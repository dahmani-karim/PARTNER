import { Link } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import EcosystemSwitcher from '../EcosystemSwitcher/EcosystemSwitcher';
import Footer from '../Footer/Footer';
import { useTranslation } from '../../i18n';
import './PublicLayout.scss';

export default function PublicLayout({ children, home = false }) {
  const { t } = useTranslation();
  const connected = useAuthStore(s => s.isAuthenticated);
  return <div className="public-layout">
    {!home && <header className="public-header"><Link className="public-brand" to="/">Partner</Link>
      <nav aria-label={t('Navigation principale')}>
        <Link to="/about">{t('À propos')}</Link>
        <Link to={connected ? '/dashboard' : '/login'}>{t(connected ? 'Tableau de bord' : 'Connexion')}</Link>
      </nav><div className="public-header__actions"><LanguageSwitcher /><EcosystemSwitcher /></div>
    </header>}
    <main>{children}</main><Footer />
  </div>;
}
