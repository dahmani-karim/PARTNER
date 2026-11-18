import { translate, useTranslation } from "../../i18n.jsx";
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserMenu.scss';

// ─────────────────────────────────────────────────────────────────────────────
// Menu utilisateur — composant commun à toutes les applications.
//
// Piloté par ses props, jamais par un store : les six applications de
// l'écosystème utilisent Redux, Zustand ou un Context selon leur époque. Le
// branchement reste donc à la charge de chaque header, et ce fichier demeure
// identique partout.
//
//   user      { username, email }
//   avatarUrl URL absolue, ou null pour retomber sur les initiales
//   items     [{ to, label, icon }] — `icon` accepte un emoji ou un nœud React
//   onLogout  appelé avant la redirection
//   logoutTo  route de sortie (défaut '/')
// ─────────────────────────────────────────────────────────────────────────────

export default function UserMenu({
  user,
  avatarUrl = null,
  items = [],
  onLogout,
  logoutTo = '/',
  logoutLabel = 'Déconnexion'
}) {
  useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (!open) return undefined;
    const onPointer = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = e => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  if (!user) return null;
  const label = user.username || user.email || translate('Utilisateur');
  const initials = label.slice(0, 2).toUpperCase();
  const go = to => {
    setOpen(false);
    navigate(to);
  };
  const handleLogout = () => {
    setOpen(false);
    if (onLogout) onLogout();
    navigate(logoutTo);
  };
  return <div className="user-menu" ref={ref}>
      <button type="button" className={`user-menu__avatar${open ? ' user-menu__avatar--open' : ''}${avatarUrl ? ' user-menu__avatar--img' : ''}`} onClick={() => setOpen(v => !v)} aria-label={translate("Menu utilisateur")} aria-expanded={open} aria-haspopup="menu" title={label}>
        {avatarUrl ? <img src={avatarUrl} alt="" onError={e => {
        e.currentTarget.style.display = 'none';
      }} /> : initials}
      </button>

      {open && <div className="user-menu__dropdown" role="menu">
          <div className="user-menu__info">
            <span className="user-menu__name">{user.username || translate('Utilisateur')}</span>
            {user.email && <span className="user-menu__email">{user.email}</span>}
          </div>

          <div className="user-menu__sep" />

          {items.map(item => <button key={item.to} type="button" className="user-menu__item" role="menuitem" onClick={() => go(item.to)}>
              <span className="user-menu__item-icon">{item.icon}</span>
              <span>{translate(item.label)}</span>
            </button>)}

          <div className="user-menu__sep" />

          <button type="button" className="user-menu__item user-menu__item--danger" role="menuitem" onClick={handleLogout}>
            <span className="user-menu__item-icon">🚪</span>
            <span>{logoutLabel}</span>
          </button>
        </div>}
    </div>;
}
