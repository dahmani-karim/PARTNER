import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import usePartnerStore from '../../stores/partnerStore';
import { PLATFORMS } from '../../config/apps';
import styles from './Videos.module.scss';

const VideoSubmit = () => {
  const { partner, submitVideo, loading, error, clearError } = usePartnerStore();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    url: '',
    platform: partner?.platform || '',
    title: '',
    publishedAt: new Date().toISOString().split('T')[0],
    description: '',
    hashtags: '',
    mentionsApp: false,
  });

  // Pas partner actif → rediriger
  if (!partner || !['active', 'warning'].includes(partner.status)) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    try {
      await submitVideo({
        ...formData,
        publishedAt: new Date(formData.publishedAt).toISOString(),
      });
      setSuccess(true);
      setTimeout(() => navigate('/videos'), 2000);
    } catch {
      // handled by store
    }
  };

  return (
    <div className={styles.videosPage}>
      <div className={styles.header}>
        <div>
          <h1>Soumettre une vidéo</h1>
          <p>Ajoute une nouvelle vidéo pour validation.</p>
        </div>
      </div>

      <div className={styles.submitForm}>
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>Vidéo soumise avec succès ! Redirection...</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>URL de la vidéo *</label>
            <input
              className={styles.input}
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://tiktok.com/@user/video/123..."
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Plateforme *</label>
            <select
              className={styles.select}
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              required
            >
              <option value="">Choisir...</option>
              {Object.values(PLATFORMS).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.icon} {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Titre de la vidéo *</label>
            <input
              className={styles.input}
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Titre ou sujet de la vidéo"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Date de publication</label>
            <input
              className={styles.input}
              type="date"
              name="publishedAt"
              value={formData.publishedAt}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description de la vidéo</label>
            <textarea
              className={styles.textarea}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description ou texte accompagnant la vidéo..."
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Hashtags utilisés</label>
            <input
              className={styles.input}
              type="text"
              name="hashtags"
              value={formData.hashtags}
              onChange={handleChange}
              placeholder="#smartcellar #lacaverne #app"
            />
            <span className={styles.hint}>Sépare les hashtags par des espaces</span>
          </div>

          <div className={styles.checkboxField}>
            <input
              type="checkbox"
              id="mentionsApp"
              name="mentionsApp"
              checked={formData.mentionsApp}
              onChange={handleChange}
            />
            <label htmlFor="mentionsApp">
              La vidéo mentionne le compte officiel de l'application
            </label>
          </div>

          <button className={styles.submitBtn} type="submit" disabled={loading || success}>
            {loading ? 'Envoi...' : 'Soumettre la vidéo'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VideoSubmit;
