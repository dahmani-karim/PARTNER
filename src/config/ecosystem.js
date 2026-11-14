// ─────────────────────────────────────────────────────────────────────────────
// Écosystème La Caverne du Réfractaire — source de vérité de l'app-switcher.
//
// Ce fichier est IDENTIQUE dans tous les dépôts de l'écosystème, à une seule
// ligne près : CURRENT_APP ci-dessous. Toute autre divergence est un bug.
//
// L'ordre de APPS est figé : il alimente une grille 3×3 et doit rester le même
// partout, pour qu'un utilisateur qui change d'application retrouve le même
// bouton au même endroit.
//
//   ligne 1 : LYNX        · PRÊT·E      · HerboGenius
//   ligne 2 : SmartCellar · ProGarden   · Farmly
//   ligne 3 : Primal      · MentalGate  · Partner
// ─────────────────────────────────────────────────────────────────────────────

const CURRENT_APP = 'partner';

const APPS = [
  {
    id: 'lynx',
    name: 'LYNX',
    emoji: '🐆',
    description: 'Anticipation & alertes temps réel',
    url: 'https://lynx.lacavernedurefractaire.fr',
    devUrl: 'http://localhost:5176',
    color: '#3B82F6',
  },
  {
    id: 'prete',
    name: 'PRÊT·E',
    emoji: '🎒',
    description: 'Scénarios de préparation',
    url: 'https://pret.lacavernedurefractaire.fr',
    color: '#C96A5A',
  },
  {
    id: 'herbogenius',
    name: 'HerboGenius',
    emoji: '🌿',
    description: 'Plantes, huiles & remèdes naturels',
    url: 'https://www.herbogenius.fr',
    color: '#16A34A',
  },
  {
    id: 'smartcellar',
    name: 'SmartCellar',
    emoji: '🏪',
    description: 'Gestion intelligente de vos stocks',
    url: 'https://smartcellar.lacavernedurefractaire.fr',
    color: '#F59E0B',
  },
  {
    id: 'progarden',
    name: 'ProGarden',
    emoji: '🌱',
    description: 'Potager & autoproduction',
    url: 'https://progarden.lacavernedurefractaire.fr',
    color: '#22C55E',
  },
  {
    id: 'farmly',
    name: 'Farmly',
    emoji: '🐔',
    description: 'Élevage & autosuffisance animale',
    url: 'https://farmly.lacavernedurefractaire.fr',
    color: '#92400E',
  },
  {
    id: 'primal',
    name: 'Primal',
    emoji: '🏋️',
    description: 'Préparation physique & fonctionnelle',
    url: 'https://primal.lacavernedurefractaire.fr',
    color: '#DC2626',
  },
  {
    id: 'mentalgate',
    name: 'MentalGate',
    emoji: '🧠',
    description: 'Santé mentale & bilan psychologique',
    url: 'https://mentalgate.peaceandpause.fr',
    color: '#7C3AED',
  },
  {
    id: 'partner',
    name: 'Partner',
    emoji: '🤝',
    description: 'Réseau partenaires & collaborateurs',
    url: 'https://partner.lacavernedurefractaire.fr',
    color: '#6B7280',
  },
];

// Une application sans URL n'est pas cliquable, quoi qu'il arrive : c'est la
// seule source de `disabled`. Marquer une app à la main a produit des liens
// morts vers Farmly et Primal, restés en place des mois après leur mise en
// ligne — la règle est désormais déduite, plus déclarée.
export const ECOSYSTEM_APPS = APPS.map((app) => ({
  ...app,
  current: app.id === CURRENT_APP,
  disabled: !app.url,
}));

// Hors grille : pied de panneau. Le site vitrine, puis les réseaux.
export const HOME_LINK = {
  label: 'La Caverne du Réfractaire',
  description: 'Le Site Officiel',
  emoji: '🕯️',
  url: 'https://lacavernedurefractaire.fr',
};

export const SOCIAL_LINKS = [
  { id: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@lacavernedurefractaire' },
  { id: 'tiktok', label: 'TikTok', url: 'https://tiktok.com/@lacavernedurefractaire' },
  { id: 'discord', label: 'Discord', url: 'https://lacavernedurefractaire.fr/en-eur/pages/discord' },
];

export function getAppUrl(app) {
  if (!app.url) return undefined;
  return import.meta.env.DEV && app.devUrl ? app.devUrl : app.url;
}
