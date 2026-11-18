import { useCallback, useSyncExternalStore } from 'react';
import { getLanguage, getLocale, setLanguage, subscribe, translate } from './services/localization.js';
export { translate } from './services/localization.js';
export function useTranslation() {
  const language = useSyncExternalStore(subscribe, getLanguage, () => 'fr');
  const t = useCallback((text, values) => translate(text, values), [language]);
  return {
    t,
    language,
    locale: getLocale(),
    setLanguage
  };
}
