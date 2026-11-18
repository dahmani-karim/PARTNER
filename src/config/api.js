const configuredOrigin = (import.meta.env.VITE_API_URL || 'https://smart-cellar-api.onrender.com')
  .replace(/\/+$/, '').replace(/\/api$/, '');

export const API_URL = import.meta.env.DEV ? '' : configuredOrigin;
