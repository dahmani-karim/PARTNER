import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (identifier, password) => {
        set({ loading: true, error: null });
        try {
          const { jwt, user } = await authService.login(identifier, password);
          localStorage.setItem('partner-token', jwt);
          set({ user, token: jwt, isAuthenticated: true, loading: false });
          return user;
        } catch (err) {
          const message = err.response?.data?.error?.message || 'Erreur de connexion';
          set({ loading: false, error: message });
          throw err;
        }
      },

      register: async (username, email, password) => {
        set({ loading: true, error: null });
        try {
          const { jwt, user } = await authService.register(username, email, password);
          localStorage.setItem('partner-token', jwt);
          set({ user, token: jwt, isAuthenticated: true, loading: false });
          return user;
        } catch (err) {
          const message = err.response?.data?.error?.message || "Erreur d'inscription";
          set({ loading: false, error: message });
          throw err;
        }
      },

      refreshUser: async () => {
        try {
          const user = await authService.getMe();
          set({ user });
          return user;
        } catch {
          get().logout();
        }
      },

      logout: () => {
        localStorage.removeItem('partner-token');
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },

      clearError: () => set({ error: null }),

      get isAdmin() {
        return get().user?.partnerAdmin === true;
      },
    }),
    {
      name: 'partner-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrate: (state) => {
        // Restaurer le token dans localStorage au démarrage
        if (state?.token) {
          localStorage.setItem('partner-token', state.token);
        }
      },
    }
  )
);

export default useAuthStore;
