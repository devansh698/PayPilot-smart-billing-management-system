import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchUserProfile } from '../api';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser ] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Hook for navigation

    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                const response = await fetchUserProfile();
                setUser (response.data);
            } catch (error) {
                // Handle the error for expired or invalid token
                setError("Login expired. Please log in again.");
                console.error("Error loading user profile: ", error);
                navigate('/login'); // Redirect to login page
            } finally {
                setLoading(false);
            }
        };

        loadUserProfile();
    }, [navigate]);

    const logout = () => {
        setUser (null);
        localStorage.removeItem("token");
        navigate('/login'); // Redirect to login page after logout
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for using AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};