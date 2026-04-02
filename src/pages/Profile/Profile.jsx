import useAuthStore from '../../stores/authStore';
import usePartnerStore from '../../stores/partnerStore';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { APPS, PLATFORMS } from '../../config/apps';
import styles from './Profile.module.scss';

const Profile = () => {
  const user = useAuthStore((s) => s.user);
  const { partner, application } = usePartnerStore();

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
        {user?.partnerAdmin && (
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
    </div>
  );
};

export default Profile;
