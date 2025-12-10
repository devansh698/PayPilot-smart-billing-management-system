const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware'); 
const Client = require('../models/Client'); 
const Order = require('../models/Order.js'); 
const Product = require('../models/Product'); // *** NEW: Imported Product model for stock update ***
const Payment = require('../models/Payment'); 
const Notification = require('../models/Notification');
const Invoice = require('../models/Invoice');
const { sendOtpMail } = require('../helpers/otp');

router.post('/client-portal', (req, res) => {
    res.send('Welcome to the Client Portal');
});


// Apply middleware to all routes in this router
router.use(authMiddleware);

// Helper function for paginated fetch (used internally)
const fetchPaginatedData = async (Model, clientId, req) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search = '' } = req.query;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const filter = { clientId }; // Filter by the authenticated client's ID
    
    // Generic search filtering (adjust fields based on Model schema)
    if (search) {
        if (Model.modelName === 'Order') {
            filter.$or = [
                { status: { $regex: search, $options: 'i' } },
            ];
        } else if (Model.modelName === 'Payment') {
            filter.$or = [
                { paymentMethod: { $regex: search, $options: 'i' } },
            ];
        } else if (Model.modelName === 'Notification') {
            filter.$or = [
                { message: { $regex: search, $options: 'i' } },
            ];
        } else if (Model.modelName === 'Invoice') {
             // Invoices are handled separately below to filter by `client` field
        }
    }


    const data = await Model.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalCount = await Model.countDocuments(filter);

    return {
        data,
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        currentPage: parseInt(page),
        totalCount,
    };
};

// Get client profile
router.get('/profile', async (req, res) => {
    try {
        const clientId = req.user._id; 
        const client = await Client.findById(clientId).select('-password'); 
        res.json(client);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile data' });
    }
});

