import api from '../config/api';

export const authService = {
  register: async (data) => {
    try {
      const response = await api.post('/auth/register', data);
      const { token, user, expiresAt } = response.data || {};

      if (token) {
        localStorage.setItem('token', token);
      }

      return { token, user, expiresAt, raw: response.data };
    } catch (error) {
      console.error('[AuthService] Register error:', error.response?.status, error.response?.data);
      throw error;
    }
  },

  login: async (data) => {
    try {
      const response = await api.post('/auth/login', data);
      const { token, user, expiresAt } = response.data || {};

      if (token) {
        localStorage.setItem('token', token);
      }

      return { token, user, expiresAt, raw: response.data };
    } catch (error) {
      console.error('[AuthService] Login error:', error.response?.status, error.response?.data);
      throw error;
    }
  },

  refresh: async () => {
    try {
      const response = await api.post('/auth/refresh');
      const { token } = response.data || {};

      if (token) {
        localStorage.setItem('token', token);
      }

      return response.data;
    } catch (error) {
      console.error('[AuthService] Refresh error:', error.response?.status, error.response?.data);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getToken: () => localStorage.getItem('token'),
  isAuthenticated: () => !!localStorage.getItem('token'),
};
