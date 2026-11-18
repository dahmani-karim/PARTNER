import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileVideo, Send, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import useAuthStore from '../../stores/authStore';
import styles from './Navbar.module.scss';
import EcosystemSwitcher from '../EcosystemSwitcher/EcosystemSwitcher';
import UserMenu from '../UserMenu/UserMenu';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import { useTranslation } from '../../i18n';

export default function Navbar() {
  const { t } = useTranslation();
  const user = useAuthStore(s => s.user);
  const avatarUrl = useAuthStore(s => s.avatarUrl);
  const logout = useAuthStore(s => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const menuButton = useRef(null);
  useEffect(() => setMobileOpen(false), [location.pathname, location.search]);
  useEffect(() => {
    if (!mobileOpen) return;
    const close = event => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [mobileOpen]);
  const items = [
    { to: '/profile', label: 'Mon profil', icon: '👤' },
    { to: '/profile/advanced', label: 'Mon partenariat', icon: '🤝' },
    { to: '/settings', label: 'Paramètres', icon: '⚙️' },
    ...(Number(user?.id) === 1 ? [{ to: '/admin', label: 'Administration', icon: '🛠️' }] : []),
  ];
  const navItems = [
    ['/dashboard', LayoutDashboard, 'Tableau de bord'],
    ['/videos', FileVideo, 'Mes vidéos'],
    ['/videos/submit', Send, 'Soumettre'],
  ];
  const links = <>
    {navItems.map(([to, Icon, label]) => <NavLink key={to} to={to} end className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`} onClick={() => setMobileOpen(false)}>
      <Icon size={18} /><span className={styles.label}>{t(label)}</span>
    </NavLink>)}
    <NavLink to="/about" className={styles.navLink} onClick={() => setMobileOpen(false)}>{t('À propos')}</NavLink>
  </>;
  return <>
    <header className={styles.navbar}>
      <NavLink to="/dashboard" className={styles.brand}><div className={styles.logo}>P</div><span>Partner</span></NavLink>
      <div className={styles.actions}>
        <EcosystemSwitcher />
        <UserMenu user={user} avatarUrl={avatarUrl} items={items} onLogout={logout} logoutLabel={t('Déconnexion')} />
        <button ref={menuButton} type="button" className={styles.mobileMenu} aria-label={t('Menu')} aria-controls="partner-sidebar" aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
    {mobileOpen && <button type="button" className={styles.backdrop} aria-label={t('Fermer le menu')} onClick={() => setMobileOpen(false)} />}
    <aside id="partner-sidebar" className={`${styles.sidebar} ${mobileOpen ? styles.open : ''}`}>
      <nav className={styles.nav} aria-label={t('Navigation principale')}>{links}</nav>
      <div className={styles.sidebarFooter}><LanguageSwitcher /></div>
    </aside>
  </>;
}
