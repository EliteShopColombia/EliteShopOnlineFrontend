import api from '../config/api';

export const sellerVerificationService = {
  getStatus: async (sellerId) => {
    const response = await api.get(`/sellers/${sellerId}/verification`);
    return response.data;
  },

  uploadDocument: async (sellerId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/sellers/${sellerId}/verification/document`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  uploadSelfie: async (sellerId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/sellers/${sellerId}/verification/selfie`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  validate: async (sellerId) => {
    const response = await api.post(`/sellers/${sellerId}/verification/validate`);
    return response.data;
  },
};