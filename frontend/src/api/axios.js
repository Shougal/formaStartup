import axios from 'axios';

// Smart backend baseURL
const baseURL = window.location.hostname.includes('localhost')
  ? 'http://127.0.0.1:8000/api'  // Local backend
  : 'https://forma-app-b1081cbc4d9c.herokuapp.com/api';  // Deployed backend

const axiosInstance = axios.create({
  baseURL: baseURL, //  backend base URL
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adding a request interceptor
axiosInstance.interceptors.request.use(config => {

  const storedData = localStorage.getItem('user');
  if (storedData) {
    const { accessToken } = JSON.parse(storedData);
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`; // Append token to headers
    }
  }
  return config;
}, error => {
  // Do something with request error
  return Promise.reject(error);
});

export default axiosInstance;
