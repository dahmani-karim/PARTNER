import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, ShieldOff, Crown, Star, Trash2 } from 'lucide-react';
import api from '../../services/api';
import styles from './Admin.module.scss';
import userStyles from './UserManagement.module.scss';

const APP_LABELS = {
  smartcellar: '🍷 SmartCellar',
  progarden: '🌱 ProGarden',
  farmly: '🐔 Farmly',
  prete: '🏠 PRETE',
  lynx: '🎵 LYNX',
  partner: '🤝 Partner',
};

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/admin/users/${id}`);
      setUser(res.data);
    } catch (err) {
      console.error('Erreur chargement utilisateur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    const confirmMsg = {
      block: `Bloquer ${user.username} ?`,
      unblock: `Débloquer ${user.username} ?`,
      delete: `Supprimer définitivement ${user.username} ? Cette action est irréversible.`,
    };
    if (!window.confirm(confirmMsg[action] || `Confirmer l'action ?`)) return;

    setActionLoading(true);
    try {
      if (action === 'block') await api.put(`/api/admin/users/${id}/block`);
      else if (action === 'unblock') await api.put(`/api/admin/users/${id}/unblock`);
      else if (action === 'delete') {
        await api.delete(`/api/admin/users/${id}`);
        navigate('/admin/users');
        return;
      }
      fetchUser();
    } catch (err) {
      console.error('Erreur action:', err);
      alert('Erreur: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async (field) => {
    setActionLoading(true);
    try {
      await api.put(`/api/admin/users/${id}/${field}`);
      fetchUser();
    } catch (err) {
      console.error('Erreur toggle:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className={styles.adminPage}><p style={{ textAlign: 'center', padding: '2rem' }}>Chargement...</p></div>;
  if (!user) return <div className={styles.adminPage}><p style={{ textAlign: 'center', padding: '2rem' }}>Utilisateur non trouvé</p></div>;

  const vipApps = ['smartcellar', 'progarden', 'farmly', 'prete', 'lynx'];

  return (
    <div className={styles.adminPage}>
      <button onClick={() => navigate('/admin/users')} className={userStyles.backBtn}>
        <ArrowLeft size={18} /> Retour à la liste
      </button>

      {/* Header */}
      <div className={userStyles.userHeader}>
        <div className={userStyles.userAvatar}>{user.username?.[0]?.toUpperCase() || '?'}</div>
        <div>
          <h1>{user.username} <span className={userStyles.userId}>#{user.id}</span></h1>
          <p className={userStyles.userEmail}>{user.email}</p>
          <div className={userStyles.badges} style={{ marginTop: '0.5rem' }}>
            {user.blocked ? <span className={userStyles.badgeBlocked}>Bloqué</span> : <span className={userStyles.badgeActive}>Actif</span>}
            {user.isPremium && <span className={userStyles.badgePremium}><Crown size={12} /> Premium</span>}
            {user.isVIP && <span className={userStyles.badgeVip}><Star size={12} /> VIP</span>}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className={userStyles.section}>
        <h2 className={userStyles.sectionTitle}>Actions</h2>
        <div className={styles.actionBtns}>
          {user.blocked ? (
            <button className={styles.btnApprove} onClick={() => handleAction('unblock')} disabled={actionLoading}>
              <ShieldOff size={14} /> Débloquer
            </button>
          ) : (
            <button className={styles.btnWarning} onClick={() => handleAction('block')} disabled={actionLoading}>
              <Shield size={14} /> Bloquer
            </button>
          )}
          <button className={styles.btnApprove} onClick={() => handleToggle('toggle-premium')} disabled={actionLoading}>
            <Crown size={14} /> {user.isPremium ? 'Retirer Premium' : 'Donner Premium'}
          </button>
          <button className={styles.btnApprove} onClick={() => handleToggle('toggle-vip')} disabled={actionLoading}>
            <Star size={14} /> {user.isVIP ? 'Retirer VIP' : 'Donner VIP'}
          </button>
          <button className={styles.btnReject} onClick={() => handleAction('delete')} disabled={actionLoading}>
            <Trash2 size={14} /> Supprimer
          </button>
        </div>
      </div>

      {/* VIP par app */}
      <div className={userStyles.section}>
        <h2 className={userStyles.sectionTitle}>VIP par application</h2>
        <div className={userStyles.vipGrid}>
          {vipApps.map((app) => {
            const field = `vip${app.charAt(0).toUpperCase() + app.slice(1)}`;
            const isActive = user[field];
            return (
              <button
                key={app}
                className={`${userStyles.vipChip} ${isActive ? userStyles.vipActive : ''}`}
                onClick={() => handleToggle(`toggle-vip-app/${app}`)}
                disabled={actionLoading}
              >
                {APP_LABELS[app] || app}
                <span>{isActive ? '✓' : '✗'}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SmartCellar Stats */}
      {(user.householdCount > 0 || user.productCount > 0 || user.recipeCount > 0) && (
        <div className={userStyles.section}>
          <h2 className={userStyles.sectionTitle}>🍷 SmartCellar</h2>
          <div className={userStyles.miniStatsGrid}>
            <div className={userStyles.miniStat}><span className={userStyles.miniVal}>{user.householdCount || 0}</span><span className={userStyles.miniLabel}>Foyers</span></div>
            <div className={userStyles.miniStat}><span className={userStyles.miniVal}>{user.productCount || 0}</span><span className={userStyles.miniLabel}>Produits</span></div>
            <div className={userStyles.miniStat}><span className={userStyles.miniVal}>{user.recipeCount || 0}</span><span className={userStyles.miniLabel}>Recettes</span></div>
            <div className={userStyles.miniStat}><span className={userStyles.miniVal}>{user.shoppingListCount || 0}</span><span className={userStyles.miniLabel}>Listes</span></div>
          </div>
        </div>
      )}

      {/* ProGarden Stats */}
      {(user.gardenCount > 0 || user.seedCount > 0) && (
        <div className={userStyles.section}>
          <h2 className={userStyles.sectionTitle}>🌱 ProGarden</h2>
          <div className={userStyles.miniStatsGrid}>
            <div className={userStyles.miniStat}><span className={userStyles.miniVal}>{user.gardenCount || 0}</span><span className={userStyles.miniLabel}>Potagers</span></div>
            <div className={userStyles.miniStat}><span className={userStyles.miniVal}>{user.observationCount || 0}</span><span className={userStyles.miniLabel}>Diagnostics</span></div>
            <div className={userStyles.miniStat}><span className={userStyles.miniVal}>{user.seedCount || 0}</span><span className={userStyles.miniLabel}>Graines</span></div>
            <div className={userStyles.miniStat}><span className={userStyles.miniVal}>{user.gardenEventCount || 0}</span><span className={userStyles.miniLabel}>Événements</span></div>
          </div>
        </div>
      )}

      {/* Farmly Stats */}
      {(user.farmAnimalCount > 0 || user.farmGroupCount > 0) && (
        <div className={userStyles.section}>
          <h2 className={userStyles.sectionTitle}>🐔 Farmly</h2>
          <div className={userStyles.miniStatsGrid}>
            <div className={userStyles.miniStat}><span className={userStyles.miniVal}>{user.farmAnimalCount || 0}</span><span className={userStyles.miniLabel}>Animaux</span></div>
            <div className={userStyles.miniStat}><span className={userStyles.miniVal}>{user.farmGroupCount || 0}</span><span className={userStyles.miniLabel}>Groupes</span></div>
            <div className={userStyles.miniStat}><span className={userStyles.miniVal}>{user.farmProductionCount || 0}</span><span className={userStyles.miniLabel}>Productions</span></div>
            <div className={userStyles.miniStat}><span className={userStyles.miniVal}>{user.farmHealthCount || 0}</span><span className={userStyles.miniLabel}>Santé</span></div>
          </div>
        </div>
      )}

      {/* PRETE Stats */}
      {user.preteProgress && (
        <div className={userStyles.section}>
          <h2 className={userStyles.sectionTitle}>🏠 PRETE</h2>
          <div className={userStyles.miniStatsGrid}>
            {user.preteProgress.pseudo && (
              <div className={userStyles.miniStat}><span className={userStyles.miniVal} style={{ fontSize: '0.9rem' }}>{user.preteProgress.pseudo}</span><span className={userStyles.miniLabel}>Pseudo</span></div>
            )}
            <div className={userStyles.miniStat}><span className={userStyles.miniVal}>{user.preteProgress.completedCount}</span><span className={userStyles.miniLabel}>Étapes</span></div>
            <div className={userStyles.miniStat}><span className={userStyles.miniVal}>{user.preteProgress.achievementCount}</span><span className={userStyles.miniLabel}>Succès</span></div>
            <div className={userStyles.miniStat}><span className={userStyles.miniVal}>{user.preteProgress.displayMode}</span><span className={userStyles.miniLabel}>Mode</span></div>
          </div>
        </div>
      )}

      {/* Community Stats */}
      {(user.communityPostCount > 0 || user.tradeAnnouncementCount > 0) && (
        <div className={userStyles.section}>
          <h2 className={userStyles.sectionTitle}>💬 Communauté</h2>
          <div className={userStyles.miniStatsGrid}>
            <div className={userStyles.miniStat}><span className={userStyles.miniVal}>{user.communityPostCount || 0}</span><span className={userStyles.miniLabel}>Posts</span></div>
            <div className={userStyles.miniStat}><span className={userStyles.miniVal}>{user.tradeAnnouncementCount || 0}</span><span className={userStyles.miniLabel}>Annonces troc</span></div>
          </div>
        </div>
      )}

      {/* Partner Stats */}
      {user.partnerData && (
        <div className={userStyles.section}>
          <h2 className={userStyles.sectionTitle}>🤝 Partner</h2>
          <div className={userStyles.miniStatsGrid}>
            <div className={userStyles.miniStat}><span className={userStyles.miniVal}>{APP_LABELS[user.partnerData.app] || user.partnerData.app}</span><span className={userStyles.miniLabel}>Application</span></div>
            <div className={userStyles.miniStat}><span className={userStyles.miniVal}>{user.partnerData.status}</span><span className={userStyles.miniLabel}>Statut</span></div>
            <div className={userStyles.miniStat}><span className={userStyles.miniVal}>{user.partnerData.totalVideos}</span><span className={userStyles.miniLabel}>Vidéos</span></div>
            {user.partnerData.startDate && (
              <div className={userStyles.miniStat}><span className={userStyles.miniVal} style={{ fontSize: '0.85rem' }}>{new Date(user.partnerData.startDate).toLocaleDateString('fr-FR')}</span><span className={userStyles.miniLabel}>Début</span></div>
            )}
          </div>
        </div>
      )}

      {/* Push notifications */}
      <div className={userStyles.section}>
        <h2 className={userStyles.sectionTitle}>🔔 Notifications push</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          {user.hasPushNotifications
            ? `${user.pushSubscriptionsCount} appareil${user.pushSubscriptionsCount > 1 ? 's' : ''} enregistré${user.pushSubscriptionsCount > 1 ? 's' : ''}`
            : 'Aucun appareil enregistré'}
        </p>
      </div>

      {/* Households */}
      {user.households?.length > 0 && (
        <div className={userStyles.section}>
          <h2 className={userStyles.sectionTitle}>🏠 Foyers SmartCellar</h2>
          <div className={userStyles.householdList}>
            {user.households.map((h) => (
              <div key={h.id} className={userStyles.householdCard}>
                <div className={userStyles.householdName}>{h.name}</div>
                <div className={userStyles.householdMeta}>
                  Rôle: <strong>{h.role}</strong> · {h.memberCount} membre{h.memberCount > 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Infos compte */}
      <div className={userStyles.section}>
        <h2 className={userStyles.sectionTitle}>ℹ️ Informations compte</h2>
        <div className={userStyles.infoGrid}>
          <div className={userStyles.infoRow}><span>Email confirmé</span><span>{user.confirmed ? '✅ Oui' : '❌ Non'}</span></div>
          <div className={userStyles.infoRow}><span>Créé le</span><span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</span></div>
          <div className={userStyles.infoRow}><span>Dernière mise à jour</span><span>{user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</span></div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
