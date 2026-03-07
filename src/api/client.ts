import axios from 'axios';
import { getAccessToken } from '../storage/authStorage';

const apiClient = axios.create({
  baseURL: 'https://paginas-pachamama-backend.pk1ooa.easypanel.host',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
