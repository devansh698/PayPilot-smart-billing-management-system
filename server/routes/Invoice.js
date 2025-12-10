// invoice.controller.js
const express = require("express");
const Invoice = require("../models/Invoice");
const Client = require("../models/Client");
const Product = require("../models/Product");
const Router = express.Router();

Router.get("/lastinvno", async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ _id: -1 });
    if (invoices.length > 0) {
      const lastInvoice = invoices[0];
      res.json({ invoiceNo: lastInvoice.invoiceNo });
    } else {
      res.json({ invoiceNo: "00000" }); 
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create new invoice (Kept existing stock deduction logic and added checks)
Router.post("/", async (req, res) => {
  try {
    const { client, products, subtotal, tax, totalAmount } = req.body;

    if (!client || !products || products.length === 0 || !totalAmount) {
         return res.status(400).json({ error: "Client, products, and totalAmount are required." });
    }
    
    // Check stock before creation
     for (const productItem of products) {
        const product = await Product.findById(productItem.product);
        if (!product) {
            return res.status(404).json({ message: `Product with ID ${productItem.product} not found.` });
        }
        if (product.quantity < productItem.quantity) {
            return res.status(400).json({ message: `Insufficient stock for product ${product.name}. Available: ${product.quantity}, Requested: ${productItem.quantity}` });
        }
    }


    const invoices = await Invoice.find().sort({ _id: -1 }).limit(1);
    const lastInvoiceNo = invoices.length > 0 ? invoices[0].invoiceNo : "00000";
    const newInvoiceNo = (parseInt(lastInvoiceNo, 10) + 1).toString().padStart(5, '0');

    const clientDoc = await Client.findById(client);
    if (!clientDoc) {
      return res.status(404).json({ error: "Client not found" });
    }

    const invoice = new Invoice({
      invoiceNo: newInvoiceNo,
      client: clientDoc._id,
      date: new Date(),
      paymentStatus: "Pending",
      products,
      subtotal,
      tax,
      totalAmount,
    });

    await invoice.save();

    // Deduct stock after successful invoice creation
    for (const product of products) {
      const productId = product.product;
      const quantity = product.quantity;

      await Product.findByIdAndUpdate(productId, {
        $inc: { quantity: -quantity }
      });
    }

    res.json({ message: "Invoice created successfully and inventory updated.", invoiceNo: newInvoiceNo });
  } catch (err) {
    console.error("Error creating invoice:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// Get all invoices with pagination, sorting, and filtering
Router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc', search = '', paymentStatus } = req.query;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const filter = {};
    if (search) {
        filter.$or = [
            { invoiceNo: { $regex: search, $options: 'i' } },
            { paymentStatus: { $regex: search, $options: 'i' } },
        ];
    }
    if (paymentStatus) {
        filter.paymentStatus = paymentStatus;
    }
    
    const invoices = await Invoice.find(filter)
      .populate("client", 'name email')
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get a specific invoice by ID - Parameter changed to :id
Router.get("/:id", async (req, res) => {
  try {
    const invoiceId = req.params.id; 
    const invoice = await Invoice.findById(invoiceId)
      .populate("client")
      .populate("products.product");
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update payment status - Parameter changed to :id
Router.put("/:id", async (req, res) => {
  try {
    const invoiceId = req.params.id; 
    const { paymentStatus } = req.body;
    
    const invoice = await Invoice.findByIdAndUpdate(invoiceId, {
      paymentStatus,
    }, { new: true, runValidators: true }); // Added validation
    
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    res.json({ message: "Invoice updated successfully", invoice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// Delete an invoice - Parameter changed to :id & *** FIX: Restore stock ***
Router.delete("/:id", async (req, res) => {
  try {
    const invoiceId = req.params.id; 
    
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Restore stock 
    for (const productItem of invoice.products) {
        await Product.findByIdAndUpdate(productItem.product, {
            $inc: { quantity: productItem.quantity }
        });
    }

    await Invoice.findByIdAndDelete(invoiceId);

    res.json({ message: "Invoice deleted successfully and stock restored" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting invoice", details: err.message });
  }
});

// Patch route - Parameter changed to :id
Router.patch("/:id", async (req, res) => {
  const invoiceId = req.params.id;
  const updateData = req.body;

  try {
    const invoice = await Invoice.findByIdAndUpdate(invoiceId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
    }
    res.send(invoice);
  } catch (error) {
    console.error("Error updating invoice:", error);
    res.status(500).send({ error: "Internal Server Error", details: error.message });
  }
});

module.exports = Router;