// Update client profile
router.put('/profile', async (req, res) => {
    try {
        const clientId = req.user._id;
        const updateData = req.body;
        delete updateData.role; 
        delete updateData.password; 

        const updatedClient = await Client.findByIdAndUpdate(clientId, updateData, { new: true, runValidators: true });
        res.json(updatedClient);
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
});

// Get all orders for the client with pagination/sorting/filtering
router.get('/orders', async (req, res) => {
    try {
        const clientId = req.user._id;
        const { data: orders, totalPages, currentPage, totalCount } = await fetchPaginatedData(Order, clientId, req);
        res.json({ orders, totalPages, currentPage, totalCount });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// Create a new order - *** FIX: Deduct product stock ***
router.post('/orders', async (req, res) => {
    try {
        const clientId = req.user._id;
        const { products, subtotal, tax, totalAmount } = req.body; 
        if (!products || products.length === 0 || !subtotal || !tax || !totalAmount) {
            return res.status(400).json({ message: 'Products, subtotal, tax, and total amount are required.' });
        }
        
        // 1. Check current stock and prepare for update
        const productUpdates = products.map(p => ({
            id: p.productId,
            quantity: p.quantity
        }));

        for (const update of productUpdates) {
            const product = await Product.findById(update.id);
            if (!product) {
                return res.status(404).json({ message: `Product with ID ${update.id} not found.` });
            }
            if (product.quantity < update.quantity) {
                return res.status(400).json({ message: `Insufficient stock for product ${product.name}. Available: ${product.quantity}, Requested: ${update.quantity}` });
            }
        }


        // 2. Create the order
        const newOrder = new Order({
            clientId,
            products,
            subtotal,
            tax, 
            totalAmount,
            status: 'Pending', 
        });

        await newOrder.save();

        // 3. Update product stock (deduct quantities)
        for (const update of productUpdates) {
            await Product.findByIdAndUpdate(update.id, { $inc: { quantity: -update.quantity } });
        }
        
        // 4. Create and save notification
        const notification = new Notification({
            clientId,
            message: `Your order has been placed successfully! Order ID: ${newOrder._id}`,
            relatedto: 'order',
        });

        await notification.save();

        res.status(201).json(newOrder);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
});

// Get order details
router.get('/orders/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        // Security check
        if (order.clientId.toString() !== req.user._id.toString()) {
             return res.status(403).json({ message: 'Access denied to this order' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order details' });
    }
});

// Get all payments for the client with pagination/sorting/filtering
router.get('/payments', async (req, res) => {
    try {
        const clientId = req.user._id;
        const { data: payments, totalPages, currentPage, totalCount } = await fetchPaginatedData(Payment, clientId, req);
        res.json({ payments, totalPages, currentPage, totalCount });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payments' });
    }
});

// Process a new payment
router.post('/payments', async (req, res) => {
    try {
        const { invoiceId, amount, paymentMethod, paymentId, invoiceNo } = req.body;
        const clientId = req.user._id;
        console.log(invoiceId, amount, paymentMethod, paymentId);


        const newPayment = new Payment({ clientId, invoiceId, amount, paymentMethod, paymentId });
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
        res.status(500).json({ message: 'Error processing payment', error: error.message });
    }
});

// Get all notifications for the client with pagination/sorting/filtering
router.get('/notifications', async (req, res) => {
    try {
        const clientId = req.user._id;
        const { data: notifications, totalPages, currentPage, totalCount } = await fetchPaginatedData(Notification, clientId, req);
        res.json({ notifications, totalPages, currentPage, totalCount });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
});

// Mark a notification as read - *** FIX: Use req.params.id for notificationId ***
router.put('/notifications/:id/read', async (req, res) => {
    try {
        const notificationId = req.params.id; // *** FIXED BUG: Now uses req.params.id ***
        const notification = await Notification.findById(notificationId);
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        // Security check: ensure the client can only mark their own notifications as read
        if (notification.clientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied to this notification' });
        }
        
        const updatedNotification = await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });

        res.json(updatedNotification);
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification' });
    }
});

// Get all invoices for the client with pagination/sorting/filtering
router.get('/invoices', async (req, res) => {
    try {
        const clientId = req.user._id; // Get the authenticated client's ID
        const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc', search = '' } = req.query;

        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const filter = { client: clientId }; 
        if (search) {
             filter.$or = [
                { invoiceNumber: { $regex: search, $options: 'i' } },
                { paymentStatus: { $regex: search, $options: 'i' } },
            ];
        }

        const invoices = await Invoice.find(filter)
            .populate('client')
            .sort(sort)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
        
        const totalInvoices = await Invoice.countDocuments(filter);
        
        res.json({
            invoices,
            totalPages: Math.ceil(totalInvoices / parseInt(limit)),
            currentPage: parseInt(page),
            totalInvoices,
        });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching invoices' });
    }
});

// Admin-like route for all invoices (assuming temporary)
router.get('/invoice', async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc', search = '' } = req.query;
        
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const filter = {}; 
        if (search) {
             filter.$or = [
                { invoiceNumber: { $regex: search, $options: 'i' } },
                { paymentStatus: { $regex: search, $options: 'i' } },
            ];
        }

        const invoices = await Invoice.find(filter)
            .populate('client')
            .sort(sort)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
        
        const totalInvoices = await Invoice.countDocuments(filter);
        
        res.json({
            invoices,
            totalPages: Math.ceil(totalInvoices / parseInt(limit)),
            currentPage: parseInt(page),
            totalInvoices,
        });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching invoices' });
    }
});

router.put('/invoices/:id', async (req, res) => {
    try {
        const { paymentStatus } = req.body;
        
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) {
            return res.status(404).send('Invoice not found');
        }
        
        // Security Check
        if (invoice.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied to update this invoice' });
        }

        const updatedInvoice = await Invoice.findByIdAndUpdate(req.params.id, { paymentStatus }, { new: true, runValidators: true });

        res.send(updatedInvoice);
    } catch (error) {
        console.error('Error updating invoice:', error);
        res.status(500).send('Server error');
    }
});
router.get('/dashboaed', async (req, res) => {
    try {
        const clientId = req.user._id;

        const profile = await Client.findById(clientId).select('-password');
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