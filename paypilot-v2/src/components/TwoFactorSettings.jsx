import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import { Shield, Mail, Smartphone, CheckCircle, XCircle, Key, Copy, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { useAuth } from '../context/AuthContext';

const TwoFactorSettings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [twoFactorMethod, setTwoFactorMethod] = useState('email');
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [showQR, setShowQR] = useState(false);
    const [backupCodes, setBackupCodes] = useState([]);
    const [showBackupCodes, setShowBackupCodes] = useState(false);

    useEffect(() => {
        if (user) {
            setTwoFactorEnabled(user.twoFactorEnabled || false);
            setTwoFactorMethod(user.twoFactorMethod || 'email');
        }
    }, [user]);

    const handleEnable2FA = async (method) => {
        setLoading(true);
        try {
            if (method === 'authenticator') {
                const res = await api.post('/2fa/enable', { method: 'authenticator' });
                setQrCode(res.data.qrCode);
                setSecret(res.data.secret);
                setShowQR(true);
                setTwoFactorMethod('authenticator');
                toast.success('Scan the QR code with your authenticator app');
            } else {
                await api.post('/2fa/enable', { method: 'email' });
                setTwoFactorEnabled(true);
                setTwoFactorMethod('email');
                toast.success('2FA enabled with email OTP');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to enable 2FA');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAuthenticator = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            toast.error('Please enter a valid 6-digit code');
            return;
        }

        setLoading(true);
        try {
            await api.post('/2fa/verify', { token: verificationCode });
            setTwoFactorEnabled(true);
            setShowQR(false);
            setVerificationCode('');
            toast.success('2FA verified and enabled successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    const handleDisable2FA = async () => {
        if (!window.confirm('Are you sure you want to disable 2FA? This will reduce your account security.')) {
            return;
        }

        setLoading(true);
        try {
            await api.post('/2fa/disable');
            setTwoFactorEnabled(false);
            setShowQR(false);
            setSecret('');
            setQrCode('');
            toast.success('2FA disabled successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to disable 2FA');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateBackupCodes = async () => {
        if (!window.confirm('This will generate new backup codes. Old codes will be invalidated. Continue?')) {
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/2fa/generate-backup-codes');
            setBackupCodes(res.data.backupCodes);
            setShowBackupCodes(true);
            toast.success('Backup codes generated! Save them securely.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to generate backup codes');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const copyBackupCodes = () => {
        const codesText = backupCodes.join('\n');
        navigator.clipboard.writeText(codesText);
        toast.success('Backup codes copied to clipboard!');
    };

    const downloadBackupCodes = () => {
        const codesText = `PayPilot 2FA Backup Codes\nGenerated: ${new Date().toLocaleString()}\n\n${backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}\n\nKeep these codes safe! Each code can only be used once.`;
        const blob = new Blob([codesText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `paypilot-backup-codes-${Date.now()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Backup codes downloaded!');
    };

    const handleChangeMethod = async (newMethod) => {
        if (!window.confirm(`Are you sure you want to change 2FA method from ${twoFactorMethod} to ${newMethod}?`)) {
            return;
        }

        setLoading(true);
        try {
            // First disable current 2FA
            await api.post('/2fa/disable');
            
            // Then enable with new method
            if (newMethod === 'authenticator') {
                const res = await api.post('/2fa/enable', { method: 'authenticator' });
                setQrCode(res.data.qrCode);
                setSecret(res.data.secret);
                setShowQR(true);
                setTwoFactorMethod('authenticator');
                toast.success('Scan the QR code with your authenticator app');
            } else {
                await api.post('/2fa/enable', { method: 'email' });
                setTwoFactorEnabled(true);
                setTwoFactorMethod('email');
                toast.success('2FA method changed to email OTP');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change 2FA method');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {twoFactorEnabled ? (
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle size={20} />
                            <span className="font-medium">2FA is enabled ({twoFactorMethod})</span>
                        </div>
                        <div className="flex gap-2">
                            {twoFactorMethod === 'email' ? (
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleChangeMethod('authenticator')} 
                                    disabled={loading}
                                >
                                    <Smartphone size={16} className="mr-2" />
                                    Switch to Authenticator
                                </Button>
                            ) : (
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleChangeMethod('email')} 
                                    disabled={loading}
                                >
                                    <Mail size={16} className="mr-2" />
                                    Switch to Email
                                </Button>
                            )}
                            <Button variant="destructive" size="sm" onClick={handleDisable2FA} disabled={loading}>
                                <XCircle size={16} className="mr-2" />
                                Disable
                            </Button>
                        </div>
                    </div>
                    
                    {/* Backup Codes Section */}
                    <div className="mt-4 p-4 border rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Key size={18} className="text-primary" />
                                <h4 className="font-semibold">Backup Codes</h4>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={handleGenerateBackupCodes}
                                disabled={loading}
                            >
                                Generate New Codes
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                            Backup codes can be used to access your account if you lose access to your 2FA device. Each code can only be used once.
                        </p>
                        {showBackupCodes && backupCodes.length > 0 && (
                            <Card className="mt-3 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                                            ⚠️ Save these codes now - they won't be shown again!
                                        </p>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={copyBackupCodes}>
                                                <Copy size={14} className="mr-1" />
                                                Copy
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={downloadBackupCodes}>
                                                <Download size={14} className="mr-1" />
                                                Download
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                                        {backupCodes.map((code, index) => (
                                            <div key={index} className="p-2 bg-white dark:bg-gray-800 rounded border text-center">
                                                {code}
                                            </div>
                                        ))}
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="w-full mt-3"
                                        onClick={() => setShowBackupCodes(false)}
                                    >
                                        I've Saved These Codes
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Choose your preferred 2FA method:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="cursor-pointer hover:border-primary transition-colors">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <Mail size={24} className="text-primary" />
                                    <h4 className="font-semibold">Email OTP</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Receive a one-time password via email
                                </p>
                                <Button 
                                    onClick={() => handleEnable2FA('email')} 
                                    disabled={loading}
                                    className="w-full"
                                >
                                    Enable Email 2FA
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="cursor-pointer hover:border-primary transition-colors">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <Smartphone size={24} className="text-primary" />
                                    <h4 className="font-semibold">Authenticator App</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Use apps like Google Authenticator or Authy
                                </p>
                                <Button 
                                    onClick={() => handleEnable2FA('authenticator')} 
                                    disabled={loading}
                                    className="w-full"
                                    variant="outline"
                                >
                                    Enable Authenticator 2FA
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {showQR && (
                        <Card className="mt-4">
                            <CardContent className="p-6">
                                <h4 className="font-semibold mb-4">Scan QR Code</h4>
                                <div className="flex flex-col items-center space-y-4">
                                    <img src={qrCode} alt="QR Code" className="border rounded-lg p-2 bg-white" />
                                    <div className="text-center space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            Scan this QR code with your authenticator app
                                        </p>
                                        <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                                            {secret}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Or enter this code manually
                                        </p>
                                    </div>
                                    <div className="w-full max-w-xs space-y-2">
                                        <Label htmlFor="verify-code">Enter 6-digit code</Label>
                                        <Input
                                            id="verify-code"
                                            type="text"
                                            maxLength={6}
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                            placeholder="000000"
                                            className="text-center text-lg tracking-widest"
                                        />
                                        <Button 
                                            onClick={handleVerifyAuthenticator} 
                                            disabled={loading || verificationCode.length !== 6}
                                            className="w-full"
                                        >
                                            Verify & Enable
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => {
                                                setShowQR(false);
                                                setQrCode('');
                                                setSecret('');
                                            }}
                                            className="w-full"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};

export default TwoFactorSettings;

