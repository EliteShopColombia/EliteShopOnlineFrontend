import api from '../config/api';

export const adminService = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getCustomers: async (page = 0, size = 10) => {
    const response = await api.get('/admin/customers', { params: { page, size } });
    return response.data;
  },

  getSellers: async (page = 0, size = 10) => {
    const response = await api.get('/admin/sellers', { params: { page, size } });
    return response.data;
  },

  getSellerById: async (id) => {
    const response = await api.get(`/admin/sellers/${id}`);
    return response.data;
  },

  updateSellerStatus: async (id, isActive) => {
    const response = await api.patch(`/admin/sellers/${id}/status`, { isActive });
    return response.data;
  },

  getOrders: async (page = 0, size = 10) => {
    const response = await api.get('/admin/orders', { params: { page, size } });
    return response.data;
  },
};
