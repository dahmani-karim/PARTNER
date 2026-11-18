import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import styles from './Layout.module.scss';
import useAuthStore from '../../stores/authStore';
import usePartnerStore from '../../stores/partnerStore';
import { useTranslation } from '../../i18n';

const Layout = ({ children }) => {
  const { t } = useTranslation();
  const sessionError = useAuthStore(s => s.sessionError);
  const accessError = useAuthStore(s => s.accessError);
  const errors = usePartnerStore(s => s.errors);
  const messages = [...new Set([sessionError, accessError, ...Object.values(errors)].filter(Boolean))];
  return (
    <div className={styles.layout}>
      <Navbar />
      <main className={styles.main}>
        {messages.length > 0 && <div className="session-alert" role="alert">{messages.map(message => <p key={message}>{t(message)}</p>)}<button className="partner-btn" onClick={() => window.location.reload()}>{t('Recharger')}</button></div>}
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default Layout;
