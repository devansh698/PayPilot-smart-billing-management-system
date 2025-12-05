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

// Client API calls
export const curentuser=()=>api.get('/auth/client/me');
export const fetchClientProfile = () => api.get('/clientroutes/profile');
export const updateClientProfile = (data) => api.put('/clientroutes/profile', data);
export const fetchClientOrders = () => api.get('/clientroutes/orders');
export const createOrder = (data) => api.post('/clientroutes/orders', data);
export const fetchPayments = () => api.get('/clientroutes/payments');
export const processPayment = (data) => api.post('/clientroutes/payments', data);
export const fetchNotifications = () => api.get('/clientroutes/notifications');
export const markNotificationAsRead = (id) => api.put(`/clientroutes/notifications/${id}/read`);