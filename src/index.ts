import { Hono } from 'hono';
import { renderHtml } from './ui.js';

type Bindings = {
  WISHLIST_KV: KVNamespace;
};

type AppConfig = {
  name: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
};

type Wish = {
  id: string;
  title: string;
  description: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};

type WishState = {
  wishes: Wish[];
};

type WishExportPayload = {
  version: number;
  exportedAt: string;
  projectName: string;
  ownerName: string;
  wishes: Wish[];
};

type WishImportMode = 'replace' | 'merge';

const PROJECT_NAME = '♥️の种草';
const CONFIG_KEY = 'wishlist:config';
const WISHES_KEY = 'wishlist:wishes';
const BACKUP_VERSION = 1;
const MAX_IMPORT_WISHES = 5000;
const MAX_WISH_ID_LENGTH = 128;
const MAX_WISH_TITLE_LENGTH = 120;
const MAX_WISH_DESCRIPTION_LENGTH = 2000;
const AUTH_COOKIE_NAME = 'wishlist_auth';
const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type RequestAuthState = 'ok' | 'missing' | 'invalid-header' | 'invalid-cookie';

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', (c) => {
  return c.html(renderHtml(PROJECT_NAME));
});

app.get('/api/public', async (c) => {
  const config = await getConfig(c.env.WISHLIST_KV);
  if (!config) {
    return c.json({
      projectName: PROJECT_NAME,
      hasConfig: false,
      ownerName: '',
      authenticated: false,
      randomWish: null,
      completedWishes: [],
      unfinishedCount: 0,
      totalCount: 0,
    });
  }

  const authState = await resolveRequestAuthState(c, config);
  if (authState === 'missing' || authState === 'invalid-cookie') {
    if (authState === 'invalid-cookie') {
      c.header('Set-Cookie', buildClearAuthCookie(isSecureRequest(c.req.url)));
    }
    return c.json({
      projectName: PROJECT_NAME,
      hasConfig: true,
      ownerName: config.name,
      authenticated: false,
      randomWish: null,
      completedWishes: [],
      unfinishedCount: 0,
      totalCount: 0,
    });
  }

  if (authState !== 'ok') {
    return c.json({ error: '验证失败。' }, 401);
  }

  const state = await loadWishState(c.env.WISHLIST_KV);

  const completedWishes = state.wishes
    .filter((wish) => wish.done)
    .sort((a, b) => (b.completedAt ?? b.updatedAt).localeCompare(a.completedAt ?? a.updatedAt));
  const unfinishedWishes = state.wishes.filter((wish) => !wish.done);

  const randomWish =
    unfinishedWishes.length > 0
      ? unfinishedWishes[Math.floor(Math.random() * unfinishedWishes.length)]
      : null;

  return c.json({
    projectName: PROJECT_NAME,
    hasConfig: true,
    ownerName: config.name,
    authenticated: true,
    randomWish,
    completedWishes,
    unfinishedCount: unfinishedWishes.length,
    totalCount: state.wishes.length,
  });
});

