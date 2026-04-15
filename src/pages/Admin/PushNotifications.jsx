import { useState } from 'react';
import useAuthStore from '../../stores/authStore';
import { API_URL } from '../../config/api';
import styles from './Admin.module.scss';

const ICONS = ['🔔', '⭐', '🎉', '📢', '💡', '⚡', '🎯', '🔥', '✨', '📱'];
const APPS = [
  { value: '', label: 'Toutes les apps' },
  { value: 'smartcellar', label: 'SmartCellar' },
  { value: 'progarden', label: 'ProGarden' },
  { value: 'farmly', label: 'Farmly' },
  { value: 'lynx', label: 'LYNX' },
  { value: 'prete', label: 'PRÊT·E' },
  { value: 'partner', label: 'Partner' },
];

const APP_URLS = {
  smartcellar: [
    { value: '/dashboard', label: 'Tableau de bord' },
    { value: '/stock', label: 'Stock / Inventaire' },
    { value: '/recette', label: 'Recettes' },
    { value: '/meal-plan', label: 'Planification repas' },
    { value: '/course', label: 'Liste de courses' },
    { value: '/scan', label: 'Scanner' },
    { value: '/household', label: 'Foyer' },
    { value: '/notification-history', label: 'Historique notifications' },
    { value: '/settings', label: 'Paramètres' },
    { value: '/profile', label: 'Profil' },
    { value: 'custom', label: 'URL personnalisée' },
  ],
  progarden: [
    { value: '/dashboard', label: 'Dashboard' },
    { value: '/garden', label: 'Éditeur jardin' },
    { value: '/calendar', label: 'Calendrier' },
    { value: '/plants', label: 'Catalogue plantes' },
    { value: '/seedbox', label: 'Grainothèque' },
    { value: '/observations', label: 'Observations' },
    { value: '/soil', label: 'Analyse sol' },
    { value: '/settings', label: 'Paramètres' },
    { value: 'custom', label: 'URL personnalisée' },
  ],
  farmly: [
    { value: '/dashboard', label: 'Dashboard' },
    { value: '/animals', label: 'Animaux' },
    { value: '/settings', label: 'Paramètres' },
    { value: 'custom', label: 'URL personnalisée' },
  ],
  lynx: [
    { value: '/dashboard', label: 'Dashboard' },
    { value: '/map', label: 'Carte' },
    { value: '/alerts', label: 'Alertes' },
    { value: '/stats', label: 'Statistiques' },
    { value: '/energy', label: 'Prix énergie' },
    { value: '/blackout', label: 'Coupures' },
    { value: '/analysis', label: 'Analyse' },
    { value: '/settings', label: 'Paramètres' },
    { value: 'custom', label: 'URL personnalisée' },
  ],
  prete: [
    { value: '/dashboard', label: 'Dashboard' },
    { value: '/scenarios', label: 'Scénarios' },
    { value: '/exercices', label: 'Exercices' },
    { value: '/terrain', label: 'Terrain' },
    { value: '/profile', label: 'Profil' },
    { value: '/gamification', label: 'Gamification' },
    { value: 'custom', label: 'URL personnalisée' },
  ],
  partner: [
    { value: '/dashboard', label: 'Dashboard' },
    { value: '/profile', label: 'Profil' },
    { value: 'custom', label: 'URL personnalisée' },
  ],
};

