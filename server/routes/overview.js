const express = require("express");
const Router = express.Router();
const Invoice = require("../models/Invoice");
const Client = require("../models/Client");
const Product = require("../models/Product");

// Helper to ensure values are numbers (copied from chartsdata.js for robustness)
const toNum = (val) => Number(val) || 0; 

Router.get("/", async (req, res) => {
  try {
    const clients = await Client.find().exec();
    const invoices = await Invoice.find().exec();
    const products = await Product.find().exec();

    const totalBilledAmount = invoices.reduce(
      (acc, invoice) => acc + toNum(invoice.totalAmount), // *** FIXED with toNum ***
      0
    );
    const numberOfInvoices = invoices.length;
    const averageInvoiceValue = numberOfInvoices > 0 ? totalBilledAmount / numberOfInvoices : 0;
    const recentInvoices = invoices.sort((a, b) => b.date - a.date).slice(0, 3); // Sorted for correctness
    
    // Aggregate Top Clients
    const topClients = await Client.aggregate([
      {
        $lookup: {
          from: "invoices",
          localField: "_id",
          foreignField: "client", // Assuming 'client' is the field in Invoice model for Client ID
          as: "invoices",
        },
      },
      {
        $addFields: {
          invoiceCount: { $size: "$invoices" },
        },
      },
      {
        $sort: { invoiceCount: -1 },
      },
      {
        $limit: 3,
      },
      {
          $project: { password: 0, otp: 0, otpExpiresAt: 0 } // Exclude sensitive fields
      }
    ]);
    
    // *** FIX: Simplified overdue logic to strictly check payment status ***
    const overdueInvoices = invoices.filter((invoice) => {
        // Assuming overdue is any invoice where paymentStatus is "Pending"
        // If a due date check is needed, the Invoice model should have a dueDate field.
        return invoice.paymentStatus && invoice.paymentStatus.toLowerCase() === "pending"; 
    });
    
    // Filter for upcoming invoices (in the next 30 days)
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const today = new Date();
    
    const upcomingBillingDates = invoices.filter(
      (invoice) =>
        invoice.date >= today &&
        invoice.date <= thirtyDaysFromNow
    );
    
    const pendingBillpayment = overdueInvoices; // pendingBillpayment is the same as overdueInvoices if based on status
    
    const totalUnbilledPayment = pendingBillpayment.reduce(
      (acc, invoice) => acc + toNum(invoice.totalAmount), // *** FIXED with toNum ***
      0
    );

    const lowInventoryProducts = products.filter(
      (product) => toNum(product.quantity) <= 10
    );
    const outOfStockProducts = products.filter(
      (product) => toNum(product.quantity) === 0
    );

    const lowInventoryProductsList = lowInventoryProducts.map((product) => ({
      name: product.name,
      quantity: product.quantity,
    }));
    const outOfStockProductsList = outOfStockProducts.map((product) => ({
      name: product.name,
      quantity: product.quantity,
    }));

    res.json({
      totalBilledAmount,
      numberOfInvoices,
      averageInvoiceValue,
      recentInvoices,
      topClients,
      overdueInvoices,
      upcomingBillingDates,
      totalUnbilledPayment,
      lowInventoryProducts: lowInventoryProductsList,
      outOfStockProducts: outOfStockProductsList,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});
module.exports = Router;