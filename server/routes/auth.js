// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Client = require('../models/Client');
const { sendOtpMail } = require('../helpers/otp');
const router = express.Router();
const otpStorage = {}

// Generate OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Register (for Admin/Employee)
router.post('/register', async (req, res) => {
    const { username, email, phone, password} = req.body;

  if (!username || !email || !phone || !password ) {
    return res
      .status(400)
      .json({ status: 400, message: "All fields are required" });
  }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username,
            email: email.toLowerCase(), 
            phone,
            password: hashedPassword,
            role:"admin",
            otp: null,
            otpExpiresAt: null });
        await user.save();

        // Send OTP after registration
        const otp = generateOtp();
        user.otp = otp;
        user.otpExpiresAt = Date.now() + 10 * 60 * 1000; 
        await user.save();

        await sendOtpMail(email, otp);
        res.json({ message: 'OTP sent to email for verification' });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ error: 'Error creating user', details: error.message });
    }
});

// Verify OTP for Registration
router.post('/verify-otp-register', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || user.otp.toString() !== otp || user.otpExpiresAt < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
        user.otp = undefined;
        user.otpExpiresAt = undefined;
        await user.save();

        res.json({ message: 'Registration successful. Please proceed to login.' });
    } catch (error) {
        console.error("Verify OTP Register Error:", error);
        res.status(500).json({ error: 'Error verifying OTP', details: error.message });
    }
});
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Send OTP after successful login
        const otp = generateOtp();
        user.otp = otp;
        user.otpExpiresAt = Date.now() + 10 * 60 * 1000; 
        await user.save();

        try {
            await sendOtpMail(email, otp);
            res.json({ message: 'OTP sent to email for verification' });
        } catch (error) {
            console.error("Failed to send OTP:", error);
            res.status(500).json({ message: 'Failed to send OTP.'});
        }
        
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: 'Error logging in' });
    }
});

// Verify OTP for Login (Admin/Employee)
router.post('/verify-otp-login', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        
        if (user.otpExpiresAt < Date.now()) {
            return res.status(400).json({ message: 'OTP expired' });
        }
        
        if (user.otp != otp) { 
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        user.otp = undefined;
        user.otpExpiresAt = undefined;
        await user.save();

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, userId: user._id, role: user.role });
    } catch (error) {
        console.error("Verify OTP Login Error:", error);
        res.status(500).json({ error: 'Error verifying OTP' });
    }
});

// Get User Profile (Admin/Employee)
router.get('/me', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

// Client: Send OTP
router.post('/client/send-otp', async (req, res) => {
    const body = req.body;

    try {
        const client = await Client.findOne({ email: body.email.toLowerCase() });
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const OTP = generateOtp();
        otpStorage[client.email.toLowerCase()] = { otp: OTP, expiresAt: Date.now() + 10 * 60 * 1000 };
        try {
            await sendOtpMail(client.email, OTP);
            res.json({ success: true , message: 'OTP sent to email for verification' });
        } catch (error) {
            console.error("Client Send OTP Mail Error:", error);
            res.status(500).json({ message: 'Failed to send OTP: ' + error.message });
        }
    } catch (error) {
        console.error("Client Send OTP Error:", error);
        res.status(500).json({ error: 'Error sending OTP: ' + error.message });
    }
});

// Client: Verify OTP
router.post('/client/verify-otp',async (req, res) => {
    const { email, otp } = req.body;
    const lowerCaseEmail = email.toLowerCase();
    
    if (!otpStorage[lowerCaseEmail]) {
        return res.status(404).json({ message: 'OTP not found or expired' });
    }

    const storedOtpData = otpStorage[lowerCaseEmail];
    if (Date.now() > storedOtpData.expiresAt) {
        delete otpStorage[lowerCaseEmail];
        return res.status(400).json({ message: 'OTP has expired' });
    }
    if (storedOtpData.otp == otp.toString()) { 
        const client = await Client.findOne({ email: lowerCaseEmail });
        if (!client) {
             return res.status(404).json({ message: 'Client not found' });
        }
        delete otpStorage[lowerCaseEmail];
        // Token generation for Client
        const token = jwt.sign({ clientID: client._id, role: 'client' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ success:true, token: token, clientID: client._id });
    } else {
        return res.status(400).json({ message: 'Invalid OTP' });
    }
});

// Get Client Profile - *** FIX: Use decoded.clientID ***
router.get('/client/me', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // FIXED: Using decoded.clientID as set in /client/verify-otp
        const client = await Client.findById(decoded.clientID).select('-password'); 
        if (!client) return res.status(404).json({ message: 'Client not found' });
        res.json(client);
    } catch (error) {
        console.error("Client Me Error:", error);
        res.status(401).json({ message: 'Unauthorized or Invalid Token' });
    }
});

module.exports = router;