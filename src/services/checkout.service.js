import api from '../config/api';

export const checkoutService = {
  checkout: async (data) => {
    const response = await api.post('/checkout', data);
    return response.data;
  },

  retryPayment: async (orderId) => {
    const response = await api.post(`/payments/orders/${orderId}/retry`);
    return response.data;
  },
};