import api from '../config/api';

/**
 * Normaliza estados legacy/actuales a los 5 estados canónicos del flujo:
 * DOCUMENT_UPLOADED | SELFIE_UPLOADED | PROCESSING | APPROVED | REJECTED.
 * `null` significa "sin verificación iniciada".
 */
export const normalizeVerificationStatus = (status) => {
  if (!status) return null;
  const s = String(status).toUpperCase();
  if (s === 'VERIFIED') return 'APPROVED';
  if (s === 'FAILED') return 'REJECTED';
  if (s === 'NONE' || s === 'NOT_STARTED') return null;
  return s;
};

/**
 * La verificación de identidad de vendedores se expone a través del gateway,
 * que exige el encabezado `X-Gateway-SellerId` en las llamadas de estado y
 * validación. Los uploads viajan como multipart/form-data.
 */
export const sellerVerificationService = {
  getStatus: async (sellerId) => {
    const response = await api.get(`/sellers/${sellerId}/verification`, {
      headers: { 'X-Gateway-SellerId': String(sellerId) },
    });
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
    const response = await api.post(
      `/sellers/${sellerId}/verification/validate`,
      null,
      { headers: { 'X-Gateway-SellerId': String(sellerId) } }
    );
    return response.data;
  },
};