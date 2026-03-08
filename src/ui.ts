export function renderHtml(projectName: string): string {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
    <style>
      :root {
        --bg: #fffaf0;
        --surface: #ffffff;
        --text: #2f1d0f;
        --muted: #7e6656;
        --primary: #da6931;
        --primary-soft: #ffe2d0;
        --accent: #2a9d8f;
        --border: #f1d8c8;
        --danger: #b23a48;
        --shadow: 0 16px 40px rgba(73, 34, 12, 0.12);
        --space-1: 6px;
        --space-2: 8px;
        --space-3: 10px;
        --space-4: 12px;
        --space-5: 16px;
        --space-6: 18px;
        --space-7: 24px;
        --space-8: 28px;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: "Noto Serif SC", "Songti SC", "STKaiti", "Baskerville", serif;
        color: var(--text);
        background: var(--bg);
        min-height: 100dvh;
      }

      .wrap {
        max-width: 1080px;
        margin: 0 auto;
        padding: var(--space-7) var(--space-5) calc(var(--space-7) * 2);
      }

      .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-4);
        margin-bottom: var(--space-5);
      }

      .brand {
        margin: 0;
        font-size: clamp(1.6rem, 2vw + 1rem, 2.4rem);
      }

      h1,
      h2,
      h3 {
        text-wrap: balance;
      }

      p {
        text-wrap: pretty;
      }

      .owner {
        margin: var(--space-1) 0 0;
        color: var(--muted);
      }

      .button {
        border: 1px solid transparent;
        background: var(--primary);
        color: #fff;
        border-radius: 999px;
        font-weight: 700;
        cursor: pointer;
        padding: var(--space-3) var(--space-5);
        line-height: 1.2;
      }

      .button:focus-visible {
        outline: 3px solid color-mix(in srgb, var(--primary) 45%, #fff);
        outline-offset: 2px;
      }

      .button:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .button.secondary {
        background: var(--surface);
        color: var(--text);
        border-color: var(--border);
      }

      .button.ghost {
        background: transparent;
        color: var(--muted);
        border-color: var(--border);
      }

      .button.danger {
        background: var(--danger);
      }

      .feature-nav {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-3);
        margin-bottom: var(--space-5);
      }

      .nav-button {
        border: 1px solid var(--border);
        background: color-mix(in srgb, var(--surface) 90%, var(--primary-soft) 10%);
        color: var(--text);
        border-radius: 999px;
        padding: var(--space-2) var(--space-4);
        cursor: pointer;
        font: inherit;
        font-weight: 700;
      }

      .nav-button.active {
        border-color: var(--primary);
        color: #fff;
        background: var(--primary);
      }

      .nav-button:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .panel-stack {
        display: grid;
        gap: var(--space-5);
      }

      .panel {
        display: none;
      }

      .panel.open {
        display: block;
      }

      .card {
        border-radius: 18px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.88);
        box-shadow: var(--shadow);
        padding: var(--space-6);
      }

      .card h2,
      .card h3 {
        margin: 0 0 var(--space-4);
        font-size: 1.15rem;
      }

      .card h3 {
        font-size: 1.05rem;
      }

      .summary {
        color: var(--muted);
        margin: 0;
      }

      .completed-list,
      .manage-list {
        display: grid;
        gap: var(--space-3);
      }

      .wish-item {
        border: 1px solid var(--border);
        border-radius: 14px;
        background: #fff;
        padding: var(--space-4);
      }

      .wish-item.done {
        border-color: #bfe5dc;
        background: #f3fffb;
      }

      .wish-title {
        font-weight: 700;
        margin-bottom: var(--space-1);
      }

      .wish-desc {
        margin: 0;
        color: var(--muted);
        white-space: pre-wrap;
      }

      .wish-meta {
        margin-top: var(--space-2);
        font-size: 0.82rem;
        color: #9e8372;
        font-variant-numeric: tabular-nums;
      }

      .empty {
        color: #9e8372;
        margin: 0;
      }

      .setup {
        display: none;
        max-width: 560px;
        margin: var(--space-8) auto 0;
      }

      .form {
        display: grid;
        gap: var(--space-4);
      }

      .field {
        display: grid;
        gap: var(--space-2);
      }

      label {
        font-weight: 700;
      }

      input,
      textarea {
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: var(--space-3) var(--space-4);
        font: inherit;
        background: #fff;
      }

      textarea {
        min-height: 92px;
        resize: vertical;
      }

      .inline {
        display: flex;
        align-items: center;
        gap: var(--space-2);
      }

      .status {
        margin: 0;
        color: var(--muted);
        min-height: 1.2em;
      }

      .wish-actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-3);
        margin-top: var(--space-3);
      }

      .wish-actions .button {
        padding: var(--space-1) var(--space-3);
        font-size: 0.86rem;
      }

      .wish-editor {
        margin-top: var(--space-3);
        border-top: 1px dashed var(--border);
        padding-top: var(--space-3);
      }

      .manage-toolbar {
        display: grid;
        gap: var(--space-4);
        margin-bottom: var(--space-4);
      }

      .backup-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--space-3);
        margin-top: var(--space-3);
      }

      .backup-modes {
        flex-direction: column;
        align-items: flex-start;
      }

      .search-form {
        display: flex;
        gap: var(--space-3);
      }

      .search-input {
        flex: 1;
      }

      .manage-meta {
        color: var(--muted);
        font-size: 0.9rem;
        font-variant-numeric: tabular-nums;
      }

      .pager {
        margin-top: var(--space-4);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-3);
      }

      .pager-info {
        color: var(--muted);
        font-size: 0.9rem;
        font-variant-numeric: tabular-nums;
      }

      @media (prefers-reduced-motion: reduce) {
        * {
          animation: none !important;
          transition: none !important;
          scroll-behavior: auto !important;
        }
      }

      @media (max-width: 860px) {
        .topbar {
          flex-direction: column;
          align-items: flex-start;
        }

        .feature-nav {
          gap: var(--space-2);
        }

        .search-form {
          flex-wrap: wrap;
        }
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <header class="topbar">
        <div>
          <h1 class="brand">${projectName}</h1>
          <p class="owner" id="ownerName">加载中...</p>
        </div>
      </header>

      <nav class="feature-nav" id="featureNav" style="display:none;">
        <button class="nav-button active" type="button" data-panel-nav="random">随机愿望</button>
        <button class="nav-button" type="button" data-panel-nav="completed">已实现清单</button>
        <button class="nav-button" type="button" data-panel-nav="login">登录验证</button>
        <button class="nav-button" type="button" data-panel-nav="create" data-private="true">新增愿望</button>
        <button class="nav-button" type="button" data-panel-nav="backup" data-private="true">备份恢复</button>
        <button class="nav-button" type="button" data-panel-nav="list" data-private="true">全部愿望</button>
      </nav>

      <section class="setup card" id="setupCard">
        <h2>初始化愿望清单</h2>
        <p class="summary">首次使用时请先配置许愿人姓名和验证密码。</p>
        <form class="form" id="setupForm">
          <div class="field">
            <label for="setupName">许愿人姓名</label>
            <input id="setupName" maxlength="40" required placeholder="例如：小林" />
          </div>
          <div class="field">
            <label for="setupPassword">验证密码（至少 4 位）</label>
            <input id="setupPassword" type="password" minlength="4" required />
          </div>
          <button class="button" type="submit">保存配置</button>
          <p class="status" id="setupStatus"></p>
        </form>
      </section>

      <main class="panel-stack" id="mainLayout" style="display:none;">
        <section class="card panel open" id="panelRandom" data-panel="random">
          <h2>今日随机种草</h2>
          <p class="summary" id="randomSummary">正在抽取未实现愿望...</p>
          <button class="button secondary" id="showRandom">再抽一个</button>
          <article class="wish-item" id="randomCard" style="display:none; margin-top: var(--space-4);">
            <div class="wish-title" id="randomTitle"></div>
            <p class="wish-desc" id="randomDesc"></p>
            <div class="wish-meta" id="randomMeta"></div>
          </article>
        </section>

        <section class="card panel" id="panelCompleted" data-panel="completed">
          <h2>已实现愿望清单</h2>
          <div id="completedList" class="completed-list"></div>
        </section>

        <section class="card panel" id="panelLogin" data-panel="login">
          <h2>输入验证密码</h2>
          <p class="summary">验证成功后即可使用新增、备份和完整管理功能。</p>
          <form class="form" id="loginForm">
            <input id="loginPassword" type="password" placeholder="请输入密码" required />
            <button class="button" type="submit">验证并进入</button>
            <p class="status" id="loginStatus"></p>
          </form>
        </section>

        <section class="card panel" id="panelCreate" data-panel="create">
          <h2>新增愿望</h2>
          <form class="form" id="createForm">
            <div class="field">
              <label for="wishTitle">项目名称</label>
              <input id="wishTitle" maxlength="80" required placeholder="例如：入手降噪耳机" />
            </div>
            <div class="field">
              <label for="wishDesc">描述</label>
              <textarea id="wishDesc" maxlength="300" placeholder="写下你想实现它的理由"></textarea>
            </div>
            <label class="inline">
              <input id="wishDone" type="checkbox" />
              已实现
            </label>
            <button class="button" type="submit">创建愿望</button>
            <p class="status" id="createStatus"></p>
          </form>
        </section>

        <section class="card panel" id="panelBackup" data-panel="backup">
          <h2>备份与恢复</h2>
          <p class="summary">导出和导入都需要先登录。导入支持覆盖和合并模式。</p>
          <div class="backup-row">
            <button type="button" class="button secondary" id="exportData">导出 JSON 备份</button>
          </div>
          <div class="backup-row">
            <input id="importFile" type="file" accept=".json,application/json" />
            <span class="manage-meta" id="importFileName">未选择文件</span>
          </div>
          <div class="backup-row backup-modes">
            <label class="inline">
              <input type="radio" name="importMode" value="replace" checked />
              覆盖现有数据
            </label>
            <label class="inline">
              <input type="radio" name="importMode" value="merge" />
              合并到现有数据
            </label>
            <label class="inline">
              <input type="checkbox" id="replaceConfirm" />
              我已确认：覆盖模式会替换全部愿望
            </label>
            <label class="field" style="width: 100%;">
              <span>输入“确认覆盖”后才允许覆盖导入</span>
              <input id="replaceConfirmText" placeholder="请输入：确认覆盖" />
            </label>
          </div>
          <button type="button" class="button" id="importData">开始导入</button>
          <p class="status" id="backupStatus"></p>
        </section>

        <section class="card panel" id="panelList" data-panel="list">
          <h2>全部愿望</h2>
          <div class="manage-toolbar">
            <form id="searchForm" class="search-form">
              <input id="searchInput" class="search-input" placeholder="搜索项目名称或描述" />
              <button type="submit" class="button secondary">搜索</button>
              <button type="button" class="button ghost" id="clearSearch">清空</button>
            </form>
            <div class="manage-meta" id="manageMeta">共 0 条</div>
          </div>
          <p class="status" id="manageStatus"></p>
          <div class="backup-row" id="manageStatusActions" style="display:none;">
            <button type="button" class="button ghost" id="undoDelete">撤销删除</button>
          </div>
          <div class="manage-list" id="manageList"></div>
          <div class="pager">
            <button type="button" class="button secondary" id="prevPage">上一页</button>
            <span class="pager-info" id="pagerInfo">第 1 / 1 页</span>
            <button type="button" class="button secondary" id="nextPage">下一页</button>
          </div>
        </section>
      </main>
    </div>

    <script>
      const state = {
        hasConfig: false,
        hasPrivateData: false,
        ownerName: '',
        password: '',
        activePanel: 'random',
        wishes: [],
        manageQuery: '',
        managePage: 1,
        managePageSize: 8,
        manageTotal: 0,
        manageTotalPages: 0,
        unfinishedCount: 0,
        editingWishId: '',
        pendingDeleteWishId: '',
        scheduledDeleteWishId: '',
        randomWish: null,
        completedWishes: [],
        pendingBackup: null
      };

      const ownerNameEl = document.getElementById('ownerName');
      const setupCard = document.getElementById('setupCard');
      const featureNav = document.getElementById('featureNav');
      const navButtons = Array.from(document.querySelectorAll('[data-panel-nav]'));
      const panels = Array.from(document.querySelectorAll('[data-panel]'));
      const setupForm = document.getElementById('setupForm');
      const setupStatus = document.getElementById('setupStatus');
      const mainLayout = document.getElementById('mainLayout');
      const completedList = document.getElementById('completedList');
      const randomSummary = document.getElementById('randomSummary');
      const randomCard = document.getElementById('randomCard');
      const randomTitle = document.getElementById('randomTitle');
      const randomDesc = document.getElementById('randomDesc');
      const randomMeta = document.getElementById('randomMeta');
      const showRandomBtn = document.getElementById('showRandom');
      const loginForm = document.getElementById('loginForm');
      const loginPassword = document.getElementById('loginPassword');
      const loginStatus = document.getElementById('loginStatus');
      const createForm = document.getElementById('createForm');
      const createStatus = document.getElementById('createStatus');
      const manageList = document.getElementById('manageList');
      const searchForm = document.getElementById('searchForm');
      const searchInput = document.getElementById('searchInput');
      const clearSearch = document.getElementById('clearSearch');
      const manageMeta = document.getElementById('manageMeta');
      const manageStatus = document.getElementById('manageStatus');
      const pagerInfo = document.getElementById('pagerInfo');
      const prevPage = document.getElementById('prevPage');
      const nextPage = document.getElementById('nextPage');
      const exportData = document.getElementById('exportData');
      const importFile = document.getElementById('importFile');
      const importFileName = document.getElementById('importFileName');
      const importData = document.getElementById('importData');
      const importModeInputs = Array.from(document.querySelectorAll('input[name="importMode"]'));
      const replaceConfirm = document.getElementById('replaceConfirm');
      const replaceConfirmText = document.getElementById('replaceConfirmText');
      const backupStatus = document.getElementById('backupStatus');
      const manageStatusActions = document.getElementById('manageStatusActions');
      const undoDelete = document.getElementById('undoDelete');
      let scheduledDeleteTimer = null;

      function setText(el, value) {
        if (el) {
          el.textContent = value;
        }
      }

      function authHeaders(includeJson) {
        const headers = {};
        if (state.password) {
          headers['x-wishlist-password'] = state.password;
        }
        if (includeJson) {
          headers['content-type'] = 'application/json';
        }
        return headers;
      }

      function publicHeaders() {
        if (!state.password) {
          return {};
        }
        return { 'x-wishlist-password': state.password };
      }

      function isPanelAllowed(panelName) {
        if (!state.hasConfig) {
          return false;
        }
        if (state.hasPrivateData) {
          return true;
        }
        return panelName === 'random' || panelName === 'completed' || panelName === 'login';
      }

      function setActivePanel(panelName) {
        if (!isPanelAllowed(panelName)) {
          state.activePanel = 'login';
        } else {
          state.activePanel = panelName;
        }

        panels.forEach(function(panel) {
          const isOpen = panel.dataset.panel === state.activePanel;
          panel.classList.toggle('open', isOpen);
        });

        navButtons.forEach(function(button) {
          button.classList.toggle('active', button.dataset.panelNav === state.activePanel);
        });
      }

      function syncFeatureNav() {
        if (!featureNav) {
          return;
        }

        if (!state.hasConfig) {
          featureNav.style.display = 'none';
          return;
        }

        featureNav.style.display = 'flex';
        navButtons.forEach(function(button) {
          const needsAuth = button.dataset.private === 'true';
          button.disabled = needsAuth && !state.hasPrivateData;
        });

        if (!isPanelAllowed(state.activePanel)) {
          setActivePanel('login');
          return;
        }

        if (state.hasPrivateData && state.activePanel === 'login') {
          setActivePanel('random');
          return;
        }

        setActivePanel(state.activePanel);
      }

      async function fetchJson(url, options) {
        const resp = await fetch(url, options || {});
        let data = {};
        try {
          data = await resp.json();
        } catch (err) {
          data = {};
        }
        if (!resp.ok) {
          const msg = data && data.error ? data.error : '请求失败';
          throw new Error(msg);
        }
        return data;
      }

      function renderCompleted() {
        completedList.innerHTML = '';
        if (!state.hasPrivateData) {
          const p = document.createElement('p');
          p.className = 'empty';
          p.textContent = '登录后可查看已实现愿望。';
          completedList.appendChild(p);
          return;
        }

        if (!state.completedWishes.length) {
          const p = document.createElement('p');
          p.className = 'empty';
          p.textContent = '还没有实现的项目，可在“全部愿望”里把愿望标记为已实现。';
          completedList.appendChild(p);
          return;
        }

        state.completedWishes.forEach(function(wish) {
          const node = document.createElement('article');
          node.className = 'wish-item done';

          const title = document.createElement('div');
          title.className = 'wish-title';
          title.textContent = wish.title;

          const desc = document.createElement('p');
          desc.className = 'wish-desc';
          desc.textContent = wish.description || '已实现，暂无补充描述。';

          const meta = document.createElement('div');
          meta.className = 'wish-meta';
          meta.textContent = '完成于 ' + new Date(wish.completedAt || wish.updatedAt).toLocaleString();

          node.appendChild(title);
          node.appendChild(desc);
          node.appendChild(meta);
          completedList.appendChild(node);
        });
      }

      function renderRandomWish() {
        if (!randomCard) {
          return;
        }

        if (!state.hasPrivateData) {
          randomCard.style.display = 'none';
          setText(randomSummary, '登录后可查看未实现愿望。');
          return;
        }

        if (!state.randomWish) {
          randomCard.style.display = 'none';
          setText(randomSummary, '目前没有未实现愿望。');
          return;
        }

        randomCard.style.display = 'block';
        setText(randomTitle, state.randomWish.title);
        setText(randomDesc, state.randomWish.description || '这个愿望还没有补充说明。');
        setText(randomMeta, '更新于 ' + new Date(state.randomWish.updatedAt).toLocaleString());
        setText(randomSummary, '还有 ' + state.unfinishedCount + ' 个未实现愿望，随机展示中。');
      }

      function renderOwner() {
        if (!state.hasConfig) {
          setText(ownerNameEl, '请先初始化愿望清单');
          return;
        }
        setText(ownerNameEl, state.ownerName + ' 的愿望清单');
      }

      async function loadPublicState() {
        const data = await fetchJson('/api/public', {
          headers: publicHeaders()
        });
        state.hasConfig = Boolean(data.hasConfig);
        state.ownerName = data.ownerName || '';
        state.randomWish = data.randomWish || null;
        state.completedWishes = data.completedWishes || [];
        state.unfinishedCount = data.unfinishedCount || 0;
        state.hasPrivateData = Boolean(data.authenticated);

        renderOwner();
        syncFeatureNav();

        if (!state.hasConfig) {
          setupCard.style.display = 'block';
          mainLayout.style.display = 'none';
          return;
        }

        setupCard.style.display = 'none';
        mainLayout.style.display = 'grid';
        renderCompleted();
        renderRandomWish();

        if (!state.hasPrivateData) {
          if (!isPanelAllowed(state.activePanel)) {
            setActivePanel('login');
          }
          return;
        }

        if (state.activePanel === 'login') {
          setActivePanel('random');
        }
      }

      async function verifyPassword(password) {
        await fetchJson('/api/auth', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ password: password })
        });
      }

      async function loadManageWishes() {
        const params = new URLSearchParams();
        params.set('page', String(state.managePage));
        params.set('pageSize', String(state.managePageSize));
        if (state.manageQuery) {
          params.set('q', state.manageQuery);
        }

        const data = await fetchJson('/api/wishes?' + params.toString(), {
          headers: authHeaders(false)
        });
        state.wishes = data.wishes || [];
        const pagination = data.pagination || {};
        state.manageTotal = Number(pagination.total) || 0;
        state.managePage = Number(pagination.page) || 1;
        state.managePageSize = Number(pagination.pageSize) || state.managePageSize;
        state.manageTotalPages = Number(pagination.totalPages) || 0;
        renderManageList();
        renderPager();
      }

      function makeBackupFilename() {
        return 'wishlist-backup-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
      }

      function getImportMode() {
        const modeInput = document.querySelector('input[name="importMode"]:checked');
        return modeInput && modeInput.value === 'merge' ? 'merge' : 'replace';
      }

      async function readBackupFile(file) {
        const text = await file.text();
        let parsed = null;
        try {
          parsed = JSON.parse(text);
        } catch (err) {
          throw new Error('备份文件不是合法 JSON。');
        }
        if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.wishes)) {
          throw new Error('备份文件格式错误，缺少 wishes 数组。');
        }
        return parsed;
      }

      async function exportBackup() {
        const data = await fetchJson('/api/wishes/export', {
          headers: authHeaders(false)
        });
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = makeBackupFilename();
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(link.href);
      }

      async function importBackup() {
        if (!state.pendingBackup) {
          throw new Error('请先选择备份文件。');
        }

        const mode = getImportMode();
        const confirmText = replaceConfirmText ? replaceConfirmText.value.trim() : '';
        if (mode === 'replace') {
          if (replaceConfirm && !replaceConfirm.checked) {
            throw new Error('覆盖导入前请勾选确认选项。');
          }
          if (confirmText !== '确认覆盖') {
            throw new Error('覆盖导入前请输入“确认覆盖”。');
          }
        }

        const result = await fetchJson('/api/wishes/import', {
          method: 'POST',
          headers: authHeaders(true),
          body: JSON.stringify({
            mode: mode,
            backup: state.pendingBackup
          })
        });

        state.managePage = 1;
        await Promise.all([
          loadManageWishes(),
          loadPublicState()
        ]);

        if (replaceConfirm) {
          replaceConfirm.checked = false;
        }
        if (replaceConfirmText) {
          replaceConfirmText.value = '';
        }

        return result;
      }

      function setManageMessage(message) {
        setText(manageStatus, message);
      }

      function showUndoDeleteAction(show) {
        if (!manageStatusActions) {
          return;
        }
        manageStatusActions.style.display = show ? 'flex' : 'none';
      }

      function clearScheduledDelete(shouldRender) {
        if (scheduledDeleteTimer) {
          clearTimeout(scheduledDeleteTimer);
          scheduledDeleteTimer = null;
        }
        state.scheduledDeleteWishId = '';
        showUndoDeleteAction(false);
        if (shouldRender) {
          renderManageList();
        }
      }

      function startEditWish(wishId) {
        clearScheduledDelete(false);
        state.pendingDeleteWishId = '';
        state.editingWishId = wishId;
        setManageMessage('');
        renderManageList();
      }

      function cancelEditWish() {
        state.editingWishId = '';
        renderManageList();
      }

      function scheduleDeleteWish(wish) {
        clearScheduledDelete(false);
        state.scheduledDeleteWishId = wish.id;
        setManageMessage('已进入删除倒计时（6 秒）：' + wish.title + '。可点击“撤销删除”。');
        showUndoDeleteAction(true);
        renderManageList();

        scheduledDeleteTimer = setTimeout(function() {
          scheduledDeleteTimer = null;
          deleteWish(wish.id);
        }, 6000);
      }

      function queueDeleteWish(wish) {
        clearScheduledDelete(false);
        state.editingWishId = '';
        if (state.pendingDeleteWishId === wish.id) {
          state.pendingDeleteWishId = '';
          scheduleDeleteWish(wish);
          return;
        }
        state.pendingDeleteWishId = wish.id;
        setManageMessage('再次点击“确认删除”会进入 6 秒倒计时，期间可撤销：' + wish.title);
        renderManageList();
      }

      function clearPendingDelete() {
        if (!state.pendingDeleteWishId) {
          return;
        }
        state.pendingDeleteWishId = '';
        renderManageList();
      }

      function undoScheduledDelete() {
        clearScheduledDelete(true);
        setManageMessage('已撤销删除。');
      }

      async function saveInlineEdit(wishId, title, description) {
        const nextTitle = title.trim();
        if (!nextTitle) {
          setManageMessage('项目名称不能为空。');
          return;
        }

        try {
          clearScheduledDelete(false);
          await fetchJson('/api/wishes/' + encodeURIComponent(wishId), {
            method: 'PUT',
            headers: authHeaders(true),
            body: JSON.stringify({
              title: nextTitle,
              description: description.trim()
            })
          });
          state.editingWishId = '';
          setManageMessage('愿望已更新。');
          await Promise.all([
            loadManageWishes(),
            loadPublicState()
          ]);
        } catch (err) {
          setManageMessage(err.message);
        }
      }

      async function toggleWishDone(wish) {
        try {
          clearScheduledDelete(false);
          await fetchJson('/api/wishes/' + encodeURIComponent(wish.id), {
            method: 'PUT',
            headers: authHeaders(true),
            body: JSON.stringify({ done: !wish.done })
          });
          clearPendingDelete();
          setManageMessage('');
          await Promise.all([
            loadManageWishes(),
            loadPublicState()
          ]);
        } catch (err) {
          setManageMessage(err.message);
        }
      }

      function renderManageList() {
        manageList.innerHTML = '';
        if (!state.wishes.length) {
          const p = document.createElement('p');
          p.className = 'empty';
          p.textContent = state.manageQuery ? '没有匹配的愿望。' : '还没有愿望，先创建一个吧。';
          manageList.appendChild(p);
          return;
        }

        state.wishes.forEach(function(wish) {
          const node = document.createElement('article');
          node.className = 'wish-item' + (wish.done ? ' done' : '');

          const title = document.createElement('div');
          title.className = 'wish-title';
          title.textContent = wish.title;

          const desc = document.createElement('p');
          desc.className = 'wish-desc';
          desc.textContent = wish.description || '暂无描述';

          const meta = document.createElement('div');
          meta.className = 'wish-meta';
          meta.textContent = (wish.done ? '已实现' : '未实现') + ' · 更新于 ' + new Date(wish.updatedAt).toLocaleString();

          const actions = document.createElement('div');
          actions.className = 'wish-actions';

          const toggleBtn = document.createElement('button');
          toggleBtn.className = 'button secondary';
          toggleBtn.textContent = wish.done ? '标记未实现' : '标记已实现';
          toggleBtn.addEventListener('click', function() {
            toggleWishDone(wish);
          });

          const editBtn = document.createElement('button');
          editBtn.className = 'button ghost';
          editBtn.textContent = state.editingWishId === wish.id ? '收起编辑' : '编辑';
          editBtn.addEventListener('click', function() {
            if (state.editingWishId === wish.id) {
              cancelEditWish();
              return;
            }
            startEditWish(wish.id);
          });

          const deleteBtn = document.createElement('button');
          const pendingDelete = state.pendingDeleteWishId === wish.id;
          const scheduledDelete = state.scheduledDeleteWishId === wish.id;
          deleteBtn.className = pendingDelete || scheduledDelete ? 'button danger' : 'button ghost';
          deleteBtn.textContent = scheduledDelete ? '删除倒计时中...' : pendingDelete ? '确认删除' : '删除';
          deleteBtn.disabled = scheduledDelete;
          deleteBtn.addEventListener('click', function() {
            queueDeleteWish(wish);
          });

          actions.appendChild(toggleBtn);
          actions.appendChild(editBtn);
          actions.appendChild(deleteBtn);

          node.appendChild(title);
          node.appendChild(desc);
          node.appendChild(meta);
          node.appendChild(actions);

          if (state.editingWishId === wish.id) {
            const editor = document.createElement('div');
            editor.className = 'form wish-editor';

            const titleField = document.createElement('input');
            titleField.value = wish.title;
            titleField.maxLength = 80;
            titleField.placeholder = '项目名称';

            const descField = document.createElement('textarea');
            descField.value = wish.description || '';
            descField.maxLength = 300;
            descField.placeholder = '描述';

            const editorActions = document.createElement('div');
            editorActions.className = 'wish-actions';

            const saveBtn = document.createElement('button');
            saveBtn.className = 'button secondary';
            saveBtn.textContent = '保存';
            saveBtn.addEventListener('click', function() {
              saveInlineEdit(wish.id, titleField.value, descField.value);
            });

            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'button ghost';
            cancelBtn.textContent = '取消';
            cancelBtn.addEventListener('click', function() {
              cancelEditWish();
            });

            editorActions.appendChild(saveBtn);
            editorActions.appendChild(cancelBtn);
            editor.appendChild(titleField);
            editor.appendChild(descField);
            editor.appendChild(editorActions);
            node.appendChild(editor);
          }
          manageList.appendChild(node);
        });
      }

      function renderPager() {
        const total = state.manageTotal;
        const page = state.managePage;
        const totalPages = state.manageTotalPages;

        if (manageMeta) {
          if (state.manageQuery) {
            manageMeta.textContent = '关键词：' + state.manageQuery + ' · 共 ' + total + ' 条';
          } else {
            manageMeta.textContent = '共 ' + total + ' 条';
          }
        }

        if (pagerInfo) {
          pagerInfo.textContent = '第 ' + page + ' / ' + Math.max(totalPages, 1) + ' 页';
        }

        if (prevPage) {
          prevPage.disabled = page <= 1;
        }
        if (nextPage) {
          nextPage.disabled = totalPages === 0 || page >= totalPages;
        }
      }

      async function deleteWish(id) {
        try {
          clearScheduledDelete(false);
          state.pendingDeleteWishId = '';
          await fetchJson('/api/wishes/' + encodeURIComponent(id), {
            method: 'DELETE',
            headers: authHeaders(false)
          });
          setManageMessage('愿望已删除。');
          await Promise.all([
            loadManageWishes(),
            loadPublicState()
          ]);
        } catch (err) {
          setManageMessage(err.message);
        }
      }

      setupForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const name = document.getElementById('setupName').value.trim();
        const password = document.getElementById('setupPassword').value;

        try {
          await fetchJson('/api/setup', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ name: name, password: password })
          });
          setText(setupStatus, '配置已保存。你可以通过导航栏进入登录和管理功能。');
          await loadPublicState();
        } catch (err) {
          setText(setupStatus, err.message);
        }
      });

      showRandomBtn.addEventListener('click', async function() {
        try {
          await loadPublicState();
        } catch (err) {
          setText(randomSummary, err.message);
        }
      });

      if (undoDelete) {
        undoDelete.addEventListener('click', function() {
          undoScheduledDelete();
        });
      }

      navButtons.forEach(function(button) {
        button.addEventListener('click', async function() {
          const panelName = button.dataset.panelNav || 'random';
          if (!isPanelAllowed(panelName)) {
            setActivePanel('login');
            return;
          }
          setActivePanel(panelName);

          if (panelName === 'list' && state.hasPrivateData) {
            try {
              await loadManageWishes();
            } catch (err) {
              setManageMessage(err.message);
            }
          }
        });
      });

      loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const password = loginPassword.value;
        try {
          await verifyPassword(password);
          state.password = password;
          state.hasPrivateData = true;
          setText(loginStatus, '');
          setText(backupStatus, '');
          await Promise.all([
            loadManageWishes(),
            loadPublicState()
          ]);
          setActivePanel('create');
        } catch (err) {
          setText(loginStatus, err.message);
        }
      });

      createForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const title = document.getElementById('wishTitle').value.trim();
        const description = document.getElementById('wishDesc').value.trim();
        const done = document.getElementById('wishDone').checked;

        if (!title) {
          setText(createStatus, '项目名称不能为空');
          return;
        }

        try {
          await fetchJson('/api/wishes', {
            method: 'POST',
            headers: authHeaders(true),
            body: JSON.stringify({
              title: title,
              description: description,
              done: done
            })
          });
          createForm.reset();
          setText(createStatus, '已创建愿望。');
          await Promise.all([
            loadManageWishes(),
            loadPublicState()
          ]);
        } catch (err) {
          setText(createStatus, err.message);
        }
      });

      searchForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        state.manageQuery = searchInput.value.trim();
        state.managePage = 1;
        try {
          await loadManageWishes();
          setManageMessage('');
        } catch (err) {
          setManageMessage(err.message);
        }
      });

      clearSearch.addEventListener('click', async function() {
        searchInput.value = '';
        state.manageQuery = '';
        state.managePage = 1;
        try {
          await loadManageWishes();
          setManageMessage('');
        } catch (err) {
          setManageMessage(err.message);
        }
      });

      prevPage.addEventListener('click', async function() {
        if (state.managePage <= 1) {
          return;
        }
        state.managePage -= 1;
        try {
          await loadManageWishes();
          setManageMessage('');
        } catch (err) {
          setManageMessage(err.message);
        }
      });

      nextPage.addEventListener('click', async function() {
        if (state.manageTotalPages > 0 && state.managePage >= state.manageTotalPages) {
          return;
        }
        state.managePage += 1;
        try {
          await loadManageWishes();
          setManageMessage('');
        } catch (err) {
          setManageMessage(err.message);
        }
      });

      exportData.addEventListener('click', async function() {
        try {
          setText(backupStatus, '正在导出备份...');
          await exportBackup();
          setText(backupStatus, '导出成功，请妥善保存备份文件。');
        } catch (err) {
          setText(backupStatus, err.message);
        }
      });

      importFile.addEventListener('change', async function() {
        const file = importFile.files && importFile.files[0];
        if (!file) {
          state.pendingBackup = null;
          setText(importFileName, '未选择文件');
          return;
        }

        try {
          const parsed = await readBackupFile(file);
          state.pendingBackup = parsed;
          setText(importFileName, file.name);
          setText(backupStatus, '已加载备份：共 ' + parsed.wishes.length + ' 条记录。');
        } catch (err) {
          state.pendingBackup = null;
          importFile.value = '';
          setText(importFileName, '未选择文件');
          setText(backupStatus, err.message);
        }
      });

      importModeInputs.forEach(function(input) {
        input.addEventListener('change', function() {
          if (input.value === 'merge') {
            if (replaceConfirm) {
              replaceConfirm.checked = false;
            }
            if (replaceConfirmText) {
              replaceConfirmText.value = '';
            }
          }
        });
      });

      importData.addEventListener('click', async function() {
        try {
          setText(backupStatus, '正在导入备份...');
          const result = await importBackup();
          const overwriteText = result.mode === 'merge' ? '，覆盖同 ID ' + result.overwrittenCount + ' 条' : '';
          setText(
            backupStatus,
            '导入完成：接收 ' + result.acceptedCount + ' 条，当前共 ' + result.totalAfter + ' 条' + overwriteText + '。',
          );
        } catch (err) {
          setText(backupStatus, err.message);
        }
      });

      loadPublicState().catch(function(err) {
        setText(ownerNameEl, '加载失败：' + err.message);
      });
    </script>
  </body>
</html>`;
}
