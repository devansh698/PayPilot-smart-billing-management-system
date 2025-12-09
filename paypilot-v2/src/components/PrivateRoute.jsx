import React from 'react';
import { Navigate } from 'react-router-dom';

// Simplified PrivateRoute
// In a real app, you might want to decode the JWT to check expiration or role
const PrivateRoute = ({ element, requiredRole }) => {
    const token = localStorage.getItem('token');
    // Basic check: if no token, redirect to login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Optional: Add role checking logic here if you decode the token
    // const userRole = decode(token).role;
    // if (requiredRole && userRole !== requiredRole) return <NotAuthorized />;

    return element;
};

export default PrivateRoute;