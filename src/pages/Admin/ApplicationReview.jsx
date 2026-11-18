import { getLocale } from "../../services/localization";
import { translate, useTranslation } from "../../i18n";
import { useEffect, useState } from 'react';
import usePartnerStore from '../../stores/partnerStore';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { APPS, PLATFORMS } from '../../config/apps';
import styles from './Admin.module.scss';
import AdminBackLink from '../../components/AdminBackLink';
const ApplicationReview = () => {
  useTranslation();
  const {
    allApplications,
    loadAllApplications,
    reviewApplication,
    loading
  } = usePartnerStore();
  const [filter, setFilter] = useState('pending');
  const [modal, setModal] = useState(null); // { id, action }
  const [adminNotes, setAdminNotes] = useState('');
  useEffect(() => {
    loadAllApplications(filter !== 'all' ? {
      status: filter
    } : {});
  }, [filter]);
  const handleReview = async status => {
    if (!modal) return;
    try {
      await reviewApplication(modal.id, {
        status,
        adminNotes
      });
      setModal(null);
      setAdminNotes('');
      loadAllApplications(filter !== 'all' ? {
        status: filter
      } : {});
    } catch {
      // error logged in store
    }
  };
  return <div className={`${styles.adminPage} admin-page`}>
      <AdminBackLink />
      <div className={styles.header}>
        <div>
          <h1>{translate("Candidatures")}</h1>
          <p>{translate('{count} candidature(s)', { count: allApplications.length })}</p>
        </div>
      </div>

      <div className={styles.filters}>
        {['pending', 'approved', 'rejected', 'all'].map(f => <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? translate("Toutes") : f === 'pending' ? translate("En attente") : f === 'approved' ? translate("Approuvées") : translate("Refusées")}
          </button>)}
      </div>

      {allApplications.length === 0 ? <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <p>{translate("Aucune candidature ")}{filter !== 'all' ? `"${filter}"` : ''}</p>
        </div> : <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th>{translate("Utilisateur")}</th>
                <th>{translate("Application")}</th>
                <th>{translate("Plateforme")}</th>
                <th>{translate("Handle")}</th>
                <th>{translate("Statut")}</th>
                <th>{translate("Date")}</th>
                <th>{translate("Actions")}</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {allApplications.map(app => <tr key={app.id}>
                  <td>
                    <div className={styles.userName}>{app.user?.username || '—'}</div>
                    <div className={styles.userEmail}>{app.user?.email || ''}</div>
                  </td>
                  <td>{APPS[app.app]?.icon} {APPS[app.app]?.name}</td>
                  <td>{PLATFORMS[app.platform]?.icon} {translate(PLATFORMS[app.platform]?.name)}</td>
                  <td>{app.socialHandle}</td>
                  <td><StatusBadge status={app.status} type="application" /></td>
                  <td>{new Date(app.createdAt).toLocaleDateString(getLocale())}</td>
                  <td>
                    {app.status === 'pending' && <div className={styles.actionBtns}>
                        <button className={styles.btnApprove} onClick={() => {
                  setModal({
                    id: app.id,
                    action: 'approve'
                  });
                  setAdminNotes('');
                }}>{translate("Approuver")}</button>
                        <button className={styles.btnReject} onClick={() => {
                  setModal({
                    id: app.id,
                    action: 'reject'
                  });
                  setAdminNotes('');
                }}>{translate("Refuser")}</button>
                      </div>}
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>}

      {/* Modal de confirmation */}
      {modal && <div className={styles.modalOverlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>{modal.action === 'approve' ? translate("✅ Approuver la candidature") : translate("❌ Refuser la candidature")}</h3>

            <div className={styles.modalField}>
              <label className={styles.modalLabel}>{translate("Notes admin (optionnel)")}</label>
              <textarea className={styles.modalTextarea} value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder={modal.action === 'approve' ? translate("Bienvenue dans le programme...") : translate("Raison du refus...")} />
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btnNeutral} onClick={() => setModal(null)}>{translate("Annuler")}</button>
              <button className={modal.action === 'approve' ? styles.btnApprove : styles.btnReject} onClick={() => handleReview(modal.action === 'approve' ? "approved" : "rejected")} disabled={loading}>
                {loading ? translate("En cours...") : modal.action === 'approve' ? translate("Confirmer approbation") : translate("Confirmer refus")}
              </button>
            </div>
          </div>
        </div>}
    </div>;
};
export default ApplicationReview;
