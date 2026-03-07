import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://paginas-pachamama-backend.pk1ooa.easypanel.host', // tu backend
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;