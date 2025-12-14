const express = require('express');
const router = express.Router();
const Store = require('../models/Store');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to authenticate and get user
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.userId);
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

// Get all stores (admin only or user's assigned store)
router.get('/', authenticate, async (req, res) => {
    try {
        let stores;
        if (req.user.role === 'admin') {
            stores = await Store.find().populate('createdBy', 'username email').populate('employees', 'username email role');
        } else if (req.user.store) {
            stores = await Store.find({ _id: req.user.store }).populate('createdBy', 'username email').populate('employees', 'username email role');
        } else {
            return res.status(403).json({ message: 'No store assigned' });
        }
        res.json(stores);
    } catch (error) {
        console.error('Error fetching stores:', error);
        res.status(500).json({ message: 'Error fetching stores', error: error.message });
    }
});

// Get single store
router.get('/:id', authenticate, async (req, res) => {
    try {
        const store = await Store.findById(req.params.id).populate('createdBy', 'username email').populate('employees', 'username email role');
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        
        // Check if user has access (admin or assigned to this store)
        if (req.user.role !== 'admin' && req.user.store?.toString() !== store._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        res.json(store);
    } catch (error) {
        console.error('Error fetching store:', error);
        res.status(500).json({ message: 'Error fetching store', error: error.message });
    }
});

// Create new store (admin only)
router.post('/', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can create stores' });
        }

        const { name, address, contact, gstNumber } = req.body;
        
        if (!name || !address || !contact) {
            return res.status(400).json({ message: 'Name, address, and contact are required' });
        }

        const store = new Store({
            name,
            address,
            contact,
            gstNumber,
            createdBy: req.user._id,
        });

        await store.save();
        res.status(201).json(store);
    } catch (error) {
        console.error('Error creating store:', error);
        res.status(500).json({ message: 'Error creating store', error: error.message });
    }
});

// Update store (admin only)
router.put('/:id', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can update stores' });
        }

        const store = await Store.findById(req.params.id);
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        const { name, address, contact, gstNumber, isActive } = req.body;
        
        if (name) store.name = name;
        if (address) store.address = address;
        if (contact) store.contact = contact;
        if (gstNumber !== undefined) store.gstNumber = gstNumber;
        if (isActive !== undefined) store.isActive = isActive;

        await store.save();
        res.json(store);
    } catch (error) {
        console.error('Error updating store:', error);
        res.status(500).json({ message: 'Error updating store', error: error.message });
    }
});

// Delete store (admin only)
router.delete('/:id', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can delete stores' });
        }

        const store = await Store.findById(req.params.id);
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        await Store.findByIdAndDelete(req.params.id);
        res.json({ message: 'Store deleted successfully' });
    } catch (error) {
        console.error('Error deleting store:', error);
        res.status(500).json({ message: 'Error deleting store', error: error.message });
    }
});

// Assign employee to store (admin only)
router.post('/:id/employees', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can assign employees' });
        }

        const { employeeId } = req.body;
        if (!employeeId) {
            return res.status(400).json({ message: 'Employee ID is required' });
        }

        const store = await Store.findById(req.params.id);
        const employee = await User.findById(employeeId);

        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        if (!store.employees.includes(employeeId)) {
            store.employees.push(employeeId);
            await store.save();
        }

        employee.store = store._id;
        await employee.save();

        res.json({ message: 'Employee assigned successfully', store });
    } catch (error) {
        console.error('Error assigning employee:', error);
        res.status(500).json({ message: 'Error assigning employee', error: error.message });
    }
});

// Remove employee from store (admin only)
router.delete('/:id/employees/:employeeId', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can remove employees' });
        }

        const store = await Store.findById(req.params.id);
        const employee = await User.findById(req.params.employeeId);

        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        store.employees = store.employees.filter(id => id.toString() !== req.params.employeeId);
        await store.save();

        employee.store = undefined;
        await employee.save();

        res.json({ message: 'Employee removed successfully', store });
    } catch (error) {
        console.error('Error removing employee:', error);
        res.status(500).json({ message: 'Error removing employee', error: error.message });
    }
});

module.exports = router;

