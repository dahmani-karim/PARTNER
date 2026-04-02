import api from './api';

export const authService = {
  async login(identifier, password) {
    const { data } = await api.post('/api/auth/local', { identifier, password });
    return data; // { jwt, user }
  },

  async register(username, email, password) {
    const { data } = await api.post('/api/auth/local/register', {
      username,
      email,
      password,
    });
    return data; // { jwt, user }
  },

  async getMe() {
    const { data } = await api.get('/api/users/me');
    return data;
  },
};
