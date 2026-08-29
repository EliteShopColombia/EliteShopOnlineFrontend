import api from '../config/api';

// Cache en memoria para evitar requests repetidos
const cache = {
  departments: null,
  citiesByDept: {},
};

export const locationService = {
  getDepartments: async () => {
    if (cache.departments) return cache.departments;
    const { data } = await api.get('/locations/departments');
    cache.departments = data;
    return data;
  },

  getCitiesByDepartment: async (departmentId) => {
    if (cache.citiesByDept[departmentId]) return cache.citiesByDept[departmentId];
    const { data } = await api.get(`/locations/departments/${departmentId}/cities`);
    cache.citiesByDept[departmentId] = data;
    return data;
  },

  invalidateCache: () => {
    cache.departments = null;
    cache.citiesByDept = {};
  },
};
