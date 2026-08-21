export const parsePageResponse = (data) => ({
  content: data.content || [],
  page: data.page || 0,
  size: data.size || 25,
  totalElements: data.totalElements || 0,
  totalPages: data.totalPages || 0,
  first: data.first || false,
  last: data.last || false,
});

export const parseApiError = (error) => ({
  timestamp: error.response?.data?.timestamp,
  status: error.response?.status,
  error: error.response?.data?.error,
  message: error.response?.data?.message,
  path: error.response?.data?.path,
});
