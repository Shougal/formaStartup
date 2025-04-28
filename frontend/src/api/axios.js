import axios from 'axios';

// Smart backend baseURL
const baseURL = window.location.hostname.includes('localhost')
  ? 'http://127.0.0.1:8000/api'  // Local backend
  : 'https://forma-app-b1081cbc4d9c.herokuapp.com/api';  // Deployed backend

export const publicAxiosInstance = axios.create({
  baseURL: baseURL,
  withCredentials: false, // <-- NO cookies
  headers: {
    'Content-Type': 'application/json',
  },
});
const axiosInstance = axios.create({
  baseURL: baseURL, //  backend base URL
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// // Adding a request interceptor
// axiosInstance.interceptors.request.use(config => {
//
//   const storedData = localStorage.getItem('user');
//   if (storedData) {
//     const { accessToken } = JSON.parse(storedData);
//     if (accessToken) {
//       config.headers['Authorization'] = `Bearer ${accessToken}`; // Append token to headers
//     }
//   }
//   return config;
// }, error => {
//   // Do something with request error
//   return Promise.reject(error);
// });
//
// export default axiosInstance;
// Adding a request interceptor
axiosInstance.interceptors.request.use(config => {
  // 1. Attach Authorization Header
  const storedData = localStorage.getItem('user');
  if (storedData) {
    const { accessToken } = JSON.parse(storedData);
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`; // Append token to headers
    }
  }

  // 2. Attach CSRF Token Header (for unsafe methods)
  const csrfToken = getCookie('csrftoken');
  if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
    config.headers['X-CSRFToken'] = csrfToken;
  }

  return config;
}, error => {
  return Promise.reject(error);
});

// Helper function to get CSRF cookie
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export default axiosInstance;