import api from '../config/api';

export async function fetchAvatarBlob(url) {
  const response = await api.get(url, { responseType: 'blob' });
  return URL.createObjectURL(response.data);
}
