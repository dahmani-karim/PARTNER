import { create } from 'zustand';
import { partnerService } from '../services/partnerService';
import { videoService } from '../services/videoService';

const usePartnerStore = create((set, get) => ({
  // Partner data
  application: null,
  partner: null,
  videos: [],
  weeklyCount: null,
  configs: [],

  // Admin data
  stats: null,
  allApplications: [],
  allPartners: [],
  allVideos: [],

  // UI state
  loading: false,
  error: null,

  // === PARTNER ACTIONS ===

  loadMyData: async () => {
    set({ loading: true, error: null });
    try {
      const [application, partner] = await Promise.all([
        partnerService.getMyApplication(),
        partnerService.getMyPartner(),
      ]);
      set({ application, partner, loading: false });

      // Si partner actif, charger les vidéos et le compteur
      if (partner && ['active', 'warning'].includes(partner.status)) {
        get().loadMyVideos();
        get().loadWeeklyCount();
      }
    } catch (err) {
      set({ loading: false, error: err.message });
    }
  },

  loadMyVideos: async () => {
    try {
      const videos = await videoService.getMyVideos();
      set({ videos });
    } catch (err) {
      console.error('Erreur chargement vidéos:', err);
    }
  },

  loadWeeklyCount: async () => {
    try {
      const weeklyCount = await videoService.getWeeklyCount();
      set({ weeklyCount });
    } catch (err) {
      console.error('Erreur chargement compteur:', err);
    }
  },

  submitApplication: async (data) => {
    set({ loading: true, error: null });
    try {
      const application = await partnerService.apply(data);
      set({ application, loading: false });
      return application;
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Erreur lors de la candidature';
      set({ loading: false, error: msg });
      throw err;
    }
  },

  submitVideo: async (data) => {
    set({ loading: true, error: null });
    try {
      const video = await videoService.submit(data);
      set((state) => ({
        videos: [video, ...state.videos],
        loading: false,
      }));
      get().loadWeeklyCount();
      return video;
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Erreur lors de la soumission';
      set({ loading: false, error: msg });
      throw err;
    }
  },

  loadConfigs: async () => {
    try {
      const configs = await partnerService.getConfigs();
      set({ configs });
    } catch (err) {
      console.error('Erreur chargement configs:', err);
    }
  },

  // === ADMIN ACTIONS ===

  loadStats: async () => {
    try {
      const stats = await partnerService.getStats();
      set({ stats });
    } catch (err) {
      console.error('Erreur chargement stats:', err);
    }
  },

  loadAllApplications: async (filters) => {
    set({ loading: true });
    try {
      const allApplications = await partnerService.listApplications(filters);
      set({ allApplications, loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  reviewApplication: async (id, body) => {
    try {
      await partnerService.reviewApplication(id, body);
      get().loadAllApplications();
      get().loadStats();
    } catch (err) {
      console.error('Erreur review:', err);
      throw err;
    }
  },

  loadAllPartners: async (filters) => {
    set({ loading: true });
    try {
      const allPartners = await partnerService.listPartners(filters);
      set({ allPartners, loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  updatePartnerStatus: async (id, body) => {
    try {
      await partnerService.updatePartnerStatus(id, body);
      get().loadAllPartners();
      get().loadStats();
    } catch (err) {
      console.error('Erreur update status:', err);
      throw err;
    }
  },

  loadAllVideos: async (filters) => {
    set({ loading: true });
    try {
      const allVideos = await videoService.listAll(filters);
      set({ allVideos, loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  validateVideo: async (id, body) => {
    try {
      await videoService.validate(id, body);
      get().loadAllVideos();
      get().loadStats();
    } catch (err) {
      console.error('Erreur validation:', err);
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));

export default usePartnerStore;
