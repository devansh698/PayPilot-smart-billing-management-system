// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    message: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    relatedto: {
        type: String,
        enum: ['order', 'payment', 'invoice', 'product', 'client', 'system'],
        required: true,
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
    },
});

module.exports = mongoose.model('Notification', notificationSchema);