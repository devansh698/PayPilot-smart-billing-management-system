const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");
const Client = require("../models/Client");
const Product = require("../models/Product");
const Payment = require("../models/Payment");

// Define functions for each API endpoint
async function getTotalBilledAmount() {
  try {
    const invoices = await Invoice.find().select("totalAmount");
    const totalBilledAmount = invoices.reduce(
      (acc, invoice) => acc + invoice.totalAmount,
      0
    );
    return totalBilledAmount;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getNumberOfInvoices() {
  try {
    const count = await Invoice.countDocuments();
    return count;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getAverageInvoiceValue() {
  try {
    const invoices = await Invoice.find().select("totalAmount");
    const sum = invoices.reduce((acc, invoice) => acc + invoice.totalAmount, 0);
    const averageInvoiceValue = sum / invoices.length;
    return averageInvoiceValue;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getRecentInvoices() {
  try {
    const invoices = await Invoice.find().sort({ date: -1 }).limit(5);
    return invoices;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getTopClients() {
  try {
    const clients = await Client.find().populate("invoices");
    const sortedClients = clients.sort(
      (a, b) => b.invoices.length - a.invoices.length
    );
    const topClients = sortedClients.slice(0, 5);
    return topClients;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getOverdueInvoices() {
  try {
    const overdueInvoices = await Invoice.find({
      paymentStatus: "pending",
    });
    return overdueInvoices;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getTotalUnbilledPayment() {
  try {
    const invoices = await Invoice.find({ paymentStatus: "Pending" }).select(
      "totalAmount"
    );
    const totalUnbilledPayment = invoices.reduce(
      (acc, invoice) => acc + invoice.totalAmount,
      0
    );
    return totalUnbilledPayment;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getLowInventoryProducts() {
  try {
    const products = await Product.find({ quantity: { $lt: 5 } });
    return products;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
async function getProductinventory() {
  try {
    const products = await Product.find().select("quantity");
    const totalquantity = products.reduce(
      (acc, product) => acc + product.quantity,
      0
    );
    return totalquantity;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
async function getProductviseinventory() {
  try {
    const products = await Product.find().select("quantity").select("name");
    return products;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getOutOfStockProducts() {
  try {
    const products = await Product.find({ quantity: 0 });
    return products;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getSalesReport() {
  try {
    const sales = await Invoice.aggregate([
      {
        $group: {
          _id: { $month: "$date" },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);
    return sales;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
async function getDailySalesReport() {
  try {
    const salesReport = await Invoice.aggregate([
      {
        $match: {
          date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);
    return salesReport;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
async function productsalsereport1() {
  try {
    const invoices = await Invoice.find()
      .populate({
        path: "products",
        populate: {
          path: "product",
          model: "Product",
        },
      })
      .exec();
    const reports = invoices.reduce((acc, invoice) => {
      const filteredProducts = invoice.products.filter(
        (product) => product !== null
      );
      filteredProducts.forEach((product) => {
        if (product.product !== null) {
          const productId = product.product._id;
          const productName = product.product.name;
          const totalSales = acc[productId]
            ? acc[productId].totalSales + product.amount
            : product.amount;
          const totalOrders = acc[productId]
            ? acc[productId].totalOrders + 1
            : 1;
          acc[productId] = { productId, productName, totalSales, totalOrders };
        }
      });
      return acc;
    }, {});
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error fetching sales reports by product" });
  }
}

async function getDailyPaymentReport() {
  try {
    const paymentReport = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalPaid: { $sum: "$amount" },
        },
      },
    ]);
    return paymentReport;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getDailyStockReport() {
  try {
    const stockReport = await Product.aggregate([
      {
        $match: {
          updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
          totalQuantity: { $sum: "$quantity" },
        },
      },
    ]);
    return stockReport;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
async function getTotalPaymentReceived() {
  try {
    const payments = await Payment.find().select("amount");
    const totalPaymentReceived = payments.reduce(
      (acc, payment) => acc + payment.amount,
      0
    );
    return totalPaymentReceived;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
async function getTotalNumberOfPayments() {
  try {
    const payments = await Payment.find();
    const totalNumberOfPayments = payments.length;
    return totalNumberOfPayments;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getAveragePaymentAmount() {
  try {
    const payments = await Payment.find().select("amount");
    const totalPaymentAmount = payments.reduce(
      (acc, payment) => acc + payment.amount,
      0
    );
    const averagePaymentAmount = totalPaymentAmount / payments.length;
    return averagePaymentAmount;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// API Endpoints

router.get("/all-data", async (req, res) => {
  try {
    const totalBilledAmount = await getTotalBilledAmount();
    const numberOfInvoices = await getNumberOfInvoices();
    const averageInvoiceValue = await getAverageInvoiceValue();
    const recentInvoices = await getRecentInvoices();
    const topClients = await getTopClients();
    const overdueInvoices = await getOverdueInvoices();
    const totalUnbilledPayment = await getTotalUnbilledPayment();
    const lowInventoryProducts = await getLowInventoryProducts();
    const outOfStockProducts = await getOutOfStockProducts();
    const salesReport = await getSalesReport();
    const dailySalesReport = await getDailySalesReport();
    const dailyPaymentReport = await getDailyPaymentReport();
    const dailyStockReport = await getDailyStockReport();
    const totalPaymentRecived = await getTotalPaymentReceived();
    const totalNumberOfPayments = await getTotalNumberOfPayments();
    const averagePaymentAmount = await getAveragePaymentAmount();
    const totalquantity = await getProductinventory();
    const productinventory = await getProductviseinventory();
    const productsalsereport = await productsalsereport1();

    const allData = {
      totalquantity,
      totalBilledAmount,
      numberOfInvoices,
      averageInvoiceValue,
      recentInvoices,
      topClients,
      overdueInvoices,
      productinventory,
      totalUnbilledPayment,
      lowInventoryProducts,
      outOfStockProducts,
      salesReport,
      dailySalesReport,
      dailyPaymentReport,
      dailyStockReport,
      totalPaymentRecived,
      totalNumberOfPayments,
      averagePaymentAmount,
      productsalsereport,
      noofoverdueInvoices: numberOfInvoices - totalNumberOfPayments,
      nooflowInventoryProducts: lowInventoryProducts.length,
      noofoutOfStockProducts: outOfStockProducts.length,
    };

    res.json(allData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching all data" });
  }
});
module.exports = router;
