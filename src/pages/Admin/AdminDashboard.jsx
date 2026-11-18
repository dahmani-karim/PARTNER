import { getLocale } from "../../services/localization";
import { translate, useTranslation } from "../../i18n";
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, FileVideo, Users, UserCog } from 'lucide-react';
import usePartnerStore from '../../stores/partnerStore';
import styles from './Admin.module.scss';
import './AdminHome.scss';
const APP_LABELS = {
  smartcellar: '🍷 SmartCellar',
  progarden: '🌱 ProGarden',
  farmly: '🐔 Farmly',
  prete: '🏠 PRET·E',
  lynx: '🎵 LYNX',
  herbogenius: '🌿 HerboGenius',
  primal: '💪 PRIMAL'
};
const APP_COLORS = {
  smartcellar: '#7C3AED',
  progarden: '#16A34A',
  farmly: '#B45309',
  prete: '#0284C7',
  lynx: '#EC4899',
  herbogenius: '#15803D',
  primal: '#DC2626'
};
const AdminDashboard = () => {
  useTranslation();
  const {
    stats,
    loadStats
  } = usePartnerStore();
  useEffect(() => {
    loadStats();
  }, []);
  return <div className={`${styles.adminPage} partner-admin-dashboard`}>
      <div className={styles.header}>
        <div>
          <h1>{translate("Administration Partner")}</h1>
          <p>{translate("Gestion du programme ambassadeur")}</p>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.gold}`}>
          <div className={styles.statValue}>{stats?.activePartners || 0}</div>
          <div className={styles.statLabel}>{translate("Partners actifs")}</div>
        </div>
        <div className={`${styles.statCard} ${styles.orange}`}>
          <div className={styles.statValue}>{stats?.pendingApplications || 0}</div>
          <div className={styles.statLabel}>{translate("Candidatures en attente")}</div>
        </div>
        <div className={`${styles.statCard} ${styles.blue}`}>
          <div className={styles.statValue}>{stats?.pendingVideos || 0}</div>
          <div className={styles.statLabel}>{translate("Vidéos à valider")}</div>
        </div>
        <div className={`${styles.statCard} ${styles.green}`}>
          <div className={styles.statValue}>{stats?.videosThisWeek || 0}</div>
          <div className={styles.statLabel}>{translate("Vidéos cette semaine")}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats?.totalVideos || 0}</div>
          <div className={styles.statLabel}>{translate("Vidéos totales")}</div>
        </div>
        <div className={`${styles.statCard} ${styles.red}`}>
          <div className={styles.statValue}>{stats?.suspendedPartners || 0}</div>
          <div className={styles.statLabel}>{translate("Partners suspendus")}</div>
        </div>
      </div>

      <section className="admin-home"><div className="admin-section"><div className="admin-actions">
        {[['/admin/quotas', '⚙️', 'Quotas des applications', 'Régler les limites gratuites et Premium de l’écosystème.', 'users-button'], ['/admin/users', '👥', 'Utilisateurs et accès', 'Consulter les comptes et gérer leurs accès.', 'users-button'], ['/admin/notifications', '📢', 'Notifications push', 'Envois, ciblage et historique des notifications.', 'notifications-admin-button']].map(([to, icon, title, description, variant]) => <Link className={`admin-button ${variant}`} to={to} key={to}>
          <span className="admin-button__icon" aria-hidden="true">{icon}</span><div className="admin-button__content"><h2>{translate(title)}</h2><p>{translate(description)}</p></div>
        </Link>)}
      </div></div></section>
      {/* Navigation cards */}
      <div className={styles.navGrid}>
        <Link to="/admin/applications" className={styles.navCard}>
          <div className={styles.navIcon} style={{
          background: 'var(--color-warning-bg)'
        }}>
            <FileText size={24} />
          </div>
          <div>
            <div className={styles.navTitle}>{translate("Candidatures")}</div>
            <div className={styles.navDesc}>{translate("Examiner et valider les candidatures")}</div>
          </div>
          {stats?.pendingApplications > 0 && <span className={styles.navBadge}>{stats.pendingApplications}</span>}
        </Link>

        <Link to="/admin/videos" className={styles.navCard}>
          <div className={styles.navIcon} style={{
          background: 'var(--color-info-bg)'
        }}>
            <FileVideo size={24} />
          </div>
          <div>
            <div className={styles.navTitle}>{translate("Vidéos")}</div>
            <div className={styles.navDesc}>{translate("Valider les vidéos soumises")}</div>
          </div>
          {stats?.pendingVideos > 0 && <span className={styles.navBadge}>{stats.pendingVideos}</span>}
        </Link>

        <Link to="/admin/partners" className={styles.navCard}>
          <div className={styles.navIcon} style={{
          background: 'var(--color-success-bg)'
        }}>
            <Users size={24} />
          </div>
          <div>
            <div className={styles.navTitle}>{translate("Partners")}</div>
            <div className={styles.navDesc}>{translate("Gérer les ambassadeurs et leurs statuts")}</div>
          </div>
        </Link>

        <Link to="/admin/users" className={styles.navCard}>
          <div className={styles.navIcon} style={{
          background: 'var(--color-info-bg)'
        }}>
            <UserCog size={24} />
          </div>
          <div>
            <div className={styles.navTitle}>{translate("Utilisateurs")}</div>
            <div className={styles.navDesc}>{translate("Gérer tous les utilisateurs de l'écosystème")}</div>
          </div>
        </Link>
      </div>

      {/* Partners par app */}
      {stats?.partnersByApp && Object.keys(stats.partnersByApp).some(app => stats.partnersByApp[app].total > 0) && <div style={{
      marginTop: '1rem'
    }}>
          <h2 style={{
        fontSize: '1.125rem',
        marginBottom: '1rem'
      }}>{translate("Répartition par application")}</h2>
          <div className={styles.statsGrid}>
            {Object.entries(stats.partnersByApp).filter(([, data]) => data.total > 0).map(([app, data]) => <div key={app} className={styles.statCard} style={{
          borderLeft: `3px solid ${APP_COLORS[app] || '#888'}`
        }}>
                <div className={styles.statValue}>{data.active}<span style={{
              fontSize: '0.85rem',
              color: 'var(--color-text-secondary)'
            }}>/{data.total}</span></div>
                <div className={styles.statLabel}>{APP_LABELS[app] || app}</div>
                <div style={{
            fontSize: '0.75rem',
            color: 'var(--color-text-secondary)'
          }}>{translate("actifs / total")}</div>
              </div>)}
          </div>
        </div>}
    </div>;
};
export default AdminDashboard;
