import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import LanguageSwitcher from '../../components/LanguageSwitcher/LanguageSwitcher';
import { PwaSettings } from '../../pwa/PwaExperience';
import './account.scss';

export default function Settings() {
  const { t, language } = useTranslation();
  return <div className="account-page">
    <h1>{t('Paramètres')}</h1><p>{t('Préférences de l’application PARTNER')}</p>
    <nav className="account-links"><Link to="/profile">{t('Mon profil')}</Link><Link to="/profile/advanced">{t('Mon partenariat')}</Link><Link to="/settings/security">{t('Sécurité du compte')}</Link></nav>
    <section><h2>{t('Langue')}</h2><LanguageSwitcher /></section>
    <PwaSettings language={language} />
  </div>;
}
