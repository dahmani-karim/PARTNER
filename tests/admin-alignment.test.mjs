import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as access from '../src/pages/Admin/userAccess.js';
import admin from '../src/locales/admin.js';
import quotas from '../src/locales/quotas.js';

const require = createRequire(import.meta.url);
const { transformSync } = require('esbuild');
const source = path => readFile(new URL(`../src/${path}`, import.meta.url), 'utf8');
const translate = (text, values = {}) => ({ ...quotas, ...admin }[text] || text)
  .replace(/\{(\w+)\}/g, (match, key) => key in values ? values[key] : match);
async function load(path, mocks = {}) {
  const module = { exports: {} };
  runInNewContext(transformSync(await source(path), { loader: 'jsx', jsx: 'automatic', format: 'cjs' }).code, {
    module, exports: module.exports, console,
    require: name => name in mocks ? mocks[name] : require(name),
  });
  return module.exports;
}
const link = ({ to, ...props }) => React.createElement('a', { ...props, href: to });
const baseMocks = {
  '../../stores/authStore': { useAuthStore: { getState: () => ({ syncEntitlements: async () => {} }) } },
  '../../i18n': { useTranslation: () => ({ t: translate, locale: 'en-GB' }) },
  '../../services/adminApi': {},
  './userAccess': access,
  './UserAdministration.scss': {},
  'react-router-dom': { Link: link, useNavigate: () => () => {}, useParams: () => ({ id: '2' }) },
};

test('exclusive status counters and search match SmartCellar for all five VIP applications', () => {
  const users = [
    { username: 'Alice', email: 'alice@example.invalid' }, { username: 'Alice paid', premiumFarmly: true },
    { username: 'Alice VIP', vipLynx: true }, { username: 'Alice Partner', isPartner: true, isVIP: true },
    { username: 'Bob', blocked: true, vipPrimal: true },
  ];
  assert.deepEqual(users.map(access.accessLevel), ['freemium', 'premium', 'vip', 'partner', 'vip']);
  const candidates = access.filterUsers(users, { search: ' ALICE ', activity: 'active' });
  assert.equal(candidates.length, 4);
  for (const level of ['freemium', 'premium', 'vip', 'partner']) assert.equal(access.filterUsers(candidates, { access: level }).length, 1);
  assert.equal(access.filterUsers(users, { activity: 'blocked' }).length, 1);
  assert.equal(access.VIP_APPS.length, 5);
  for (const [, , field] of access.VIP_APPS) assert.equal(access.accessLevel({ [field]: true }), 'vip');
  assert.equal(access.householdIcon(':briefcase:'), '👜');
  assert.equal(access.householdIcon(null), '🏠');
});

