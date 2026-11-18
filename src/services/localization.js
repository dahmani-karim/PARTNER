
import dictionary from '../locales/en.js';
import partner from '../locales/partner.js';
import quotas from '../locales/quotas.js';
import admin from '../locales/admin.js';

const KEY = 'partner-language';
const messages = { ...dictionary, ...quotas, ...admin, ...partner };

const listeners = new Set();
let language = readLanguage();

function readLanguage() {
  if (typeof localStorage === 'undefined') return 'fr';
  try {
    return localStorage.getItem(KEY) === 'en' ? 'en' : 'fr';
  } catch (error) {
    console.error('Unable to read the PARTNER language preference', error);
    return 'fr';
  }
}

function updateDocumentLanguage() {
  if (typeof document !== 'undefined') document.documentElement.lang = language;
}

export function getLanguage() {
  return language;
}

export function getLocale() {
  return language === 'en' ? 'en-GB' : 'fr-FR';
}

export function setLanguage(nextLanguage) {
  if (nextLanguage !== 'fr' && nextLanguage !== 'en') throw new Error('Unsupported language');
  localStorage.setItem(KEY, nextLanguage);
  if (language === nextLanguage) return;
  language = nextLanguage;
  updateDocumentLanguage();
  listeners.forEach(listener => listener());
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function translate(text, values = {}) {
  if (typeof text !== 'string') return text;
  const key = text.trim();
  const translated = language === 'en' && Object.hasOwn(messages, text) ? messages[text] :
    language === 'en' && Object.hasOwn(messages, key) ? text.replace(key, () => messages[key]) : text;
  return translated.replace(/\{(\w+)\}/g, (match, key) => Object.hasOwn(values, key) ? String(values[key]) : match);
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', event => {
    if (event.key !== KEY && event.key !== null) return;
    const nextLanguage = readLanguage();
    if (language === nextLanguage) return;
    language = nextLanguage;
    updateDocumentLanguage();
    listeners.forEach(listener => listener());
  });
}
updateDocumentLanguage();
