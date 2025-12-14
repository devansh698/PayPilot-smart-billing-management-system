import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Store, Filter, X } from 'lucide-react';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';

const StoreFilter = () => {
    const { stores, isSuperAdmin, selectedStoreFilter, setSelectedStoreFilter, fetchStores } = useStore();
    const [open, setOpen] = useState(false);

    if (!isSuperAdmin || !stores || stores.length === 0) {
        return null;
    }

    const handleFilterChange = (storeId) => {
        setSelectedStoreFilter(storeId);
        setOpen(false);
        // Store the filter in localStorage
        localStorage.setItem('storeFilter', storeId || 'all');
        // Dispatch a custom event to notify components
        window.dispatchEvent(new CustomEvent('storeFilterChanged', { detail: { storeId } }));
    };

    const selectedStore = selectedStoreFilter && selectedStoreFilter !== 'all' 
        ? stores.find(s => s._id === selectedStoreFilter)
        : null;

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Filter size={16} />
                    {selectedStoreFilter === 'all' || !selectedStoreFilter ? (
                        <>
                            <span>All Stores</span>
                            <Badge variant="secondary" className="ml-1">{stores.length}</Badge>
                        </>
                    ) : (
                        <>
                            <Store size={16} />
                            <span>{selectedStore?.name || 'Select Store'}</span>
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuItem
                    onClick={() => handleFilterChange('all')}
                    className={(!selectedStoreFilter || selectedStoreFilter === 'all') ? 'bg-accent' : ''}
                >
                    <div className="flex items-center justify-between w-full">
                        <span className="font-medium">All Stores</span>
                        <Badge variant="secondary">{stores.length}</Badge>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {stores.map((store) => (
                    <DropdownMenuItem
                        key={store._id}
                        onClick={() => handleFilterChange(store._id)}
                        className={selectedStoreFilter === store._id ? 'bg-accent' : ''}
                    >
                        <div className="flex flex-col w-full">
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

export default StoreFilter;

