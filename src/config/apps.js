export const APPS = {
  smartcellar: {
    id: 'smartcellar',
    name: 'SmartCellar',
    description: 'Gestion intelligente de votre garde-manger et recettes',
    url: 'https://smartcellar.lacavernedurefractaire.fr',
    color: '#4A9D5B',
    icon: '🍽️',
  },
  lynx: {
    id: 'lynx',
    name: 'LYNX',
    description: 'Tracker de prix et alertes shopping intelligent',
    url: 'https://lynx.lacavernedurefractaire.fr',
    color: '#6366F1',
    icon: '🔍',
  },
  progarden: {
    id: 'progarden',
    name: 'ProGarden',
    description: 'Assistant potager et planification de jardinage',
    url: 'https://progarden.lacavernedurefractaire.fr',
    color: '#22C55E',
    icon: '🌱',
  },
  farmly: {
    id: 'farmly',
    name: 'Farmly',
    description: 'Trouvez les producteurs locaux autour de vous',
    url: 'https://farmly.lacavernedurefractaire.fr',
    color: '#F59E0B',
    icon: '🌾',
  },
  prete: {
    id: 'prete',
    name: 'PRÊT·E',
    description: 'Préparation et résilience au quotidien',
    url: 'https://prete.lacavernedurefractaire.fr',
    color: '#6B8E7A',
    icon: '🧠',
  },
};

export const PLATFORMS = {
  tiktok: { id: 'tiktok', name: 'TikTok', icon: '🎵', urlPattern: 'tiktok.com' },
  youtube: { id: 'youtube', name: 'YouTube', icon: '▶️', urlPattern: 'youtube.com|youtu.be' },
  instagram: { id: 'instagram', name: 'Instagram', icon: '📸', urlPattern: 'instagram.com' },
  twitter: { id: 'twitter', name: 'X (Twitter)', icon: '𝕏', urlPattern: 'twitter.com|x.com' },
  other: { id: 'other', name: 'Autre', icon: '🔗', urlPattern: '' },
};

export const PARTNER_STATUS = {
  active: { label: 'Actif', color: '#22C55E', icon: '✅' },
  warning: { label: 'Avertissement', color: '#F59E0B', icon: '⚠️' },
  suspended: { label: 'Suspendu', color: '#EF4444', icon: '⏸️' },
  revoked: { label: 'Révoqué', color: '#6B7280', icon: '❌' },
};

export const APPLICATION_STATUS = {
  pending: { label: 'En attente', color: '#F59E0B', icon: '⏳' },
  approved: { label: 'Approuvée', color: '#22C55E', icon: '✅' },
  rejected: { label: 'Refusée', color: '#EF4444', icon: '❌' },
};

export const VIDEO_STATUS = {
  pending: { label: 'En attente', color: '#F59E0B', icon: '⏳' },
  approved: { label: 'Validée', color: '#22C55E', icon: '✅' },
  rejected: { label: 'Refusée', color: '#EF4444', icon: '❌' },
};
