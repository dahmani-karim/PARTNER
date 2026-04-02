import { Link } from 'react-router-dom';
import styles from '../Landing/Landing.module.scss';

const NotFound = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem',
      background: 'var(--color-background)',
    }}>
      <div>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Page introuvable</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
          La page que tu cherches n'existe pas.
        </p>
        <Link to="/" className={styles.btnPrimary}>
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
