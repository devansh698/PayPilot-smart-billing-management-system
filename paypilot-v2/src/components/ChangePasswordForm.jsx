import React, { useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../context/AuthContext';

const ChangePasswordForm = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (formData.oldPassword === formData.newPassword) {
            toast.error('New password must be different from old password');
            return;
        }

        setLoading(true);
        try {
            await api.patch(`/user/${user._id}/change-password`, {
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword,
            });
            toast.success('Password changed successfully');
            setFormData({
                oldPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Change Password</h3>
            <p className="text-sm text-muted-foreground mb-4">
                Use a strong password to protect your account
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="oldPassword">Current Password</Label>
                    <div className="relative">
                        <Input
                            id="oldPassword"
                            type={showPasswords.old ? 'text' : 'password'}
                            value={formData.oldPassword}
                            onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                            required
                            className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                        >
                            {showPasswords.old ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                        <Input
                            id="newPassword"
                            type={showPasswords.new ? 'text' : 'password'}
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            required
                            minLength={6}
                            className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                        >
                            {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                        <Input
                            id="confirmPassword"
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                            minLength={6}
                            className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                        >
                            {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>
                <Button type="submit" disabled={loading}>
                    <Lock size={16} className="mr-2" />
                    {loading ? 'Changing...' : 'Change Password'}
                </Button>
            </form>
        </div>
    );
};

export default ChangePasswordForm;

