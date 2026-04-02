import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, FileVideo, Users } from 'lucide-react';
import usePartnerStore from '../../stores/partnerStore';
import styles from './Admin.module.scss';

const AdminDashboard = () => {
  const { stats, loadStats } = usePartnerStore();

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className={styles.adminPage}>
      <div className={styles.header}>
        <div>
          <h1>Administration Partner</h1>
          <p>Gestion du programme ambassadeur</p>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.gold}`}>
          <div className={styles.statValue}>{stats?.activePartners || 0}</div>
          <div className={styles.statLabel}>Partners actifs</div>
        </div>
        <div className={`${styles.statCard} ${styles.orange}`}>
          <div className={styles.statValue}>{stats?.pendingApplications || 0}</div>
          <div className={styles.statLabel}>Candidatures en attente</div>
        </div>
        <div className={`${styles.statCard} ${styles.blue}`}>
          <div className={styles.statValue}>{stats?.pendingVideos || 0}</div>
          <div className={styles.statLabel}>Vidéos à valider</div>
        </div>
        <div className={`${styles.statCard} ${styles.green}`}>
          <div className={styles.statValue}>{stats?.videosThisWeek || 0}</div>
          <div className={styles.statLabel}>Vidéos cette semaine</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats?.totalVideos || 0}</div>
          <div className={styles.statLabel}>Vidéos totales</div>
        </div>
        <div className={`${styles.statCard} ${styles.red}`}>
          <div className={styles.statValue}>{stats?.suspendedPartners || 0}</div>
          <div className={styles.statLabel}>Partners suspendus</div>
        </div>
      </div>

      {/* Navigation cards */}
      <div className={styles.navGrid}>
        <Link to="/admin/applications" className={styles.navCard}>
          <div className={styles.navIcon} style={{ background: 'var(--color-warning-bg)' }}>
            <FileText size={24} />
          </div>
          <div>
            <div className={styles.navTitle}>Candidatures</div>
            <div className={styles.navDesc}>Examiner et valider les candidatures</div>
          </div>
          {stats?.pendingApplications > 0 && (
            <span className={styles.navBadge}>{stats.pendingApplications}</span>
          )}
        </Link>

        <Link to="/admin/videos" className={styles.navCard}>
          <div className={styles.navIcon} style={{ background: 'var(--color-info-bg)' }}>
            <FileVideo size={24} />
          </div>
          <div>
            <div className={styles.navTitle}>Vidéos</div>
            <div className={styles.navDesc}>Valider les vidéos soumises</div>
          </div>
          {stats?.pendingVideos > 0 && (
            <span className={styles.navBadge}>{stats.pendingVideos}</span>
          )}
        </Link>

        <Link to="/admin/partners" className={styles.navCard}>
          <div className={styles.navIcon} style={{ background: 'var(--color-success-bg)' }}>
            <Users size={24} />
          </div>
          <div>
            <div className={styles.navTitle}>Partners</div>
            <div className={styles.navDesc}>Gérer les ambassadeurs et leurs statuts</div>
          </div>
        </Link>
      </div>

      {/* Partners par app */}
      {stats?.partnersByApp && (
        <div style={{ marginTop: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Répartition par application</h2>
          <div className={styles.statsGrid}>
            {Object.entries(stats.partnersByApp).map(([app, data]) => (
              <div key={app} className={styles.statCard}>
                <div className={styles.statValue}>{data.active}/{data.total}</div>
                <div className={styles.statLabel}>{app} (actifs/total)</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
