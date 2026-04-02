import { Link } from 'react-router-dom';
import { Crown, Video, CheckCircle, ArrowRight } from 'lucide-react';
import { APPS } from '../../config/apps';
import styles from './Landing.module.scss';

const Landing = () => {
  return (
    <div className={styles.landing}>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.pill}>
            <Crown size={14} /> Programme Ambassadeur
          </div>
          <h1 className={styles.heroTitle}>
            Deviens <span className="gold-gradient">Partner</span> et accède au
            Premium gratuitement
          </h1>
          <p className={styles.heroSub}>
            Rejoins le programme ambassadeur de La Caverne du Réfractaire.
            Crée du contenu vidéo sur nos applications et bénéficie d'un accès
            premium gratuit en retour.
          </p>
          <div className={styles.heroCta}>
            <Link to="/login" className={styles.btnPrimary}>
              Devenir Partner <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.howSection}>
        <h2 className={styles.sectionTitle}>Comment ça marche ?</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h3 className={styles.stepTitle}>Connecte-toi</h3>
            <p className={styles.stepDesc}>
              Connecte-toi avec ton compte existant d'une de nos applications et postule pour devenir ambassadeur.
            </p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h3 className={styles.stepTitle}>Candidature</h3>
            <p className={styles.stepDesc}>
              Remplis le formulaire avec ta plateforme, ton profil social et ta motivation.
            </p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h3 className={styles.stepTitle}>Crée du contenu</h3>
            <p className={styles.stepDesc}>
              Publie au minimum 2 vidéos par semaine en mentionnant l'application.
            </p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <h3 className={styles.stepTitle}>Premium gratuit</h3>
            <p className={styles.stepDesc}>
              Tant que tu respectes les conditions, tu profites du premium sans payer.
            </p>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className={styles.benefitsSection}>
        <h2 className={styles.sectionTitle}>Les avantages Partner</h2>
        <div className={styles.benefits}>
          <div className={styles.benefit}>
            <div className={styles.benefitIcon}>👑</div>
            <h3 className={styles.benefitTitle}>Accès Premium Gratuit</h3>
            <p className={styles.benefitDesc}>
              Profite de toutes les fonctionnalités premium de l'application de ton choix, sans frais.
            </p>
          </div>
          <div className={styles.benefit}>
            <div className={styles.benefitIcon}>🎬</div>
            <h3 className={styles.benefitTitle}>Créateur reconnu</h3>
            <p className={styles.benefitDesc}>
              Intègre un programme exclusif limité à 2 ambassadeurs par application. 
            </p>
          </div>
          <div className={styles.benefit}>
            <div className={styles.benefitIcon}>📈</div>
            <h3 className={styles.benefitTitle}>Suivi & Dashboard</h3>
            <p className={styles.benefitDesc}>
              Suis tes statistiques, ton quota hebdomadaire et ton score de qualité depuis ton tableau de bord.
            </p>
          </div>
        </div>
      </section>

      {/* APPS */}
      <section className={styles.appsSection}>
        <h2 className={styles.sectionTitle}>Applications éligibles</h2>
        <div className={styles.apps}>
          {Object.values(APPS).map((app) => (
            <div key={app.id} className={styles.appCard}>
              <div
                className={styles.appIcon}
                style={{ backgroundColor: `${app.color}15` }}
              >
                {app.icon}
              </div>
              <div>
                <div className={styles.appName}>{app.name}</div>
                <div className={styles.appDesc}>{app.description}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        © {new Date().getFullYear()} La Caverne du Réfractaire — Programme Partner
      </footer>
    </div>
  );
};

export default Landing;
