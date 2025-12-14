import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import { Store, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useStore } from '../context/StoreContext';

const StoreSelector = () => {
    const storeContext = useStore();
    const { currentStore, setCurrentStore, stores, fetchStores } = storeContext || {};
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (storeContext && stores && stores.length === 0) {
            fetchStores();
        }
    }, [storeContext]);

    const handleStoreChange = async (storeId) => {
        setLoading(true);
        try {
            const store = stores.find(s => s._id === storeId);
            if (store) {
                setCurrentStore(store);
                localStorage.setItem('currentStore', JSON.stringify(store));
                toast.success(`Switched to ${store.name}`);
            }
        } catch (error) {
            toast.error('Failed to switch store');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!storeContext || !stores || stores.length === 0) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center gap-2">
                        <Store size={16} />
                        <span className="truncate">
                            {currentStore ? currentStore.name : 'Select Store'}
                        </span>
                    </div>
                    <ChevronDown size={16} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
                {stores.map((store) => (
                    <DropdownMenuItem
                        key={store._id}
                        onClick={() => handleStoreChange(store._id)}
                        className={currentStore?._id === store._id ? 'bg-accent' : ''}
                    >
                        <div className="flex flex-col">
                            <span className="font-medium">{store.name}</span>
                            <span className="text-xs text-muted-foreground">
                                {store.address.city}, {store.address.state}
                            </span>
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default StoreSelector;

