// client.model.js
const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
    },
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    company: {
        name: {
            type: String,
        },
        gstNumber: {
            type: String,
        },
    },
    address: {
        type: String,
        required: true,
    },
    code: {
        type: Number,
        required: true,
    },
    country: {
        type: String,
    },
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    pendingdues: {
        type: Number,
        default: 0,
    },
    totalbought: {
        type: Number,
        default: 0,
    },
    totalpaid: {
        type: Number,
        default: 0,
    },
    invoices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' }],
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }] // New field for notifications
});

module.exports = mongoose.model('Client', clientSchema);