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

// Register
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
            email,
            phone,
            password: hashedPassword,
            role:"admin",
            otp: null,
            otpExpiresAt: null });
        await user.save();

        // Send OTP after registration
        const otp = generateOtp();
        console.log(otp);
        user.otp = otp;
        user.otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiration
        await user.save();

        await sendOtpMail(email, otp);
        res.json({ message: 'OTP sent to email for verification' });
    } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
});

// Verify OTP for Registration
router.post('/verify-otp-register', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });
        if ( user.otp.toString() !== otp) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
        user.otp = undefined;
        user.otpExpiresAt = undefined;
        await user.save();

        res.json({ message: 'Registration successful' });
    } catch (error) {
        res.status(500).json({ error: 'Error verifying OTP' });
    }
});
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
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
        user.otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiration
        await user.save();

        try {
            await sendOtpMail(email, otp);
            res.json({ message: 'OTP sent to email for verification' });
        } catch (error) {
            res.status(500).json({ message: 'Failed to send OTP.'+error });
        }
        
        //res.json({ message: 'OTP sent to email for verification' });
    } catch (error) {
        res.status(500).json({ error: 'Error logging in' });
    }
});

// Verify OTP for Login
router.post('/verify-otp-login', async (req, res) => {
    const { email, otp } = req.body;
    //console.log(email, otp);

    try {
        const user = await User.findOne({ email });
        //console.log(user);
        
        if (!user) {
            return res.status(400).json({ message: 'User  not found' });
        }
        
        if (user.otpExpiresAt < Date.now()) {
            return res.status(400).json({ message: 'OTP expired' });
        }
        
        if (user.otp == otp) {
            console.log("otp matched");
        }
        else{
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        //console.log("otp verified");
        user.otp = undefined;
        user.otpExpiresAt = undefined;
        await user.save();
        //console.log("user saved");

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
        //res.json({ token, userId: user._id });
        //console.log("token generated");
    } catch (error) {
        res.status(500).json({ error: 'Error verifying OTP' });
    }
});

// Get User Profile
router.get('/me', async (req, res) => {
    console.log(req.headers);
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        res.json(user);
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }
});
router.post('/client/send-otp', async (req, res) => {
    const body = req.body;

    try {
        const client = await Client.findOne({ email: body.email.toLowerCase() });
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const OTP = generateOtp();
        otpStorage[client.email] = { otp: OTP, expiresAt: Date.now() + 10 * 60 * 1000 };
        try {
            await sendOtpMail(client.email, OTP);
            res.json({ success: true , message: 'OTP sent to email for verification' });
        } catch (error) {
            res.status(500).json({ message: 'Failed to send OTP: ' + error.message });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error sending OTP: ' + error.message });
    }
});
router.post('/client/verify-otp',async (req, res) => {
    const { email, otp } = req.body;
    if (!otpStorage[email]) {
        return res.status(404).json({ message: 'OTP not found or expired' });
    }

    const storedOtpData = otpStorage[email];
    if (Date.now() > storedOtpData.expiresAt) {
        delete otpStorage[email];
        return res.status(400).json({ message: 'OTP has expired' });
    }
    if (storedOtpData.otp === otp.toString()) {
        const client = await Client.findOne({ email: email.toLowerCase() });
        delete otpStorage[email];
        const token = jwt.sign({clientID: client._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ success:true,token:token });
    } else {
        return res.status(400).json({ message: 'Invalid OTP' });
    }
});
router.get('/client/me', async (req, res) => {
    console.log(req.headers);
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await Client.findById(decoded.userId).select('-password');
        res.json(user);
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }
});
module.exports = router;
