// src/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Change this to your actual API endpoint
});

// Add request interceptor to include the token in headers
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const fetchUserProfile = () => api.get('/auth/me',{
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
});
export const fetchProducts = () => api.get('/product');
export const login = (credentials) => api.post('/auth/login', credentials);
export const register= (userData) => api.post('/auth/register', userData);
export const fetchNotifications = () => api.get('/clientportal/notifications');
export const markNotificationAsRead = (id) => api.put(`/clientportal/notifications/${id}/read`);
