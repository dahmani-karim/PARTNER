import { getLocale } from "../../services/localization";
import { translate, useTranslation } from "../../i18n";
import { useEffect, useState } from 'react';
import usePartnerStore from '../../stores/partnerStore';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { APPS, PLATFORMS } from '../../config/apps';
import styles from './Admin.module.scss';
import AdminBackLink from '../../components/AdminBackLink';
const PartnerManagement = () => {
  useTranslation();
  const {
    allPartners,
    loadAllPartners,
    updatePartnerStatus,
    loading
  } = usePartnerStore();
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  useEffect(() => {
    loadAllPartners(filter !== 'all' ? {
      status: filter
    } : {});
  }, [filter]);
  const handleUpdate = async () => {
    if (!modal || !newStatus) return;
    try {
      await updatePartnerStatus(modal.id, {
        status: newStatus,
        adminNotes
      });
      setModal(null);
      setNewStatus('');
      setAdminNotes('');
      loadAllPartners(filter !== 'all' ? {
        status: filter
      } : {});
    } catch {
      // error logged
    }
  };
  return <div className={`${styles.adminPage} admin-page`}>
      <AdminBackLink />
      <div className={styles.header}>
        <div>
          <h1>{translate("Gestion Partners")}</h1>
          <p>{translate('{count} partenaire(s)', { count: allPartners.length })}</p>
        </div>
      </div>

      <div className={styles.filters}>
        {['all', 'active', 'warning', 'suspended', 'revoked'].map(f => <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? translate("Tous") : f === 'active' ? translate("Actifs") : f === 'warning' ? translate("Avertis") : f === 'suspended' ? translate("Suspendus") : translate("Révoqués")}
          </button>)}
      </div>

      {allPartners.length === 0 ? <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>👥</div>
          <p>{translate("Aucun partner ")}{filter !== 'all' ? `"${filter}"` : ''}</p>
        </div> : <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th>{translate("Utilisateur")}</th>
                <th>{translate("App")}</th>
                <th>{translate("Plateforme")}</th>
                <th>{translate("Handle")}</th>
                <th>{translate("Vidéos")}</th>
                <th>{translate("Warnings")}</th>
                <th>{translate("Statut")}</th>
                <th>{translate("Début")}</th>
                <th>{translate("Actions")}</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {allPartners.map(p => <tr key={p.id}>
                  <td>
                    <div className={styles.userName}>{p.user?.username || '—'}</div>
                    <div className={styles.userEmail}>{p.user?.email || ''}</div>
                  </td>
                  <td>{APPS[p.app]?.icon} {APPS[p.app]?.name}</td>
                  <td>{PLATFORMS[p.platform]?.icon} {translate(PLATFORMS[p.platform]?.name)}</td>
                  <td>{p.socialHandle}</td>
                  <td>{p.totalVideos || 0}</td>
                  <td>{p.warningCount || 0}</td>
                  <td><StatusBadge status={p.status} type="partner" /></td>
                  <td>{p.startDate ? new Date(p.startDate).toLocaleDateString(getLocale()) : '—'}</td>
                  <td>
                    <div className={styles.actionBtns}>
                      <button className={styles.btnNeutral} onClick={() => {
                  setModal({
                    id: p.id,
                    current: p.status,
                    username: p.user?.username
                  });
                  setNewStatus('');
                  setAdminNotes('');
                }}>{translate("Modifier")}</button>
                    </div>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>}

      {/* Modal */}
      {modal && <div className={styles.modalOverlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>{translate("Modifier le statut de ")}{modal.username}</h3>

            <div className={styles.modalField}>
              <label className={styles.modalLabel}>{translate("Nouveau statut")}</label>
              <select className={styles.modalSelect} value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                <option value="">{translate("Choisir...")}</option>
                <option value="active">{translate("✅ Actif")}</option>
                <option value="warning">{translate("⚠️ Avertissement")}</option>
                <option value="suspended">{translate("⏸️ Suspendu")}</option>
                <option value="revoked">{translate("❌ Révoqué")}</option>
              </select>
            </div>

            <div className={styles.modalField}>
              <label className={styles.modalLabel}>{translate("Notes admin")}</label>
              <textarea className={styles.modalTextarea} value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder={translate("Raison du changement de statut...")} />
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btnNeutral} onClick={() => setModal(null)}>{translate("Annuler")}</button>
              <button className={newStatus === 'active' ? styles.btnApprove : newStatus === 'warning' ? styles.btnWarning : newStatus === 'suspended' || newStatus === 'revoked' ? styles.btnReject : styles.btnNeutral} onClick={handleUpdate} disabled={!newStatus || loading}>
                {loading ? translate("En cours...") : translate("Confirmer")}
              </button>
            </div>
          </div>
        </div>}
    </div>;
};
export default PartnerManagement;
