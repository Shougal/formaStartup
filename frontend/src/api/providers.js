import axiosInstance from './axios';

const BASE_URL = 'http://127.0.0.1:8000/api';

export const fetchApprovedProviders = async (specialty) => {
    try {
        const response = await axiosInstance.get(`/approved-providers/${specialty}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching approved providers:', error.response ? error.response.data : error.message);
        throw error;
    }
};
