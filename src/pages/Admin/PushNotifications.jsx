import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import api from '../../services/adminApi';
import { errorMessage } from './userAccess';
import './UserAdministration.scss';
import './PushNotifications.scss';

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
  const { t, locale } = useTranslation();
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', body: '', icon: '🔔', app: '', targetAudience: 'all', url: '/', urlType: '/' });
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [history, setHistory] = useState([]);

  const fetchAdminHistory = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/notifications/push/history');
      if (!Array.isArray(data)) throw new Error(t('Réponse historique invalide.'));
      setHistory(data);
    } catch (failure) { setError(errorMessage(failure)); }
  }, [t]);

  useEffect(() => { fetchAdminHistory(); }, [fetchAdminHistory]);

  const deleteAdminHistoryItem = async (id) => {
    try {
      await api.delete(`/admin/notifications/push/history/${id}`);
      setHistory(prev => prev.filter(h => h.id !== id));
    } catch (failure) { setError(errorMessage(failure)); }
  };

  const searchUsers = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    try {
      setSearching(true);
      const { data } = await api.get(`/admin/users?search=${encodeURIComponent(query)}`);
      if (!Array.isArray(data?.users)) throw new Error(t('Réponse utilisateurs invalide.'));
      setSearchResults(data.users);
    } catch (failure) { setSearchResults([]); setError(errorMessage(failure)); }
    finally { setSearching(false); }
  };

  const toggleUser = (user) => {
    setSelectedUsers((prev) => {
      const exists = prev.find((u) => u.id === user.id);
      return exists ? prev.filter((u) => u.id !== user.id) : [...prev, user];
    });
  };

  const handleSend = async () => {
    if (!form.title || !form.body) return setError(t('Titre et message obligatoires'));
    if (form.targetAudience === 'specific' && selectedUsers.length === 0) return setError(t('Sélectionnez au moins un utilisateur'));

    const audienceLabel = form.targetAudience === 'specific'
      ? t('{count} utilisateur(s)', { count: selectedUsers.length })
      : t(form.targetAudience === 'all' ? 'Tous' : form.targetAudience === 'premium' ? 'Premium/VIP' : 'Gratuits');

    if (!window.confirm(t('Envoyer à : {audience} ?', { audience: audienceLabel }))) return;

    try {
      setSending(true);
      setError('');
      const { data: result } = await api.post('/admin/notifications/push/send', {
        title: form.title,
        body: form.body,
        icon: form.icon,
        data: form.app ? { url: form.url || '/' } : undefined,
        app: form.app || undefined,
        targetAudience: form.targetAudience,
        targetUserIds: form.targetAudience === 'specific' ? selectedUsers.map((u) => u.id) : undefined,
      });
      await fetchAdminHistory();
      setForm({ title: '', body: '', icon: '🔔', app: form.app, targetAudience: 'all', url: '/', urlType: '/' });
      setSelectedUsers([]);
      setSearchQuery('');
      alert(t('Envoyé : {success} réussi(s), {failure} échoué(s)', { success: result.successCount, failure: result.failureCount }));
    } catch (failure) { setError(errorMessage(failure)); }
    finally { setSending(false); }
  };

  const handleTest = async () => {
    if (!form.title || !form.body) return setError(t('Titre et message obligatoires'));
    try {
      setSending(true); setError('');
      await api.post('/admin/notifications/push/test', { title: form.title, body: form.body, icon: form.icon });
      alert(t('Notification de test envoyée'));
    } catch (failure) { setError(errorMessage(failure)); }
    finally { setSending(false); }
  };

  const handleTriggerCron = async () => {
    if (!window.confirm(t('Déclencher manuellement les notifications automatiques ?'))) return;
    try {
      setSending(true); setError('');
      const { data } = await api.post('/admin/notifications/trigger-cron');
      const result = data?.result;
      if (!Number.isFinite(result?.totalSent) || !Number.isFinite(result?.totalFailed)) throw new Error(t('Réponse notifications invalide.'));
      await fetchAdminHistory();
      alert(t('Envoyé : {success} réussi(s), {failure} échoué(s)', { success: result.totalSent, failure: result.totalFailed }));
    } catch (failure) { setError(errorMessage(failure)); }
    finally { setSending(false); }
  };

  return (
    <div className="push-notifications admin-page">
      <div className="push-notifications__header"><h1>{t('Notifications push')}</h1>
      <p>{t("Envoyez des notifications manuelles aux utilisateurs de l'écosystème")}</p></div>
      {error && <p role="alert" className="admin-error">{error}</p>}

      <div className="push-notifications__content">
      <div className="notification-form">
        <h2>{t('Créer une notification')}</h2>
        <div className="form-group">
          <label>{t('Icône')}</label>
          <div className="icon-selector">
            {ICONS.map((ic) => (
              <button key={ic} className={`icon-btn ${form.icon === ic ? 'active' : ''}`} onClick={() => setForm({ ...form, icon: ic })}>{ic}</button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>{t('Titre *')}</label>
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t('Titre de la notification')} maxLength={50} />
          <span className="char-count">{form.title.length}/50</span>
        </div>

        <div className="form-group">
          <label>{t('Message *')}</label>
          <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder={t('Contenu de la notification')} rows={4} maxLength={200} />
          <span className="char-count">{form.body.length}/200</span>
        </div>

        <div className="form-group">
          <label>{t('Application cible')}</label>
          <select value={form.app} onChange={(e) => setForm({ ...form, app: e.target.value, url: '/', urlType: '/' })}>
            {APPS.map((a) => <option key={a.value} value={a.value}>{t(a.label)}</option>)}
          </select>
        </div>

        {form.app && APP_URLS[form.app] && (
          <div className="form-group">
            <label>{t('URL de destination')}</label>
            <select value={form.urlType} onChange={(e) => { const v = e.target.value; setForm({ ...form, urlType: v, url: v === 'custom' ? '' : v }); }}>
              {APP_URLS[form.app].map((u) => <option key={u.value} value={u.value}>{t(u.label)}</option>)}
            </select>
          </div>
        )}

        {form.urlType === 'custom' && form.app && (
          <div className="form-group">
            <label>{t('URL personnalisée')}</label>
            <input type="text" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="/my-page" />
          </div>
        )}

        <div className="form-group">
          <label>{t('Audience')}</label>
          <select value={form.targetAudience} onChange={(e) => { setForm({ ...form, targetAudience: e.target.value }); setSelectedUsers([]); setSearchQuery(''); }}>
            <option value="all">{t('Tous les utilisateurs')}</option>
            <option value="premium">{t('Premium / VIP uniquement')}</option>
            <option value="free">{t('Gratuits uniquement')}</option>
            <option value="specific">{t('Utilisateurs spécifiques')}</option>
          </select>
        </div>

        {form.targetAudience === 'specific' && (
          <div className="form-group user-search">
            <label>{t('Rechercher des utilisateurs')}</label>
            <input type="text" value={searchQuery} onChange={(e) => searchUsers(e.target.value)} placeholder={t('Nom ou email...')} />
            {searching && <div className="search-loading">{t('Recherche en cours...')}</div>}

            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((u) => (
                  <div key={u.id} className={`search-result-item ${selectedUsers.find((s) => s.id === u.id) ? 'selected' : ''}`} onClick={() => toggleUser(u)}>
                    <div className="user-info"><span className="user-name">{u.username}</span><span className="user-email">{u.email}</span></div>
                    {(u.isPremium || u.isVIP) && <span className="user-badge">{u.isVIP ? '⭐ VIP' : '👑 Premium'}</span>}
                    {selectedUsers.find((s) => s.id === u.id) && <span>✓</span>}
                  </div>
                ))}
              </div>
            )}

            {selectedUsers.length > 0 && (
              <div className="selected-users-chips">
                {selectedUsers.map((u) => (
                  <span key={u.id} className="user-chip" onClick={() => toggleUser(u)}>{u.username} ✕</span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="preview-card">
          <h3>{t('Aperçu de la notification')}</h3>
          <div className="notification-preview">
            <div className="notification-icon">{form.icon}</div>
            <div className="notification-content">
              <div className="notification-title">{form.title || t('Titre de la notification')}</div>
              <div className="notification-body">{form.body || t('Corps de la notification')}</div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn-test" onClick={handleTest} disabled={sending || !form.title || !form.body}>{t('🧪 Tester (moi seulement)')}</button>
          <button className="btn-send" onClick={handleSend} disabled={sending || !form.title || !form.body}>
            {t(sending ? 'Envoi...' : '📢 Envoyer à tous')}
          </button>
        </div>
        <div className="cron-test-section">
          <h3>{t('⚙️ Test du système automatique')}</h3>
          <p>{t('Déclencher manuellement les notifications automatiques (produits expirés, stocks bas, etc.)')}</p>
          <button className="btn-trigger-cron" onClick={handleTriggerCron} disabled={sending}>{t(sending ? 'Exécution...' : '🚀 Déclencher les notifications auto')}</button>
        </div>
      </div>

        <div className="notification-history">
          <h2>{t('Historique des envois')}</h2>
          {history.length === 0 ? <div className="empty-history"><p>{t('Aucune notification envoyée pour le moment')}</p></div> : <div className="history-list">{history.map((h) => (
            <div key={h.id} className="history-item">
              <div className="history-icon">{h.icon}</div>
              <div className="history-content">
                <div className="history-title">{h.title}</div><div className="history-body">{h.body}</div>
                <div className="history-meta">
                  <span className="history-date">{new Date(h.createdAt || h.sentAt).toLocaleString(locale)}</span>
                  <span className="history-stats">{t('✅ {success} envoyé(s) · ❌ {failure} échoué(s)', { success: h.successCount, failure: h.failureCount })}</span>
                </div>
              </div>
              <button className="history-delete" onClick={() => deleteAdminHistoryItem(h.id)} title={t('Supprimer')}>🗑️</button>
            </div>
          ))}</div>}
        </div>
      </div>
      <div className="back-link-container"><Link className="admin-back-link" to="/admin" aria-label={t('Administration')}>◀️</Link></div>
    </div>
  );
};

export default PushNotifications;
