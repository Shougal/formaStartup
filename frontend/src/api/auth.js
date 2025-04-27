import axiosInstance, { publicAxiosInstance } from './axios';

// Login
export const login = async (email, password) => {
  const response = await publicAxiosInstance.post('/login/', { email, password });
  return response.data; // Contains tokens and user details
};

// Register as Customer
export const registerCustomer = async (customerData) => {
  const response = await publicAxiosInstance.post('/register/customer/', customerData);
  return response.data;
};

// Register as Provider
export const registerProvider = async (providerData) => {
  const response = await publicAxiosInstance.post('/register/provider/', providerData);
  return response.data;
};

//Change Password
export const changePassword = async (newPassword) => {
  const response = await axiosInstance.post('/change-password/', { password: newPassword });
  return response.data;
}

// Logout
export const logout = () => {
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('storageChange'));
  window.location.href = '/login'; // Force hard refresh to reset memory/cookies
};


