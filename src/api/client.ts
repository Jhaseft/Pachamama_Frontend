import axios from 'axios';
import { getAccessToken } from '../storage/authStorage';
import { API_URL } from '../config';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();

console.log("DEBUG - URL COMPLETA:", (config.baseURL || '') + (config.url || ''));
  console.log("🚀 Enviando petición a:", config.url);
  console.log("🔑 Token detectado:", token ? "SÍ (empieza por " + token.substring(0, 10) + "...)" : "NO");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
