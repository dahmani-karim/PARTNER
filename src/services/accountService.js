import { translate } from './localization.js';
import { API_URL } from '../config/api';
const BASE_URL = `${API_URL}/api`;

export function validatePassword(currentPassword, password, confirmation) {
  if (!currentPassword) return translate("Indiquez votre mot de passe actuel.");
  if (password.length < 6) return translate("Le nouveau mot de passe doit contenir au moins 6 caractères.");
  if (new TextEncoder().encode(password).length > 72) return translate("Le nouveau mot de passe dépasse la limite de 72 octets.");
  if (password !== confirmation) return translate("Les mots de passe ne correspondent pas.");
  if (password === currentPassword) return translate("Le nouveau mot de passe doit être différent de l’actuel.");
  return '';
}

async function request(path, method, body, token) {
  if (!token) throw new Error(translate("Votre session a expiré. Reconnectez-vous."));
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    });
  } catch {
    throw new Error(translate("Connexion impossible. Vérifiez votre connexion puis réessayez."));
  }
  let data;
  try {data = await response.json();}
  catch {throw new Error(translate("Réponse serveur illisible. Réessayez ou contactez le support."));}
  if (!response.ok) {
    if (data?.error?.message === 'The provided current password is invalid') throw new Error(translate("Le mot de passe actuel est incorrect."));
    if (response.status === 429) throw new Error(translate("Trop de tentatives. Patientez avant de réessayer."));
    if (response.status === 401) throw new Error(translate("Votre session a expiré. Reconnectez-vous."));
    if (response.status === 403) throw new Error(translate("Cette opération n’est pas autorisée. Contactez le support."));
    throw new Error(data?.error?.message || `L’opération a échoué (HTTP ${response.status}).`);
  }
  return data;
}

export async function changePassword(currentPassword, password, passwordConfirmation, token) {
  const error = validatePassword(currentPassword, password, passwordConfirmation);
  if (error) throw new Error(error);
  const data = await request('/auth/change-password', 'POST', { currentPassword, password, passwordConfirmation }, token);
  if (typeof data?.jwt !== 'string' || !data.jwt || !data.user?.id) throw new Error(translate("La nouvelle session n’a pas pu être confirmée. Reconnectez-vous."));
  return data;
}

// Same existing operation as SmartCellar: block login, not erase shared data.
export async function deactivateAccount(userId, token) {
  if (!Number.isInteger(userId) || userId < 1) throw new Error(translate("Compte utilisateur invalide."));
  const data = await request(`/users/${userId}`, 'PUT', { blocked: true }, token);
  if (data?.id !== userId || data.blocked !== true) throw new Error(translate("La désactivation n’a pas été confirmée par le serveur."));
  return data;
}
