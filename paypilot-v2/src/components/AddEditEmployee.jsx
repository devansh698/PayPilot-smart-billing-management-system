import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User, Mail, Phone, Shield, Store } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

const AddEditEmployee = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { stores, isSuperAdmin } = useStore();
    const { user: currentUser } = useAuth();
    const isEdit = !!id;
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        password: '',
        role: 'Employee Manager',
        store: '',
    });

    const roles = [
        'Store Admin',
        'Store Manager',
        'Client Manager',
        'Invoice Manager',
        'Payment Manager',
        'Product Manager',
        'Order Manager',
        'Inventory Manager',
        'Report Manager',
        'Employee Manager',
    ];

    useEffect(() => {
        if (isEdit) {
            fetchEmployee();
        } else if (!isSuperAdmin && currentUser?.store) {
            setFormData(prev => ({ ...prev, store: currentUser.store }));
        }
    }, [id, isEdit, isSuperAdmin, currentUser]);

    const fetchEmployee = async () => {
        try {
            const res = await api.get(`/user/${id}`);
            setFormData({
                username: res.data.username || '',
                email: res.data.email || '',
                phone: res.data.phone || '',
                password: '',
                role: res.data.role || 'Employee Manager',
                store: res.data.store || '',
            });
        } catch (error) {
            toast.error('Failed to fetch employee details');
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!isEdit && !formData.password) {
            toast.error('Password is required for new employees');
            setLoading(false);
            return;
        }

        if (!formData.store && (isSuperAdmin || formData.role === 'Store Admin' || formData.role === 'Store Manager')) {
            toast.error('Please select a store');
            setLoading(false);
            return;
        }

        try {
            const payload = {
                username: formData.username,
                email: formData.email,
                phone: formData.phone,
                role: formData.role,
                store: formData.store,
            };

            if (isEdit) {
                if (formData.password) {
                    payload.password = formData.password;
                }
                await api.put(`/user/${id}`, payload);
                toast.success('Employee updated successfully');
            } else {
                await api.post('/auth/register', {
                    ...payload,
                    password: formData.password,
                });
                toast.success('Employee created successfully');
            }
            navigate('/employee-manager');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save employee');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/employee-manager')}>
                    <ArrowLeft size={16} className="mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {isEdit ? 'Edit Employee' : 'Add Employee'}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {isEdit ? 'Update employee information' : 'Create a new employee account'}
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Employee Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username *</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                                    <Input
                                        id="username"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="pl-9"
                                        required
                                        disabled={isEdit}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="pl-9"
                                        required
                                        disabled={isEdit}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone *</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="pl-9"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role *</Label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-2.5 text-muted-foreground z-10" size={16} />
                                    <select
                                        id="role"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-9 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        required
                                    >
                                        {roles.map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {(isSuperAdmin || formData.role === 'Store Admin' || formData.role === 'Store Manager') && stores && stores.length > 0 && (
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="store">Store *</Label>
                                    <div className="relative">
                                        <Store className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                                        <select
                                            id="store"
                                            value={formData.store}
                                            onChange={(e) => setFormData({ ...formData, store: e.target.value })}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-9 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            required
                                        >
                                            <option value="">Select a store...</option>
                                            {stores.map(store => (
                                                <option key={store._id} value={store._id}>
                                                    {store.name} - {store.address.city}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="password">
                                    {isEdit ? 'New Password (leave blank to keep current)' : 'Password *'}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required={!isEdit}
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button type="submit" disabled={loading}>
                                <Save size={16} className="mr-2" />
                                {loading ? 'Saving...' : isEdit ? 'Update Employee' : 'Create Employee'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => navigate('/employee-manager')}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AddEditEmployee;

