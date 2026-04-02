import { useEffect, useState } from 'react';
import usePartnerStore from '../../stores/partnerStore';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { APPS, PLATFORMS } from '../../config/apps';
import styles from './Admin.module.scss';

const ApplicationReview = () => {
  const { allApplications, loadAllApplications, reviewApplication, loading } = usePartnerStore();
  const [filter, setFilter] = useState('pending');
  const [modal, setModal] = useState(null); // { id, action }
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadAllApplications(filter !== 'all' ? { status: filter } : {});
  }, [filter]);

  const handleReview = async (status) => {
    if (!modal) return;
    try {
      await reviewApplication(modal.id, { status, adminNotes });
      setModal(null);
      setAdminNotes('');
      loadAllApplications(filter !== 'all' ? { status: filter } : {});
    } catch {
      // error logged in store
    }
  };

  return (
    <div className={styles.adminPage}>
      <div className={styles.header}>
        <div>
          <h1>Candidatures</h1>
          <p>{allApplications.length} candidature{allApplications.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className={styles.filters}>
        {['pending', 'approved', 'rejected', 'all'].map((f) => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Toutes' : f === 'pending' ? 'En attente' : f === 'approved' ? 'Approuvées' : 'Refusées'}
          </button>
        ))}
      </div>

      {allApplications.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <p>Aucune candidature {filter !== 'all' ? `"${filter}"` : ''}</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th>Utilisateur</th>
                <th>Application</th>
                <th>Plateforme</th>
                <th>Handle</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {allApplications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div className={styles.userName}>{app.user?.username || '—'}</div>
                    <div className={styles.userEmail}>{app.user?.email || ''}</div>
                  </td>
                  <td>{APPS[app.app]?.icon} {APPS[app.app]?.name}</td>
                  <td>{PLATFORMS[app.platform]?.icon} {PLATFORMS[app.platform]?.name}</td>
                  <td>{app.socialHandle}</td>
                  <td><StatusBadge status={app.status} type="application" /></td>
                  <td>{new Date(app.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td>
                    {app.status === 'pending' && (
                      <div className={styles.actionBtns}>
                        <button
                          className={styles.btnApprove}
                          onClick={() => { setModal({ id: app.id, action: 'approve' }); setAdminNotes(''); }}
                        >
                          Approuver
                        </button>
                        <button
                          className={styles.btnReject}
                          onClick={() => { setModal({ id: app.id, action: 'reject' }); setAdminNotes(''); }}
                        >
                          Refuser
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmation */}
      {modal && (
        <div className={styles.modalOverlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>{modal.action === 'approve' ? '✅ Approuver la candidature' : '❌ Refuser la candidature'}</h3>

            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Notes admin (optionnel)</label>
              <textarea
                className={styles.modalTextarea}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={modal.action === 'approve' ? 'Bienvenue dans le programme...' : 'Raison du refus...'}
              />
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btnNeutral} onClick={() => setModal(null)}>
                Annuler
              </button>
              <button
                className={modal.action === 'approve' ? styles.btnApprove : styles.btnReject}
                onClick={() => handleReview(modal.action === 'approve' ? 'approved' : 'rejected')}
                disabled={loading}
              >
                {loading ? 'En cours...' : modal.action === 'approve' ? 'Confirmer approbation' : 'Confirmer refus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationReview;
