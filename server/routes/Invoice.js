// invoice.controller.js
const express = require("express");
const Invoice = require("../models/Invoice");
const Client = require("../models/Client");
const Product = require("../models/Product");
const { route } = require("./Product");
const router = require("./Product");
const Router = express.Router();

route;

Router.get("/lastinvno", async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ _id: -1 });
    if (invoices.length > 0) {
      const lastInvoice = invoices[0];
      res.json({ invoiceNo: lastInvoice.invoiceNo });
    } else {
      res.json({ error: "Invoice not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

Router.post("/", async (req, res) => {
  try {
    const { client, products, subtotal, tax, totalAmount } = req.body;

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

    for (const product of products) {
      const productId = product.product;
      const quantity = product.quantity;

      await Product.findByIdAndUpdate(productId, {
        $inc: { quantity: -quantity }
      });
    }

    res.json({ message: "Invoice created successfully and inventory updated." });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
Router.get("/", async (req, res) => {
  try {
    const invoices = await Invoice.find().populate("client");
    res.json(invoices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
Router.get("/:Id", async (req, res) => {
  try {
    const invoiceId = req.params.invoiceId;
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

Router.put("/:Id", async (req, res) => {
  try {
    const invoiceId = req.params.invoiceId;
    const { paymentStatus } = req.body;
    const invoice = await Invoice.findByIdAndUpdate(invoiceId, {
      paymentStatus,
    });
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    res.json({ message: "Invoice updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
Router.delete("/:Id", async (req, res) => {
  try {
    const invoiceId = req.params.invoiceId;
    const invoice = await Invoice.findByIdAndDelete(invoiceId);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    res.json({ message: "Invoice deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

Router.patch("/:id", async (req, res) => {
  const invoiceId = req.params.id;

  const updateData = req.body;

  try {
    const invoice = await Invoice.findByIdAndUpdate(invoiceId, updateData, {
      new: true,
    });

    res.send(invoice);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = Router;
