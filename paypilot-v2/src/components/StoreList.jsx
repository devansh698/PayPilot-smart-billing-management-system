import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Store, MapPin, Phone, Mail, Users, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';

const StoreList = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            const res = await api.get('/stores');
            setStores(res.data);
        } catch (error) {
            toast.error('Failed to fetch stores');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this store?')) return;
        
        try {
            await api.delete(`/stores/${id}`);
            toast.success('Store deleted successfully');
            fetchStores();
        } catch (error) {
            toast.error('Failed to delete store');
            console.error(error);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px]">Loading stores...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Store Management</h1>
                    <p className="text-muted-foreground mt-1">Manage your multiple stores</p>
                </div>
                <Button onClick={() => navigate('/add-store')}>
                    <Plus size={16} className="mr-2" />
                    Add Store
                </Button>
            </div>

            {stores.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Store size={48} className="text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No stores found</h3>
                        <p className="text-muted-foreground mb-4">Get started by creating your first store</p>
                        <Button onClick={() => navigate('/add-store')}>
                            <Plus size={16} className="mr-2" />
                            Create Store
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stores.map((store) => (
                        <Card key={store._id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <Building2 size={24} className="text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{store.name}</CardTitle>
                                            <Badge variant={store.isActive ? "default" : "secondary"} className="mt-1">
                                                {store.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => navigate(`/edit-store/${store._id}`)}
                                        >
                                            <Edit size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(store._id)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start gap-2 text-sm">
                                    <MapPin size={16} className="text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="font-medium">{store.address.street}</p>
                                        <p className="text-muted-foreground">
                                            {store.address.city}, {store.address.state} {store.address.zipCode}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone size={16} className="text-muted-foreground" />
                                    <span>{store.contact.phone}</span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail size={16} className="text-muted-foreground" />
                                    <span>{store.contact.email}</span>
                                </div>

                                {store.gstNumber && (
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">GST: </span>
                                        <span className="font-medium">{store.gstNumber}</span>
                                    </div>
                                )}

                                {store.employees && store.employees.length > 0 && (
                                    <div className="flex items-center gap-2 text-sm pt-2 border-t">
                                        <Users size={16} className="text-muted-foreground" />
                                        <span>{store.employees.length} employee(s)</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StoreList;

