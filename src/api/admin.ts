import apiClient from './client';

export const getAdminDashboardData = async () => {
  try {
    const response = await apiClient.get('/admin/stats'); // Tu endpoint en NestJS
    return response.data;
  } catch (error) {
    throw error;
  }
};