test('user table renders counters and links; detail renders Partner, five VIP actions and safe returns', async () => {
  const accounts = [{ id: 2, username: 'Test', email: 'test@example.invalid', vipPrimal: true }];
  const reactState = states => {
    let index = 0;
    return { ...React, useState: initial => [index < states.length ? states[index++] : initial, () => {}] };
  };
  const { default: Users } = await load('pages/Admin/UserAdministration.jsx', {
    ...baseMocks, react: reactState([accounts, false, false, '', '', 'all', 'all']),
  });
  const list = renderToStaticMarkup(React.createElement(Users));
  assert.match(list, /User management/);
  assert.match(list, /href="\/admin\/users\/2"/);
  assert.match(list, /href="\/admin"/);
  assert.equal((list.match(/aria-pressed=/g) || []).length, 5);
  for (const [id, isPartner, busy] of [1, 2].flatMap(id => [false, true].flatMap(isPartner => [false, true].map(busy => [id, isPartner, busy])))) {
    const user = { ...accounts[0], id, isPartner, gardenCount: 0, farmAnimalCount: 7, householdCount: 3, productCount: 71,
      households: [{ id: 1, name: 'Work', icon: 'briefcase', members: [{ id: 2 }, { id: 3 }] },
        { id: 2, name: 'Empty', members: [] }, { id: 3, name: 'Unknown' }] };
    const { UserDetail } = await load('pages/Admin/UserAdministration.jsx', {
      ...baseMocks, react: reactState([user, false, busy, '', '']),
    });
    const detail = renderToStaticMarkup(React.createElement(UserDetail));
    const fieldsets = [];
    let accessButtons = 0;
    for (const [tag] of detail.matchAll(/<\/?fieldset\b[^>]*>|<button\b[^>]*>/g)) {
      if (tag.startsWith('</fieldset')) { fieldsets.pop(); continue; }
      if (tag.startsWith('<fieldset')) { fieldsets.push(/\bdisabled=/.test(tag)); continue; }
      if (!/class="action-btn /.test(tag)) continue;
      const accessAction = /toggle-(premium|vip)/.test(tag);
      if (accessAction) accessButtons++;
      const disabled = fieldsets.some(Boolean) || /\bdisabled=/.test(tag);
      assert.equal(disabled, busy || (!accessAction && id === 1), tag);
    }
    assert.equal(accessButtons, 14);
    assert.match(detail, /href="\/admin\/users"/);
    for (const label of ['LYNX', 'PRIMAL', 'SmartCellar', 'ProGarden', 'Farmly']) assert.ok(detail.includes(label));
    assert.ok(detail.includes(isPartner ? 'Revoke Partner status' : 'Enrol as Partner'));
    assert.ok(detail.includes('👜'));
    assert.equal((detail.match(/class="stat-card"/g) || []).length, 12);
    for (const app of ['SmartCellar', 'ProGarden', 'Farmly']) assert.ok(detail.includes(`Statistics ${app}</h2>`));
    assert.equal((detail.match(/class="stat-value">—</g) || []).length, 8);
    assert.match(detail, /class="stat-value">0</);
    assert.match(detail, /class="stat-value">71</);
    assert.equal((detail.match(/class="household-card"/g) || []).length, 3);
    assert.ok(detail.includes('2 member(s)'));
    assert.ok(detail.includes('0 member(s)'));
    assert.equal((detail.match(/member\(s\)/g) || []).length, 2);
    assert.ok(detail.includes('Households (3)'));
    for (const name of ['user-detail__header', 'user-detail__content', 'info-grid', 'info-item', 'info-value', 'access-management', 'account-actions', 'actions-section', 'partner-management', 'action-btn reset', 'action-btn delete']) assert.ok(detail.includes(name), name);
  }
});

test('push administration uses the SmartCellar form, preview and history columns', async () => {
  const { default: PushNotifications } = await load('pages/Admin/PushNotifications.jsx', {
    ...baseMocks,
    './PushNotifications.scss': {},
  });
  const html = renderToStaticMarkup(React.createElement(PushNotifications));
  for (const name of ['push-notifications__content', 'notification-form', 'notification-history', 'empty-history', 'preview-card', 'form-actions', 'cron-test-section']) assert.ok(html.includes(name), name);
  assert.match(html, /href="\/admin"/);
  assert.ok(html.includes('Automatic system test'));
});

test('administration home uses the SmartCellar card structure', async () => {
  const { default: Home } = await load('pages/Admin/AdminDashboard.jsx', {
    ...baseMocks, './AdminHome.scss': {}, './Admin.module.scss': {},
    '../../services/localization': { getLocale: () => 'en-GB' },
    '../../stores/partnerStore': () => ({ stats: null, loadStats() {} }),
    '../../i18n': { translate, useTranslation: () => ({ t: translate }) },
  });
  const html = renderToStaticMarkup(React.createElement(Home));
  for (const name of ['admin-home', 'admin-section', 'admin-actions']) assert.ok(html.includes(name), name);
  assert.equal((html.match(/class="admin-button /g) || []).length, 3);
  assert.equal((html.match(/class="admin-button__icon"/g) || []).length, 3);
  assert.ok(html.includes('notifications-admin-button'));
  for (const route of ['/admin/applications', '/admin/videos', '/admin/partners', '/admin/quotas']) assert.ok(html.includes(`href="${route}"`), route);
});

test('SmartCellar component styles retain the application page background', async () => {
  const [layout, home, users, detail, push, quota] = await Promise.all([
    source('pages/Admin/UserAdministration.scss'), source('pages/Admin/AdminHome.scss'),
    source('pages/Admin/UserManagement.scss'), source('pages/Admin/UserDetail.scss'),
    source('pages/Admin/PushNotifications.scss'), source('pages/Admin/QuotaSettings.scss'),
  ]);
  assert.doesNotMatch(layout + home, /#0f1e3a/i);
  assert.ok(home.includes('var(--text-secondary)'));
  assert.ok(users.includes('.users-table'));
  assert.ok(detail.includes('&.grant-partner'));
  assert.ok(detail.includes('&.reset'));
  assert.ok(push.includes('grid-template-columns: 1fr 1fr'));
  assert.ok(quota.includes('background: #5665bd'));
  const { css } = require('sass').compileString(layout, {
    loadPaths: [new URL('../src/pages/Admin/', import.meta.url).pathname],
  });
  assert.match(css, /\n\.user-management__stats \.stat-card \{\s*min-height: 120px/);
  assert.match(css, /\n\.quota-settings\.admin-page > h1 \{/);
  assert.match(css, /\n\.push-notifications \.notification-form \.form-group label \{/);
});

test('global quota editor includes all four LYNX resources and returns to administration', async () => {
  const hook = await load('hooks/useQuotaConfig.js', { '../config/api': { API_URL: '' } });
  const config = { revision: 3, apps: structuredClone(hook.DEFAULT_QUOTAS) };
  assert.equal(hook.validQuotaConfiguration(config), true);
  assert.equal(config.apps.lynx.sources.freemium, 5);
  assert.equal(config.apps.lynx.trackers.freemium, 3);
  assert.equal(config.apps.lynx.zones.freemium, 1);
  assert.equal(config.apps.lynx.dossiers.freemium, 2);
  const { default: QuotaSettings } = await load('pages/Admin/QuotaSettings.jsx', {
    ...baseMocks, './QuotaSettings.scss': {},
    'react-redux': { useSelector: () => 'test-only' },
    '../../hooks/useQuotaConfig': () => ({ config, error: '', loading: false }),
  });
  const html = renderToStaticMarkup(React.createElement(QuotaSettings));
  assert.equal((html.match(/type="checkbox"/g) || []).length, 16);
  assert.match(html, /href="\/admin"/);
  for (const label of ['LYNX', 'Followed sources', 'Trackers', 'Monitored zones', 'Personal dossiers']) assert.ok(html.includes(label), label);
});

test('administration translations preserve interpolation and referral entry points stay hidden', async () => {
  for (const [fr, en] of Object.entries(admin)) {
    assert.equal(typeof en, 'string');
    const placeholders = value => [...value.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
    assert.deepEqual(placeholders(fr), placeholders(en), fr);
  }
  const app = await source('App.jsx');
  assert.match(app, /path="\/admin\/users\/:id"/);
  assert.ok(app.includes('AdminRoute'));
  const header = await source('components/Navbar/Navbar.jsx');
  assert.doesNotMatch(header, /referral|parrain/i);
});
