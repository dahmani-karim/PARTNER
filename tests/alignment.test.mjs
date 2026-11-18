import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import common from '../src/locales/en.js';
import partner from '../src/locales/partner.js';
import admin from '../src/locales/admin.js';
import quotas from '../src/locales/quotas.js';

const require = createRequire(import.meta.url);
const { transformSync } = require('esbuild');
const messages = { ...common, ...admin, ...quotas, ...partner };
const translate = (text, values = {}) => typeof text === 'string'
  ? (messages[text.trim()] ? text.replace(text.trim(), () => messages[text.trim()]) : text)
    .replace(/\{(\w+)\}/g, (match, key) => key in values ? values[key] : match) : text;
const source = path => readFile(new URL(`../src/${path}`, import.meta.url), 'utf8');
const storage = new Map();
const localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
globalThis.window = { localStorage };
after(() => { delete globalThis.window; });
async function load(file, mocks = {}, globals = {}) {
  const module = { exports: {} };
  runInNewContext(transformSync(await source(file), { loader: 'jsx', jsx: 'automatic', format: 'cjs' }).code, {
    module, exports: module.exports, console, localStorage, TextEncoder, URL,
    require: name => name in mocks ? mocks[name] : require(name), ...globals,
  });
  return module.exports;
}
const link = ({ to, ...props }) => React.createElement('a', { ...props, href: to });
const i18n = { translate, useTranslation: () => ({ t: translate, language: 'en', locale: 'en-GB' }) };
const baseMocks = {
  '../../i18n': i18n, '../../i18n.jsx': i18n,
  '../../services/localization': { getLocale: () => 'en-GB' },
  'react-router-dom': { Link: link, useNavigate: () => () => {}, useLocation: () => ({}) },
};
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
async function partnerStore(overrides = {}, videos = {}) {
  return (await load('stores/partnerStore.js', {
    '../services/partnerService': { partnerService: { getMyApplication: async () => null, getMyPartner: async () => null,
      getConfigs: async () => [], listApplications: async () => [], listPartners: async () => [], ...overrides } },
    '../services/videoService': { videoService: { getMyVideos: async () => [], getWeeklyCount: async () => ({ count: 0, required: 2 }), ...videos } },
  })).default;
}

test('PARTNER has no pricing, checkout or referral surface and keeps programme routes', async () => {
  const paths = ['App.jsx', 'components/Navbar/Navbar.jsx', 'components/PublicLayout/PublicLayout.jsx',
    'components/Footer/Footer.jsx', 'pages/Account/Access.jsx', 'pages/About/Terms.jsx'];
  for (const path of paths) assert.doesNotMatch(await source(path), /\/pricing|supporters\/pricing|fetchPlans|tab=cgv|parrain|referral/i, path);
  const app = await source('App.jsx');
  for (const route of ['/admin', '/admin/applications', '/admin/videos', '/admin/partners', '/admin/users', '/admin/users/:id', '/admin/quotas', '/admin/notifications']) {
    assert.ok(app.includes(`path="${route}" element={<AdminRoute>`), route);
  }
  for (const route of ['/apply', '/videos', '/videos/submit', '/profile', '/profile/advanced', '/settings', '/settings/security']) assert.ok(app.includes(`path="${route}"`), route);
  const header = await source('components/Navbar/Navbar.jsx');
  assert.ok(header.includes('UserMenu'));
  assert.ok(header.includes('Mon partenariat'));
  assert.doesNotMatch(await source('pages/About/Terms.jsx'), /préparation physique|séances|abonnement.*proposés par/i);
});

test('mobile menu button precedes the brand on the left and submission label is translated', async () => {
  const header = await source('components/Navbar/Navbar.jsx');
  const css = await source('components/Navbar/Navbar.module.scss');
  assert.ok(header.indexOf('<button ref={menuButton}') < header.indexOf('className={styles.brand}'));
  assert.equal((header.match(/ref=\{menuButton\}/g) || []).length, 1);
  assert.match(css, /inset: var\(--navbar-height\) auto 0 0/);
  assert.match(header, /t\(label\)/);
  assert.equal(translate('Soumettre'), 'Submit');
});

