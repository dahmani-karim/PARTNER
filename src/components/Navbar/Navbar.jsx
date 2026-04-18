import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileVideo, Send, User, Shield, Bell, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../../stores/authStore';
import styles from './Navbar.module.scss';

const Navbar = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = Number(user?.id) === 1;

  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/videos', icon: <FileVideo size={18} />, label: 'Vidéos' },
    { to: '/videos/submit', icon: <Send size={18} />, label: 'Soumettre' },
    { to: '/profile', icon: <User size={18} />, label: 'Profil' },
  ];

  const adminItems = [
    { to: '/admin', icon: <Shield size={18} />, label: 'Admin' },
    { to: '/admin/notifications', icon: <Bell size={18} />, label: 'Push' },
  ];

  const renderLinks = (items) =>
    items.map(({ to, icon, label }) => (
      <NavLink
        key={to}
        to={to}
        className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
        onClick={() => setMobileOpen(false)}
        end={to === '/admin'}
      >
        {icon}
        <span className={styles.label}>{label}</span>
      </NavLink>
    ));

  return (
    <>
      <nav className={styles.navbar}>
        <NavLink to="/dashboard" className={styles.brand}>
          <div className={styles.logo}>P</div>
          <span>Partner</span>
        </NavLink>

        <div className={styles.nav}>
          {renderLinks(navItems)}
          {isAdmin && (
            <>
              <span className={styles.adminBadge}>Admin</span>
              {renderLinks(adminItems)}
            </>
          )}
        </div>

        <div className={styles.actions}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={16} />
            <span className={styles.label}>Déconnexion</span>
          </button>

          <button
            className={styles.mobileMenu}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className={styles.mobileNav}>
          {renderLinks(navItems)}
          {isAdmin && renderLinks(adminItems)}
        </div>
      )}
    </>
  );
};

export default Navbar;
