import api from '../config/api';

export const reviewService = {
  getAll: async (page = 0, size = 25) => {
    const response = await api.get(`/reviews?page=${page}&size=${size}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/reviews/${id}`);
    return response.data;
  },

  getByProduct: async (productId) => {
    const response = await api.get(`/reviews/product/${productId}`);
    return response.data;
  },

  create: async (reviewData, images = []) => {
    const formData = new FormData();
    formData.append('review', new Blob([JSON.stringify(reviewData)], { type: 'application/json' }));
    images.forEach((file) => formData.append('images', file));
    const response = await api.post('/reviews', formData, {
      headers: { 'Content-Type': undefined },
    });
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/reviews/${id}`);
  },
};