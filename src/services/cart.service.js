import api from '../config/api';

export const cartService = {
  getCart: async (customerId) => {
    const response = await api.get(`/cart/${customerId}`);
    return response.data;
  },

  addItem: async (customerId, data) => {
    const response = await api.post(`/cart/${customerId}/items`, data);
    return response.data;
  },

  updateItem: async (customerId, itemId, data) => {
    const response = await api.put(`/cart/${customerId}/items/${itemId}`, data);
    return response.data;
  },

  removeItem: async (customerId, itemId) => {
    await api.delete(`/cart/${customerId}/items/${itemId}`);
  },

  clearCart: async (customerId) => {
    await api.delete(`/cart/${customerId}`);
  },

  checkout: async (customerId) => {
    const response = await api.post(`/cart/${customerId}/checkout`);
    return response.data;
  },
};
