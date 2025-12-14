import React, { useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

const AddStore = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'India',
        },
        contact: {
            phone: '',
            email: '',
        },
        gstNumber: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const field = name.split('.')[1];
            setFormData({
                ...formData,
                address: { ...formData.address, [field]: value },
            });
        } else if (name.startsWith('contact.')) {
            const field = name.split('.')[1];
            setFormData({
                ...formData,
                contact: { ...formData.contact, [field]: value },
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/stores', formData);
            toast.success('Store created successfully');
            navigate('/store-list');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create store');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/store-list')}>
                    <ArrowLeft size={16} className="mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Add New Store</h1>
                    <p className="text-muted-foreground mt-1">Create a new store location</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 size={20} />
                        Store Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Store Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Enter store name"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contact.phone">Phone *</Label>
                                <Input
                                    id="contact.phone"
                                    name="contact.phone"
                                    type="tel"
                                    value={formData.contact.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="+91 1234567890"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact.email">Email *</Label>
                                <Input
                                    id="contact.email"
                                    name="contact.email"
                                    type="email"
                                    value={formData.contact.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="store@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address.street">Street Address *</Label>
                            <Input
                                id="address.street"
                                name="address.street"
                                value={formData.address.street}
                                onChange={handleChange}
                                required
                                placeholder="123 Main Street"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="address.city">City *</Label>
                                <Input
                                    id="address.city"
                                    name="address.city"
                                    value={formData.address.city}
                                    onChange={handleChange}
                                    required
                                    placeholder="Mumbai"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address.state">State *</Label>
                                <Input
                                    id="address.state"
                                    name="address.state"
                                    value={formData.address.state}
                                    onChange={handleChange}
                                    required
                                    placeholder="Maharashtra"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address.zipCode">Zip Code *</Label>
                                <Input
                                    id="address.zipCode"
                                    name="address.zipCode"
                                    value={formData.address.zipCode}
                                    onChange={handleChange}
                                    required
                                    placeholder="400001"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="gstNumber">GST Number</Label>
                            <Input
                                id="gstNumber"
                                name="gstNumber"
                                value={formData.gstNumber}
                                onChange={handleChange}
                                placeholder="27AAAAA0000A1Z5"
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Store'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => navigate('/store-list')}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AddStore;

