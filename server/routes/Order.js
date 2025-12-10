// routes/notifications.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification'); // Import Notification model
const Client = require('../models/Client'); // Import Client model
const authMiddleware = require('../middlewares/authMiddleware'); // Import the authentication middleware

// Apply middleware to all routes in this router
router.use(authMiddleware);

// Get all notifications with pagination, sorting, and filtering
// Assumes this route is for Admin view, or a client view that filters by user ID based on req.user._id
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', isRead, search = '' } = req.query;

        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1

        const filter = { clientId: req.user._id }; // Filter always by the authenticated user's ID
        
        // Additional filters
        if (isRead !== undefined) {
            filter.isRead = isRead === 'true'; 
        }
        
        if (search) {
            filter.$or = [
                { message: { $regex: search, $options: 'i' } },
                { relatedto: { $regex: search, $options: 'i' } },
            ];
        }

        const notifications = await Notification.find(filter)
            .sort(sort)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
            
        const totalNotifications = await Notification.countDocuments(filter);

        res.json({
            notifications,
            totalPages: Math.ceil(totalNotifications / parseInt(limit)),
            currentPage: parseInt(page),
            totalNotifications,
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
});

// Mark a notification as read
router.put('/:id/read', async (req, res) => {
    try {
        const notificationId = req.params.id;
        
        // 1. Find the notification to perform a security check
        const notificationToUpdate = await Notification.findById(notificationId);
        
        if (!notificationToUpdate) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        // 2. Security Check: Only allow if the notification belongs to the authenticated user
        if (notificationToUpdate.clientId.toString() !== req.user._id.toString()) {
             // In a real app, an Admin check would go here. For now, deny access.
             return res.status(403).json({ message: 'Access denied: Cannot update another user\'s notification.' });
        }
        
        // 3. Update
        const updatedNotification = await Notification.findByIdAndUpdate(notificationId, 
            { isRead: true }, 
            { new: true }
        );


        res.json(updatedNotification);
    } catch (error) {
        console.error("Error updating notification:", error);
        res.status(500).json({ message: 'Error updating notification' });
    }
});

module.exports = router;