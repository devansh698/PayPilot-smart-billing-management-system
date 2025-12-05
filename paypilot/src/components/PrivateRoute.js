// src/components/PrivateRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ element, requiredRole }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>;

    if (!user) return <Navigate to="/login" />;

    if (requiredRole && user.role !== requiredRole) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div>
                    <h1>Unauthorized</h1>
                    <p>You do not have permission to access this page.</p>
                </div>
            </div>
        );
    }

    return element;
};

export default PrivateRoute;
