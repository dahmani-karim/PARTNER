import { translate, useTranslation } from '../../i18n.jsx';
import { useState } from 'react';
import './LanguageSwitcher.scss';
const FLAGS = {
  fr: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" width="24" height="16">
      <rect width="1" height="2" fill="#002395" />
      <rect width="1" height="2" x="1" fill="#fff" />
      <rect width="1" height="2" x="2" fill="#ED2939" />
    </svg>,
  en: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="24" height="12">
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="2" />
      <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6" />
    </svg>
};
export default function LanguageSwitcher() {
  const {
    t,
    language,
    setLanguage
  } = useTranslation();
  const [error, setError] = useState('');
  return <div className="language-switcher" role="group" aria-label={t('Langue de l’interface')}>
      {Object.entries(FLAGS).map(([code, flag]) => <button key={code} type="button" lang={code} title={code === 'fr' ? translate("Français") : 'English'} aria-label={code === 'fr' ? translate("Français") : 'English'} aria-pressed={language === code} onClick={() => {
      try {
        setLanguage(code);
        setError('');
      } catch (failure) {
        console.error('Language preference could not be saved', failure);
        setError(language === 'en' ? 'Unable to save language.' : 'Impossible d’enregistrer la langue.');
      }
    }}>
          <span aria-hidden="true">{flag}</span>
        </button>)}
      {error && <span role="alert">{error}</span>}
    </div>;
}
