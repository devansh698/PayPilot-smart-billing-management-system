import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

export const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
    const { user, loading: authLoading } = useAuth();
    const [stores, setStores] = useState([]);
    const [currentStore, setCurrentStore] = useState(null);
    const [selectedStoreFilter, setSelectedStoreFilter] = useState(() => {
        const stored = localStorage.getItem('storeFilter');
        return stored === 'all' ? 'all' : stored || 'all';
    });
    const [loading, setLoading] = useState(true);
    const isSuperAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            const res = await api.get('/stores');
            setStores(res.data);
            
            // Superadmin: Don't set a default store, show all data
            // Other users: Set their assigned store
            if (!isSuperAdmin && res.data.length > 0) {
                const storedStore = localStorage.getItem('currentStore');
                if (storedStore) {
                    try {
                        const parsed = JSON.parse(storedStore);
                        setCurrentStore(parsed);
                    } catch (error) {
                        // If stored store is invalid, use first store
                        const firstStore = res.data[0];
                        setCurrentStore(firstStore);
                        localStorage.setItem('currentStore', JSON.stringify(firstStore));
                    }
                } else {
                    const firstStore = res.data[0];
                    setCurrentStore(firstStore);
                    localStorage.setItem('currentStore', JSON.stringify(firstStore));
                }
            }
        } catch (error) {
            console.error('Error fetching stores:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateCurrentStore = (store) => {
        setCurrentStore(store);
        if (!isSuperAdmin) {
            localStorage.setItem('currentStore', JSON.stringify(store));
        }
    };

    const updateStoreFilter = (storeId) => {
        setSelectedStoreFilter(storeId);
        localStorage.setItem('storeFilter', storeId || 'all');
    };

    // For superadmin: return selected filter or 'all'
    // For others: return their current store
    const getActiveStoreId = () => {
        if (isSuperAdmin) {
            return selectedStoreFilter === 'all' ? null : selectedStoreFilter;
        }
        return currentStore?._id || null;
    };

    return (
        <StoreContext.Provider value={{
            stores,
            currentStore,
            setCurrentStore: updateCurrentStore,
            fetchStores,
            loading,
            isSuperAdmin,
            selectedStoreFilter,
            setSelectedStoreFilter: updateStoreFilter,
            getActiveStoreId,
        }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
};

