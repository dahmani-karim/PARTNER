import { useState, useEffect, useCallback } from 'react';
import { API_URL as API_ORIGIN } from '../config/api';

export const DEFAULT_QUOTAS = {
  smartcellar: { households: { freemium: 1, premium: 5 } },
  progarden: { gardens: { freemium: 1, premium: 5 } },
  lynx: { sources: { freemium: 5, premium: null }, trackers: { freemium: 3, premium: null }, zones: { freemium: 1, premium: null }, dossiers: { freemium: 2, premium: null } },
  farmly: { animals: { freemium: 20, premium: null }, incubations: { freemium: 1, premium: null } },
};
export function validQuotaConfiguration(data) {
  return Number.isSafeInteger(data?.revision) && data.revision >= 0 &&
    Object.entries(DEFAULT_QUOTAS).every(([app, resources]) =>
      Object.keys(resources).every(resource => {
        const tiers = data.apps?.[app]?.[resource];
        const valid = value => value === null || (Number.isSafeInteger(value) && value >= 0 && value <= 1000000);
        return tiers && valid(tiers.freemium) && valid(tiers.premium) &&
          (tiers.premium === null || (tiers.freemium !== null && tiers.premium >= tiers.freemium));
      }));
}
export default function useQuotaConfig() {
  const [config, setConfig] = useState({ revision: 0, apps: DEFAULT_QUOTAS });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`${API_ORIGIN}/api/quota-config`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Quotas HTTP ${response.status}`);
      const data = await response.json();
      if (!validQuotaConfiguration(data)) throw new Error('Invalid quota configuration');
      setConfig(current => data.revision >= current.revision ? data : current);
      setError('');
      return data;
    } catch (failure) {
      console.error('Quota configuration unavailable', failure);
      setError(failure.message);
      throw failure;
    } finally { setLoading(false); }
  }, []);
  useEffect(() => {
    const update = () => { refresh().catch(() => { /* Displayed through error. */ }); };
    update();
    window.addEventListener('focus', update);
    const timer = setInterval(update, 60000);
    return () => { clearInterval(timer); window.removeEventListener('focus', update); };
  }, [refresh]);
  return { config, loading, error, refresh };
}