test('old programme requests cannot repopulate another session and latest filter wins', async () => {
  const first = deferred();
  const store = await partnerStore({ getMyApplication: () => first.promise });
  const pending = store.getState().loadMyData();
  store.getState().reset();
  first.resolve({ id: 8, socialHandle: 'private' });
  await pending;
  assert.equal(store.getState().application, null);
  assert.equal(store.getState().ready, false);
  assert.equal(store.getState().pending, 0);
  const older = deferred(), newer = deferred();
  let count = 0;
  const filtered = await partnerStore({ listPartners: () => (++count === 1 ? older.promise : newer.promise) });
  const p1 = filtered.getState().loadAllPartners({ status: 'active' });
  const p2 = filtered.getState().loadAllPartners({ status: 'revoked' });
  newer.resolve([{ id: 2 }]); await p2;
  older.resolve([{ id: 1 }]); await p1;
  assert.equal(filtered.getState().allPartners[0].id, 2);
  assert.equal(filtered.getState().loading, false);
});

test('programme API failures are visible and mutations retain exact contracts', async () => {
  const calls = [];
  const store = await partnerStore({
    apply: async data => { calls.push(['apply', data]); return { id: 4, ...data }; },
    reviewApplication: async (id, body) => { calls.push(['review', id, body]); },
    updatePartnerStatus: async () => { throw new Error('Review unavailable'); },
    listPartners: async () => ({ invalid: true }),
  }, {
    submit: async data => { calls.push(['submit', data]); return { id: 7, ...data }; },
    validate: async (id, body) => { calls.push(['validate', id, body]); },
  });
  await store.getState().loadMyData();
  assert.equal(store.getState().ready, true);
  await store.getState().submitApplication({ app: 'primal', socialHandle: '@demo', motivation: 'Example' });
  assert.equal(store.getState().application.app, 'primal');
  await store.getState().submitVideo({ url: 'https://example.invalid/video', mentionsApp: true });
  assert.equal(store.getState().videos[0].id, 7);
  await store.getState().reviewApplication(4, { status: 'approved', adminNotes: 'Welcome' });
  await store.getState().validateVideo(7, { validationStatus: 'approved', qualityScore: 0 });
  assert.deepEqual(calls.map(call => call[0]), ['apply', 'submit', 'review', 'validate']);
  await assert.rejects(store.getState().updatePartnerStatus(4, { status: 'active' }), /Review unavailable/);
  assert.equal(store.getState().errors.partnerStatus, 'Review unavailable');
  await store.getState().loadAllPartners();
  assert.equal(store.getState().errors.allPartners, 'Réponse de liste invalide.');
  assert.equal(store.getState().loading, false);
});

test('auth renewal, logout and failed refresh isolate sessions without logging out on a network failure', async () => {
  storage.clear();
  let resets = 0;
  let me = deferred(), rights = deferred();
  const { useAuthStore: auth } = await load('stores/authStore.js', {
    '../services/authService': { authService: { getMe: () => me.promise } },
    '../services/api': { get: async () => ({ data: { id: 1, firstName: 'Demo' } }) },
    '../config/api': { API_URL: 'https://example.invalid' },
    '../services/entitlements': { fetchEntitlements: () => rights.promise },
    './partnerStore': { getState: () => ({ reset: () => resets++ }) },
  });
  auth.getState().renewSession({ jwt: 'first', user: { id: 2 } });
  assert.equal(localStorage.getItem('partner-token'), 'first');
  const request = auth.getState().refreshUser();
  auth.getState().renewSession({ jwt: 'second', user: { id: 3 } });
  me.resolve({ id: 2, username: 'Old session' }); await request;
  assert.equal(auth.getState().user.id, 3);
  const pendingRights = auth.getState().syncEntitlements();
  auth.getState().logout();
  rights.resolve({ status: 'complete', apps: {} }); await pendingRights;
  assert.equal(auth.getState().entitlements, null);
  assert.equal(auth.getState().token, null);
  auth.getState().renewSession({ jwt: 'third', user: { id: 3 } });
  me = deferred();
  const unavailable = auth.getState().refreshUser();
  me.reject(new Error('Network unavailable')); await unavailable;
  assert.equal(auth.getState().isAuthenticated, true);
  assert.equal(auth.getState().sessionError, 'Network unavailable');
  assert.ok(resets >= 4);
});

