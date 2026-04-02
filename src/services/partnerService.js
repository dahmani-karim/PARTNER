import api from './api';

export const partnerService = {
  // === CANDIDATURE ===
  async apply(data) {
    const { data: result } = await api.post('/api/partner-applications/apply', data);
    return result;
  },

  async getMyApplication() {
    const { data } = await api.get('/api/partner-applications/me');
    return data;
  },

  // === PARTNER ===
  async getMyPartner() {
    const { data } = await api.get('/api/partners/me');
    return data;
  },

  // === CONFIG ===
  async getConfigs() {
    const { data } = await api.get('/api/partner-configs');
    return data?.data || data || [];
  },

  // === ADMIN ===
  async getStats() {
    const { data } = await api.get('/api/partners/stats');
    return data;
  },

  async listApplications(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const { data } = await api.get(`/api/partner-applications/all?${params}`);
    return data;
  },

  async reviewApplication(id, body) {
    const { data } = await api.put(`/api/partner-applications/${id}/review`, body);
    return data;
  },

  async listPartners(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const { data } = await api.get(`/api/partners/all?${params}`);
    return data;
  },

  async updatePartnerStatus(id, body) {
    const { data } = await api.put(`/api/partners/${id}/status`, body);
    return data;
  },
};
