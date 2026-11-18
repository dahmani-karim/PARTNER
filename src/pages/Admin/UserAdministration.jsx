import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import api from '../../services/adminApi';
import { ACCESS_LABELS, VIP_APPS, accessLevel, errorMessage, filterUsers, householdIcon } from './userAccess';
import './UserAdministration.scss';
import { useAuthStore } from '../../stores/authStore';

function BackLink({ users = false }) {
  const { t } = useTranslation();
  return <Link className="admin-back-link" to={users ? '/admin/users' : '/admin'}
    aria-label={t(users ? 'Gestion des utilisateurs' : 'Administration')}>◀️</Link>;
}

function Badges({ user }) {
  const { t } = useTranslation();
  const level = accessLevel(user);
  return <div className="badges-row">
    <span className={`status-badge ${user.blocked ? 'blocked' : 'active'}`}>{t(user.blocked ? 'Bloqué' : 'Actif')}</span>
    <span className={`access-badge ${level}`}>{t(ACCESS_LABELS[level])}</span>
  </div>;
}

export default function UserManagement() {
  const { t, locale } = useTranslation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activity, setActivity] = useState('all');
  const [access, setAccess] = useState('all');
  const refresh = useCallback(async signal => {
    const { data } = await api.get('/admin/users', { signal });
    if (!Array.isArray(data)) throw new Error(t('Réponse utilisateurs invalide.'));
    if (!signal?.aborted) { setUsers(data); setError(''); }
  }, [t]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    refresh(controller.signal).catch(failure => {
      if (!controller.signal.aborted) setError(errorMessage(failure));
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [refresh]);
  const toggleBlock = async user => {
    if (!window.confirm(t(user.blocked ? 'Débloquer cet utilisateur ?' : 'Bloquer cet utilisateur ?'))) return;
    setBusy(true); setError('');
    try { await api.put(`/admin/users/${user.id}/${user.blocked ? 'unblock' : 'block'}`); await refresh(); }
    catch (failure) { setError(errorMessage(failure)); }
    finally { setBusy(false); }
  };
  const candidates = filterUsers(users, { search, activity });
  const filtered = filterUsers(candidates, { access });
  const actions = user => <div className="action-buttons" onClick={event => event.stopPropagation()}>
    <Link className="btn-view" to={`/admin/users/${user.id}`}>{t('Voir détails')}</Link>
    {user.id !== 1 && <button type="button" className={user.blocked ? 'btn-unblock' : 'btn-block'} disabled={busy} onClick={() => toggleBlock(user)}>
      {t(user.blocked ? 'Débloquer' : 'Bloquer')}</button>}
  </div>;
  return <section className="user-management admin-page">
    <header className="user-management__header"><h1>{t('Gestion des utilisateurs')}</h1><p>{t('Consulter les comptes et gérer leurs accès.')}</p></header>
    {error && <p className="admin-error" role="alert">{error}</p>}
    <div className="user-management__filters">
      <input type="search" aria-label={t('Rechercher par nom ou email')} placeholder={t('Rechercher par nom ou email')}
        value={search} onChange={event => setSearch(event.target.value)} />
      <label>{t('Statut')}<select value={activity} onChange={event => setActivity(event.target.value)}>
        {['all', 'active', 'blocked'].map(value => <option key={value} value={value}>
          {t(value === 'all' ? 'Tous les utilisateurs' : value === 'active' ? 'Actif' : 'Bloqué')} ({filterUsers(users, { search, activity: value }).length})
        </option>)}
      </select></label>
    </div>
    <div className="user-management__stats" aria-label={t('Accès')}>
      {Object.keys(ACCESS_LABELS).map(level => <button key={level} type="button" className={`stat-card ${access === level ? 'active' : ''}`} aria-pressed={access === level}
        onClick={() => setAccess(level)}><strong>{level === 'all' ? candidates.length : candidates.filter(user => accessLevel(user) === level).length}</strong>
        <span>{t(ACCESS_LABELS[level])}</span></button>)}
    </div>
    <p className="user-management__summary" role="status">{t('{count} compte(s) affiché(s) sur {total}', { count: filtered.length, total: users.length })}</p>
    {loading ? <p role="status">{t('Chargement...')}</p> : <>
      <div className="user-management__list"><table className="users-table desktop-only"><thead><tr>
        {['ID', 'Utilisateur', 'Email', 'Statut', 'Inscription', 'Actions'].map(label => <th key={label}>{t(label)}</th>)}
      </tr></thead><tbody>{filtered.map(user => <tr key={user.id} className={user.blocked ? 'blocked' : ''} onClick={event => {
        if (!event.target.closest('a, button, input, select')) navigate(`/admin/users/${user.id}`);
      }}>
        <td>#{user.id}</td><td><Link to={`/admin/users/${user.id}`}>{user.username}</Link></td>
        <td>{user.email}</td><td><Badges user={user} /></td>
        <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString(locale) : '—'}</td><td>{actions(user)}</td>
      </tr>)}</tbody></table>
      <div className="users-cards mobile-only">{filtered.map(user => <article key={user.id} className="user-card">
        <h2><Link to={`/admin/users/${user.id}`}>{user.username}</Link></h2><p>{user.email}</p>
        <div className="badges-row">#{user.id} <Badges user={user} /></div>{actions(user)}
      </article>)}</div>
      {!filtered.length && <p className="no-results">{t('Aucun utilisateur ne correspond aux filtres.')}</p>}
      </div>
    </>}
    <BackLink />
  </section>;
}

