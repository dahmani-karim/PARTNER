import { getLocale } from "../../services/localization";
import { translate, useTranslation } from "../../i18n";
import { Link } from 'react-router-dom';
import { Send, FileVideo, FileText, ArrowRight } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import usePartnerStore from '../../stores/partnerStore';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { APPS, PLATFORMS } from '../../config/apps';
import styles from './Dashboard.module.scss';
const Dashboard = () => {
  useTranslation();
  const user = useAuthStore(s => s.user);
  const {
    application,
    partner,
    videos,
    weeklyCount,
    loading,
    ready
  } = usePartnerStore();
  if (loading || !ready) {
    return <div className={styles.dashboard}><p>{translate("Chargement...")}</p></div>;
  }

  // Pas encore de candidature
  if (!application && !partner) {
    return <div className={styles.dashboard}>
        <div className={styles.header}>
          <h1>{translate("Bienvenue, ")}<span>{user?.username}</span></h1>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>👑</div>
          <h2>{translate("Deviens Ambassadeur")}</h2>
          <p>{translate("Tu n'as pas encore de candidature en cours. Postule pour devenir Partner et bénéficie d’un accès Premium offert à l’écosystème.")}</p>
          <Link to="/apply" className={`${styles.actionBtn} ${styles.primary}`}>{translate("Postuler maintenant ")}<ArrowRight size={16} />
          </Link>
        </div>
      </div>;
  }

  // Candidature en attente
  if (application && application.status === 'pending' && !partner) {
    return <div className={styles.dashboard}>
        <div className={styles.header}>
          <h1>{translate("Bienvenue, ")}<span>{user?.username}</span></h1>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⏳</div>
          <h2>{translate("Candidature en cours d'examen")}</h2>
          <p>{translate("Ta candidature pour ")}<strong>{APPS[application.app]?.name}</strong>{translate(" est en cours de validation. Tu seras notifié dès qu'une décision sera prise.")}</p>
          <StatusBadge status="pending" type="application" />
        </div>
      </div>;
  }

  // Candidature rejetée
  if (application && application.status === 'rejected' && !partner) {
    return <div className={styles.dashboard}>
        <div className={styles.header}>
          <h1>{translate("Bienvenue, ")}<span>{user?.username}</span></h1>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>😔</div>
          <h2>{translate("Candidature non retenue")}</h2>
          <p>{translate("Malheureusement, ta candidature pour ")}<strong>{APPS[application.app]?.name}</strong>{translate(" n'a pas été retenue.")}{application.adminNotes && <><br /><em>{translate("Raison : ")}{application.adminNotes}</em></>}
          </p>
          <StatusBadge status="rejected" type="application" />
        </div>
      </div>;
  }

  // Partner actif (ou warning/suspended/revoked)
  if (partner) {
    const app = APPS[partner.app];
    const recentVideos = videos.slice(0, 5);
    const count = weeklyCount?.count;
    const required = weeklyCount?.required;
    const progress = required > 0 ? Math.min(count / required * 100, 100) : 0;
    return <div className={styles.dashboard}>
        <div className={styles.header}>
          <h1>{translate("Dashboard Partner")}</h1>
          <p>{translate("Bienvenue ")}{user?.username}{translate(" — Ambassadeur ")}{app?.name}</p>
        </div>

        {/* Warning banner */}
        {partner.status === 'warning' && <div className={styles.warningBanner}>
            <span className={styles.warningIcon}>⚠️</span>
            <div>
              <strong>{translate("Attention :")}</strong>{translate(" Tu n'as pas atteint ton quota de vidéos récemment. Continue à publier pour maintenir ton statut Partner.")}</div>
          </div>}

        {partner.status === 'suspended' && <div className={styles.warningBanner} style={{
        background: 'var(--color-danger-bg)',
        borderColor: 'rgba(239, 68, 68, 0.2)'
      }}>
            <span className={styles.warningIcon}>⏸️</span>
            <div>
              <strong>{translate("Statut suspendu :")}</strong>{translate(" Ton accès premium a été temporairement désactivé. Contacte l'administration pour plus d'informations.")}</div>
          </div>}

        {/* Status card */}
        <div className={styles.statusCard}>
          <div className={styles.statusHeader}>
            <div className={styles.statusTitle}>
              <StatusBadge status={partner.status} type="partner" />
              <span className={styles.appTag}>{app?.icon} {app?.name}</span>
            </div>
            <span className={styles.appTag}>
              {PLATFORMS[partner.platform]?.icon} {partner.socialHandle}
            </span>
          </div>

          {/* Stats */}
          <div className={styles.statsGrid}>
            <div className={`${styles.stat} ${styles.gold}`}>
              <div className={styles.statValue}>{partner.totalVideos || 0}</div>
              <div className={styles.statLabel}>{translate("Vidéos totales")}</div>
            </div>
            <div className={`${styles.stat} ${count >= required ? styles.green : styles.red}`}>
              <div className={styles.statValue}>{count ?? '—'}/{required ?? '—'}</div>
              <div className={styles.statLabel}>{translate("Cette semaine")}</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>
                {videos.filter(v => v.validationStatus === 'approved').length}
              </div>
              <div className={styles.statLabel}>{translate("Vidéos validées")}</div>
            </div>
          </div>

          {/* Progress bar */}
          {weeklyCount && ['active', 'warning'].includes(partner.status) && <div className={styles.progressSection}>
              <div className={styles.progressLabel}>
                <span className={styles.progressCount}>{translate("Quota hebdomadaire")}</span>
                <span className={styles.progressTarget}>{count} / {required}{translate(" vidéos")}</span>
              </div>
              <div className={styles.progressBar}>
                <div className={`${styles.progressFill} ${progress >= 100 ? styles.complete : progress < 50 ? styles.warning : ''}`} style={{
              width: `${progress}%`
            }} />
              </div>
            </div>}

          {/* Actions */}
          {['active', 'warning'].includes(partner.status) && <div className={styles.actions}>
              <Link to="/videos/submit" className={`${styles.actionBtn} ${styles.primary}`}>
                <Send size={16} />{translate(" Soumettre une vidéo")}</Link>
              <Link to="/videos" className={`${styles.actionBtn} ${styles.secondary}`}>
                <FileVideo size={16} />{translate(" Mes vidéos")}</Link>
            </div>}
        </div>

        {/* Recent videos */}
        {recentVideos.length > 0 && <div className={styles.recentSection}>
            <h2 className={styles.sectionTitle}>{translate("Dernières vidéos")}</h2>
            <div className={styles.videoList}>
              {recentVideos.map(video => <div key={video.id} className={styles.videoItem}>
                  <div className={styles.videoInfo}>
                    <div className={styles.videoTitle}>
                      {PLATFORMS[video.platform]?.icon} {video.title}
                    </div>
                    <div className={styles.videoMeta}>
                      {new Date(video.createdAt).toLocaleDateString(getLocale())} • {translate(PLATFORMS[video.platform]?.name)}
                    </div>
                  </div>
                  <StatusBadge status={video.validationStatus} type="video" />
                </div>)}
            </div>
          </div>}
      </div>;
  }
  return null;
};
export default Dashboard;
