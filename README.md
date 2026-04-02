# PARTNER — Programme Ambassadeur

Plateforme de gestion du programme ambassadeur de [La Caverne du Réfractaire](https://lacavernedurefractaire.fr).

Les partners sélectionnés créent du contenu vidéo promouvant les applications de l'écosystème en échange d'un accès premium gratuit.

## Applications éligibles

| App | URL |
|---|---|
| SmartCellar | smartcellar.lacavernedurefractaire.fr |
| LYNX | lynx.lacavernedurefractaire.fr |
| ProGarden | progarden.lacavernedurefractaire.fr |
| Farmly | farmly.lacavernedurefractaire.fr |
| PRETE | prete.lacavernedurefractaire.fr |

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
npm install
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
VITE_API_URL=http://localhost:1337
```

En production, le domaine API est détecté automatiquement via `src/config/api.js`.

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

1. **Inscription** sur la plateforme
2. **Candidature** : choisir une app, indiquer son réseau social, rédiger sa motivation
3. **Validation admin** : l'admin approuve ou refuse la candidature
4. **Création de contenu** : minimum 2 vidéos/semaine promouvant l'app choisie
5. **Soumission** : le partner soumet les liens de ses vidéos
6. **Validation** : l'admin valide chaque vidéo
7. **Accès premium** : activé automatiquement à l'approbation de la candidature

## Thème

Light theme avec accent **Gold (#D4AF37)** — design premium/ambassadeur.
