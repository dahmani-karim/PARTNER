import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import api from '../services/api';
import { API_URL } from '../config/api';
import { fetchEntitlements } from '../services/entitlements';
import usePartnerStore from './partnerStore';

const EMPTY_SESSION = {
  user: null, token: null, isAuthenticated: false, loading: false, error: null,
  profile: null, avatarUrl: null, profileError: '', sessionError: '',
  entitlements: null, accessError: '',
};
async function authenticate(method, args) {
  useAuthStore.setState({ loading: true, error: null });
  try {
    const session = await authService[method](...args);
    useAuthStore.getState().renewSession(session);
    return session.user;
  } catch (error) {
    useAuthStore.setState({ loading: false, error: error.response?.data?.error?.message || error.message });
    throw error;
  }
}

export const useAuthStore = create(persist((set, get) => ({
  ...EMPTY_SESSION,
  login: (...args) => authenticate('login', args),
  register: (...args) => authenticate('register', args),
  renewSession: ({ jwt, user }) => {
    if (typeof jwt !== 'string' || !jwt || !user?.id) throw new Error('Session invalide.');
    if (get().token !== jwt || get().user?.id !== user.id) usePartnerStore.getState().reset();
    localStorage.setItem('partner-token', jwt);
    set({ ...EMPTY_SESSION, token: jwt, user, isAuthenticated: true });
  },
  refreshUser: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const user = await authService.getMe();
      if (get().token !== token) return;
      if (!user?.id || user.id !== get().user?.id) throw new Error('Session utilisateur invalide.');
      set({ user, sessionError: '' });
      await Promise.all([get().refreshProfile(), get().syncEntitlements()]);
      return user;
    } catch (error) {
      console.error('Unable to refresh PARTNER session', error);
      if (get().token === token) set({ sessionError: error.message });
    }
  },
  refreshSession: () => get().refreshUser(),
  refreshProfile: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const { data: profile } = await api.get('/api/user-profiles/me');
      if (!profile || typeof profile !== 'object' || Array.isArray(profile)) throw new Error('Réponse profil invalide.');
      if (get().token !== token) return;
      const url = profile.avatar?.url;
      set({ profile, avatarUrl: url ? new URL(url, API_URL || window.location.origin).href : null, profileError: '' });
      return profile;
    } catch (error) {
      console.error('Unable to refresh PARTNER profile', error);
      if (get().token === token) set({ profileError: error.message });
      throw error;
    }
  },
  syncEntitlements: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const entitlements = await fetchEntitlements(token);
      if (get().token === token) set({ entitlements, accessError: '' });
      return entitlements;
    } catch (error) {
      console.error('Unable to refresh PARTNER entitlements', error);
      if (get().token === token) set({ accessError: 'Impossible d’actualiser vos accès. Réessayez depuis votre profil.' });
      throw error;
    }
  },
  logout: () => {
    localStorage.removeItem('partner-token');
    usePartnerStore.getState().reset();
    set(EMPTY_SESSION);
  },
  clearError: () => set({ error: null }),
}), {
  name: 'partner-auth',
  partialize: ({ user, token }) => ({ user, token }),
  merge: (persisted, current) => {
    const token = persisted?.token || null;
    const user = persisted?.user || null;
    if (token && user?.id) localStorage.setItem('partner-token', token);
    else localStorage.removeItem('partner-token');
    return { ...current, user, token, isAuthenticated: Boolean(token && user?.id) };
  },
}));

export default useAuthStore;
