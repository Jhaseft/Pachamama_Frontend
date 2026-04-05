import axios from 'axios';
import { getAccessToken, removeAccessToken, removeUser } from '../storage/authStorage';
import { API_URL } from '../config';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el backend responde 401, la sesión expiró → limpiar storage
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await Promise.all([removeAccessToken(), removeUser()]);
    }
    return Promise.reject(error);
  },
);

export default apiClient;
