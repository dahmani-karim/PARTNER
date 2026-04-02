import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, ExternalLink } from 'lucide-react';
import usePartnerStore from '../../stores/partnerStore';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { PLATFORMS } from '../../config/apps';
import styles from './Videos.module.scss';

const VideoHistory = () => {
  const { videos, partner } = usePartnerStore();
  const [filter, setFilter] = useState('all');

  const filteredVideos = filter === 'all'
    ? videos
    : videos.filter(v => v.validationStatus === filter);

  const isActive = partner && ['active', 'warning'].includes(partner.status);

  return (
    <div className={styles.videosPage}>
      <div className={styles.header}>
        <div>
          <h1>Mes vidéos</h1>
          <p>{videos.length} vidéo{videos.length > 1 ? 's' : ''} soumise{videos.length > 1 ? 's' : ''}</p>
        </div>
        {isActive && (
          <Link to="/videos/submit" className={styles.actionBtn}>
            <Send size={16} /> Soumettre une vidéo
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        {[
          { key: 'all', label: 'Toutes' },
          { key: 'pending', label: 'En attente' },
          { key: 'approved', label: 'Validées' },
          { key: 'rejected', label: 'Refusées' },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`${styles.filterBtn} ${filter === key ? styles.active : ''}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {filteredVideos.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎬</div>
          <h2>Aucune vidéo</h2>
          <p>
            {filter === 'all'
              ? "Tu n'as pas encore soumis de vidéo."
              : `Aucune vidéo avec le statut "${filter}".`}
          </p>
          {isActive && (
            <Link to="/videos/submit" className={styles.actionBtn}>
              <Send size={16} /> Soumettre ma première vidéo
            </Link>
          )}
        </div>
      ) : (
        <div className={styles.videoList}>
          {filteredVideos.map((video) => (
            <div key={video.id} className={styles.videoCard}>
              <div className={styles.videoMain}>
                <div className={styles.videoTitle}>
                  {PLATFORMS[video.platform]?.icon} {video.title}
                </div>
                <div className={styles.videoMeta}>
                  <span>{PLATFORMS[video.platform]?.name}</span>
                  <span>{new Date(video.createdAt).toLocaleDateString('fr-FR')}</span>
                  {video.mentionsApp && <span>✅ Mention app</span>}
                </div>
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.videoLink}
                >
                  <ExternalLink size={12} /> {video.url}
                </a>
              </div>
              <div className={styles.videoRight}>
                <StatusBadge status={video.validationStatus} type="video" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoHistory;
