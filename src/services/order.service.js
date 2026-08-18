import api from '../config/api';
import { parsePageResponse } from '../helpers/api.helpers';

export const orderService = {
  getAll: async (page = 0, size = 25) => {
    const response = await api.get(`/orders?page=${page}&size=${size}`);
    return parsePageResponse(response.data);
  },

  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/orders', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/orders/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/orders/${id}`);
  },
};
