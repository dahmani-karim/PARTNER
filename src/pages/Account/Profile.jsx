import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import api from '../../services/adminApi';
import { useTranslation } from '../../i18n';
import Access from './Access';
import './account.scss';

const FIELDS = [
  ['firstName', 'Prénom'], ['lastName', 'Nom'], ['dateOfBirth', 'Date de naissance', 'date'],
  ['phoneNumber', 'Téléphone', 'tel'], ['city', 'Ville'], ['postalCode', 'Code postal'], ['country', 'Pays'],
];
export function profilePayload(form) {
  return Object.fromEntries([...FIELDS.map(([key]) => key), 'bio'].map(key => [key, form[key] || null]));
}

export default function Profile() {
  const { t } = useTranslation();
  const user = useAuthStore(s => s.user);
  const avatarUrl = useAuthStore(s => s.avatarUrl);
  const profile = useAuthStore(s => s.profile);
  const profileError = useAuthStore(s => s.profileError);
  const refreshProfile = useAuthStore(s => s.refreshProfile);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (profile) setForm(profilePayload(profile));
  }, [profile]);
  const save = async event => {
    event.preventDefault();
    setBusy(true); setError(''); setMessage('');
    try {
      await api.put('/user-profiles/me', profilePayload(form));
      await refreshProfile();
      setMessage(t('Profil enregistré'));
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  };
  const avatar = async file => {
    if (!file) return;
    setError(''); setMessage('');
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setError(t('Choisissez une image de moins de 5 Mo.')); return;
    }
    setBusy(true);
    try {
      const body = new FormData();
      body.append('avatar', file);
      await api.post('/user-profiles/me/avatar', body);
      await refreshProfile();
      setMessage(t('Profil enregistré'));
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  };
  return <div className="account-page">
    <h1>{t('Mon profil')}</h1><p>{user?.username} · {user?.email}</p>
    <nav className="account-links"><Link to="/profile/advanced">{t('Mon partenariat')}</Link><Link to="/settings/security">{t('Sécurité du compte')}</Link></nav>
    {avatarUrl && <img className="account-avatar" src={avatarUrl} alt={t('Photo de profil')} />}
    {(error || profileError) && <p role="alert">{t(error || profileError)}</p>}
    {message && <p role="status">{message}</p>}
    {!form ? <button onClick={() => refreshProfile().catch(failure => setError(failure.message))}>{t('Recharger')}</button> : <form onSubmit={save}>
      <fieldset disabled={busy}><legend>{t('Informations personnelles')}</legend>
        <label>{t('Photo de profil')}<input type="file" accept="image/*" onChange={event => avatar(event.target.files[0])} /></label>
        {FIELDS.map(([key, label, type = 'text']) => <label key={key}>{t(label)}<input type={type} value={form[key] || ''} onChange={event => setForm(previous => ({ ...previous, [key]: event.target.value }))} /></label>)}
        <label>{t('Biographie')}<textarea value={form.bio || ''} onChange={event => setForm(previous => ({ ...previous, bio: event.target.value }))} /></label>
        <button className="partner-btn partner-btn--primary" disabled={busy}>{t(busy ? 'Enregistrement...' : 'Enregistrer')}</button>
      </fieldset>
    </form>}
    <Access />
  </div>;
}
