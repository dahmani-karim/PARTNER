import { getLocale } from "../../services/localization";
import { translate, useTranslation } from "../../i18n";
import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import usePartnerStore from '../../stores/partnerStore';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { APPS, PLATFORMS } from '../../config/apps';
import styles from './Admin.module.scss';
import AdminBackLink from '../../components/AdminBackLink';
const VideoValidation = () => {
  useTranslation();
  const {
    allVideos,
    loadAllVideos,
    validateVideo,
    loading
  } = usePartnerStore();
  const [filter, setFilter] = useState('pending');
  const [modal, setModal] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [qualityScore, setQualityScore] = useState('');
  useEffect(() => {
    loadAllVideos(filter !== 'all' ? {
      validationStatus: filter
    } : {});
  }, [filter]);
  const handleValidate = async validationStatus => {
    if (!modal) return;
    try {
      await validateVideo(modal.id, {
        validationStatus,
        adminNotes,
        qualityScore: qualityScore ? parseInt(qualityScore) : null
      });
      setModal(null);
      setAdminNotes('');
      setQualityScore('');
      loadAllVideos(filter !== 'all' ? {
        validationStatus: filter
      } : {});
    } catch {
      // error logged
    }
  };
  return <div className={`${styles.adminPage} admin-page`}>
      <AdminBackLink />
      <div className={styles.header}>
        <div>
          <h1>{translate("Validation vidéos")}</h1>
          <p>{translate('{count} vidéo(s)', { count: allVideos.length })}</p>
        </div>
      </div>

      <div className={styles.filters}>
        {['pending', 'approved', 'rejected', 'all'].map(f => <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? translate("Toutes") : f === 'pending' ? translate("En attente") : f === 'approved' ? translate("Validées") : translate("Refusées")}
          </button>)}
      </div>

      {allVideos.length === 0 ? <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎬</div>
          <p>{translate("Aucune vidéo ")}{filter !== 'all' ? `"${filter}"` : ''}</p>
        </div> : <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th>{translate("Utilisateur")}</th>
                <th>{translate("App")}</th>
                <th>{translate("Titre")}</th>
                <th>{translate("Plateforme")}</th>
                <th>{translate("Mention")}</th>
                <th>{translate("Statut")}</th>
                <th>{translate("Date")}</th>
                <th>{translate("Actions")}</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {allVideos.map(video => <tr key={video.id}>
                  <td>
                    <div className={styles.userName}>{video.user?.username || '—'}</div>
                  </td>
                  <td>{APPS[video.app]?.icon} {APPS[video.app]?.name}</td>
                  <td>
                    <div>{video.title}</div>
                    <a href={video.url} target="_blank" rel="noopener noreferrer" className={styles.videoLink}>
                      <ExternalLink size={10} />{translate(" Voir")}</a>
                  </td>
                  <td>{PLATFORMS[video.platform]?.icon}</td>
                  <td>{video.mentionsApp ? '✅' : '❌'}</td>
                  <td><StatusBadge status={video.validationStatus} type="video" /></td>
                  <td>{new Date(video.createdAt).toLocaleDateString(getLocale())}</td>
                  <td>
                    {video.validationStatus === 'pending' && <div className={styles.actionBtns}>
                        <button className={styles.btnApprove} onClick={() => {
                  setModal({
                    id: video.id,
                    action: 'approve'
                  });
                  setAdminNotes('');
                  setQualityScore('');
                }}>{translate("Valider")}</button>
                        <button className={styles.btnReject} onClick={() => {
                  setModal({
                    id: video.id,
                    action: 'reject'
                  });
                  setAdminNotes('');
                  setQualityScore('');
                }}>{translate("Refuser")}</button>
                      </div>}
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>}

      {/* Modal */}
      {modal && <div className={styles.modalOverlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>{modal.action === 'approve' ? translate("✅ Valider la vidéo") : translate("❌ Refuser la vidéo")}</h3>

            <div className={styles.modalField}>
              <label className={styles.modalLabel}>{translate("Score qualité (0-100)")}</label>
              <input className={styles.scoreInput} type="number" min="0" max="100" value={qualityScore} onChange={e => setQualityScore(e.target.value)} placeholder="—" />
            </div>

            <div className={styles.modalField}>
              <label className={styles.modalLabel}>{translate("Notes admin")}</label>
              <textarea className={styles.modalTextarea} value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder={translate("Commentaire sur la qualité...")} />
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btnNeutral} onClick={() => setModal(null)}>{translate("Annuler")}</button>
              <button className={modal.action === 'approve' ? styles.btnApprove : styles.btnReject} onClick={() => handleValidate(modal.action === 'approve' ? "approved" : "rejected")} disabled={loading}>
                {loading ? translate("En cours...") : translate("Confirmer")}
              </button>
            </div>
          </div>
        </div>}
    </div>;
};
export default VideoValidation;
