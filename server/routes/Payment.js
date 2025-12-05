// api/payments.js
const express = require('express');
const Payment = require('../models/Payment');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const paymentData = req.body;
    const payment = new Payment({
      paymentId: paymentData.paymentId,
      clientId: paymentData.clientId,
      invoiceId: paymentData.invoiceId,
      paymentMethod: paymentData.paymentMethod,
      amount: paymentData.amount,
    });
    console.log(payment);
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
    console.error(error);
    res.status(500).send({ message: 'Error fetching payments' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).exec();
    if (!payment) {
      return res.status(404).send({ message: 'Payment not found' });
    }
    res.send(payment);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error fetching payment' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();
    if (!payment) {
      return res.status(404).send({ message: 'Payment not found' });
    }
    res.send(payment);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error updating payment' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id).exec();
    if (!payment) {
      return res.status(404).send({ message: 'Payment not found' });
    }
    res.send({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error deleting payment' });
  }
});

module.exports = router;