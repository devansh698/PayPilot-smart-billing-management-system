// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const Client = require('../models/Client'); // Assuming you have a Client model

const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await Client.findById(decoded.clientID);

        if (!req.user) {
            return res.status(401).json({ message: 'User not found.' });
        }

        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(400).json({ message: 'Invalid token.' });
    }
};

const roleMiddleware = (requiredRole) => async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'User not found.' });
    }

    if (req.user.role !== requiredRole) {
        return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }

    next();
};

module.exports = { authMiddleware, roleMiddleware };

module.exports = authMiddleware;