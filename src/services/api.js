import axios from 'axios';

const BACKEND = window.location.hostname === 'localhost'
  ? 'http://localhost:5001'
  : 'http://' + window.location.hostname + ':5001';

const API = axios.create({
  baseURL: BACKEND + '/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

export default API;