import api from '../config/api';

export const paymentService = {
  createCheckoutSession: async (data) => {
    const response = await api.post('/payments/checkout-session', data);
    return response.data;
  },

  getByInvoice: async (invoice) => {
    const response = await api.get(`/payments/${invoice}`);
    return response.data;
  },

  confirm: async (refId) => {
    const response = await api.post(`/payments/confirm/${refId}`);
    return response.data;
  },
};
