import api from '../config/api';
import { parsePageResponse } from '../helpers/api.helpers';

export const productService = {
  getAll: async (page = 0, size = 25) => {
    const response = await api.get(`/products?page=${page}&size=${size}`);
    return parsePageResponse(response.data);
  },

  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  create: async (sellerId, data) => {
    const response = await api.post(`/sellers/${sellerId}/products`, data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/products/${id}`);
  },
};
