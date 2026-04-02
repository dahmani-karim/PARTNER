import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import styles from './Auth.module.scss';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setLocalError('');

    if (password !== confirmPassword) {
      setLocalError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setLocalError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      await register(username, email, password);
      navigate('/dashboard');
    } catch {
      // error handled by store
    }
  };

  const displayError = localError || error;

  return (
    <div className={styles.authPage}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.logo}>P</div>
          <h1>Inscription</h1>
          <p>Rejoins le programme Partner</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {displayError && <div className={styles.error}>{displayError}</div>}

          <div className={styles.field}>
            <label className={styles.label}>Nom d'utilisateur</label>
            <input
              className={styles.input}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="MonPseudo"
              required
              autoComplete="username"
              minLength={3}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Mot de passe</label>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              minLength={6}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Confirmer le mot de passe</label>
            <input
              className={styles.input}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Inscription...' : "S'inscrire"}
          </button>
        </form>

        <div className={styles.switch}>
          Déjà un compte ?{' '}
          <Link to="/login">Se connecter</Link>
        </div>

        <Link to="/" className={styles.backLink}>
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default Register;