test('API adapter uses one /api prefix, anonymous login and current-session expiry only', async () => {
  let request, rejectResponse;
  const requests = [];
  const client = {
    interceptors: { request: { use: fn => { request = fn; } }, response: { use: (_, fn) => { rejectResponse = fn; } } },
    get: (...args) => { requests.push(args); },
  };
  const events = [];
  await load('services/api.js', { axios: { create: () => client }, '../config/api': { API_URL: '' } },
    { window: { dispatchEvent: event => events.push(event) }, CustomEvent: class { constructor(type, data) { this.type = type; this.detail = data.detail; } } });
  localStorage.setItem('partner-token', 'current');
  assert.equal(request({ url: '/api/auth/local', headers: {} }).headers.Authorization, undefined);
  assert.equal(request({ url: '/api/users/me', headers: {} }).headers.Authorization, 'Bearer current');
  await assert.rejects(rejectResponse({ response: { status: 401 }, config: { headers: { Authorization: 'Bearer old' } } }));
  assert.equal(events.length, 0);
  await assert.rejects(rejectResponse({ response: { status: 401 }, config: { headers: { Authorization: 'Bearer current' } } }));
  assert.equal(events[0].detail.token, 'current');
  const { default: adminApi } = await load('services/adminApi.js', { './api': client });
  adminApi.get('/admin/users');
  assert.equal(requests[0][0], '/api/admin/users');
});

test('shared profile whitelist and password/deactivation contracts match the common backend', async () => {
  const { profilePayload } = await load('pages/Account/Profile.jsx', {
    ...baseMocks, '../../stores/authStore': {}, '../../services/adminApi': {}, './Access': () => null, './account.scss': {},
  });
  const payload = profilePayload({ firstName: 'Ada', city: '', vipPrimal: true });
  assert.equal(payload.firstName, 'Ada');
  assert.equal(payload.city, null);
  assert.equal('vipPrimal' in payload, false);
  const calls = [];
  const service = await load('services/accountService.js', {
    './localization.js': { translate }, '../config/api': { API_URL: 'https://example.invalid' },
  }, {
    fetch: async (url, options) => {
      calls.push({ url, options });
      return { ok: true, json: async () => url.endsWith('change-password') ? { jwt: 'renewed', user: { id: 2 } } : { id: 2, blocked: true } };
    },
  });
  assert.ok(service.validatePassword('old', 'short', 'short'));
  assert.ok(service.validatePassword('old', 'é'.repeat(37), 'é'.repeat(37)));
  assert.ok(service.validatePassword('oldpass', 'oldpass', 'oldpass'));
  assert.equal((await service.changePassword('oldpass', 'newpass', 'newpass', 'token')).jwt, 'renewed');
  assert.equal(calls[0].url, 'https://example.invalid/api/auth/change-password');
  assert.deepEqual(JSON.parse(calls[0].options.body), { currentPassword: 'oldpass', password: 'newpass', passwordConfirmation: 'newpass' });
  await service.deactivateAccount(2, 'token');
  assert.equal(calls[1].url, 'https://example.invalid/api/users/2');
});

