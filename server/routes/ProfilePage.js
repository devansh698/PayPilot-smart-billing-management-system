const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware'); // *** NEW: Import middleware ***

// Apply authentication middleware
router.use(authMiddleware);

// Get User Profile
router.get('/', async (req, res) => {
  try {
    // *** FIX: Use req.user._id (populated by authMiddleware) ***
    const user = await User.findById(req.user._id).select('-password -otp -otpExpiresAt').exec(); 
    if (!user) {
        return res.status(404).send({ message: 'User not found' });
    }
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error fetching user profile' });
  }
});

module.exports = router;