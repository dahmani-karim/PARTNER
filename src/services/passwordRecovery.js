import api from './api';

export async function forgotPassword(email) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    const response = await fetch(`${api.defaults.baseURL.replace(/\/$/, '')}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
      signal: controller.signal,
    });
    if (response.status === 429) throw new Error('Trop de tentatives. Patientez avant de réessayer.');
    if (!response.ok) throw new Error("Impossible d'envoyer le lien. Réessayez ou contactez l'administrateur.");
    const data = await response.json();
    if (data?.ok !== true) throw new Error('Réponse inattendue du serveur. Réessayez plus tard.');
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Le serveur met trop de temps à répondre. Réessayez.');
    if (error instanceof TypeError) throw new Error('Connexion au serveur impossible. Vérifiez votre connexion.');
    if (error instanceof SyntaxError) throw new Error('Réponse inattendue du serveur. Réessayez plus tard.');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