app.post('/api/setup', async (c) => {
  const existingConfig = await getConfig(c.env.WISHLIST_KV);
  if (existingConfig) {
    return c.json({ error: '配置已存在，如需修改请扩展设置接口。' }, 409);
  }

  const body = await readJson<{ name?: string; password?: string }>(c);
  if (!body) {
    return c.json({ error: '请求体必须为 JSON。' }, 400);
  }

  const name = (body.name ?? '').trim();
  const password = body.password ?? '';

  if (!name) {
    return c.json({ error: '许愿人姓名不能为空。' }, 400);
  }

  if (password.length < 4) {
    return c.json({ error: '密码长度至少为 4 位。' }, 400);
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);

  const config: AppConfig = {
    name,
    salt,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  await c.env.WISHLIST_KV.put(CONFIG_KEY, JSON.stringify(config));

  const existingState = await c.env.WISHLIST_KV.get(WISHES_KEY, 'json');
  if (!existingState) {
    await saveWishState(c.env.WISHLIST_KV, { wishes: [] });
  }

  return c.json({ ok: true });
});

app.post('/api/auth', async (c) => {
  const config = await getConfig(c.env.WISHLIST_KV);
  if (!config) {
    return c.json({ error: '请先初始化配置。' }, 400);
  }

  const body = await readJson<{ password?: string }>(c);
  if (!body) {
    return c.json({ error: '请求体必须为 JSON。' }, 400);
  }

  const password = body.password ?? '';
  const passed = await verifyPassword(config, password);

  if (!passed) {
    return c.json({ error: '密码错误。' }, 401);
  }

  const token = await createAuthCookieToken(config);
  c.header('Set-Cookie', buildAuthCookie(token, isSecureRequest(c.req.url)));

  return c.json({ ok: true });
});

app.use('/api/wishes*', async (c, next) => {
  const config = await getConfig(c.env.WISHLIST_KV);
  if (!config) {
    return c.json({ error: '请先初始化配置。' }, 400);
  }

  const authState = await resolveRequestAuthState(c, config);
  if (authState === 'missing') {
    return c.json({ error: '缺少验证密码。' }, 401);
  }

  if (authState !== 'ok') {
    if (authState === 'invalid-cookie') {
      c.header('Set-Cookie', buildClearAuthCookie(isSecureRequest(c.req.url)));
    }
    return c.json({ error: '验证失败。' }, 401);
  }

  await next();
});

app.get('/api/wishes', async (c) => {
  const state = await loadWishState(c.env.WISHLIST_KV);
  const q = (c.req.query('q') ?? '').trim().toLowerCase();
  const page = normalizePositiveInt(c.req.query('page'), 1);
  const pageSize = normalizePositiveInt(c.req.query('pageSize'), 8, 1, 50);

  let wishes = [...state.wishes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  if (q) {
    wishes = wishes.filter((wish) => {
      const title = wish.title.toLowerCase();
      const description = wish.description.toLowerCase();
      return title.includes(q) || description.includes(q);
    });
  }

  const total = wishes.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
  const currentPage = totalPages === 0 ? 1 : Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pagedWishes = wishes.slice(start, start + pageSize);

  return c.json({
    wishes: pagedWishes,
    pagination: {
      total,
      page: currentPage,
      pageSize,
      totalPages,
    },
    query: {
      q,
    },
  });
});

app.get('/api/wishes/export', async (c) => {
  const config = await getConfig(c.env.WISHLIST_KV);
  const state = await loadWishState(c.env.WISHLIST_KV);

  const payload: WishExportPayload = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    projectName: PROJECT_NAME,
    ownerName: config?.name ?? '',
    wishes: [...state.wishes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  };

  return c.json(payload);
});

app.post('/api/wishes/import', async (c) => {
  const body = await readJson<{ backup?: unknown; mode?: unknown }>(c);
  if (!body) {
    return c.json({ error: '请求体必须为 JSON。' }, 400);
  }

  const mode = parseImportMode(body.mode);
  if (!mode) {
    return c.json({ error: '导入模式无效，仅支持 replace 或 merge。' }, 400);
  }

  const importedWishes = parseImportedWishes(body.backup ?? body);
  if (!importedWishes) {
    return c.json({ error: '备份文件格式无效。' }, 400);
  }

  const dedupedImported = dedupeWishesById(importedWishes);
  const state = await loadWishState(c.env.WISHLIST_KV);
  const previousTotal = state.wishes.length;
  let mergedOverwritten = 0;

  if (mode === 'replace') {
    state.wishes = dedupedImported;
  } else {
    const merged = new Map(state.wishes.map((wish) => [wish.id, wish] as const));
    for (const wish of dedupedImported) {
      if (merged.has(wish.id)) {
        mergedOverwritten += 1;
      }
      merged.set(wish.id, wish);
    }
    state.wishes = [...merged.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  await saveWishState(c.env.WISHLIST_KV, state);

  return c.json({
    ok: true,
    mode,
    importedCount: importedWishes.length,
    acceptedCount: dedupedImported.length,
    overwrittenCount: mergedOverwritten,
    totalBefore: previousTotal,
    totalAfter: state.wishes.length,
  });
});

app.post('/api/wishes', async (c) => {
  const body = await readJson<{ title?: string; description?: string; done?: boolean }>(c);
  if (!body) {
    return c.json({ error: '请求体必须为 JSON。' }, 400);
  }

  const title = (body.title ?? '').trim();
  const description = (body.description ?? '').trim();
  const done = Boolean(body.done);

  if (!title) {
    return c.json({ error: '项目名称不能为空。' }, 400);
  }

  const now = new Date().toISOString();
  const wish: Wish = {
    id: crypto.randomUUID(),
    title,
    description,
    done,
    createdAt: now,
    updatedAt: now,
  };

  if (done) {
    wish.completedAt = now;
  }

  const state = await loadWishState(c.env.WISHLIST_KV);
  state.wishes.unshift(wish);
  await saveWishState(c.env.WISHLIST_KV, state);

  return c.json({ wish }, 201);
});

app.put('/api/wishes/:id', async (c) => {
  const id = c.req.param('id');
  const body = await readJson<{ title?: string; description?: string; done?: boolean }>(c);
  if (!body) {
    return c.json({ error: '请求体必须为 JSON。' }, 400);
  }

  const state = await loadWishState(c.env.WISHLIST_KV);
  const index = state.wishes.findIndex((wish) => wish.id === id);

  if (index < 0) {
    return c.json({ error: '愿望不存在。' }, 404);
  }

  const target = state.wishes[index];

  if (typeof body.title === 'string') {
    const nextTitle = body.title.trim();
    if (!nextTitle) {
      return c.json({ error: '项目名称不能为空。' }, 400);
    }
    target.title = nextTitle;
  }

  if (typeof body.description === 'string') {
    target.description = body.description.trim();
  }

  if (typeof body.done === 'boolean' && body.done !== target.done) {
    target.done = body.done;
    if (target.done) {
      target.completedAt = new Date().toISOString();
    } else {
      delete target.completedAt;
    }
  }

  target.updatedAt = new Date().toISOString();
  await saveWishState(c.env.WISHLIST_KV, state);

  return c.json({ wish: target });
});

app.delete('/api/wishes/:id', async (c) => {
  const id = c.req.param('id');
  const state = await loadWishState(c.env.WISHLIST_KV);
  const nextWishes = state.wishes.filter((wish) => wish.id !== id);

  if (nextWishes.length === state.wishes.length) {
    return c.json({ error: '愿望不存在。' }, 404);
  }

  state.wishes = nextWishes;
  await saveWishState(c.env.WISHLIST_KV, state);

  return c.json({ ok: true });
});

async function getConfig(kv: KVNamespace): Promise<AppConfig | null> {
  return kv.get(CONFIG_KEY, 'json');
}

async function loadWishState(kv: KVNamespace): Promise<WishState> {
  const state = await kv.get(WISHES_KEY, 'json');
  if (!state || typeof state !== 'object' || !Array.isArray((state as WishState).wishes)) {
    return { wishes: [] };
  }
  return state as WishState;
}

async function saveWishState(kv: KVNamespace, state: WishState): Promise<void> {
  await kv.put(WISHES_KEY, JSON.stringify(state));
}

async function readJson<T>(c: { req: { json: <J>() => Promise<J> } }): Promise<T | null> {
  try {
    return (await c.req.json<T>()) ?? null;
  } catch {
    return null;
  }
}

function generateSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return bytesToBase64(bytes);
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const encoded = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return bytesToBase64(new Uint8Array(digest));
}

async function verifyPassword(config: AppConfig, password: string): Promise<boolean> {
  if (!password) {
    return false;
  }
  const inputHash = await hashPassword(password, config.salt);
  return timingSafeEqual(inputHash, config.passwordHash);
}

async function resolveRequestAuthState(
  c: {
    req: {
      header: (name: string) => string | undefined;
      url: string;
    };
  },
  config: AppConfig,
): Promise<RequestAuthState> {
  const password = (c.req.header('x-wishlist-password') ?? '').trim();
  if (password) {
    const passed = await verifyPassword(config, password);
    return passed ? 'ok' : 'invalid-header';
  }

  const cookieRaw = c.req.header('cookie') ?? '';
  const token = readCookie(cookieRaw, AUTH_COOKIE_NAME);
  if (!token) {
    return 'missing';
  }

  const cookiePassed = await verifyAuthCookieToken(config, token);
  return cookiePassed ? 'ok' : 'invalid-cookie';
}

async function createAuthCookieToken(config: AppConfig): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + AUTH_COOKIE_MAX_AGE_SECONDS;
  const signature = await hashPassword(`wishlist-auth:${expiresAt}:${config.passwordHash}`, config.salt);
  return `${expiresAt}.${signature}`;
}

async function verifyAuthCookieToken(config: AppConfig, token: string): Promise<boolean> {
  const dotIndex = token.indexOf('.');
  if (dotIndex <= 0 || dotIndex === token.length - 1) {
    return false;
  }

  const expiresAtRaw = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isInteger(expiresAt)) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  if (expiresAt <= now) {
    return false;
  }

  if (expiresAt > now + AUTH_COOKIE_MAX_AGE_SECONDS + 60) {
    return false;
  }

  const expected = await hashPassword(`wishlist-auth:${expiresAt}:${config.passwordHash}`, config.salt);
  return timingSafeEqual(signature, expected);
}

function readCookie(cookieHeader: string, name: string): string {
  if (!cookieHeader) {
    return '';
  }

  const target = `${name}=`;
  const chunks = cookieHeader.split(';');
  for (const chunk of chunks) {
    const part = chunk.trim();
    if (part.startsWith(target)) {
      return part.slice(target.length);
    }
  }
  return '';
}

function isSecureRequest(url: string): boolean {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}

function buildAuthCookie(token: string, secure: boolean): string {
  const parts = [
    `${AUTH_COOKIE_NAME}=${token}`,
    'Path=/',
    `Max-Age=${AUTH_COOKIE_MAX_AGE_SECONDS}`,
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (secure) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

function buildClearAuthCookie(secure: boolean): string {
  const parts = [
    `${AUTH_COOKIE_NAME}=`,
    'Path=/',
    'Max-Age=0',
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (secure) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const value of bytes) {
    binary += String.fromCharCode(value);
  }
  return btoa(binary);
}

function normalizePositiveInt(
  raw: string | undefined,
  fallback: number,
  min = 1,
  max = Number.MAX_SAFE_INTEGER,
): number {
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min) {
    return fallback;
  }
  return Math.min(value, max);
}

function parseImportMode(raw: unknown): WishImportMode | null {
  if (raw === 'replace' || raw === 'merge') {
    return raw;
  }
  return null;
}

function parseImportedWishes(raw: unknown): Wish[] | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const wishes = (raw as { wishes?: unknown }).wishes;
  if (!Array.isArray(wishes) || wishes.length > MAX_IMPORT_WISHES) {
    return null;
  }

  const now = new Date().toISOString();
  const normalized: Wish[] = [];
  for (const item of wishes) {
    const wish = normalizeImportedWish(item, now);
    if (!wish) {
      return null;
    }
    normalized.push(wish);
  }

  return normalized;
}

function normalizeImportedWish(raw: unknown, fallbackTime: string): Wish | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const input = raw as Record<string, unknown>;

  const title = typeof input.title === 'string' ? input.title.trim() : '';
  if (!title || title.length > MAX_WISH_TITLE_LENGTH) {
    return null;
  }

  const description = typeof input.description === 'string' ? input.description.trim() : '';
  if (description.length > MAX_WISH_DESCRIPTION_LENGTH) {
    return null;
  }

  const done = typeof input.done === 'boolean' ? input.done : false;
  const createdAt = normalizeDateString(input.createdAt, fallbackTime);
  const updatedAt = normalizeDateString(input.updatedAt, createdAt);
  const completedAt = done
    ? normalizeDateString(input.completedAt, updatedAt)
    : undefined;
  const normalizedId = typeof input.id === 'string' ? input.id.trim() : '';
  const id =
    normalizedId && normalizedId.length <= MAX_WISH_ID_LENGTH
      ? normalizedId
      : crypto.randomUUID();

  const wish: Wish = {
    id,
    title,
    description,
    done,
    createdAt,
    updatedAt,
  };

  if (completedAt) {
    wish.completedAt = completedAt;
  }

  return wish;
}

function normalizeDateString(raw: unknown, fallback: string): string {
  if (typeof raw !== 'string') {
    return fallback;
  }
  const value = raw.trim();
  if (!value) {
    return fallback;
  }
  const ts = Date.parse(value);
  if (Number.isNaN(ts)) {
    return fallback;
  }
  return new Date(ts).toISOString();
}

function dedupeWishesById(wishes: Wish[]): Wish[] {
  const unique = new Map<string, Wish>();
  for (const wish of wishes) {
    unique.set(wish.id, wish);
  }
  return [...unique.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export default app;
