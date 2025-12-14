import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchUserProfile } from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser ] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadUserProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetchUserProfile();
                setUser (response.data);
            } catch (error) {
                // Handle the error for expired or invalid token
                setError("Login expired. Please log in again.");
                console.error("Error loading user profile: ", error);
                localStorage.removeItem("token");
                // Don't navigate here - let PrivateRoute handle it
            } finally {
                setLoading(false);
            }
        };

        loadUserProfile();

        // Listen for storage changes (when token is set from login)
        const handleStorageChange = (e) => {
            if (e.key === 'token' && e.newValue) {
                loadUserProfile();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        
        // Also listen for custom event for same-tab updates
        const handleTokenSet = () => {
            loadUserProfile();
        };
        window.addEventListener('tokenSet', handleTokenSet);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('tokenSet', handleTokenSet);
        };
    }, []);

    const logout = () => {
        setUser (null);
        localStorage.removeItem("token");
        // Navigation will be handled by the component calling logout
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, logout, setUser }}>
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