import axios from 'axios';
import { getAccessToken } from '../storage/authStorage';
import { API_URL } from '../config';

const apiClient = axios.create({
  //baseURL: 'https://paginas-pachamama-backend.pk1ooa.easypanel.host',
//  baseURL: 'http://192.168.100.9:4000', //es de mi wifi para hacer funcionar expo go movil
  //baseURL: 'http://192.168.0.4:4000', //la ip que paso fabian

  baseURL: API_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();

  console.log("🚀 Enviando petición a:", config.url);
  console.log("🔑 Token detectado:", token ? "SÍ (empieza por " + token.substring(0, 10) + "...)" : "NO");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
