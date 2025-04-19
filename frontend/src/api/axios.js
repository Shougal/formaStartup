import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', //  backend base URL
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
