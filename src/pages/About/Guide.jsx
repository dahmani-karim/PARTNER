import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import './About.scss';

export default function Guide() {
  const { t } = useTranslation();
  return <div className="about-document"><div className="about-document__content">
    <header className="about-header"><h1>{t('Guide d’utilisation')}</h1><p>{t('De la candidature au suivi de vos publications.')}</p></header>
    {[
      ['Un compte commun', 'Connectez-vous avec votre compte applications. Le compte du site officiel est distinct.'],
      ['Candidater', 'Choisissez une application, une plateforme et votre profil social, puis expliquez votre motivation. L’administration examine votre candidature.'],
      ['Publier et soumettre', 'Une fois votre dossier actif, ajoutez les liens de vos vidéos avec leur date, leur plateforme et la mention de l’application. Les contenus restent sur leurs plateformes d’origine.'],
      ['Suivre le programme', 'Le tableau de bord présente votre statut, vos publications et votre objectif hebdomadaire. Les accès offerts dépendent du statut confirmé par le backend.'],
      ['Gérer votre compte', 'Le profil commun permet de modifier vos informations. Les paramètres regroupent la langue, l’installation et la sécurité. Le mot de passe est partagé entre les applications.'],
    ].map(([title, text]) => <section key={title} className="content-section"><h2>{t(title)}</h2><p>{t(text)}</p></section>)}
    <Link to="/about">{t('Retour à propos')}</Link>
  </div></div>;
}
