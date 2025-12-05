// routes/notifications.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification'); // Import Notification model
const Client = require('../models/Client'); // Import Client model
const authMiddleware = require('../middlewares/authMiddleware'); // Import the authentication middleware

// Apply middleware to all routes in this router
router.use(authMiddleware);

// Get all notifications for the client
router.get('/', async (req, res) => {
    try {
        const clientId = req.user._id;
        const notifications = await Notification.find({ clientId }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications' });
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

module.exports = router;