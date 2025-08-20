// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5260/api', // Địa chỉ API của bạn
});

// Thêm một "interceptor" để tự động thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { api };