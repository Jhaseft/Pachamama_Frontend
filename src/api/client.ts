import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://192.168.100.9:4000', // tu backend
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;