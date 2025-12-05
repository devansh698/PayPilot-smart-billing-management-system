// routes/Order.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Client = require('../models/Client');
const authMiddleware = require('../middlewares/authMiddleware'); // Import the authMiddleware

// Get all orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().populate('clientId').populate('products.productId');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error });
    }
});

// Get a specific order by ID
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('clientId').populate('products.productId');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order', error });
    }
});

// Create a new order
router.post('/', authMiddleware, async (req, res) => {
    const { clientId, products, subtotal, tax, totalAmount } = req.body;
    try {
        const newOrder = new Order({
            clientId,
            products,
            subtotal,
            tax,
            totalAmount,
        });

        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(400).json({ message: 'Error creating order', error });
    }
});

// Update an existing order (e.g., to fulfill an order)
router.patch("/:id", async (req, res) => {
    try {
      const { status } = req.body;
      const orderId = req.params.id;
  
      const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
      
      if (!updatedOrder) {
        return res.status(404).json({ error: "Order not found" });
      }
  
      res.json({ message: "Order status updated successfully", order: updatedOrder });
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

// Delete an order
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting order', error });
    }
});

module.exports = router;