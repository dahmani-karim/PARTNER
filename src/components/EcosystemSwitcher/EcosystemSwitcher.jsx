import { useEffect, useRef, useState } from 'react';
import { ECOSYSTEM_APPS, HOME_LINK, SOCIAL_LINKS, getAppUrl } from '../../config/ecosystem';
import './EcosystemSwitcher.scss';

// ─────────────────────────────────────────────────────────────────────────────
// App-switcher de l'écosystème — composant commun à toutes les applications.
//
// Volontairement sans dépendance : ni store, ni bibliothèque d'icônes, ni
// routeur. Il ne lit que `config/ecosystem.js`. C'est ce qui permet de le
// déposer tel quel dans tous les dépôts dont les piles diffèrent.
//
// L'apparence est pilotée par des variables CSS (voir le .scss). Chaque
// application garde donc ses couleurs et son ambiance sans toucher au JSX.
// ─────────────────────────────────────────────────────────────────────────────

// Glyphes de marque en SVG inline : le socle doit rester installable dans les
// dépôts dont les bibliothèques d'icônes diffèrent, ou sont absentes.
const SOCIAL_GLYPHS = {
  youtube: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  tiktok: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
  discord: 'M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z',
};

export default function EcosystemSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="eco-switcher" ref={ref}>
      <button
        type="button"
        className={`eco-switcher__btn${open ? ' eco-switcher__btn--active' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Changer d'application"
        aria-expanded={open}
        aria-haspopup="menu"
        title="Écosystème La Caverne"
      >
        <span className="eco-switcher__dots" aria-hidden="true">
          <span /><span /><span />
          <span /><span /><span />
          <span /><span /><span />
        </span>
      </button>

      {open && (
        <div className="eco-switcher__dropdown" role="menu">
          <p className="eco-switcher__label">Écosystème La Caverne</p>

          <div className="eco-switcher__grid">
            {ECOSYSTEM_APPS.map((app) => {
              const tint = { background: `${app.color}22`, color: app.color };

              if (app.current) {
                return (
                  <div
                    key={app.id}
                    className="eco-switcher__app eco-switcher__app--current"
                    aria-current="true"
                  >
                    <span className="eco-switcher__app-icon" style={tint}>{app.emoji}</span>
                    <span className="eco-switcher__app-name">{app.name}</span>
                    <span className="eco-switcher__tag">actuel</span>
                  </div>
                );
              }

              if (app.disabled) {
                return (
                  <div
                    key={app.id}
                    className="eco-switcher__app eco-switcher__app--disabled"
                    title={`${app.name} — bientôt disponible`}
                  >
                    <span className="eco-switcher__app-icon">{app.emoji}</span>
                    <span className="eco-switcher__app-name">{app.name}</span>
                    {app.comingSoon && <span className="eco-switcher__tag">bientôt</span>}
                  </div>
                );
              }

              return (
                <a
                  key={app.id}
                  href={getAppUrl(app)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="eco-switcher__app"
                  title={`${app.description} — Ouvrir dans une autre fenêtre ou dans l'application installée, selon votre navigateur`}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                >
                  <span className="eco-switcher__app-icon" style={tint}>{app.emoji}</span>
                  <span className="eco-switcher__app-name">{app.name}</span>
                </a>
              );
            })}
          </div>

          <p className="eco-switcher__hint">
            L'ouverture dans l'app installée dépend de votre navigateur et de ses réglages de liens.
          </p>

          <a
            className="eco-switcher__home"
            href={HOME_LINK.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            <span aria-hidden="true">{HOME_LINK.emoji}</span>
            <span className="eco-switcher__home-name">{HOME_LINK.label}</span>
            {HOME_LINK.description && (
              <span className="eco-switcher__home-desc">{HOME_LINK.description}</span>
            )}
          </a>

          <div className="eco-switcher__socials">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.id}
                className={`eco-switcher__social eco-switcher__social--${social.id}`}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                title={social.label}
                onClick={() => setOpen(false)}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d={SOCIAL_GLYPHS[social.id]} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
