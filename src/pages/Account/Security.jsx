import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { changePassword, deactivateAccount } from '../../services/accountService';
import { useTranslation } from '../../i18n';
import './account.scss';

export default function Security() {
  const { t } = useTranslation();
  const jwt = useAuthStore(s => s.token);
  const user = useAuthStore(s => s.user);
  const renewSession = useAuthStore(s => s.renewSession);
  const logout = useAuthStore(s => s.logout);
  const navigate = useNavigate();
  const [form, setForm] = useState({ current: '', password: '', confirmation: '' });
  const [confirmation, setConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const password = async event => {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError(''); setMessage('');
    try {
      const session = await changePassword(form.current, form.password, form.confirmation, jwt);
      renewSession(session);
      setForm({ current: '', password: '', confirmation: '' });
      setMessage(t('Mot de passe modifié pour toutes vos applications. Votre session PARTNER a été renouvelée.'));
    } catch (failure) { setError(t(failure.message)); }
    finally { setBusy(false); }
  };
  const deactivate = async event => {
    event.preventDefault();
    if (busy || confirmation !== 'DESACTIVER') return;
    setBusy(true); setError(''); setMessage('');
    try {
      await deactivateAccount(user.id, jwt);
      logout(); navigate('/login', { replace: true });
    } catch (failure) { setError(t(failure.message)); }
    finally { setBusy(false); }
  };
  return <div className="account-page">
    <h1>{t('Sécurité du compte')}</h1>
    <nav className="account-links"><Link to="/profile">{t('Mon profil')}</Link><Link to="/settings">{t('Paramètres')}</Link></nav>
    <p>{t('Votre mot de passe est commun à toutes les applications de La Caverne du Réfractaire.')}</p>
    {error && <p role="alert">{error}</p>}{message && <p role="status">{message}</p>}
    <form onSubmit={password}><fieldset disabled={busy}><legend>{t('Changer le mot de passe')}</legend>
      {[['current', 'Mot de passe actuel', 'current-password'], ['password', 'Nouveau mot de passe', 'new-password'], ['confirmation', 'Confirmer le nouveau mot de passe', 'new-password']].map(([key, label, autoComplete]) =>
        <label key={key}>{t(label)}<input type="password" autoComplete={autoComplete} required value={form[key]} onChange={event => setForm(previous => ({ ...previous, [key]: event.target.value }))} /></label>)}
      <button className="partner-btn partner-btn--primary" disabled={busy}>{t(busy ? 'En cours…' : 'Modifier mon mot de passe')}</button>
    </fieldset></form>
    <section><h2>{t('Suppression / désactivation du compte')}</h2>
      <p>{t('Cette action bloque votre compte commun sur toutes les applications, sans effacer vos données ni annuler vos abonnements Fourthwall. Pour un effacement, contactez le support.')}</p>
      <a href="mailto:contact@lacavernedurefractaire.fr">contact@lacavernedurefractaire.fr</a>
      {!deleting ? <button className="partner-btn partner-btn--ghost" disabled={busy} onClick={() => setDeleting(true)}>{t('Désactiver mon compte')}</button> :
        <form onSubmit={deactivate}><label>{t('Saisissez DESACTIVER pour confirmer')}<input autoComplete="off" disabled={busy} value={confirmation} onChange={event => setConfirmation(event.target.value)} /></label>
          <div className="account-links"><button className="partner-btn partner-btn--ghost" type="button" disabled={busy} onClick={() => { setDeleting(false); setConfirmation(''); }}>{t('Annuler')}</button>
            <button className="partner-btn partner-btn--primary" disabled={busy || confirmation !== 'DESACTIVER'}>{t('Confirmer la désactivation de toutes mes applications')}</button></div>
        </form>}
    </section>
  </div>;
}
