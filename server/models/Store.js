const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, default: 'India' },
    },
    contact: {
        phone: { type: String, required: true },
        email: { type: String, required: true, lowercase: true },
    },
    gstNumber: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    employees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, {
    timestamps: true,
});

module.exports = mongoose.model('Store', storeSchema);

