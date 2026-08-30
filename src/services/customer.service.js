import api from '../config/api';

export const customerService = {
  getAll: async (page = 0, size = 10) => {
    const response = await api.get('/customers', { params: { page, size } });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/customers', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/customers/${id}`);
  },

  uploadAvatar: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/customers/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateAvatar: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.put(`/customers/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteAvatar: async (id) => {
    await api.delete(`/customers/${id}/avatar`);
  },
};
