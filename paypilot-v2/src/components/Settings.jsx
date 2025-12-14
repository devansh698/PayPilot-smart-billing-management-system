import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import { Settings as SettingsIcon, User, Bell, Shield, Database, Moon, Sun, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import TwoFactorSettings from './TwoFactorSettings';
import ChangePasswordForm from './ChangePasswordForm';

const Settings = () => {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
        phone: '',
    });
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        orderNotifications: true,
        paymentNotifications: true,
        inventoryAlerts: true,
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                username: user.username || '',
                email: user.email || '',
                phone: user.phone || '',
            });
            // Load notification preferences from user or localStorage
            if (user.notificationPreferences) {
                setNotifications(user.notificationPreferences);
            } else {
                const saved = localStorage.getItem('notificationSettings');
                if (saved) {
                    setNotifications(JSON.parse(saved));
                }
            }
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!user?._id) {
                toast.error('User ID not found');
                return;
            }
            
            await api.put(`/user/${user._id}`, {
                email: profileData.email,
                phone: profileData.phone,
            });
            toast.success('Profile updated successfully');
            // Refresh user data
            window.location.reload();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationChange = async (key, value) => {
        const updated = { ...notifications, [key]: value };
        setNotifications(updated);
        
        // Save to localStorage
        localStorage.setItem('notificationSettings', JSON.stringify(updated));
        
        // Save to backend
        try {
            if (user?._id) {
                await api.put(`/user/${user._id}`, {
                    notificationPreferences: updated,
                });
            }
        } catch (error) {
            console.error('Failed to save notification preferences:', error);
            // Don't show error to user, localStorage is saved
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="profile">
                        <User size={16} className="mr-2" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="notifications">
                        <Bell size={16} className="mr-2" />
                        Notifications
                    </TabsTrigger>
                    <TabsTrigger value="security">
                        <Shield size={16} className="mr-2" />
                        Security
                    </TabsTrigger>
                    <TabsTrigger value="system">
                        <Database size={16} className="mr-2" />
                        System
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Profile Avatar Card */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="w-24 h-24 rounded-full bg-primary/20 text-primary flex items-center justify-center text-4xl font-bold">
                                        {user?.username?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">{user?.username || 'User'}</h3>
                                        <p className="text-sm text-muted-foreground">{user?.role || 'User'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Profile Form */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleProfileUpdate} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="username">Username</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                                            <Input
                                                id="username"
                                                value={profileData.username}
                                                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                                className="pl-9"
                                                disabled
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={profileData.email}
                                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <Label>Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                                </div>
                                <Switch
                                    checked={notifications.emailNotifications}
                                    onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <Label>Order Notifications</Label>
                                    <p className="text-sm text-muted-foreground">Get notified about new orders</p>
                                </div>
                                <Switch
                                    checked={notifications.orderNotifications}
                                    onCheckedChange={(checked) => handleNotificationChange('orderNotifications', checked)}
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <Label>Payment Notifications</Label>
                                    <p className="text-sm text-muted-foreground">Get notified about payments</p>
                                </div>
                                <Switch
                                    checked={notifications.paymentNotifications}
                                    onCheckedChange={(checked) => handleNotificationChange('paymentNotifications', checked)}
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <Label>Inventory Alerts</Label>
                                    <p className="text-sm text-muted-foreground">Get alerts for low stock items</p>
                                </div>
                                <Switch
                                    checked={notifications.inventoryAlerts}
                                    onCheckedChange={(checked) => handleNotificationChange('inventoryAlerts', checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ChangePasswordForm />
                            <div className="p-4 border rounded-lg">
                                <h3 className="font-semibold mb-2">Two-Factor Authentication</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Add an extra layer of security to your account
                                </p>
                                <TwoFactorSettings />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="system">
                    <Card>
                        <CardHeader>
                            <CardTitle>System Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold mb-1">Theme</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Switch between light and dark mode
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={toggleTheme}
                                        className="gap-2"
                                    >
                                        {theme === 'dark' ? (
                                            <>
                                                <Sun size={18} />
                                                Light Mode
                                            </>
                                        ) : (
                                            <>
                                                <Moon size={18} />
                                                Dark Mode
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <h3 className="font-semibold mb-2">Data Export</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Export your data in various formats
                                </p>
                                <Button variant="outline">Export Data</Button>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <h3 className="font-semibold mb-2 text-destructive">Danger Zone</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Permanently delete your account and all associated data
                                </p>
                                <Button variant="destructive">Delete Account</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Settings;

