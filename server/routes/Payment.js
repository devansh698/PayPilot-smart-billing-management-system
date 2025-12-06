// server/routes/Payment.js
const express = require('express');
const Payment = require('../models/Payment');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();
require('dotenv').config();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. ROUTE: Create Razorpay Order (For Security)
router.post('/razorpay-order', async (req, res) => {
  try {
    const { amount, currency = "INR" } = req.body;
    
    const options = {
      amount: amount * 100, // Amount in paise
      currency: currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).send("Error creating order");
  }
});

// 2. ROUTE: Verify Razorpay Signature
router.post('/razorpay-verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Signature matches - Payment is Legitimate
      res.status(200).json({ message: "Payment verified successfully" });
    } else {
      res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    res.status(500).send("Error verifying payment");
  }
});

// --- Existing CRUD Routes (Keep these for your database) ---

router.post('/', async (req, res) => {
  try {
    const paymentData = req.body;
    const payment = new Payment({
      paymentId: paymentData.paymentId, // This can now be the Razorpay Transaction ID
      clientId: paymentData.clientId,
      invoiceId: paymentData.invoiceId,
      paymentMethod: paymentData.paymentMethod,
      amount: paymentData.amount,
    });
    const savedPayment = await payment.save();
    res.status(201).send(savedPayment);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error creating payment' });
  }
});

router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find().populate('clientId').populate('invoiceId').exec();
    res.send(payments);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching payments' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).exec();
    if (!payment) return res.status(404).send({ message: 'Payment not found' });
    res.send(payment);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching payment' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id).exec();
    if (!payment) return res.status(404).send({ message: 'Payment not found' });
    res.send({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Error deleting payment' });
  }
});


module.exports = router;