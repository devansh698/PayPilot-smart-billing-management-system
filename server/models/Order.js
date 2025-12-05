// models/Order.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const productSchema = new Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true }
});
const orderSchema = new mongoose.Schema({
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    products: [productSchema], 
    status: { type: String, default: 'Pending' },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);