function PartnerAccess({ user, busy, onUpdate }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ app: 'smartcellar', platform: 'youtube', socialHandle: '', adminNotes: '' });
  const field = key => event => setForm(previous => ({ ...previous, [key]: event.target.value }));
  return <div className="partner-management">
    <h3>{t('Programme Partner')}</h3>
    <p>{t('Un dossier ambassadeur actif offre l’accès Premium à tout l’écosystème. Un retrait ne résilie pas les abonnements et ne retire pas les VIP.')}</p>
    {user.partnerData && <p>{user.partnerData.app} · {user.partnerData.status}</p>}
    {user.isPartner ? <div className="action-buttons"><button type="button" className="action-btn revoke-partner" disabled={busy}
      onClick={() => onUpdate('partner', { enabled: false }, 'Retirer le statut Partner de cet utilisateur ?')}>
      {t('Retirer le statut Partner')}</button></div> :
      <form onSubmit={event => {
        event.preventDefault();
        onUpdate('partner', { enabled: true, ...form, overrideCapacity: false }, 'Créer ou réactiver le dossier ambassadeur et offrir l’accès Partner ?');
      }}><fieldset disabled={busy}>
        <label>{t('Application représentée')}<select value={form.app} onChange={field('app')}>
          {[...VIP_APPS.map(([value, name]) => [value, name]), ['prete', 'PRÊT·E'], ['herbogenius', "Herbo’Genius"]]
            .map(([value, name]) => <option key={value} value={value}>{name}</option>)}
        </select></label>
        <label>{t('Plateforme')}<select value={form.platform} onChange={field('platform')}>
          {['youtube', 'tiktok', 'instagram', 'twitter', 'other'].map(value => <option key={value} value={value}>{value === 'other' ? t('Autre') : value}</option>)}
        </select></label>
        <label>{t('Pseudo social')}<input required maxLength={200} value={form.socialHandle} onChange={field('socialHandle')} /></label>
        <label>{t('Notes administratives')}<textarea maxLength={5000} value={form.adminNotes} onChange={field('adminNotes')} /></label>
        <div className="action-buttons"><button className="action-btn grant-partner" type="submit">{t('Inscrire comme Partner')}</button></div>
      </fieldset></form>}
  </div>;
}

