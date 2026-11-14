import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { createContext, SourceTextModule, SyntheticModule } from 'node:vm';

class Events {
  handlers = new Map();
  addEventListener(name, listener) {
    if (!this.handlers.has(name)) this.handlers.set(name, new Set());
    this.handlers.get(name).add(listener);
  }
  removeEventListener(name, listener) { this.handlers.get(name)?.delete(listener); }
  emit(name, event = {}) { this.handlers.get(name)?.forEach(listener => listener(event)); }
}
const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };

async function setup({ controlled = true, waiting = false, production = true } = {}) {
  const window = new Events();
  const document = new Events();
  const serviceWorker = new Events();
  const registration = new Events();
  const media = new Events();
  media.matches = false;
  const values = new Map();
  const timers = new Map();
  const messages = [];
  let time = 1700000000000;
  let reloads = 0;
  let updates = 0;
  const worker = new Events();
  worker.postMessage = message => messages.push(message);
  worker.state = waiting ? 'installed' : 'installing';
  registration.waiting = waiting ? worker : null;
  registration.active = controlled ? {} : null;
  registration.update = async () => { updates++; };
  serviceWorker.controller = controlled ? {} : null;
  let registerOptions;
  serviceWorker.register = async (url, options) => {
    registerOptions = { url, ...options };
    return registration;
  };
  window.location = { hash: '#/dashboard', reload: () => { reloads++; } };
  window.matchMedia = () => media;
  document.visibilityState = 'visible';
  const navigator = { serviceWorker, onLine: true, userAgent: 'test', platform: 'Linux', maxTouchPoints: 0 };
  const storage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  const context = createContext({
    window, document, navigator, localStorage: storage,
    console: { warn() {}, error() {} },
    Date: class extends Date { static now() { return time; } },
    setInterval() {},
    setTimeout: (callback, delay) => { timers.set(callback, delay); return callback; },
    clearTimeout: callback => timers.delete(callback),
  });
  const module = new SourceTextModule(await readFile(new URL('./runtime.js', import.meta.url), 'utf8'), {
    context,
    initializeImportMeta: meta => { meta.env = { PROD: production, BASE_URL: '/' }; },
  });
  await module.link(() => new SyntheticModule(['pwaConfig'], function () {
    this.setExport('pwaConfig', { id: 'test' });
  }, { context }));
  await module.evaluate();
  await flush();
  return {
    api: module.namespace, window, document, navigator, serviceWorker, registration, worker,
    timers, messages, storage,
    advance: milliseconds => { time += milliseconds; },
    get reloads() { return reloads; },
    get updates() { return updates; },
    get registerOptions() { return registerOptions; },
  };
}

test('one explicit production registration bypasses HTTP worker cache', async () => {
  const env = await setup();
  assert.deepEqual(env.registerOptions, { url: '/sw.js', scope: '/', updateViaCache: 'none' });
  assert.equal((await setup({ production: false })).registerOptions, undefined);
});

test('the native installation event is deferred and consumed exactly once', async () => {
  const env = await setup();
  let prompts = 0;
  let prevented = false;
  env.window.emit('beforeinstallprompt', {
    preventDefault: () => { prevented = true; },
    prompt: async () => { prompts++; },
    userChoice: Promise.resolve({ outcome: 'accepted' }),
  });
  assert.equal(prevented, true);
  assert.equal(env.api.getSnapshot().canPrompt, true);
  env.api.openInstall();
  await env.api.install();
  assert.equal(prompts, 1);
  assert.equal(env.api.getSnapshot().installOpen, false);
  assert.equal(env.api.getSnapshot().installed, false);
  await env.api.install();
  assert.equal(prompts, 1);
  assert.equal(env.api.getSnapshot().error, 'installUnavailable');
  env.window.emit('appinstalled');
  assert.equal(env.api.getSnapshot().installed, true);
});

test('later suppresses automatic reminders for exactly seven days', async () => {
  const env = await setup();
  assert.equal(env.api.reminderDue(), true);
  env.api.openInstall();
  env.api.closeInstall();
  assert.equal(env.api.getSnapshot().installOpen, false);
  env.advance(7 * 86400000 - 1);
  assert.equal(env.api.reminderDue(), false);
  env.advance(1);
  assert.equal(env.api.reminderDue(), true);
});

test('denied prompts cannot be reused and storage failures are explicit', async () => {
  const env = await setup();
  env.window.emit('beforeinstallprompt', {
    preventDefault() {}, prompt: async () => {},
    userChoice: Promise.resolve({ outcome: 'dismissed' }),
  });
  await env.api.install();
  assert.equal(env.api.getSnapshot().canPrompt, false);
  assert.equal(env.api.reminderDue(), false);
  env.storage.setItem = () => { throw new Error('blocked'); };
  env.api.closeInstall();
  assert.equal(env.api.getSnapshot().error, 'storageError');
});

test('installation errors are surfaced without declaring success', async () => {
  const env = await setup();
  env.window.emit('beforeinstallprompt', {
    preventDefault() {}, prompt: async () => { throw new Error('failed'); },
  });
  await env.api.install();
  assert.equal(env.api.getSnapshot().error, 'installError');
  assert.equal(env.api.getSnapshot().installed, false);
});

test('a native install invitation is available on landing and authentication routes', async () => {
  const env = await setup();
  env.window.emit('beforeinstallprompt', { preventDefault() {} });
  for (const route of ['/', '/login', '/register', '/forgot-password', '/reset-password?code=test']) {
    env.window.location.hash = `#${route}`;
    assert.equal(env.api.canInviteInstall(), true, route);
  }
});