test('programme, forms and settings render in English without translating user content', async () => {
  const auth = { user: { id: 2, username: 'Bienvenue', email: 'demo@example.invalid' }, isAuthenticated: true, loading: false };
  const store = { application: null, partner: null, ready: true, loading: false, videos: [], weeklyCount: null };
  for (const [file, expected, css] of [
    ['pages/Dashboard/Dashboard.jsx', 'Become an ambassador', './Dashboard.module.scss'],
    ['pages/Apply/Apply.jsx', 'Apply to the Partner programme', './Apply.module.scss'],
    ['pages/Videos/VideoHistory.jsx', 'My videos', './Videos.module.scss'],
    ['pages/Landing/Landing.jsx', 'How does it work?', './Landing.module.scss'],
  ]) {
    const { default: Component } = await load(file, {
      ...baseMocks, [css]: {}, '../../stores/authStore': selector => selector ? selector(auth) : auth,
      '../../stores/partnerStore': () => store, '../../config/apps': { APPS: {}, PLATFORMS: {} },
      '../../components/StatusBadge/StatusBadge': () => null,
      '../../components/LanguageSwitcher/LanguageSwitcher': () => null,
    });

    const html = renderToStaticMarkup(React.createElement(Component));
    assert.ok(html.includes(expected), file);
    if (file.includes('Dashboard')) assert.ok(html.includes('Bienvenue'));
    assert.doesNotMatch(html, /\/pricing|supporters\/pricing/);
  }
});

test('push errors are visible and service worker activation removes only the legacy API cache', async () => {
  const { EcosystemPush } = await load('services/EcosystemPushService.js', {}, {
    navigator: { serviceWorker: { ready: Promise.resolve({ pushManager: {
      getSubscription: async () => ({ unsubscribe: async () => true }),
    } }) } },
    fetch: async () => ({ ok: false, status: 503 }),
  });
  const service = new EcosystemPush('partner', '', () => 'test-only');
  await assert.rejects(service.unsubscribe(), /503/);
  const { EcosystemPush: FailingPush } = await load('services/EcosystemPushService.js', {}, {
    navigator: { serviceWorker: { ready: Promise.resolve({ pushManager: {
      getSubscription: async () => { throw new Error('Subscription unavailable'); },
    } }) } },
  });
  await assert.rejects(new FailingPush('partner', '', () => 'test-only').isSubscribed(), /Subscription unavailable/);
  const listeners = {};
  const deleted = [];
  runInNewContext(await readFile(new URL('../public/push-sw.js', import.meta.url), 'utf8'), {
    self: { addEventListener: (name, handler) => { listeners[name] = handler; } },
    caches: { delete: async name => { deleted.push(name); } },
  });
  let activation;
  listeners.activate({ waitUntil: promise => { activation = promise; } });
  await activation;
  assert.deepEqual(deleted, ['api-cache']);
});

test('authenticated navigation keeps links in a sidebar and language switcher at its bottom', async () => {
  const { default: Navbar } = await load('components/Navbar/Navbar.jsx', {
    ...baseMocks,
    'react-router-dom': { ...baseMocks['react-router-dom'], NavLink: ({ className, end, ...props }) => link({ ...props, className: typeof className === 'function' ? className({ isActive: false }) : className }) },
    './Navbar.module.scss': { sidebarFooter: 'sidebarFooter' },
    '../../stores/authStore': selector => selector({ user: { id: 1, username: 'Admin' }, logout: () => {} }),
    '../EcosystemSwitcher/EcosystemSwitcher': () => React.createElement('span', null, 'Apps'),
    '../UserMenu/UserMenu': () => React.createElement('span', null, 'Account'),
    '../LanguageSwitcher/LanguageSwitcher': () => React.createElement('span', null, 'Language'),
  });
  const html = renderToStaticMarkup(React.createElement(Navbar));
  const header = html.match(/<header[\s\S]*?<\/header>/)?.[0];
  const sidebar = html.match(/<aside[\s\S]*?<\/aside>/)?.[0];
  assert.ok(header && sidebar);
  assert.ok(!header.includes('Language'));
  for (const route of ['/dashboard', '/videos', '/videos/submit', '/about']) assert.ok(sidebar.includes(`href="${route}"`));
  assert.match(sidebar, /<\/nav><div class="sidebarFooter"><span>Language<\/span><\/div><\/aside>/);
  assert.match(html, /aria-controls="partner-sidebar" aria-expanded="false"/);
});

