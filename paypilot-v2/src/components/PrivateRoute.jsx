import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import NotAuthorized from './NotAuthorized';

const PrivateRoute = ({ element, requiredRole }) => {
    const { user, loading } = useAuth();
    const token = localStorage.getItem('token');

    // Show loading while checking auth
    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    // If no token, redirect to login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // If user data is not loaded yet but token exists, wait
    if (!user && token) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    // Check role if required
    if (requiredRole) {
        try {
            const decoded = jwtDecode(token);
            const userRole = decoded.role || user?.role;
            
            // Admin has access to everything
            if (userRole === 'admin') {
                return element;
            }
            
            // Check if user has the required role
            if (userRole !== requiredRole) {
                return <NotAuthorized />;
            }
        } catch (error) {
            console.error('Error decoding token:', error);
            return <Navigate to="/login" replace />;
        }
    }

    return element;
};

export default PrivateRoute;