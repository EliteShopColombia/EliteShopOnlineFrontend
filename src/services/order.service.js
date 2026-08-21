import api from '../config/api';

export const orderService = {
  getAll: async () => {
    const response = await api.get('/orders');
    return response.data;
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

  getByCustomer: async (customerId) => {
    return orderService.getByCustomerId(customerId);
  },

  getByCustomerId: async (customerId) => {
    const response = await api.get(`/orders/customer/${customerId}`);
    return response.data;
  },

  cancel: async (id, reason) => {
    const response = await api.patch(`/orders/${id}/cancel`, reason ? { reason } : undefined);
    return response.data;
  },

  cancelOrder: async (id, reason) => orderService.cancel(id, reason),

  confirmDelivery: async (id) => {
    const response = await api.patch(`/orders/${id}/confirm-delivery`);
    return response.data;
  },

  prepare: async (id) => {
    const response = await api.patch(`/orders/${id}/prepare`);
    return response.data;
  },

  ship: async (id) => {
    const response = await api.patch(`/orders/${id}/ship`);
    return response.data;
  },

  outForDelivery: async (id) => {
    const response = await api.patch(`/orders/${id}/out-for-delivery`);
    return response.data;
  },

  updateTracking: async (id, data) => {
    const response = await api.patch(`/orders/${id}/tracking`, data);
    return response.data;
  },

  complete: async (id) => {
    const response = await api.patch(`/orders/${id}/complete`);
    return response.data;
  },

  dispute: async (id, reason) => {
    const response = await api.patch(`/orders/${id}/dispute`, reason ? { reason } : undefined);
    return response.data;
  },

  refund: async (id, reason) => {
    const response = await api.patch(`/orders/${id}/refund`, reason ? { reason } : undefined);
    return response.data;
  },

  getSellerSummary: async (sellerId) => {
    const response = await api.get(`/orders/seller/${sellerId}/summary`);
    return response.data;
  },

  completeOrder: async (id) => orderService.complete(id),
  disputeOrder: async (id, reason) => orderService.dispute(id, reason),
  refundOrder: async (id, reason) => orderService.refund(id, reason),
  prepareOrder: async (id) => orderService.prepare(id),
  shipOrder: async (id) => orderService.ship(id),
  outForDeliveryOrder: async (id) => orderService.outForDelivery(id),
  getBySeller: async (sellerId) => {
    const response = await api.get(`/orders/seller/${sellerId}`);
    return response.data;
  },
  getSummary: async (sellerId) => orderService.getSellerSummary(sellerId),
  getStatusCounts: async (sellerId) => orderService.getSellerStatusCounts(sellerId),

  getTrackingEvents: async (id) => {
    const response = await api.get(`/orders/${id}/tracking/events`);
    return response.data;
  },

  addTrackingEvent: async (id, data) => {
    const response = await api.post(`/orders/${id}/tracking/events`, data);
    return response.data;
  },

  searchOrders: async (sellerId, params = {}) => {
    const response = await api.get(`/orders/seller/${sellerId}/search`, { params });
    return response.data;
  },

  searchSellerOrders: async (sellerId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = `/orders/seller/${sellerId}/search${query ? `?${query}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  getSellerStatusCounts: async (sellerId) => {
    const response = await api.get(`/orders/seller/${sellerId}/status-counts`);
    return response.data;
  },
};
