import { getLocale } from "../../services/localization";
import { translate, useTranslation } from "../../i18n";
import { Link } from 'react-router-dom';
import { Crown, Video, CheckCircle, ArrowRight } from 'lucide-react';
import { APPS } from '../../config/apps';
import styles from './Landing.module.scss';
import useAuthStore from '../../stores/authStore';
import LanguageSwitcher from '../../components/LanguageSwitcher/LanguageSwitcher';
const Landing = () => {
  useTranslation();
  const connected = useAuthStore(s => s.isAuthenticated);
  return <div className={styles.landing}>
      <div className={styles.language}><LanguageSwitcher /></div>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.pill}>
            <Crown size={14} />{translate(" Programme Ambassadeur")}</div>
          <h1 className={styles.heroTitle}>{translate("Deviens ")}<span className="gold-gradient">{translate("Partner")}</span>{translate(" et accède au Premium gratuitement")}</h1>
          <p className={styles.heroSub}>{translate("Rejoins le programme ambassadeur de La Caverne du Réfractaire. Crée du contenu vidéo sur nos applications et bénéficie d'un accès Premium offert à l’écosystème en retour.")}</p>
          <div className={styles.heroCta}>
            <Link to={connected ? "/dashboard" : "/login"} className={styles.btnPrimary}>{translate(connected ? 'Accéder au dashboard' : 'Devenir Partner')} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.howSection}>
        <h2 className={styles.sectionTitle}>{translate("Comment ça marche ?")}</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h3 className={styles.stepTitle}>{translate("Connecte-toi")}</h3>
            <p className={styles.stepDesc}>{translate("Connecte-toi avec ton compte existant d'une de nos applications et postule pour devenir ambassadeur.")}</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h3 className={styles.stepTitle}>{translate("Candidature")}</h3>
            <p className={styles.stepDesc}>{translate("Remplis le formulaire avec ta plateforme, ton profil social et ta motivation.")}</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h3 className={styles.stepTitle}>{translate("Crée du contenu")}</h3>
            <p className={styles.stepDesc}>{translate("Publie régulièrement en mentionnant l’application, selon l’objectif défini pour ton partenariat.")}</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <h3 className={styles.stepTitle}>{translate("Premium gratuit")}</h3>
            <p className={styles.stepDesc}>{translate("Tant que tu respectes les conditions, tu profites du premium sans payer.")}</p>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className={styles.benefitsSection}>
        <h2 className={styles.sectionTitle}>{translate("Les avantages Partner")}</h2>
        <div className={styles.benefits}>
          <div className={styles.benefit}>
            <div className={styles.benefitIcon}>👑</div>
            <h3 className={styles.benefitTitle}>{translate("Accès Premium Gratuit")}</h3>
            <p className={styles.benefitDesc}>{translate("Profite des fonctionnalités Premium de l’écosystème couvertes par ton accès Partner, sans frais.")}</p>
          </div>
          <div className={styles.benefit}>
            <div className={styles.benefitIcon}>🎬</div>
            <h3 className={styles.benefitTitle}>{translate("Créateur reconnu")}</h3>
            <p className={styles.benefitDesc}>{translate("Intègre un programme exclusif dont les places sont définies pour chaque application.")}</p>
          </div>
          <div className={styles.benefit}>
            <div className={styles.benefitIcon}>📈</div>
            <h3 className={styles.benefitTitle}>{translate("Suivi & Dashboard")}</h3>
            <p className={styles.benefitDesc}>{translate("Suis tes statistiques, ton quota hebdomadaire et ton score de qualité depuis ton tableau de bord.")}</p>
          </div>
        </div>
      </section>

      {/* APPS */}
      <section className={styles.appsSection}>
        <h2 className={styles.sectionTitle}>{translate("Applications éligibles")}</h2>
        <div className={styles.apps}>
          {Object.values(APPS).map(app => <div key={app.id} className={styles.appCard}>
              <div className={styles.appIcon} style={{
            backgroundColor: `${app.color}15`
          }}>
                {app.icon}
              </div>
              <div>
                <div className={styles.appName}>{app.name}</div>
                <div className={styles.appDesc}>{translate(app.description)}</div>
              </div>
            </div>)}
        </div>
      </section>

    </div>;
};
export default Landing;
