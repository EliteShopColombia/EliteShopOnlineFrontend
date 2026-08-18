import api from '../config/api';

export const reviewService = {
  getByProduct: async (productId) => {
    const response = await api.get(`/products/${productId}/reviews`);
    return response.data;
  },

  create: async (productId, data) => {
    const response = await api.post(`/products/${productId}/reviews`, data);
    return response.data;
  },

  delete: async (reviewId) => {
    await api.delete(`/reviews/${reviewId}`);
  },
};
