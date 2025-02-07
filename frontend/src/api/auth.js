import axiosInstance from './axios';

// Login
export const login = async (email, password) => {
  const response = await axiosInstance.post('/login/', { email, password });
  return response.data; // Contains tokens and user details
};

// Register as Customer
export const registerCustomer = async (customerData) => {
  const response = await axiosInstance.post('/register/customer/', customerData);
  return response.data;
};

// Register as Provider
export const registerProvider = async (providerData) => {
  const response = await axiosInstance.post('/register/provider/', providerData);
  return response.data;
};
