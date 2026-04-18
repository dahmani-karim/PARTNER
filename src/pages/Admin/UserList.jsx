import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield, ShieldOff, Crown, Star } from 'lucide-react';
import api from '../../services/api';
import styles from './Admin.module.scss';
import userStyles from './UserManagement.module.scss';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      String(u.id).includes(q)
    );
  });

  return (
    <div className={styles.adminPage}>
      <div className={styles.header}>
        <div>
          <h1>Gestion Utilisateurs</h1>
          <p>{users.length} utilisateur{users.length > 1 ? 's' : ''} inscrits sur l'écosystème</p>
        </div>
      </div>

      <div className={userStyles.searchBar}>
        <Search size={18} />
        <input
          type="text"
          placeholder="Rechercher par nom, email ou ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>Chargement...</p>
      ) : filtered.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>Aucun utilisateur trouvé</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th>ID</th>
                <th>Utilisateur</th>
                <th>Statut</th>
                <th>Abonnements</th>
                <th>Inscrit le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>#{u.id}</td>
                  <td>
                    <div className={styles.userName}>{u.username}</div>
                    <div className={styles.userEmail}>{u.email}</div>
                  </td>
                  <td>
                    <div className={userStyles.badges}>
                      {u.blocked && <span className={userStyles.badgeBlocked}>Bloqué</span>}
                      {!u.confirmed && <span className={userStyles.badgeUnconfirmed}>Non confirmé</span>}
                      {!u.blocked && u.confirmed && <span className={userStyles.badgeActive}>Actif</span>}
                    </div>
                  </td>
                  <td>
                    <div className={userStyles.badges}>
                      {u.isPremium && <span className={userStyles.badgePremium}><Crown size={12} /> Premium</span>}
                      {u.isVIP && <span className={userStyles.badgeVip}><Star size={12} /> VIP</span>}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td>
                    <Link to={`/admin/users/${u.id}`} className={styles.btnNeutral}>
                      Détails
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserList;
