import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import './Footer.scss';

export default function Footer() {
  const { t } = useTranslation();
  return <footer className="partner-footer">
    <span>© {new Date().getFullYear()} La Caverne du Réfractaire — PARTNER</span>
    <nav aria-label={t('Informations légales')}>
      <Link to="/legal">{t('Mentions légales')}</Link>
      <Link to="/about/terms?tab=cgu">{t('CGU')}</Link>
      <Link to="/about/terms?tab=rgpd">{t('Confidentialité')}</Link>
      <a href="mailto:contact@lacavernedurefractaire.fr">{t('Contact')}</a>
    </nav>
  </footer>;
}
