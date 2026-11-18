import { getLocale } from "../../services/localization";
import { translate, useTranslation } from "../../i18n";
import { Link } from 'react-router-dom';
import styles from '../Landing/Landing.module.scss';
const NotFound = () => {
  useTranslation();
  return <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '2rem',
    background: 'var(--color-background)'
  }}>
      <div>
        <div style={{
        fontSize: '4rem',
        marginBottom: '1rem'
      }}>🔍</div>
        <h1 style={{
        fontSize: '2rem',
        marginBottom: '0.5rem'
      }}>{translate("Page introuvable")}</h1>
        <p style={{
        color: 'var(--color-text-secondary)',
        marginBottom: '1.5rem'
      }}>{translate("La page que tu cherches n'existe pas.")}</p>
        <Link to="/" className={styles.btnPrimary}>{translate("Retour à l'accueil")}</Link>
      </div>
    </div>;
};
export default NotFound;