const PushNotifications = () => {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState({ title: '', body: '', icon: '🔔', app: '', targetAudience: 'all', url: '/', urlType: '/' });
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [history, setHistory] = useState([]);

  const searchUsers = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    try {
      setSearching(true);
      const res = await fetch(`${API_URL}/api/admin/users?search=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSearchResults(data.users || []);
    } catch { setSearchResults([]); }
    finally { setSearching(false); }
  };

  const toggleUser = (user) => {
    setSelectedUsers((prev) => {
      const exists = prev.find((u) => u.id === user.id);
      return exists ? prev.filter((u) => u.id !== user.id) : [...prev, user];
    });
  };

  const handleSend = async () => {
    if (!form.title || !form.body) return alert('Titre et message obligatoires');
    if (form.targetAudience === 'specific' && selectedUsers.length === 0) return alert('Sélectionnez au moins un utilisateur');

    const audienceLabel = form.targetAudience === 'specific'
      ? `${selectedUsers.length} utilisateur(s) sélectionné(s)`
      : form.targetAudience === 'all' ? 'Tous' : form.targetAudience === 'premium' ? 'Premium/VIP' : 'Gratuits';

    if (!window.confirm(`Envoyer à : ${audienceLabel} ?`)) return;

    try {
      setSending(true);
      const res = await fetch(`${API_URL}/api/admin/notifications/push/send`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          body: form.body,
          icon: form.icon,
          data: form.app ? { url: form.url || '/' } : undefined,
          app: form.app || undefined,
          targetAudience: form.targetAudience,
          targetUserIds: form.targetAudience === 'specific' ? selectedUsers.map((u) => u.id) : undefined,
        }),
      });
      if (!res.ok) throw new Error();
      const result = await res.json();
      setHistory([{ ...form, sentAt: new Date().toISOString(), ...result }, ...history]);
      setForm({ title: '', body: '', icon: '🔔', app: form.app, targetAudience: 'all', url: '/', urlType: '/' });
      setSelectedUsers([]);
      setSearchQuery('');
      alert(`Envoyé : ${result.successCount} réussi(s), ${result.failureCount} échoué(s)`);
    } catch { alert('Erreur lors de l\'envoi'); }
    finally { setSending(false); }
  };

  const handleTest = async () => {
    if (!form.title || !form.body) return alert('Titre et message obligatoires');
    try {
      await fetch(`${API_URL}/api/admin/notifications/push/test`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, body: form.body, icon: form.icon }),
      });
      alert('Notification de test envoyée');
    } catch { alert('Erreur test'); }
  };

  if (!user || user.id !== 1) {
    return <div className={styles.pushPage}><h1>🔒 Accès refusé</h1><p>Seul l'administrateur peut accéder à cette page.</p></div>;
  }

  return (
    <div className={styles.pushPage}>
      <h1>📢 Push Notifications</h1>
      <p className={styles.subtitle}>Envoyez des notifications manuelles aux utilisateurs de l'écosystème</p>

      <div className={styles.pushForm}>
        {/* Icon selector */}
        <div className={styles.formGroup}>
          <label>Icône</label>
          <div className={styles.iconGrid}>
            {ICONS.map((ic) => (
              <button key={ic} className={`${styles.iconBtn} ${form.icon === ic ? styles.active : ''}`} onClick={() => setForm({ ...form, icon: ic })}>{ic}</button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className={styles.formGroup}>
          <label>Titre *</label>
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre de la notification" maxLength={50} />
          <span className={styles.charCount}>{form.title.length}/50</span>
        </div>

        {/* Body */}
        <div className={styles.formGroup}>
          <label>Message *</label>
          <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Contenu de la notification" rows={3} maxLength={200} />
          <span className={styles.charCount}>{form.body.length}/200</span>
        </div>

        {/* App filter */}
        <div className={styles.formGroup}>
          <label>Application cible</label>
          <select value={form.app} onChange={(e) => setForm({ ...form, app: e.target.value, url: '/', urlType: '/' })}>
            {APPS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </div>

        {form.app && APP_URLS[form.app] && (
          <div className={styles.formGroup}>
            <label>URL de destination</label>
            <select value={form.urlType} onChange={(e) => { const v = e.target.value; setForm({ ...form, urlType: v, url: v === 'custom' ? '' : v }); }}>
              {APP_URLS[form.app].map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
        )}

        {form.urlType === 'custom' && form.app && (
          <div className={styles.formGroup}>
            <label>URL personnalisée</label>
            <input type="text" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="/ma-page" />
          </div>
        )}

        {/* Audience */}
        <div className={styles.formGroup}>
          <label>Audience</label>
          <select value={form.targetAudience} onChange={(e) => { setForm({ ...form, targetAudience: e.target.value }); setSelectedUsers([]); setSearchQuery(''); }}>
            <option value="all">Tous les utilisateurs</option>
            <option value="premium">Premium / VIP uniquement</option>
            <option value="free">Gratuits uniquement</option>
            <option value="specific">Utilisateurs spécifiques</option>
          </select>
        </div>

        {/* User search */}
        {form.targetAudience === 'specific' && (
          <div className={styles.formGroup}>
            <label>Rechercher des utilisateurs</label>
            <input type="text" value={searchQuery} onChange={(e) => searchUsers(e.target.value)} placeholder="Nom ou email..." />
            {searching && <small>Recherche en cours...</small>}

            {searchResults.length > 0 && (
              <div className={styles.searchResults}>
                {searchResults.map((u) => (
                  <div key={u.id} className={`${styles.searchItem} ${selectedUsers.find((s) => s.id === u.id) ? styles.selected : ''}`} onClick={() => toggleUser(u)}>
                    <span>{u.username} — <small>{u.email}</small></span>
                    {selectedUsers.find((s) => s.id === u.id) && <span className={styles.checkmark}>✓</span>}
                  </div>
                ))}
              </div>
            )}

            {selectedUsers.length > 0 && (
              <div className={styles.selectedChips}>
                {selectedUsers.map((u) => (
                  <span key={u.id} className={styles.chip} onClick={() => toggleUser(u)}>{u.username} ✕</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Preview */}
        <div className={styles.preview}>
          <div className={styles.previewCard}>
            <span className={styles.previewIcon}>{form.icon}</span>
            <div>
              <strong>{form.title || 'Titre'}</strong>
              <p>{form.body || 'Message de la notification...'}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.pushActions}>
          <button className={styles.btnTest} onClick={handleTest} disabled={sending}>🧪 Tester (moi)</button>
          <button className={styles.btnSend} onClick={handleSend} disabled={sending}>
            {sending ? 'Envoi...' : '📤 Envoyer'}
          </button>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className={styles.pushHistory}>
          <h2>Historique de cette session</h2>
          {history.map((h, i) => (
            <div key={i} className={styles.historyItem}>
              <span>{h.icon} <strong>{h.title}</strong></span>
              <div className={styles.historyActions}>
                <small>{new Date(h.sentAt).toLocaleTimeString('fr-FR')} — {h.successCount || 0} envoyé(s)</small>
                <button className={styles.historyDelete} onClick={() => setHistory(prev => prev.filter((_, idx) => idx !== i))} title="Supprimer">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PushNotifications;
