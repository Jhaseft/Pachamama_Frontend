import axios from 'axios';
import { getAccessToken } from '../storage/authStorage';

const apiClient = axios.create({
  //baseURL: 'https://paginas-pachamama-backend.pk1ooa.easypanel.host',
  baseURL: 'http://192.168.100.9:4000', //es de mi wifi para hacer funcionar expo go movil
  //baseURL: 'http://192.168.0.4:4000', //la ip que paso fabian

  timeout: 10000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
