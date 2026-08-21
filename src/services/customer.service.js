import api from '../config/api';

export const customerService = {
  getAll: async () => {
    const response = await api.get('/customers');
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
};
