import { getLocale } from "../../services/localization";
import { translate, useTranslation } from "../../i18n";
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import usePartnerStore from '../../stores/partnerStore';
import { APPS, PLATFORMS } from '../../config/apps';
import styles from './Apply.module.scss';
const Apply = () => {
  useTranslation();
  const {
    application,
    partner,
    ready,
    submitApplication,
    loading,
    error,
    clearError
  } = usePartnerStore();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    app: '',
    platform: '',
    socialHandle: '',
    motivation: '',
    portfolioUrl: ''
  });

  // Déjà partner ou candidature en cours
  if (!ready) return <p role="status">{translate("Chargement...")}</p>;
  if (partner || application && ['pending', 'approved'].includes(application.status)) {
    return <Navigate to="/dashboard" replace />;
  }
  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (loading) return;
    clearError();
    try {
      await submitApplication(formData);
      setSubmitted(true);
    } catch {
      // handled by store
    }
  };
  if (submitted) {
    return <div className={styles.applyPage}>
        <div className={styles.success}>
          <div className={styles.successIcon}>🎉</div>
          <h2>{translate("Candidature envoyée !")}</h2>
          <p>{translate("Ta candidature pour ")}<strong>{APPS[formData.app]?.name}</strong>{translate(" a bien été reçue. Elle sera examinée prochainement.")}</p>
          <Link to="/dashboard" className={styles.backLink}>
            <ArrowLeft size={16} />{translate(" Retour au dashboard")}</Link>
        </div>
      </div>;
  }
  return <div className={styles.applyPage}>
      <div className={styles.header}>
        <h1>{translate("Postuler au programme Partner")}</h1>
        <p>{translate("Remplis le formulaire ci-dessous pour soumettre ta candidature.")}</p>
      </div>

      <div className={styles.form}>
        <div className={styles.infoBox}>
          <strong>{translate("📋 Conditions du programme :")}</strong>{translate("• Places et objectifs définis par application")}<br />{translate("• Objectif de publication indiqué dans ton tableau de bord")}<br />{translate("• Mention du compte officiel de l'app dans chaque vidéo")}<br />{translate("• Contenu de qualité soumis à validation mensuelle")}</div>

        {error && <div className={styles.error}>{translate(error)}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>{translate("Application souhaitée *")}</label>
            <select className={styles.select} name="app" value={formData.app} onChange={handleChange} required>
              <option value="">{translate("Choisir une application...")}</option>
              {Object.values(APPS).map(app => <option key={app.id} value={app.id}>
                  {app.icon} {app.name} — {translate(app.description)}
                </option>)}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{translate("Plateforme principale *")}</label>
            <select className={styles.select} name="platform" value={formData.platform} onChange={handleChange} required>
              <option value="">{translate("Choisir une plateforme...")}</option>
              {Object.values(PLATFORMS).map(p => <option key={p.id} value={p.id}>
                  {p.icon} {translate(p.name)}
                </option>)}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{translate("Ton pseudo/handle sur cette plateforme *")}</label>
            <input className={styles.input} type="text" name="socialHandle" value={formData.socialHandle} onChange={handleChange} placeholder="@monpseudo" required />
            <span className={styles.hint}>{translate("Ex: @moncompte_tiktok, @MaChaine_YouTube")}</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{translate("Motivation *")}</label>
            <textarea className={styles.textarea} name="motivation" value={formData.motivation} onChange={handleChange} placeholder={translate("Explique pourquoi tu souhaites devenir Partner et ce que tu apporterais au programme...")} required minLength={50} />
            <span className={styles.hint}>{translate("Minimum 50 caractères")}</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{translate("Lien vers du contenu existant (optionnel)")}</label>
            <input className={styles.input} type="url" name="portfolioUrl" value={formData.portfolioUrl} onChange={handleChange} placeholder="https://tiktok.com/@monprofil" />
            <span className={styles.hint}>{translate("Si tu as déjà du contenu, partage un lien")}</span>
          </div>

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? translate("Envoi en cours...") : translate("Envoyer ma candidature")}
          </button>
        </form>
      </div>
    </div>;
};
export default Apply;
