import api from '../config/api';

export const getImageUrl = (key) => {
  if (!key) return '';
  if (key.startsWith('http') || key.startsWith('/')) return key;
  return `${api.defaults.baseURL}/products/images?key=${encodeURIComponent(key)}`;
};