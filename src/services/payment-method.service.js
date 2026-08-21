import api from '../config/api';

export const paymentMethodService = {
  getAll: async () => {
    const response = await api.get('/payment-methods');
    return response.data;
  },

  save: async (data) => {
    const response = await api.post('/payment-methods', data);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/payment-methods/${id}`);
  },

  setDefault: async (id) => {
    const response = await api.put(`/payment-methods/${id}/default`);
    return response.data;
  },
};