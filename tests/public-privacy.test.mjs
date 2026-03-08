import test from 'node:test';
import assert from 'node:assert/strict';

import app from '../.tmp-test-build/index.js';

class MemoryKV {
  constructor() {
    this.store = new Map();
  }

  async get(key, type) {
    if (!this.store.has(key)) {
      return null;
    }
    const value = this.store.get(key);
    if (type === 'json') {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    }
    return value;
  }

  async put(key, value) {
    this.store.set(key, value);
  }
}

function authHeaders(password) {
  return {
    'content-type': 'application/json',
    'x-wishlist-password': password,
  };
}

function cookieHeaders(cookie) {
  return {
    cookie,
  };
}

async function setupAppState(env, password = 'pass1234') {
  const setupResp = await app.request(
    '/api/setup',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        name: 'owner',
        password,
      }),
    },
    env,
  );
  assert.equal(setupResp.status, 200);

  const createResp = await app.request(
    '/api/wishes',
    {
      method: 'POST',
      headers: authHeaders(password),
      body: JSON.stringify({
        title: 'secret wish',
        description: 'hidden from public',
        done: true,
      }),
    },
    env,
  );
  assert.equal(createResp.status, 201);
}

test('GET /api/public should redact wishes when request is unauthenticated', async () => {
  const env = {
    WISHLIST_KV: new MemoryKV(),
  };
  await setupAppState(env);

  const resp = await app.request('/api/public', undefined, env);
  assert.equal(resp.status, 200);
  const payload = await resp.json();

  assert.equal(payload.hasConfig, true);
  assert.equal(payload.authenticated, false);
  assert.equal(payload.totalCount, 0);
  assert.equal(payload.unfinishedCount, 0);
  assert.equal(payload.randomWish, null);
  assert.deepEqual(payload.completedWishes, []);
});

test('GET /api/public should return wishes for authenticated request', async () => {
  const env = {
    WISHLIST_KV: new MemoryKV(),
  };
  await setupAppState(env);

  const resp = await app.request(
    '/api/public',
    {
      headers: {
        'x-wishlist-password': 'pass1234',
      },
    },
    env,
  );
  assert.equal(resp.status, 200);
  const payload = await resp.json();

  assert.equal(payload.authenticated, true);
  assert.equal(payload.totalCount, 1);
  assert.equal(payload.unfinishedCount, 0);
  assert.equal(payload.completedWishes.length, 1);
  assert.equal(payload.completedWishes[0].title, 'secret wish');
});

test('GET /api/public should reject invalid password header', async () => {
  const env = {
    WISHLIST_KV: new MemoryKV(),
  };
  await setupAppState(env);

  const resp = await app.request(
    '/api/public',
    {
      headers: {
        'x-wishlist-password': 'wrong-password',
      },
    },
    env,
  );
  assert.equal(resp.status, 401);
});

test('POST /api/auth should issue cookie that keeps session after refresh', async () => {
  const env = {
    WISHLIST_KV: new MemoryKV(),
  };
  await setupAppState(env);

  const authResp = await app.request(
    '/api/auth',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        password: 'pass1234',
      }),
    },
    env,
  );
  assert.equal(authResp.status, 200);

  const setCookie = authResp.headers.get('set-cookie') ?? '';
  assert.match(setCookie, /wishlist_auth=/);
  const cookie = setCookie.split(';')[0];
  assert.ok(cookie.length > 0);

  const publicResp = await app.request('/api/public', { headers: cookieHeaders(cookie) }, env);
  assert.equal(publicResp.status, 200);
  const publicPayload = await publicResp.json();
  assert.equal(publicPayload.authenticated, true);
  assert.equal(publicPayload.totalCount, 1);

  const wishesResp = await app.request('/api/wishes?page=1&pageSize=8', { headers: cookieHeaders(cookie) }, env);
  assert.equal(wishesResp.status, 200);
  const wishesPayload = await wishesResp.json();
  assert.equal(Array.isArray(wishesPayload.wishes), true);
  assert.equal(wishesPayload.wishes.length, 1);
});
