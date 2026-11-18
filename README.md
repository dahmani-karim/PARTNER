# PARTNER — Programme Ambassadeur

## Mot de passe oublie

Le lien de connexion ouvre `/forgot-password`. La demande utilise le backend
configure pour l'application, sans envoyer de JWT ni modifier la session.
Strapi envoie le modele d'e-mail commun et le lien vers
`https://smartcellar.lacavernedurefractaire.fr/#/reset-password`.
Le mot de passe est commun aux applications, pas au compte du site officiel.

Plateforme de gestion du programme ambassadeur de [La Caverne du Réfractaire](https://lacavernedurefractaire.fr).

Les partners sélectionnés créent du contenu vidéo promouvant les applications de l'écosystème en échange d'un accès premium gratuit.

PARTNER reste un programme gratuit, sans page tarifs ni souscription.
Les acces offerts sont confirmes par le backend commun, et non deduits
du seul dossier affiche dans le navigateur.

## Socle commun

- Accueil sans header public : selecteur FR/EN et CTA « Devenir Partner »,
  remplace par « Acceder au dashboard » pour un compte reconnu.
- Menu avatar : profil commun editable, partenariat, parametres et administration
  pour le compte administrateur. Aucun point d'entree de parrainage.
- Navigation connectee en sidebar, avec le selecteur de langue en bas.
  Sur mobile, le bouton menu ouvre le volet ; Echap ou le fond le referment.
- Profil : informations communes, avatar et consultation des droits de
  l'ecosysteme. Les notifications et informations ambassadeur restent dans
  « Mon partenariat ».
- Parametres : langue, installation PWA et securite. Le changement de mot de
  passe renouvelle la session ; la desactivation bloque le compte commun sans
  effacement automatique ni resiliation d'abonnements externes.
- Administration : filtres Freemium/Premium/VIP/Partner, compteurs, lignes
  cliquables, statistiques des trois applications, foyers, sept Premium
  individuels et cinq VIP, gestion Partner et quotas partages.
- Les acces VIP/Premium du compte administrateur restent modifiables ; ses
  actions de compte et son statut Partner sont proteges.
- Les candidatures, validations video et statuts ambassadeur sont conserves.
  Les erreurs sont visibles et les donnees d'une ancienne session sont ignorees.
- Guide, mentions legales, conditions du programme et confidentialite adaptes
  au programme gratuit. Pas de CGV ni d'offre commerciale propre a PARTNER.
- Theme clair et or conserve ; composants d'administration alignes sur
  SmartCellar sans reprendre son fond de page.

## Applications éligibles

| App | URL |
|---|---|
| SmartCellar | smartcellar.lacavernedurefractaire.fr |
| LYNX | lynx.lacavernedurefractaire.fr |
| ProGarden | progarden.lacavernedurefractaire.fr |
| Farmly | farmly.lacavernedurefractaire.fr |
| PRETE | prete.lacavernedurefractaire.fr |
| HerboGenius | www.herbogenius.fr |
| PRIMAL | primal.lacavernedurefractaire.fr |

## Stack technique

- **Frontend** : React 19 + Vite + SCSS Modules
- **State** : Zustand (persist)
- **Routing** : HashRouter (GitHub Pages SPA)
- **Backend** : Strapi 5.20 (partagé avec SmartCellar)
- **Déploiement** : GitHub Pages → `partner.lacavernedurefractaire.fr`
- **Icons** : lucide-react
- **PWA** : vite-plugin-pwa

## Installation

```bash
cd PARTNER
npm ci
```

## Développement

```bash
npm run dev
```

## Build & Déploiement

```bash
npm run build
npm run deploy   # gh-pages → GitHub Pages
```

## Variables d'environnement

Copier `.env.example` → `.env` :

```
VITE_API_URL=https://smart-cellar-api.onrender.com
```

Utiliser Node.js 22.12 ou superieur. `VITE_API_URL` est l'origine du backend,
sans `/api`. En local, Vite relaie `/api` et `/uploads` vers cette origine.
En production, cette variable ou la valeur Render par defaut est utilisee.
Les variables `VITE_*` sont publiques : ne pas y placer de secret.

## Structure

```
src/
├── components/          # Composants réutilisables
│   ├── Layout/          # Layout principal (Navbar + Outlet)
│   ├── Navbar/          # Barre de navigation
│   └── StatusBadge/     # Badge de statut coloré
├── config/
│   ├── api.js           # Configuration URL backend
│   └── apps.js          # Apps, plateformes, enums
├── pages/
│   ├── Admin/           # Dashboard admin, validation vidéos, gestion partners
│   ├── Apply/           # Formulaire candidature
│   ├── Auth/            # Login / Register
│   ├── Dashboard/       # Dashboard partner
│   ├── Landing/         # Page d'accueil publique
│   ├── NotFound/        # 404
│   ├── Profile/         # Profil utilisateur
│   └── Videos/          # Soumission + historique vidéos
├── services/            # Appels API (axios)
├── stores/              # Zustand stores
├── styles/              # Variables SCSS + global
├── App.jsx              # Routes
└── main.jsx             # Point d'entrée
```

## Configuration Strapi

Voir [STRAPI_PERMISSIONS.md](./STRAPI_PERMISSIONS.md) pour la configuration des permissions et des collections.

## Parcours utilisateur

1. **Connexion** avec le compte commun existant des applications
2. **Candidature** : choisir une app, indiquer son réseau social, rédiger sa motivation
3. **Validation admin** : l'admin approuve ou refuse la candidature
4. **Création de contenu** selon l'objectif defini pour l'application representee
5. **Soumission** : le partner soumet les liens de ses vidéos
6. **Validation** : l'admin valide chaque vidéo
7. **Accès offerts** : selon le statut et les droits confirmes par le backend

## Validation et sessions

`npm run build`, puis `npm test` executent les regressions du socle commun,
du programme ambassadeur et de la PWA. Les tests de manifeste lisent `dist`.
Les appels des tests sont simules : aucun compte de production n'est modifie.

Le cache metier est vide a la deconnexion et lors d'un changement de session.
Une erreur reseau ne deconnecte pas silencieusement le compte. Un rejet 401 de
la session courante invalide le store et les donnees associees, contrairement
aux reponses tardives d'un ancien JWT.
Le service worker ne met plus en cache les reponses API authentifiees ; son
activation supprime l'ancien cache `api-cache`. L'installation ne dispense pas
d'une connexion pour les operations du programme.

## Thème

Light theme avec accent **Gold (#D4AF37)** — design premium/ambassadeur.
