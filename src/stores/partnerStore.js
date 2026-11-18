import { create } from 'zustand';
import { partnerService } from '../services/partnerService';
import { videoService } from '../services/videoService';

const emptyData = () => ({
  application: null, partner: null, videos: [], weeklyCount: null, configs: [],
  stats: null, allApplications: [], allPartners: [], allVideos: [],
  errors: {}, pending: 0, loading: false, ready: false, error: null,
});
const usePartnerStore = create((set, get) => {
  let generation = 0;
  const requests = new Map();
  const run = async (key, request, apply, propagate = false) => {
    const owner = generation;
    const requestId = (requests.get(key) || 0) + 1;
    requests.set(key, requestId);
    set(state => ({ pending: state.pending + 1, loading: true, error: null,
      errors: { ...state.errors, [key]: null } }));
    try {
      const result = await request();
      if (generation !== owner) throw new Error('La session a changé. Rechargez la page.');
      if (apply && requests.get(key) === requestId) set(apply(result));
      return result;
    } catch (error) {
      console.error(`PARTNER ${key} failed`, error);
      if (generation === owner && requests.get(key) === requestId) {
        const message = error.response?.data?.error?.message || error.message;
        set(state => ({ error: message, errors: { ...state.errors, [key]: message } }));
      }
      if (propagate) throw error;
    } finally {
      if (generation === owner) set(state => ({ pending: state.pending - 1, loading: state.pending > 1 }));
    }
  };
  const list = (key, request) => run(key, async () => {
    const data = await request();
    if (!Array.isArray(data)) throw new Error('Réponse de liste invalide.');
    return data;
  }, data => ({ [key]: data }));
  return {
    ...emptyData(),
    reset: () => { generation++; set(emptyData()); },
    loadMyData: async () => {
      const result = await run('myData', async () => {
        const [application, partner] = await Promise.all([partnerService.getMyApplication(), partnerService.getMyPartner()]);
        return { application, partner };
      }, data => ({ ...data, ready: true }));
      if (result?.partner && ['active', 'warning'].includes(result.partner.status)) {
        await Promise.all([get().loadMyVideos(), get().loadWeeklyCount()]);
      }
    },
    loadMyVideos: () => list('videos', () => videoService.getMyVideos()),
    loadWeeklyCount: () => run('weeklyCount', () => videoService.getWeeklyCount(), weeklyCount => ({ weeklyCount })),
    loadConfigs: () => list('configs', () => partnerService.getConfigs()),
    submitApplication: data => run('application', () => partnerService.apply(data), application => ({ application }), true),
    submitVideo: async data => {
      const video = await run('submitVideo', () => videoService.submit(data),
        video => ({ videos: [video, ...get().videos] }), true);
      await get().loadWeeklyCount();
      return video;
    },
    loadStats: () => run('stats', () => partnerService.getStats(), stats => ({ stats })),
    loadAllApplications: filters => list('allApplications', () => partnerService.listApplications(filters)),
    loadAllPartners: filters => list('allPartners', () => partnerService.listPartners(filters)),
    loadAllVideos: filters => list('allVideos', () => videoService.listAll(filters)),
    reviewApplication: (id, body) => run('review', () => partnerService.reviewApplication(id, body), null, true),
    updatePartnerStatus: (id, body) => run('partnerStatus', () => partnerService.updatePartnerStatus(id, body), null, true),
    validateVideo: (id, body) => run('validation', () => videoService.validate(id, body), null, true),
    clearError: () => set({ error: null }),
  };
});

export default usePartnerStore;
