import { getLocale } from "../../services/localization";
import { translate, useTranslation } from "../../i18n";
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { forgotPassword } from '../../services/passwordRecovery';
import styles from './Auth.module.scss';
const Login = ({
  recovery = false
}) => {
  useTranslation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const {
    login,
    loading,
    error,
    clearError
  } = useAuthStore();
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [sent, setSent] = useState(false);
  const busy = recovery ? recoveryLoading : loading;
  const navigate = useNavigate();
  const location = useLocation();
  const handleSubmit = async e => {
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
      const target = location.state?.from?.pathname;
      navigate(target?.startsWith('/') && !target.startsWith('//') && !['/login', '/forgot-password'].includes(target) ? target : '/dashboard', {
        replace: true
      });
    } catch {
      // error handled by store
    }
  };
  return <div className={styles.authPage}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.logo}>{translate("P")}</div>
          <h1>{recovery ? translate("Mot de passe oublié") : translate("Connexion")}</h1>
          <p>{recovery ? translate("Saisis l'adresse e-mail de ton compte applications, distinct du compte du site lacavernedurefractaire.fr.") : translate("Connecte-toi avec ton compte existant")}</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {(recovery ? recoveryError : error) && <div className={styles.error} role="alert">{translate(recovery ? recoveryError : error)}</div>}
          {sent && <p role="status">{translate("Si un compte autorisé correspond à cette adresse, un e-mail a été envoyé. Vérifie tes indésirables. Le lien ouvre la page commune de réinitialisation de La Caverne du Réfractaire.")}</p>}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="identifier">{recovery ? translate("Email") : translate("Email ou nom d'utilisateur")}</label>
            <input className={styles.input} type={recovery ? "email" : "text"} id="identifier" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder={translate("ton@email.com")} required autoComplete={recovery ? "email" : "username"} disabled={busy || sent} />
          </div>

          {!recovery && <div className={styles.field}>
            <label className={styles.label} htmlFor="password">{translate("Mot de passe")}</label>
            <input className={styles.input} type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
          </div>}

          {!sent && <button className={styles.submitBtn} type="submit" disabled={busy}>
            {busy ? recovery ? translate("Envoi...") : translate("Connexion...") : recovery ? translate("Envoyer le lien") : translate("Se connecter")}
          </button>}
        </form>

        <Link to={recovery ? "/login" : "/forgot-password"} className={styles.backLink}>
          {recovery ? translate("Retour à la connexion") : translate("Mot de passe oublié ?")}
        </Link>
        <Link to="/" className={styles.backLink}>{translate("← Retour à l'accueil")}</Link>
      </div>
    </div>;
};
export default Login;
