import api from '../config/api';

export const sellerService = {
  getAll: async () => {
    const response = await api.get('/sellers');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/sellers/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/sellers', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/sellers/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/sellers/${id}`);
  },

  getContact: async (sellerId) => {
    const response = await api.get(`/seller-contact/${sellerId}`);
    return response.data;
  },

  getBankInfo: async (sellerId) => {
    const response = await api.get(`/seller-info/${sellerId}`);
    return response.data;
  },

  uploadAvatar: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/sellers/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateAvatar: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.put(`/sellers/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteAvatar: async (id) => {
    await api.delete(`/sellers/${id}/avatar`);
  },
};
