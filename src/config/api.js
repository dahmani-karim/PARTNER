const getApiUrl = () => {
  const hostname = window.location.hostname;

  // Custom domain → API custom domain
  if (hostname === 'partner.lacavernedurefractaire.fr') {
    return 'https://smartcellarapi.lacavernedurefractaire.fr';
  }

  // GitHub Pages fallback
  if (hostname === 'dahmani-karim.github.io') {
    return 'https://smart-cellar-api.onrender.com';
  }

  // Dev / fallback
  return import.meta.env.VITE_API_URL || 'http://localhost:1337';
};

export const API_URL = getApiUrl();
