import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { forgotPassword } from '../../services/passwordRecovery';
import styles from './Auth.module.scss';

const Login = ({ recovery = false }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, clearError } = useAuthStore();
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [sent, setSent] = useState(false);
  const busy = recovery ? recoveryLoading : loading;
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy || sent) return;
    if (recovery) {
      setRecoveryLoading(true);
      setRecoveryError('');
      try {
        await forgotPassword(identifier);
        setSent(true);
        setPassword('');
      } catch (failure) {
        setRecoveryError(failure.message);
      } finally {
        setRecoveryLoading(false);
      }
      return;
    }
    clearError();
    try {
      await login(identifier, password);
      navigate('/dashboard');
    } catch {
      // error handled by store
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.logo}>P</div>
          <h1>{recovery ? 'Mot de passe oublié' : 'Connexion'}</h1>
          <p>{recovery ? "Saisis l'adresse e-mail de ton compte applications, distinct du compte du site lacavernedurefractaire.fr." : 'Connecte-toi avec ton compte existant'}</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {(recovery ? recoveryError : error) && <div className={styles.error} role="alert">{recovery ? recoveryError : error}</div>}
          {sent && <p role="status">Si un compte autorisé correspond à cette adresse, un e-mail a été envoyé. Vérifie tes indésirables. Le lien ouvre la page commune de réinitialisation de La Caverne du Réfractaire.</p>}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="identifier">{recovery ? 'Email' : "Email ou nom d'utilisateur"}</label>
            <input
              className={styles.input}
              type={recovery ? 'email' : 'text'}
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="ton@email.com"
              required
              autoComplete={recovery ? 'email' : 'username'}
              disabled={busy || sent}
            />
          </div>

          {!recovery && <div className={styles.field}>
            <label className={styles.label}>Mot de passe</label>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>}

          {!sent && <button className={styles.submitBtn} type="submit" disabled={busy}>
            {busy ? (recovery ? 'Envoi...' : 'Connexion...') : (recovery ? 'Envoyer le lien' : 'Se connecter')}
          </button>}
        </form>

        <Link to={recovery ? '/login' : '/forgot-password'} className={styles.backLink}>
          {recovery ? 'Retour à la connexion' : 'Mot de passe oublié ?'}
        </Link>
        <Link to="/" className={styles.backLink}>
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default Login;