test('home has only its language control and shows dashboard CTA for recognised accounts', async () => {
  const { default: PublicLayout } = await load('components/PublicLayout/PublicLayout.jsx', {
    ...baseMocks, './PublicLayout.scss': {},
    '../../stores/authStore': selector => selector({ isAuthenticated: false }),
    '../LanguageSwitcher/LanguageSwitcher': () => React.createElement('span', null, 'Language'),
    '../EcosystemSwitcher/EcosystemSwitcher': () => null,
    '../Footer/Footer': () => null,
  });
  const shell = renderToStaticMarkup(React.createElement(PublicLayout, { home: true }, 'Home'));
  assert.doesNotMatch(shell, /public-header/);
  for (const connected of [false, true]) {
    const { default: Landing } = await load('pages/Landing/Landing.jsx', {
      ...baseMocks, './Landing.module.scss': {},
      '../../stores/authStore': selector => selector({ isAuthenticated: connected }),
      '../../config/apps': { APPS: {} },
      '../../components/LanguageSwitcher/LanguageSwitcher': () => React.createElement('span', { className: 'language-switcher' }),
    });
    const html = renderToStaticMarkup(React.createElement(Landing));
    assert.ok(html.includes('language-switcher'));
    assert.ok(html.includes(connected ? 'Open dashboard' : 'Become a Partner'));
    assert.ok(html.includes(`href="${connected ? '/dashboard' : '/login'}"`));
    if (connected) assert.ok(!html.includes('Become a Partner'));
  }
});

test('translations cover static UI and programme documents with matching interpolation and tags', async () => {
  const { parse } = require('@babel/parser');
  const traverse = require('@babel/traverse').default;
  const identity = new Set(['Email', 'Freemium', 'Premium', 'VIP', 'Partner', 'PARTNER', 'ID', 'N/A', 'English', 'App', 'Handle', 'Test', 'Contact', 'CGU', 'PRIMAL', 'P', 'SmartCellar', 'ProGarden', 'Farmly', 'LYNX', 'PRÊT·E', 'HerboGenius', 'MentalGate', 'Menu', 'ton@email.com']);
  const walk = async dir => (await Promise.all((await readdir(dir, { withFileTypes: true })).map(entry => entry.isDirectory() ? walk(new URL(`${entry.name}/`, dir)) : new URL(entry.name, dir)))).flat();
  const missing = new Set();
  const check = value => { const key = value.trim(); if (/\p{L}/u.test(key) && !Object.hasOwn(messages, key) && !identity.has(key)) missing.add(key); };
  for (const file of await walk(new URL('../src/', import.meta.url))) {
    if (!/\.(js|jsx)$/.test(file.pathname) || /\/(locales|pwa)\//.test(file.pathname)) continue;
    const ast = parse(await readFile(file, 'utf8'), { sourceType: 'module', plugins: ['jsx'] });
    traverse(ast, {
      CallExpression(path) {
        if (['t', 'translate'].includes(path.node.callee.name) && path.node.arguments[0]?.type === 'StringLiteral') check(path.node.arguments[0].value);
        assert.ok(!(path.node.callee.name === 'translate' && path.findParent(parent => parent.isJSXAttribute() && ['className', 'to', 'type', 'autoComplete'].includes(parent.node.name.name))), `Translated technical attribute in ${file.pathname}`);
      },
      StringLiteral(path) {
        if (file.pathname.endsWith('/About/Terms.jsx') && path.parentPath.isArrayExpression() && !['cgu', 'rgpd'].includes(path.node.value)) check(path.node.value);
        if (file.pathname.endsWith('/config/apps.js') && ['label', 'description'].includes(path.parent.key?.name)) check(path.node.value);
      },
    });
  }
  assert.deepEqual([...missing].sort(), []);
  for (const [fr, en] of Object.entries(messages)) {
    assert.deepEqual((fr.match(/\{\w+\}/g) || []).sort(), (en.match(/\{\w+\}/g) || []).sort(), fr);
    assert.deepEqual((fr.match(/<\/?[a-z]+\/?>/g) || []).sort(), (en.match(/<\/?[a-z]+\/?>/g) || []).sort(), fr);
  }
});
