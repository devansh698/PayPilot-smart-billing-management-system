const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware'); // Import the authentication middleware
const Client = require('../models/Client'); // Assuming you have a Client model
const Order = require('../models/Order.js'); // Assuming you have an Order model
const Payment = require('../models/Payment'); // Assuming you have a Payment model
const Notification = require('../models/Notification');
const Invoice = require('../models/Invoice');
const { sendOtpMail } = require('../helpers/otp');

router.post('/client-portal', (req, res) => {
    res.send('Welcome to the Client Portal');
});


// Apply middleware to all routes in this router
router.use(authMiddleware);

// Get client profile
router.get('/profile', async (req, res) => {
    try {
        const clientId = req.user._id; // Use the authenticated client's ID
        const client = await Client.findById(clientId); // Exclude password
        res.json(client);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile data' });
    }
});

// Update client profile
router.put('/profile', async (req, res) => {
    try {
        const clientId = req.user._id;
        const updatedClient = await Client.findByIdAndUpdate(clientId, req.body, { new: true });
        res.json(updatedClient);
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile' });
    }
});

// Get all orders for the client
router.get('/orders', async (req, res) => {
    try {
        const clientId = req.user._id;
        console.log(clientId);
        const orders = await Order.find({ clientId });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// Create a new order
router.post('/orders', async (req, res) => {
    try {
        const clientId = req.user._id;
        const { products, subtotal, tax, totalAmount } = req.body; 
        if (!products || products.length === 0 || !subtotal || !tax || !totalAmount) {
            return res.status(400).json({ message: 'Products, subtotal, tax, and total amount are required.' });
        }
        //console.log(products, subtotal, tax, totalAmount);r
        const newOrder = new Order({
            clientId,
            products,
            subtotal,
            tax, 
            totalAmount,
            status: 'Pending',
        });

        await newOrder.save();

        // Create a notification for the client
        const notification = new Notification({
            clientId,
            message: `Your order has been placed successfully! Order ID: ${newOrder._id}`,
            relatedto: 'order',
        });

        await notification.save();

        res.status(201).json(newOrder);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error creating order' });
    }
});

// Get order details
router.get('/orders/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order details' });
    }
});

// Get all payments for the client
router.get('/payments', async (req, res) => {
    try {
        const clientId = req.user._id;
        const payments = await Payment.find({ clientId });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payments' });
    }
});

// Process a new payment
router.post('/payments', async (req, res) => {
    try {
        const { invoiceId, amount, paymentMethod,paymentId,invoiceNo } = req.body;
        const clientId = req.user._id;
        console.log(invoiceId, amount, paymentMethod,paymentId);


        const newPayment = new Payment({ clientId, invoiceId, amount, paymentMethod,paymentId });
        console.log(newPayment);
        await newPayment.save();
        console.log("payment saved");

        // Create a notification for the client
        const notification = new Notification({
            clientId,
            message: `Payment of $${amount} received for Invoice No.: ${invoiceNo}`,
            relatedto: 'payment',
        });
        console.log("notification created");
        await notification.save();
        console.log("notification saved");

        // Update the client's notifications
        await Client.findByIdAndUpdate(clientId, { $push: { notifications: notification._id } });
        console.log("client updated");


        res.status(201).json(newPayment);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error processing payment' });
    }
});

// Get all notifications for the client
router.get('/notifications', async (req, res) => {
    try {
        const clientId = req.user._id;
        const notifications = await Notification.find({ clientId }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
});

// Mark a notification as read
router.put('/notifications/:id/read', async (req, res) => {
    try {
        const notificationId = req.user._id;
        const notification = await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json (notification);
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification' });
    }
});
router.get('/invoices', async (req, res) => {
    try {
        const clientId = req.user._id; // Get the authenticated client's ID
        const invoices = await Invoice.find({ client: clientId }).populate('client');
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching invoices' });
    }
});
router.get('/invoice', async (req, res) => {
    try {
        //const clientId = req.user._id; // Get the authenticated client's ID
        const invoices = await Invoice.find().populate('client');
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching invoices' });
    }
});
router.put('/invoices/:id', async (req, res) => {
    try {
        const { paymentStatus } = req.body;
        const invoice = await Invoice.findByIdAndUpdate(req.params.id, { paymentStatus }, { new: true });
        if (!invoice) {
            return res.status(404).send('Invoice not found');
        }
        res.send(invoice);
    } catch (error) {
        console.error('Error updating invoice:', error);
        res.status(500).send('Server error');
    }
});
router.get('/dashboaed', async (req, res) => {
    try {
        const clientId = req.user._id;

        const profile = await Client.findById(clientId);
        const recentOrders = await Order.find({ clientId }).sort({ createdAt: -1 }).limit(5);
        const recentPayments = await Payment.find({ clientId }).sort({ createdAt: -1 }).limit(5);
        const notifications = await Notification.find({ clientId }).sort({ createdAt: -1 }).limit(5);

        res.json({
            profile,
            recentOrders,
            recentPayments,
            notifications
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard data' });
    }
});
module.exports = router;