test('Android offers installation instructions even when Chrome withholds the native event', async () => {
  const env = await setup();
  assert.equal(env.api.canInviteInstall(), false);
  env.navigator.userAgent = 'Mozilla/5.0 (Linux; Android 14) Chrome/130 Mobile Safari/537.36';
  assert.equal(env.api.canInviteInstall(), true);
  assert.equal(env.api.getSnapshot().canPrompt, false);
  env.api.openInstall();
  assert.equal(env.api.canInviteInstall(), false);
  env.api.closeInstall();
  assert.equal(env.api.canInviteInstall(), false);
  env.advance(7 * 86400000);
  assert.equal(env.api.canInviteInstall(), true);
  env.window.emit('appinstalled');
  assert.equal(env.api.canInviteInstall(), false);
});

test('accepted installation does not reopen the Android invitation before appinstalled', async () => {
  const env = await setup();
  env.navigator.userAgent = 'Android';
  env.window.emit('beforeinstallprompt', {
    preventDefault() {}, prompt: async () => {},
    userChoice: Promise.resolve({ outcome: 'accepted' }),
  });
  await env.api.install();
  assert.equal(env.api.getSnapshot().installAccepted, true);
  assert.equal(env.api.getSnapshot().installed, false);
  assert.equal(env.api.canInviteInstall(), false);
});

test('standalone mode never automatically invites installation', async () => {
  const env = await setup();
  env.navigator.userAgent = 'Android';
  env.window.matchMedia().matches = true;
  env.window.matchMedia().emit('change');
  env.window.emit('beforeinstallprompt', { preventDefault() {} });
  assert.equal(env.api.canInviteInstall(), false);
});

test('a waiting worker never activates or reloads without a user action', async () => {
  const env = await setup({ waiting: true });
  assert.equal(env.api.getSnapshot().ready, true);
  await env.api.checkForUpdate(true);
  assert.equal(env.messages.length, 0);
  assert.equal(env.reloads, 0);
  env.api.applyUpdate();
  assert.equal(env.messages[0].type, 'SKIP_WAITING');
  assert.equal(env.reloads, 0);
  env.serviceWorker.emit('controllerchange');
  assert.equal(env.reloads, 1);
  assert.equal(env.timers.size, 0);
});

test('other tabs do not reload on controllerchange; their explicit action reloads them', async () => {
  const env = await setup();
  env.serviceWorker.emit('controllerchange');
  assert.equal(env.reloads, 0);
  assert.equal(env.api.getSnapshot().ready, true);
  env.api.applyUpdate();
  assert.equal(env.reloads, 1);
});

test('first service worker control does not request an update or reload', async () => {
  const env = await setup({ controlled: false });
  env.serviceWorker.emit('controllerchange');
  assert.equal(env.reloads, 0);
  assert.equal(env.api.getSnapshot().ready, false);
});

test('update download is not incorrectly reported as up to date', async () => {
  const env = await setup();
  env.registration.update = async () => {
    env.registration.installing = env.worker;
    env.registration.emit('updatefound');
  };
  await env.api.checkForUpdate(true);
  assert.equal(env.api.getSnapshot().status, 'downloading');
  assert.equal(env.api.getSnapshot().checking, true);
  env.registration.waiting = env.worker;
  env.registration.installing = null;
  env.worker.state = 'installed';
  env.worker.emit('statechange');
  assert.equal(env.api.getSnapshot().ready, true);
  assert.equal(env.api.getSnapshot().checking, false);
  assert.equal(env.reloads, 0);
});

test('first installation and download failure have distinct statuses', async () => {
  for (const terminal of ['installed', 'redundant']) {
    const env = await setup({ controlled: false });
    env.registration.installing = env.worker;
    env.registration.emit('updatefound');
    env.worker.state = terminal;
    env.worker.emit('statechange');
    assert.equal(env.api.getSnapshot().ready, false);
    assert.equal(env.api.getSnapshot().checking, false);
    assert.equal(terminal === 'installed' ? env.api.getSnapshot().status : env.api.getSnapshot().error,
      terminal === 'installed' ? 'offlineReady' : 'downloadError');
  }
});

test('foreground checks are throttled, manual checks bypass the five minute cooldown', async () => {
  const env = await setup();
  env.window.emit('focus');
  await flush();
  env.window.emit('focus');
  await flush();
  assert.equal(env.updates, 1);
  await env.api.checkForUpdate(true);
  assert.equal(env.updates, 2);
  env.advance(5 * 60000);
  env.document.emit('visibilitychange');
  await flush();
  assert.equal(env.updates, 3);
});

test('offline and failed checks never report a successful update', async () => {
  const env = await setup();
  env.navigator.onLine = false;
  await env.api.checkForUpdate(true);
  assert.equal(env.api.getSnapshot().error, 'offline');
  assert.equal(env.updates, 0);
  env.navigator.onLine = true;
  env.registration.update = async () => { throw new Error('network'); };
  await env.api.checkForUpdate(true);
  assert.equal(env.api.getSnapshot().error, 'checkError');
  assert.equal(env.api.getSnapshot().checking, false);
});

test('a failed activation times out; late activation still does not reload', async () => {
  const env = await setup({ waiting: true });
  env.api.applyUpdate();
  const [[timeout, delay]] = env.timers;
  assert.equal(delay, 15000);
  timeout();
  assert.equal(env.api.getSnapshot().applying, false);
  assert.equal(env.api.getSnapshot().error, 'activationError');
  env.serviceWorker.emit('controllerchange');
  assert.equal(env.reloads, 0);
});

test('no pending update and unavailable development worker are explicit', async () => {
  const env = await setup({ waiting: true });
  env.registration.waiting = null;
  env.api.applyUpdate();
  assert.equal(env.api.getSnapshot().error, 'updateUnavailable');
  const dev = await setup({ production: false });
  await dev.api.checkForUpdate(true);
  assert.equal(dev.api.getSnapshot().error, 'development');
});
