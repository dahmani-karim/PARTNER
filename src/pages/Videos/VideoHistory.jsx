import { getLocale } from "../../services/localization";
import { translate, useTranslation } from "../../i18n";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, ExternalLink } from 'lucide-react';
import usePartnerStore from '../../stores/partnerStore';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { PLATFORMS } from '../../config/apps';
import styles from './Videos.module.scss';
const VideoHistory = () => {
  useTranslation();
  const {
    videos,
    partner
  } = usePartnerStore();
  const [filter, setFilter] = useState('all');
  const filteredVideos = filter === 'all' ? videos : videos.filter(v => v.validationStatus === filter);
  const isActive = partner && ['active', 'warning'].includes(partner.status);
  return <div className={styles.videosPage}>
      <div className={styles.header}>
        <div>
          <h1>{translate("Mes vidéos")}</h1>
          <p>{translate('{count} vidéo(s) soumise(s)', { count: videos.length })}</p>
        </div>
        {isActive && <Link to="/videos/submit" className={styles.actionBtn}>
            <Send size={16} />{translate(" Soumettre une vidéo")}</Link>}
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        {[{
        key: 'all',
        label: 'Toutes'
      }, {
        key: 'pending',
        label: 'En attente'
      }, {
        key: 'approved',
        label: 'Validées'
      }, {
        key: 'rejected',
        label: 'Refusées'
      }].map(({
        key,
        label
      }) => <button key={key} className={`${styles.filterBtn} ${filter === key ? styles.active : ''}`} onClick={() => setFilter(key)}>
            {translate(label)}
          </button>)}
      </div>

      {filteredVideos.length === 0 ? <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎬</div>
          <h2>{translate("Aucune vidéo")}</h2>
          <p>
            {filter === 'all' ? translate("Tu n'as pas encore soumis de vidéo.") : translate("Aucune vidéo avec le statut \"{value0}\".", {
          value0: filter
        })}
          </p>
          {isActive && <Link to="/videos/submit" className={styles.actionBtn}>
              <Send size={16} />{translate(" Soumettre ma première vidéo")}</Link>}
        </div> : <div className={styles.videoList}>
          {filteredVideos.map(video => <div key={video.id} className={styles.videoCard}>
              <div className={styles.videoMain}>
                <div className={styles.videoTitle}>
                  {PLATFORMS[video.platform]?.icon} {video.title}
                </div>
                <div className={styles.videoMeta}>
                  <span>{translate(PLATFORMS[video.platform]?.name)}</span>
                  <span>{new Date(video.createdAt).toLocaleDateString(getLocale())}</span>
                  {video.mentionsApp && <span>{translate("✅ Mention app")}</span>}
                </div>
                <a href={video.url} target="_blank" rel="noopener noreferrer" className={styles.videoLink}>
                  <ExternalLink size={12} /> {video.url}
                </a>
              </div>
              <div className={styles.videoRight}>
                <StatusBadge status={video.validationStatus} type="video" />
              </div>
            </div>)}
        </div>}
    </div>;
};
export default VideoHistory;
