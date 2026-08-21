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

  create: async (productData, images = []) => {
    const formData = new FormData();
    formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));
    images.forEach((file) => formData.append('images', file));
    const response = await api.post('/products', formData, {
      headers: { 'Content-Type': undefined },
    });
    return response.data;
  },

  update: async (id, productData, images = []) => {
    const formData = new FormData();
    formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));
    images.forEach((file) => formData.append('images', file));
    const response = await api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': undefined },
    });
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/products/${id}`);
  },

  getImageUrl: (objectKey) => {
    return `${api.defaults.baseURL}/products/images?key=${encodeURIComponent(objectKey)}`;
  },
};