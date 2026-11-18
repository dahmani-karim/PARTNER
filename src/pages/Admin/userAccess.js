export const VIP_APPS = [
  ['smartcellar', 'SmartCellar', 'vipSmartcellar'],
  ['progarden', 'ProGarden', 'vipProgarden'],
  ['farmly', 'Farmly', 'vipFarmly'],
  ['lynx', 'LYNX', 'vipLynx'],
  ['primal', 'PRIMAL', 'vipPrimal'],
];

export const ACCESS_LABELS = { all: 'Tous les utilisateurs', freemium: 'Freemium', premium: 'Premium', vip: 'VIP', partner: 'Partner' };

export function accessLevel(user) {
  if (user.isPartner) return 'partner';
  if (user.isVIP || VIP_APPS.some(([, , field]) => user[field])) return 'vip';
  if (user.isPremium || Object.entries(user).some(([key, value]) => /^premium[A-Z]/.test(key) && value === true)) return 'premium';
  return 'freemium';
}

export function filterUsers(users, { search = '', activity = 'all', access = 'all' } = {}) {
  const query = search.trim().toLocaleLowerCase();
  return users.filter(user =>
    `${user.username || ''} ${user.email || ''}`.toLocaleLowerCase().includes(query) &&
    (activity === 'all' || (activity === 'blocked' ? user.blocked : !user.blocked)) &&
    (access === 'all' || accessLevel(user) === access));
}

export function householdIcon(icon) {
  if (typeof icon !== 'string' || !icon) return '🏠';
  const key = icon.replace(/^:|:$/g, '');
  return { house: '🏠', home: '🏠', car: '🚗', truck: '🚚', backpack: '🎒', briefcase: '👜',
    boat: '⛵', dog: '🐕', cat: '🐈', family: '👨‍👩‍👧‍👦', apartment: '🏢', tent: '⛺',
    castle: '🏰', office: '🏢', garden: '🌱' }[key] || icon;
}

export function errorMessage(error) {
  return error.response?.data?.error?.message || error.message;
}
