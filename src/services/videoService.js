import api from './api';

export const videoService = {
  async submit(data) {
    const { data: result } = await api.post('/api/video-submissions/submit', data);
    return result;
  },

  async getMyVideos() {
    const { data } = await api.get('/api/video-submissions/mine');
    return data;
  },

  async getWeeklyCount() {
    const { data } = await api.get('/api/video-submissions/weekly-count');
    return data; // { count, required, onTrack }
  },

  // === ADMIN ===
  async listAll(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const { data } = await api.get(`/api/video-submissions/all?${params}`);
    return data;
  },

  async validate(id, body) {
    const { data } = await api.put(`/api/video-submissions/${id}/validate`, body);
    return data;
  },
};