export function UserDetail() {
  const { id } = useParams();
  const { t, locale } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const refresh = useCallback(async signal => {
    const { data } = await api.get(`/admin/users/${id}`, { signal });
    if (!data || Number(data.id) !== Number(id)) throw new Error(t('Réponse utilisateur invalide.'));
    if (!signal?.aborted) setUser(data);
  }, [id, t]);
  useEffect(() => {
    const controller = new AbortController();
    setUser(null); setLoading(true); setError(''); setNotice('');
    refresh(controller.signal).catch(failure => {
      if (!controller.signal.aborted) setError(errorMessage(failure));
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [refresh]);
  const update = async (action, body, confirmation) => {
    if (busy || !window.confirm(t(confirmation))) return;
    if (action === 'delete' && !window.confirm(t('Confirmer la suppression définitive et irréversible de ce compte ?'))) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const request = () => action === 'delete' ? api.delete(`/admin/users/${id}`) :
        action === 'reset-password' ? api.post(`/admin/users/${id}/reset-password`) : api.put(`/admin/users/${id}/${action}`, body);
      try { await request(); }
      catch (failure) {
        if (action !== 'partner' || !body?.enabled || failure.response?.data?.error?.details?.code !== 'partner_capacity') throw failure;
        if (!window.confirm(t('Le quota de places Partner est atteint. Confirmer explicitement son dépassement ?'))) throw failure;
        await api.put(`/admin/users/${id}/partner`, { ...body, overrideCapacity: true });
      }
      if (action === 'delete') { navigate('/admin/users'); return; }
      await refresh();
      if (Number(id) === 1) await useAuthStore.getState().syncEntitlements();
      setNotice(t(action === 'reset-password' ? 'E-mail de réinitialisation envoyé.' : 'Modification enregistrée.'));
    } catch (failure) { setError(errorMessage(failure)); }
    finally { setBusy(false); }
  };
  const date = value => value ? new Date(value).toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'N/A';
  return <section className="user-detail admin-page">
    <div className="user-detail__header"><h1>{t('Détails de l’utilisateur')}</h1>
      {user && <div className="status-badge" data-status={user.blocked ? 'blocked' : 'active'}>{t(user.blocked ? 'Bloqué' : 'Actif')}</div>}
    </div>
    {error && <p role="alert" className="admin-error">{error}</p>}
    {notice && <p role="status">{notice}</p>}
    {loading && <p role="status">{t('Chargement...')}</p>}
    {!loading && !user && <button type="button" onClick={() => refresh().catch(failure => setError(errorMessage(failure)))}>{t('Recharger')}</button>}
    {user && <div className="user-detail__content">
      <section className="info-section"><h2>👤 {t('Informations générales')}</h2>
        <div className="info-grid">
          {[['ID', `#${user.id}`], ['Nom d’utilisateur', user.username], ['Email', user.email],
            ['Email confirmé', `${user.confirmed ? '✅' : '❌'} ${t(user.confirmed ? 'Oui' : 'Non')}`], ['Rôle', user.role?.name || t('Utilisateur')]]
            .map(([label, value]) => <div className="info-item" key={label}><label>{t(label)}</label><div className="info-value">{value}</div></div>)}
          <div className="info-item"><label>{t('Accès')}</label>
            <div className={`info-value subscription-badge ${accessLevel(user)}`}>{t(ACCESS_LABELS[accessLevel(user)])}</div>
          </div>
          <div className="info-item"><label>{t('VIP individuel par application')}</label><div className="info-value vip-badges">
            {VIP_APPS.map(([, label, field]) => <span className={`vip-app-badge ${user[field] ? 'active' : ''}`} key={field}>{user[field] ? '⭐' : '☆'} {label}</span>)}
          </div></div>
          <div className="info-item"><label>{t('Notifications push')}</label><div className={`info-value push-state ${user.hasPushNotifications ? 'enabled' : ''}`}>
            {user.hasPushNotifications ? <>✅ {t('Activées')} ({user.pushSubscriptionsCount ?? '—'})</> : <>❌ {t('Désactivées')}</>}
          </div></div>
        </div>
      </section>
      <section className="info-section"><h2>📅 {t('Dates')}</h2><div className="info-grid">
        {[['Inscription', user.createdAt], ['Dernière mise à jour', user.updatedAt],
          ...(user.premiumStartDate ? [['Début Premium', user.premiumStartDate]] : []),
          ...(user.premiumEndDate ? [['Fin Premium', user.premiumEndDate]] : [])]
          .map(([label, value]) => <div className="info-item" key={label}><label>{t(label)}</label><div className="info-value">{date(value)}</div></div>)}
      </div>
      </section>
      {[
        ['SmartCellar', [['Foyers', 'householdCount', '🏠'], ['Produits', 'productCount', '📦'], ['Recettes', 'recipeCount', '📝'], ['Listes de courses', 'shoppingListCount', '🛒']]],
        ['ProGarden', [['Potagers', 'gardenCount', '🌱'], ['Diagnostics', 'observationCount', '🔬'], ['Graines', 'seedCount', '🌾'], ['Événements', 'gardenEventCount', '📅']]],
        ['Farmly', [['Animaux', 'farmAnimalCount', '🐓'], ['Élevages', 'farmGroupCount', '🏡'], ['Productions', 'farmProductionCount', '🥚'], ['Soins', 'farmHealthCount', '🩺']]],
      ].map(([app, stats]) => <section className="info-section statistics-section" key={app}>
        <h2>📊 {t('Statistiques')} {app}</h2><div className="stats-grid">
          {stats.map(([label, field, icon]) => <div className="stat-card" key={field}>
            <div className="stat-icon" aria-hidden="true">{icon}</div>
            <div className="stat-value">{user[field] ?? '—'}</div>
            <div className="stat-label">{t(label)}</div>
          </div>)}
        </div></section>)}
      {!!user.households?.length && <section className="info-section"><h2>🏠 {t('Foyers')} ({user.households.length})</h2>
        <div className="households-list">{user.households.map(household => <div className="household-card" key={household.id}>
          <div className="household-icon" aria-hidden="true">{householdIcon(household.icon)}</div>
          <div className="household-info"><h3>{household.name}</h3>
            {Array.isArray(household.members) && <p>{t('{count} membre(s)', { count: household.members.length })}</p>}
          </div>
        </div>)}</div>
      </section>}
      <section className="info-section actions-section"><h2>⚙️ {t('Actions d’administration')}</h2>
        <fieldset disabled={busy}>
          <div className="access-management"><h3>🎯 {t('Gestion des accès')}</h3><div className="action-buttons">
            <button type="button" className={`action-btn toggle-premium ${user.isPremium ? 'active' : ''}`} disabled={busy} onClick={() => update('toggle-premium', undefined, 'Modifier le statut Premium de cet utilisateur ?')}>
              👑 {t(user.isPremium ? 'Désactiver Premium' : 'Activer Premium')}</button>
            <button type="button" className={`action-btn toggle-vip ${user.isVIP ? 'active' : ''}`} disabled={busy} onClick={() => update('toggle-vip', undefined, 'Modifier le statut VIP global de cet utilisateur ?')}>
              ⭐ {t(user.isVIP ? 'Désactiver VIP (toutes les applications)' : 'Activer VIP (toutes les applications)')}</button>
          </div><h4>{t('Premium individuel par application')}</h4><div className="action-buttons">
            {[...VIP_APPS.map(([app, label]) => [app, label]), ['prete', 'PRÊT·E'], ['herbogenius', 'HerboGenius']].map(([app, label]) => {
              const field = `premium${app[0].toUpperCase()}${app.slice(1)}`;
              return <button type="button" className={`action-btn toggle-premium premium-app-action ${user[field] ? 'active' : ''}`} key={app} disabled={busy} aria-pressed={!!user[field]}
                onClick={() => update('toggle-premium-app', { app }, t('Modifier le Premium {app} de cet utilisateur ?', { app: label }))}>{user[field] ? '👑' : '☆'} {label}</button>;
            })}
          </div><h4>{t('VIP individuel par application')}</h4><div className="action-buttons">
            {VIP_APPS.map(([app, label, field]) => <button type="button" className={`action-btn toggle-vip vip-app-action ${user[field] ? 'active' : ''}`} disabled={busy} aria-pressed={!!user[field]} key={app}
              onClick={() => update('toggle-vip-app', { app }, t('Modifier le VIP {app} de cet utilisateur ?', { app: label }))}>{user[field] ? '⭐' : '☆'} {label}</button>)}
          </div></div>
          <fieldset disabled={user.id === 1}>
          <PartnerAccess user={user} busy={busy} onUpdate={update} />
          <div className="account-actions"><h3>🔧 {t('Actions de compte')}</h3><div className="action-buttons">
            <button type="button" className={`action-btn ${user.blocked ? 'unblock' : 'block'}`} disabled={busy} onClick={() => update(user.blocked ? 'unblock' : 'block', undefined, user.blocked ? 'Débloquer cet utilisateur ?' : 'Bloquer cet utilisateur ?')}>{user.blocked ? '🔓' : '🚫'} {t(user.blocked ? 'Débloquer' : 'Bloquer')}</button>
            <button type="button" className="action-btn reset" disabled={busy} onClick={() => update('reset-password', undefined, 'Envoyer un e-mail de réinitialisation du mot de passe ?')}>🔑 {t('Réinitialiser le mot de passe')}</button>
            <button type="button" className="action-btn delete" disabled={busy} onClick={() => update('delete', undefined, 'Supprimer cet utilisateur et ses données ?')}>🗑️ {t('Supprimer l’utilisateur')}</button>
          </div></div>
          </fieldset>
        </fieldset>
      </section>
    </div>}
    <div className="back-link-container"><BackLink users /></div>
  </section>;
}
