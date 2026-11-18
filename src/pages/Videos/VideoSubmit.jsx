import { getLocale } from "../../services/localization";
import { translate, useTranslation } from "../../i18n";
import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import usePartnerStore from '../../stores/partnerStore';
import { PLATFORMS } from '../../config/apps';
import styles from './Videos.module.scss';
const VideoSubmit = () => {
  useTranslation();
  const {
    partner,
    ready,
    submitVideo,
    loading,
    error,
    clearError
  } = usePartnerStore();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    if (!success) return;
    const timeout = setTimeout(() => navigate('/videos'), 2000);
    return () => clearTimeout(timeout);
  }, [success, navigate]);
  const [formData, setFormData] = useState({
    url: '',
    platform: partner?.platform || '',
    title: '',
    publishedAt: new Date().toISOString().split('T')[0],
    description: '',
    hashtags: '',
    mentionsApp: false
  });

  // Pas partner actif → rediriger
  if (!ready) return <p role="status">{translate("Chargement...")}</p>;
  if (!partner || !['active', 'warning'].includes(partner.status)) {
    return <Navigate to="/dashboard" replace />;
  }
  const handleChange = e => {
    const {
      name,
      value,
      type,
      checked
    } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (loading || success) return;
    clearError();
    try {
      await submitVideo({
        ...formData,
        publishedAt: new Date(formData.publishedAt).toISOString()
      });
      setSuccess(true);
    } catch {
      // handled by store
    }
  };
  return <div className={styles.videosPage}>
      <div className={styles.header}>
        <div>
          <h1>{translate("Soumettre une vidéo")}</h1>
          <p>{translate("Ajoute une nouvelle vidéo pour validation.")}</p>
        </div>
      </div>

      <div className={styles.submitForm}>
        {error && <div className={styles.error}>{translate(error)}</div>}
        {success && <div className={styles.success}>{translate("Vidéo soumise avec succès ! Redirection...")}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>{translate("URL de la vidéo *")}</label>
            <input className={styles.input} type="url" name="url" value={formData.url} onChange={handleChange} placeholder="https://tiktok.com/@user/video/123..." required />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{translate("Plateforme *")}</label>
            <select className={styles.select} name="platform" value={formData.platform} onChange={handleChange} required>
              <option value="">{translate("Choisir...")}</option>
              {Object.values(PLATFORMS).map(p => <option key={p.id} value={p.id}>
                  {p.icon} {translate(p.name)}
                </option>)}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{translate("Titre de la vidéo *")}</label>
            <input className={styles.input} type="text" name="title" value={formData.title} onChange={handleChange} placeholder={translate("Titre ou sujet de la vidéo")} required />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{translate("Date de publication")}</label>
            <input className={styles.input} type="date" name="publishedAt" value={formData.publishedAt} onChange={handleChange} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{translate("Description de la vidéo")}</label>
            <textarea className={styles.textarea} name="description" value={formData.description} onChange={handleChange} placeholder={translate("Description ou texte accompagnant la vidéo...")} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{translate("Hashtags utilisés")}</label>
            <input className={styles.input} type="text" name="hashtags" value={formData.hashtags} onChange={handleChange} placeholder="#smartcellar #lacaverne #app" />
            <span className={styles.hint}>{translate("Sépare les hashtags par des espaces")}</span>
          </div>

          <div className={styles.checkboxField}>
            <input type="checkbox" id="mentionsApp" name="mentionsApp" checked={formData.mentionsApp} onChange={handleChange} />
            <label htmlFor="mentionsApp">{translate("La vidéo mentionne le compte officiel de l'application")}</label>
          </div>

          <button className={styles.submitBtn} type="submit" disabled={loading || success}>
            {loading ? translate("Envoi...") : translate("Soumettre la vidéo")}
          </button>
        </form>
      </div>
    </div>;
};
export default VideoSubmit;
