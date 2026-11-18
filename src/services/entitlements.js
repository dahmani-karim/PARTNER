import api from './api';

export async function fetchEntitlements() {
  const { data } = await api.get('/api/me/entitlements');
  if (!data || typeof data.status !== 'string' || !data.apps || Array.isArray(data.apps)) {
    throw new Error('Réponse des droits invalide.');
  }
  return data;
}
