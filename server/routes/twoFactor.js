const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const speakeasy = require('speakeasy');
const { sendOtpMail } = require('../helpers/otp');

// Middleware to authenticate
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

// Enable 2FA - Generate secret for authenticator
router.post('/enable', authenticate, async (req, res) => {
    try {
        const { method } = req.body; // 'email' or 'authenticator'
        
        if (method === 'authenticator') {
            const secret = speakeasy.generateSecret({
                name: `PayPilot (${req.user.email})`,
                issuer: 'PayPilot',
            });

            // Generate QR code
            const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

            // Store secret temporarily (user needs to verify before enabling)
            req.user.twoFactorSecret = secret.base32;
            await req.user.save();

            res.json({
                secret: secret.base32,
                qrCode: qrCodeUrl,
                manualEntryKey: secret.base32,
            });
        } else if (method === 'email') {
            // For email, just enable it
            req.user.twoFactorEnabled = true;
            req.user.twoFactorMethod = 'email';
            await req.user.save();
            res.json({ message: '2FA enabled with email OTP' });
        } else {
            res.status(400).json({ message: 'Invalid 2FA method' });
        }
    } catch (error) {
        console.error('Error enabling 2FA:', error);
        res.status(500).json({ message: 'Error enabling 2FA', error: error.message });
    }
});

// Verify and confirm 2FA setup (for authenticator)
router.post('/verify', authenticate, async (req, res) => {
    try {
        const { token } = req.body;
        
        if (!req.user.twoFactorSecret) {
            return res.status(400).json({ message: 'No 2FA secret found. Please enable 2FA first.' });
        }

        const verified = speakeasy.totp.verify({
            secret: req.user.twoFactorSecret,
            encoding: 'base32',
            token: token,
            window: 2, // Allow 2 time steps (60 seconds) tolerance
        });

        if (verified) {
            req.user.twoFactorEnabled = true;
            req.user.twoFactorMethod = 'authenticator';
            await req.user.save();
            res.json({ message: '2FA verified and enabled successfully' });
        } else {
            res.status(400).json({ message: 'Invalid verification code' });
        }
    } catch (error) {
        console.error('Error verifying 2FA:', error);
        res.status(500).json({ message: 'Error verifying 2FA', error: error.message });
    }
});

// Generate backup codes for 2FA
router.post('/generate-backup-codes', authenticate, async (req, res) => {
    try {
        if (!req.user.twoFactorEnabled) {
            return res.status(400).json({ message: '2FA must be enabled to generate backup codes' });
        }

        // Generate 10 backup codes (8 characters each)
        const generateCode = () => {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
            let code = '';
            for (let i = 0; i < 8; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return code;
        };

        const backupCodes = Array.from({ length: 10 }, generateCode);
        
        // Hash codes before storing (in production, use bcrypt)
        req.user.twoFactorBackupCodes = backupCodes.map(code => {
            // Simple hash for demo - in production use bcrypt
            return code; // Store as-is for now, hash in production
        });
        await req.user.save();

        res.json({ 
            backupCodes,
            message: 'Backup codes generated. Save them securely - they will not be shown again!'
        });
    } catch (error) {
        console.error('Error generating backup codes:', error);
        res.status(500).json({ message: 'Error generating backup codes', error: error.message });
    }
});

// Disable 2FA
router.post('/disable', authenticate, async (req, res) => {
    try {
        req.user.twoFactorEnabled = false;
        req.user.twoFactorMethod = 'email';
        req.user.twoFactorSecret = undefined;
        req.user.twoFactorBackupCodes = undefined;
        await req.user.save();
        res.json({ message: '2FA disabled successfully' });
    } catch (error) {
        console.error('Error disabling 2FA:', error);
        res.status(500).json({ message: 'Error disabling 2FA', error: error.message });
    }
});

// Verify 2FA code during login
router.post('/verify-login', async (req, res) => {
    try {
        const { userId, token, method } = req.body;
        
        const user = await User.findById(userId);
        if (!user || !user.twoFactorEnabled) {
            return res.status(400).json({ message: '2FA not enabled for this user' });
        }

        if (method === 'authenticator' || user.twoFactorMethod === 'authenticator') {
            if (!user.twoFactorSecret) {
                return res.status(400).json({ message: '2FA secret not found' });
            }

            const verified = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token: token,
                window: 2,
            });

            if (verified) {
                res.json({ verified: true });
            } else {
                res.status(400).json({ message: 'Invalid verification code' });
            }
        } else if (method === 'email' || user.twoFactorMethod === 'email') {
            // For email OTP, check against stored OTP
            if (user.otp && user.otp.toString() === token.toString() && user.otpExpiresAt > Date.now()) {
                res.json({ verified: true });
            } else {
                res.status(400).json({ message: 'Invalid or expired OTP' });
            }
        } else {
            res.status(400).json({ message: 'Invalid 2FA method' });
        }
    } catch (error) {
        console.error('Error verifying 2FA login:', error);
        res.status(500).json({ message: 'Error verifying 2FA', error: error.message });
    }
});

// Send email OTP for 2FA
router.post('/send-email-otp', authenticate, async (req, res) => {
    try {
        if (req.user.twoFactorMethod !== 'email') {
            return res.status(400).json({ message: 'Email 2FA not enabled' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        req.user.otp = otp;
        req.user.otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
        await req.user.save();

        await sendOtpMail(req.user.email, otp);
        res.json({ message: '2FA OTP sent to email' });
    } catch (error) {
        console.error('Error sending 2FA OTP:', error);
        res.status(500).json({ message: 'Error sending OTP', error: error.message });
    }
});

module.exports = router;

