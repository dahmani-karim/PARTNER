import { useState, useEffect } from 'react';
import useAuthStore from '../../stores/authStore';
import usePartnerStore from '../../stores/partnerStore';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { APPS, PLATFORMS } from '../../config/apps';
import { EcosystemPush } from '../../services/EcosystemPushService';
import { API_URL } from '../../config/api';
import styles from './Profile.module.scss';

const Profile = () => {
  const user = useAuthStore((s) => s.user);
  const { partner, application } = usePartnerStore();

  // ─── Push Notifications ───────────────────────────────────
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [notifHistory, setNotifHistory] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [pushService] = useState(() =>
    new EcosystemPush('partner', API_URL, () => localStorage.getItem('partner-token'))
  );

  useEffect(() => {
    if (EcosystemPush.isSupported()) {
      pushService.isSubscribed().then(setPushSubscribed);
      pushService.getHistory(1, 20).then((data) => {
        setNotifHistory(data.notifications || []);
        setUnreadCount(data.unread || 0);
      }).catch(() => {});
    }
  }, [pushService]);

  return (
    <div className={styles.profilePage}>
      <div className={styles.header}>
        <h1>Mon profil</h1>
      </div>

      {/* Informations utilisateur */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Informations</h2>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Nom d'utilisateur</span>
          <span className={styles.rowValue}>{user?.username}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Email</span>
          <span className={styles.rowValue}>{user?.email}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Membre depuis</span>
          <span className={styles.rowValue}>
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '—'}
          </span>
        </div>
        {Number(user?.id) === 1 && (
          <div className={styles.row}>
            <span className={styles.rowLabel}>Rôle</span>
            <span className={styles.premiumBadge}>👑 Administrateur Partner</span>
          </div>
        )}
      </div>

      {/* Statut Partner */}
      {partner && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Statut Partner</h2>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Statut</span>
            <StatusBadge status={partner.status} type="partner" />
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Application</span>
            <span className={styles.rowValue}>
              {APPS[partner.app]?.icon} {APPS[partner.app]?.name}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Plateforme</span>
            <span className={styles.rowValue}>
              {PLATFORMS[partner.platform]?.icon} {PLATFORMS[partner.platform]?.name}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Handle</span>
            <span className={styles.rowValue}>{partner.socialHandle}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Début du partenariat</span>
            <span className={styles.rowValue}>
              {partner.startDate ? new Date(partner.startDate).toLocaleDateString('fr-FR') : '—'}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Vidéos soumises</span>
            <span className={styles.rowValue}>{partner.totalVideos || 0}</span>
          </div>
        </div>
      )}

      {/* Candidature en cours */}
      {!partner && application && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Candidature</h2>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Statut</span>
            <StatusBadge status={application.status} type="application" />
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Application</span>
            <span className={styles.rowValue}>
              {APPS[application.app]?.icon} {APPS[application.app]?.name}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Date de candidature</span>
            <span className={styles.rowValue}>
              {new Date(application.createdAt).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>
      )}

      {/* Notifications Push */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          🔔 Notifications {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
        </h2>

        {EcosystemPush.getPermission() === 'denied' && (
          <div className={styles.warning}>
            Les notifications sont bloquées. Modifiez les paramètres de votre navigateur pour les activer.
          </div>
        )}

        <div className={styles.row}>
          <span className={styles.rowLabel}>Notifications Push</span>
          <button
            disabled={pushLoading || !EcosystemPush.isSupported()}
            className={`${styles.toggle} ${pushSubscribed ? styles.toggleOn : ''}`}
            onClick={async () => {
              setPushLoading(true);
              try {
                if (pushSubscribed) {
                  await pushService.unsubscribe();
                  setPushSubscribed(false);
                } else {
                  await pushService.subscribe();
                  setPushSubscribed(true);
                }
              } catch (err) { console.error(err); }
              setPushLoading(false);
            }}
          >
            <span className={styles.toggleKnob} />
          </button>
        </div>

        {pushSubscribed && (
          <div className={styles.pushActions}>
            <button
              className={styles.btnSecondary}
              onClick={async () => {
                try { await pushService.sendTest('Test Partner', 'Notification de test Partner'); }
                catch (err) { console.error(err); }
              }}
            >
              Tester
            </button>
            {unreadCount > 0 && (
              <button
                className={styles.btnSecondary}
                onClick={async () => {
                  await pushService.markRead();
                  setNotifHistory((h) => h.map((n) => ({ ...n, read: true })));
                  setUnreadCount(0);
                }}
              >
                Tout marquer lu
              </button>
            )}
          </div>
        )}

        {notifHistory.length > 0 && (
          <div className={styles.notifHistory}>
            {notifHistory.slice(0, 5).map((n) => (
              <div key={n.id} className={`${styles.notifItem} ${n.read ? styles.read : styles.unread}`}>
                <div>
                  <strong>{n.title}</strong>
                  <p>{n.body}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  <small>{new Date(n.sentAt || n.createdAt).toLocaleDateString('fr-FR')}</small>
                  <button onClick={async () => { try { await pushService.deleteHistoryItem(n.id); } catch(e) { console.error(e); } setNotifHistory(prev => prev.filter(item => item.id !== n.id)); }} title="Supprimer" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: 0.4, transition: 'opacity 0.2s', padding: '2px 4px' }} onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.4}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
