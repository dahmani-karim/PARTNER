import { pwaConfig } from './config';

const listeners = new Set();
const reminderKey = `${pwaConfig.id}:pwa-install-reminder`;
const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
let state = {
  installed: standalone(),
  installAccepted: false,
  canPrompt: false,
  installOpen: false,
  ready: false,
  checking: false,
  applying: false,
  status: '',
  error: '',
};
let promptEvent;
let registration;
let controllerChanged = false;
let lastCheck = 0;
let updateTimer;
const publish = (patch) => {
  state = { ...state, ...patch };
  listeners.forEach(listener => listener());
};
export const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const getSnapshot = () => state;
export const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
export const isAndroid = () => /Android/i.test(navigator.userAgent);

export function canInviteInstall() {
  return !state.installed && !state.installAccepted && !state.installOpen
    && (state.canPrompt || isIOS() || isAndroid()) && reminderDue();
}

export function reminderDue(now = Date.now()) {
  try {
    const dismissedAt = Number(localStorage.getItem(reminderKey));
    return !dismissedAt || now - dismissedAt >= 7 * 86400000;
  } catch (error) {
    console.warn('[PWA] Cannot read installation reminder', error);
    return false;
  }
}

export function openInstall() {
  publish({ installOpen: true, error: '' });
}

export function closeInstall() {
  try {
    localStorage.setItem(reminderKey, String(Date.now()));
  } catch (error) {
    console.warn('[PWA] Cannot save installation reminder', error);
    publish({ error: 'storageError' });
  }
  publish({ installOpen: false });
}

export async function install() {
  if (!promptEvent) {
    publish({ error: 'installUnavailable' });
    return;
  }
  const event = promptEvent;
  promptEvent = undefined;
  publish({ canPrompt: false, error: '' });
  try {
    await event.prompt();
    const { outcome } = await event.userChoice;
    if (outcome === 'accepted') publish({ installOpen: false, installAccepted: true });
    else closeInstall();
  } catch (error) {
    console.error('[PWA] Installation failed', error);
    publish({ error: 'installError' });
  }
}

function watchRegistration(value) {
  registration = value;
  if (value.waiting) publish({ ready: true, status: 'ready' });
  const watchWorker = (worker) => {
    if (!worker) return;
    publish({ checking: true, status: 'downloading' });
    const changed = () => {
      if (worker.state === 'installed') {
        const ready = Boolean(value.waiting || value.active);
        publish({ checking: false, ready, status: ready ? 'ready' : 'offlineReady' });
        worker.removeEventListener('statechange', changed);
      } else if (worker.state === 'redundant') {
        publish({ checking: false, status: '', error: 'downloadError' });
        worker.removeEventListener('statechange', changed);
      }
    };
    worker.addEventListener('statechange', changed);
    changed();
  };
  value.addEventListener('updatefound', () => watchWorker(value.installing));
  watchWorker(value.installing);
}

export async function checkForUpdate(manual = false) {
  if (state.checking || state.applying) return;
  if (!manual && Date.now() - lastCheck < 5 * 60000) return;
  if (!navigator.onLine) {
    publish({ status: '', error: 'offline' });
    return;
  }
  if (!registration) {
    publish({ status: '', error: import.meta.env.PROD ? 'registrationError' : 'development' });
    return;
  }
  lastCheck = Date.now();
  publish({ checking: true, error: '', status: 'checking' });
  try {
    await registration.update();
    if (registration.waiting) publish({ ready: true, status: 'ready' });
    else if (!registration.installing) publish({ status: state.ready ? 'ready' : 'current' });
  } catch (error) {
    console.error('[PWA] Update check failed', error);
    publish({ status: '', error: 'checkError' });
  } finally {
    if (!registration.installing) publish({ checking: false });
  }
}

export function applyUpdate() {
  if (!state.ready || state.applying) return;
  if (controllerChanged) {
    window.location.reload();
    return;
  }
  if (!registration?.waiting) {
    publish({ error: 'updateUnavailable' });
    return;
  }
  publish({ applying: true, error: '' });
  // Only this window may reload; other open tabs keep their current work.
  updateTimer = setTimeout(() => {
    publish({ applying: false, error: 'activationError' });
  }, 15000);
  registration.waiting.postMessage({ type: 'SKIP_WAITING' });
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  promptEvent = event;
  publish({ canPrompt: true });
});
window.addEventListener('appinstalled', () => {
  promptEvent = undefined;
  publish({ installed: true, canPrompt: false, installOpen: false });
});
window.matchMedia('(display-mode: standalone)').addEventListener('change', () => {
  publish({ installed: standalone() });
});

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  let hadController = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (state.applying) {
      clearTimeout(updateTimer);
      window.location.reload();
    } else if (hadController) {
      controllerChanged = true;
      publish({ ready: true, checking: false, status: 'ready' });
    }
    hadController = true;
  });
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
    scope: import.meta.env.BASE_URL,
    updateViaCache: 'none',
  }).then(watchRegistration).catch(error => {
    console.error('[PWA] Registration failed', error);
    publish({ error: 'registrationError' });
  });
  window.addEventListener('focus', () => checkForUpdate());
  window.addEventListener('online', () => checkForUpdate());
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForUpdate();
  });
  setInterval(() => {
    if (document.visibilityState === 'visible') checkForUpdate();
  }, 60 * 60000);
}
