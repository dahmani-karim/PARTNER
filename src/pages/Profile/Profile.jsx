import { getLocale } from "../../services/localization";
import { translate, useTranslation } from "../../i18n";
import { useState, useEffect } from 'react';
import useAuthStore from '../../stores/authStore';
import usePartnerStore from '../../stores/partnerStore';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { APPS, PLATFORMS } from '../../config/apps';
import { EcosystemPush } from '../../services/EcosystemPushService';
import { API_URL } from '../../config/api';
import styles from './Profile.module.scss';
const Profile = () => {
  useTranslation();
  const user = useAuthStore(s => s.user);
  const {
    partner,
    application
  } = usePartnerStore();
  const token = useAuthStore(s => s.token);

  // ─── Push Notifications ───────────────────────────────────
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [notifHistory, setNotifHistory] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pushError, setPushError] = useState('');
  const [pushService] = useState(() => new EcosystemPush('partner', API_URL, () => localStorage.getItem('partner-token')));
  useEffect(() => {
    let active = true;
    setPushError('');
    setNotifHistory([]);
    setUnreadCount(0);
    setPushSubscribed(false);
    if (EcosystemPush.isSupported()) {
      pushService.isSubscribed().then(value => {
        if (active) setPushSubscribed(value);
      }).catch(error => {
        if (active) setPushError(error.message);
      });
      pushService.getHistory(1, 20).then(data => {
        if (!active) return;
        setNotifHistory(data.notifications || []);
        setUnreadCount(data.unread || 0);
      }).catch(error => {
        if (active) setPushError(error.message);
      });
    }
    return () => {
      active = false;
    };
  }, [pushService, token]);
  return <div className={styles.profilePage}>
      <div className={styles.header}>
        <h1>{translate("Mon partenariat")}</h1>
      </div>

      {/* Informations utilisateur */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>{translate("Informations")}</h2>
        <div className={styles.row}>
          <span className={styles.rowLabel}>{translate("Nom d'utilisateur")}</span>
          <span className={styles.rowValue}>{user?.username}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>{translate("Email")}</span>
          <span className={styles.rowValue}>{user?.email}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>{translate("Membre depuis")}</span>
          <span className={styles.rowValue}>
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(getLocale()) : '—'}
          </span>
        </div>
        {Number(user?.id) === 1 && <div className={styles.row}>
            <span className={styles.rowLabel}>{translate("Rôle")}</span>
            <span className={styles.premiumBadge}>{translate("👑 Administrateur Partner")}</span>
          </div>}
      </div>

      {/* Statut Partner */}
      {partner && <div className={styles.card}>
          <h2 className={styles.cardTitle}>{translate("Statut Partner")}</h2>
          <div className={styles.row}>
            <span className={styles.rowLabel}>{translate("Statut")}</span>
            <StatusBadge status={partner.status} type="partner" />
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>{translate("Application")}</span>
            <span className={styles.rowValue}>
              {APPS[partner.app]?.icon} {APPS[partner.app]?.name}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>{translate("Plateforme")}</span>
            <span className={styles.rowValue}>
              {PLATFORMS[partner.platform]?.icon} {translate(PLATFORMS[partner.platform]?.name)}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>{translate("Handle")}</span>
            <span className={styles.rowValue}>{partner.socialHandle}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>{translate("Début du partenariat")}</span>
            <span className={styles.rowValue}>
              {partner.startDate ? new Date(partner.startDate).toLocaleDateString(getLocale()) : '—'}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>{translate("Vidéos soumises")}</span>
            <span className={styles.rowValue}>{partner.totalVideos || 0}</span>
          </div>
        </div>}

      {/* Candidature en cours */}
      {!partner && application && <div className={styles.card}>
          <h2 className={styles.cardTitle}>{translate("Candidature")}</h2>
          <div className={styles.row}>
            <span className={styles.rowLabel}>{translate("Statut")}</span>
            <StatusBadge status={application.status} type="application" />
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>{translate("Application")}</span>
            <span className={styles.rowValue}>
              {APPS[application.app]?.icon} {APPS[application.app]?.name}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>{translate("Date de candidature")}</span>
            <span className={styles.rowValue}>
              {new Date(application.createdAt).toLocaleDateString(getLocale())}
            </span>
          </div>
        </div>}

      {/* Notifications Push */}
      <div className={styles.card}>
        {pushError && <p role="alert">{pushError}</p>}
        <h2 className={styles.cardTitle}>{translate("🔔 Notifications ")}{unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
        </h2>

        {EcosystemPush.getPermission() === 'denied' && <div className={styles.warning}>{translate("Les notifications sont bloquées. Modifiez les paramètres de votre navigateur pour les activer.")}</div>}

        <div className={styles.row}>
          <span className={styles.rowLabel}>{translate("Notifications Push")}</span>
          <button disabled={pushLoading || !EcosystemPush.isSupported()} className={`${styles.toggle} ${pushSubscribed ? styles.toggleOn : ''}`} onClick={async () => {
          setPushLoading(true);
          try {
            if (pushSubscribed) {
              await pushService.unsubscribe();
              setPushSubscribed(false);
            } else {
              await pushService.subscribe();
              setPushSubscribed(true);
            }
          } catch (err) {
            console.error(err);
            setPushError(err.message);
          }
          setPushLoading(false);
        }}>
            <span className={styles.toggleKnob} />
          </button>
        </div>

        {pushSubscribed && <div className={styles.pushActions}>
            <button className={styles.btnSecondary} onClick={async () => {
          try {
            await pushService.sendTest('Test Partner', 'Notification de test Partner');
          } catch (err) {
            console.error(err);
            setPushError(err.message);
          }
        }}>{translate("Tester")}</button>
            {unreadCount > 0 && <button className={styles.btnSecondary} onClick={async () => {
          try {
            await pushService.markRead();
            setNotifHistory(h => h.map(n => ({
              ...n,
              read: true
            })));
            setUnreadCount(0);
          } catch (err) {
            console.error(err);
            setPushError(err.message);
          }
        }}>{translate("Tout marquer lu")}</button>}
          </div>}

        {notifHistory.length > 0 && <div className={styles.notifHistory}>
            {notifHistory.slice(0, 5).map(n => <div key={n.id} className={`${styles.notifItem} ${n.read ? styles.read : styles.unread}`}>
                <div>
                  <strong>{n.title}</strong>
                  <p>{n.body}</p>
                </div>
                <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexShrink: 0
          }}>
                  <small>{new Date(n.sentAt || n.createdAt).toLocaleDateString(getLocale())}</small>
                  <button onClick={async () => {
              try {
                await pushService.deleteHistoryItem(n.id);
                setNotifHistory(prev => prev.filter(item => item.id !== n.id));
                if (!n.read) setUnreadCount(count => Math.max(0, count - 1));
              } catch (e) {
                console.error(e);
                setPushError(e.message);
              }
            }} title={translate("Supprimer")} style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              opacity: 0.4,
              transition: 'opacity 0.2s',
              padding: '2px 4px'
            }} onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.4}>🗑️</button>
                </div>
              </div>)}
          </div>}
      </div>
    </div>;
};
export default Profile;
