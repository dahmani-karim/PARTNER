import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import './About.scss';

export default function About() {
  const { t } = useTranslation();
  return <div className="about-page">
    <header className="about-header"><h1>{t('À propos de PARTNER')}</h1><p>{t('Le programme ambassadeur de La Caverne du Réfractaire.')}</p></header>
    <div className="about-cards">{[
      ['/about/guide', '📖', 'Guide d’utilisation', 'Candidatures, vidéos et suivi de votre partenariat.'],
      ['/legal', '⚖️', 'Mentions légales', 'Éditeur, hébergement et responsabilités.'],
      ['/about/terms', '📋', 'Conditions & Confidentialité', 'Conditions du programme et protection de vos données.'],
    ].map(([to, icon, title, description]) => <Link className="about-card" key={to} to={to}><span aria-hidden="true">{icon}</span><h2>{t(title)}</h2><p>{t(description)}</p><span aria-hidden="true">→</span></Link>)}</div>
    <section className="about-contact"><h2>{t('Besoin d’aide ?')}</h2><a href="mailto:contact@lacavernedurefractaire.fr">contact@lacavernedurefractaire.fr</a></section>
  </div>;
}
