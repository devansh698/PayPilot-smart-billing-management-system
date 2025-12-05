// models/Notification.js
const mongoose = require('mongoose');
const { options } = require('../routes/Product');

const notificationSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
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
        enum: ['order', 'payment'],
        required: true,
    },
});

module.exports = mongoose.model('Notification', notificationSchema);