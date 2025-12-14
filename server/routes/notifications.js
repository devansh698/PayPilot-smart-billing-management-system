// routes/notifications.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const Client = require('../models/Client');
const jwt = require('jsonwebtoken');

// Middleware to authenticate
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Try to find user or client
        const user = await User.findById(decoded.userId || decoded.clientID);
        const client = !user ? await Client.findById(decoded.clientID || decoded.clientId) : null;
        
        req.user = user || client;
        req.userRole = decoded.role || (user ? user.role : 'client');
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

router.use(authenticate);

// Get all notifications with pagination and filtering
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', isRead, store } = req.query;

        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const filter = {};
        
        // Admin sees all notifications, others see only their own
        if (req.userRole === 'admin') {
            // Admin can see all notifications, optionally filtered by store
            if (store) {
                filter.store = store;
            }
        } else if (req.userRole === 'client') {
            filter.clientId = req.user._id;
        } else {
            // Employee sees notifications for their store
            filter.userId = req.user._id;
            if (req.user.store) {
                filter.store = req.user.store;
            }
        }
        
        if (isRead !== undefined) {
            filter.isRead = isRead === 'true';
        }

        const notifications = await Notification.find(filter)
            .sort(sort)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .populate('store', 'name');

        const totalNotifications = await Notification.countDocuments(filter);

        res.json({
            notifications,
            totalPages: Math.ceil(totalNotifications / parseInt(limit)),
            currentPage: parseInt(page),
            totalCount: totalNotifications,
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
});

// Mark a notification as read
router.put('/:id/read', async (req, res) => {
    try {
        const notificationId = req.params.id;
        const notification = await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification' });
    }
});

// Mark all notifications as read
router.put('/read-all', async (req, res) => {
    try {
        const filter = {};
        if (req.userRole === 'admin') {
            if (req.body.store) {
                filter.store = req.body.store;
            }
        } else if (req.userRole === 'client') {
            filter.clientId = req.user._id;
        } else {
            filter.userId = req.user._id;
        }

        await Notification.updateMany(filter, { isRead: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notifications' });
    }
});

module.exports = router;