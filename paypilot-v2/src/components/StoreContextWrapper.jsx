import React from 'react';
import { useStore } from '../context/StoreContext';
import StoreSelector from './StoreSelector';
import StoreFilter from './StoreFilter';

// Wrapper component to safely use StoreContext
export const StoreSelectorWrapper = () => {
    const storeContext = useStore();
    if (!storeContext) return null;
    
    const { isSuperAdmin, stores } = storeContext;
    
    // Don't show if no stores
    if (!stores || stores.length === 0) return null;
    
    // Superadmin gets filter, others get selector
    if (isSuperAdmin) {
        return <StoreFilter />;
    }
    
    // Only show selector if multiple stores
    if (stores.length > 1) {
        return <div className="w-48"><StoreSelector /></div>;
    }
    
    return null;
};

