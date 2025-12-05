const express = require("express");
const Router = express.Router();
const Invoice = require("../models/Invoice");
const Client = require("../models/Client");
const Product = require("../models/Product");

Router.get("/", async (req, res) => {
  try {
    const clients = await Client.find().exec();
    const invoices = await Invoice.find().exec();
    const products = await Product.find().exec();

    const totalBilledAmount = invoices.reduce(
      (acc, invoice) => acc + invoice.totalAmount,
      0
    );
    const numberOfInvoices = invoices.length;
    const averageInvoiceValue = totalBilledAmount / numberOfInvoices;
    const recentInvoices = invoices.slice(0, 3);
    //const topClients = clients.filter(client => client.invoices).sort((a, b) => b.invoices.length - a.invoices.length).slice(0, 3);
    const topClients = await Client.aggregate([
      {
        $lookup: {
          from: "invoices",
          localField: "_id",
          foreignField: "clientId",
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
    ]);
    const overdueInvoices = invoices.filter((invoice) => {
      const dueDate = new Date(invoice.date);
      const today = new Date();
      const diffInDays = Math.abs((today - dueDate) / (1000 * 3600 * 24));
      return diffInDays >= 0 && invoice.paymentStatus === "Pending";
    });
    //const overdueInvoices = invoices.filter(invoice => invoice.date < new Date() - 30 * 24 * 60 * 60 * 1000);
    const upcomingBillingDates = invoices.filter(
      (invoice) =>
        invoice.date >= new Date() &&
        invoice.date <= new Date() + 30 * 24 * 60 * 60 * 1000
    );
    const pendingBillpayment = invoices.filter(
      (invoice) => invoice.paymentStatus === "Pending"
    );
    const totalUnbilledPayment = pendingBillpayment.reduce(
      (acc, invoice) => acc + invoice.totalAmount,
      0
    );

    const lowInventoryProducts = products.filter(
      (product) => product.quantity <= 10
    );
    const outOfStockProducts = products.filter(
      (product) => product.quantity === 0
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
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = Router;
