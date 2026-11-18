import { useTranslation } from '../../i18n.jsx';
import RichText from "../../components/RichText/RichText";
import React from "react";
import { NavLink } from "react-router-dom";
import "./About.scss";
const Legal = () => {
  const {
    t
  } = useTranslation();
  return <div className="legal-page">
            <div className="legal-container">
                <div className="legal-header">
                    <h1>⚖️ {t("Mentions Légales")}</h1>
                    <p className="legal-subtitle">
                        {t("Informations légales relatives à l'édition et à l'hébergement de PARTNER")}
                    </p>
                </div>

                <section className="legal-section">
                    <h2>{t("1. Éditeur du Site")}</h2>
                    <div className="legal-card">
                        <p>
                            <RichText text={t("Le site <strong>PARTNER</strong> (https://partner.lacavernedurefractaire.fr) est édité par :")} components={{
              strong: <strong />
            }} />
                        </p>
                        <p>
                            <RichText text={t("<strong>La Caverne du Réfractaire</strong><br/>Micro-entreprise<br/>SIRET : 82462597400038<br/>Email : <a>contact@lacavernedurefractaire.fr</a>")} components={{
              strong: <strong />,
              br: <br />,
              a: <a href="mailto:contact@lacavernedurefractaire.fr" />
            }} />
                        </p>
                        <p>
                            <RichText text={t("<strong>Directeur de la publication :</strong> La Caverne du Réfractaire<br/><strong>Responsable de la rédaction :</strong> KRriM0 Toretto")} components={{
              strong: <strong />,
              br: <br />
            }} />
                        </p>
                    </div>
                </section>

                <section className="legal-section">
                    <h2>{t("2. Hébergeur")}</h2>
                    <div className="legal-card">
                        <p>
                            {t("L’application PARTNER est diffusée par GitHub Pages et utilise le backend commun hébergé sur Render.")}
                        </p>
                        <p>
                            <RichText text={t("<strong>Frontend :</strong> GitHub Pages — GitHub, Inc.<br/>88 Colin P. Kelly Jr. Street<br/>San Francisco, CA 94107, États-Unis<br/>Site web : <a>https://pages.github.com</a>")} components={{
              strong: <strong />,
              br: <br />,
              a: <a href="https://pages.github.com" target="_blank" rel="noopener noreferrer" />
            }} />
                        </p>
                        <p>
                            <RichText text={t("<strong>Backend API :</strong> Hébergé sur Render, selon la configuration du service centralisé.")} components={{
              strong: <strong />
            }} />
                        </p>
                        <p>
                            <RichText text={t("<strong>Frontend :</strong> Hébergé sur les serveurs Github (CDN mondial)")} components={{
              strong: <strong />
            }} />
                        </p>
                    </div>
                </section>

                <section className="legal-section">
                    <h2>{t("3. Propriété Intellectuelle")}</h2>
                    <div className="legal-card">
                        <p>
                            <RichText text={t("L'ensemble des contenus présents sur le site PARTNER (structure, design, logos, textes, images, graphismes, sons, vidéos, bases de données, logiciels, etc.) est la propriété exclusive de <strong>La Caverne du Réfractaire</strong>, sauf mention contraire.")} components={{
              strong: <strong />
            }} />
                        </p>
                        <p>
                            {t("Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de l'éditeur.")}
                        </p>
                        <p>
                            <RichText text={t("Les marques, logos et signes distinctifs reproduits sur le site sont la propriété de <strong>La Caverne du Réfractaire</strong> ou font l'objet d'une autorisation d'utilisation.")} components={{
              strong: <strong />
            }} />
                        </p>
                    </div>
                </section>

                <section className="legal-section">
                    <h2>{t("4. Données Personnelles")}</h2>
                    <div className="legal-card">
                        <p>
                            <RichText text={t("PARTNER collecte et traite des données personnelles dans le respect du <strong>Règlement Général sur la Protection des Données (RGPD)</strong> et de la loi Informatique et Libertés.")} components={{
              strong: <strong />
            }} />
                        </p>
                        <p>
                            <RichText text={t("Pour plus d'informations sur la collecte et le traitement de vos données personnelles, consultez notre <navlink>Politique de Confidentialité (RGPD)</navlink>.")} components={{
              navlink: <NavLink to="/about/terms?tab=rgpd" />
            }} />
                        </p>
                        <p>
                            <RichText text={t("Conformément à la loi, vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données. Pour exercer ces droits, contactez-nous à <a>contact@lacavernedurefractaire.fr</a>.")} components={{
              a: <a href="mailto:contact@lacavernedurefractaire.fr" />
            }} />
                        </p>
                    </div>
                </section>

                <section className="legal-section">
                    <h2>{t("5. Cookies")}</h2>
                    <div className="legal-card">
                        <p>
                            {t("Le site PARTNER utilise des cookies pour améliorer l'expérience utilisateur et assurer le bon fonctionnement de l'application.")}
                        </p>
                        <p>
                            <RichText text={t("<strong>Cookies essentiels :</strong> Nécessaires au fonctionnement du site (authentification, sécurité)")} components={{
              strong: <strong />
            }} />
                        </p>
                        <p>
                            <RichText text={t("<strong>Cookies de préférences :</strong> Mémorisation de vos choix (langue et affichage, paramètres d’affichage)")} components={{
              strong: <strong />
            }} />
                        </p>
                        <p>
                            {t("Vous pouvez configurer votre navigateur pour refuser les cookies, mais cela peut limiter certaines fonctionnalités du site.")}
                        </p>
                    </div>
                </section>

                <section className="legal-section">
                    <h2>{t("6. Responsabilité")}</h2>
                    <div className="legal-card">
                        <p>
                            {t("L'éditeur s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur le site, mais ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations disponibles.")}
                        </p>
                        <p>
                            {t("L'éditeur ne peut être tenu responsable :")}
                        </p>
                        <ul>
                            <li>{t("Des erreurs ou omissions dans les informations transmises pour le programme ambassadeur")}</li>
                            <li>{t("De l'utilisation incorrecte ou inappropriée de l'application")}</li>
                            <li>{t("Des dommages directs ou indirects résultant de l'accès ou de l'utilisation du site")}</li>
                            <li>{t("Des interruptions de service pour maintenance ou raisons techniques")}</li>
                        </ul>
                        <p>
                            {t("L’utilisateur est responsable des informations et liens soumis ainsi que du respect des droits liés à ses contenus.")}
                        </p>
                    </div>
                </section>

                <section className="legal-section">
                    <h2>{t("7. Liens Hypertextes")}</h2>
                    <div className="legal-card">
                        <p>
                            {t("Le site PARTNER peut contenir des liens vers des sites externes. L'éditeur n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.")}
                        </p>
                        <p>
                            {t("Sites externes référencés :")}
                        </p>
                        <ul>


                            <li>
                                <RichText text={t("<strong>Plateformes sociales :</strong> Les vidéos restent sur leurs plateformes d’origine. Ces services appliquent leurs propres conditions et politiques de confidentialité. <a>En savoir plus sur le programme</a>")} components={{
                strong: <strong />,
                a: <NavLink to="/about/guide" />
              }} />
                            </li>
                        </ul>
                    </div>
                </section>

                <section className="legal-section">
                    <h2>{t("8. Droit Applicable")}</h2>
                    <div className="legal-card">
                        <p>
                            <RichText text={t("Les présentes mentions légales sont soumises au <strong>droit français</strong>.")} components={{
              strong: <strong />
            }} />
                        </p>
                        <p>
                            {t("En cas de litige, une solution amiable sera recherchée avant toute action judiciaire. À défaut, les tribunaux français seront seuls compétents.")}
                        </p>
                    </div>
                </section>

                <section className="legal-section">
                    <h2>{t("9. Crédits")}</h2>
                    <div className="legal-card">
                        <p>
                            <RichText text={t("<strong>Conception et développement :</strong> La Caverne du Réfractaire")} components={{
              strong: <strong />
            }} />
                        </p>
                        <p>
                            <RichText text={t("<strong>Technologies utilisées :</strong>")} components={{
              strong: <strong />
            }} />
                        </p>
                        <ul>
                            <li>{t("Frontend : React, Zustand, Vite")}</li>
                            <li>{t("Backend : Strapi v5, Node.js")}</li>
                            <li>{t("Base de données : PostgreSQL")}</li>
                            <li>{t("Hébergement : Render, Github")}</li>
                        </ul>
                    </div>
                </section>

                <section className="legal-section">
                    <h2>{t("10. Contact")}</h2>
                    <div className="legal-card legal-contact">
                        <p>
                            {t("Pour toute question concernant les mentions légales ou le fonctionnement du site, vous pouvez nous contacter :")}
                        </p>
                        <p>
                            <RichText text={t("<strong>Email :</strong> <a>contact@lacavernedurefractaire.fr</a>")} components={{
              strong: <strong />,
              a: <a href="mailto:contact@lacavernedurefractaire.fr" />
            }} />
                        </p>
                        <p>
                            <RichText text={t("<strong>Délai de réponse :</strong> Nous nous engageons à répondre sous 72 heures ouvrées.")} components={{
              strong: <strong />
            }} />
                        </p>
                    </div>
                </section>

                <div className="legal-footer">
                    <p className="legal-update">
                        {t("Dernière mise à jour : 4 décembre 2025")}
                    </p>
                    <NavLink to="/about" className="back-button">
                        ◀️ {t("Retour à la page À propos")}
                    </NavLink>
                </div>
            </div>
        </div>;
};
export default Legal;
