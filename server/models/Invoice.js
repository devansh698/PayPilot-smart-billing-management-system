// invoice.model.js
const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNo:{
    type: String,
    required: true,
    default:"00000"
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  paymentStatus: {
    type: String,
    default: 'Pending',
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      rate: {
        type: Number,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
    },
  ],
  subtotal: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('Invoice', invoiceSchema);