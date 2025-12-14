const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");
const Client = require("../models/Client");
const Product = require("../models/Product");
const Payment = require("../models/Payment");

// Define functions for each API endpoint

// Helper to ensure values are numbers
const toNum = (val) => Number(val) || 0;

async function getTotalBilledAmount() {
  try {
    // Aggregation for robust calculation of sum
    const result = await Invoice.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    return toNum(result[0]?.total);
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
    const sum = invoices.reduce((acc, invoice) => acc + toNum(invoice.totalAmount), 0);
    const averageInvoiceValue = invoices.length > 0 ? sum / invoices.length : 0;
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
    // Note: This relies on the Client schema having a populated 'invoices' array.
    const clients = await Client.find().populate("invoices"); 
    const sortedClients = clients.sort(
      (a, b) => (b.invoices ? b.invoices.length : 0) - (a.invoices ? a.invoices.length : 0)
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
    // Assuming 'Pending' is the status for unfulfilled/overdue invoices
    const overdueInvoices = await Invoice.find({
      paymentStatus: { $regex: /pending/i }, // Case-insensitive for robustness
    });
    return overdueInvoices;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getTotalUnbilledPayment() {
  try {
    const invoices = await Invoice.find({ paymentStatus: { $regex: /pending/i } }).select(
      "totalAmount"
    );
    const totalUnbilledPayment = invoices.reduce(
      (acc, invoice) => acc + toNum(invoice.totalAmount),
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
      (acc, product) => acc + toNum(product.quantity),
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
    const products = await Product.find().select("quantity name");
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
          totalAmount: { $sum: { $ifNull: ["$totalAmount", 0] } },
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
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const salesReport = await Invoice.aggregate([
      {
        $match: {
          date: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalAmount: { $sum: { $ifNull: ["$totalAmount", 0] } },
        },
      },
      { $sort: { _id: 1 } }
    ]);
    return salesReport;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// *** FIXED: Renamed and fixed to correctly return the sales report ***
async function getProductSalesReports() { 
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
      // Filter out null/undefined products array or items
      const filteredProducts = invoice.products ? invoice.products.filter(p => p && p.product) : [];

      filteredProducts.forEach((productItem) => {
        if (productItem.product && productItem.product.name) {
          const productId = productItem.product._id.toString();
          const productName = productItem.product.name;
          const amount = toNum(productItem.amount);
          
          const totalSales = acc[productId]
            ? acc[productId].totalSales + amount
            : amount;
          const totalOrders = acc[productId]
            ? acc[productId].totalOrders + 1
            : 1;
          
          acc[productId] = { productId, productName, totalSales, totalOrders };
        }
      });
      return acc;
    }, {});
    
    // Return array of product sales reports
    return Object.values(reports);
  } catch (err) {
    console.error(err);
    // In a dashboard function, better to throw or return an empty array than send HTTP error
    throw new Error("Error fetching sales reports by product: " + err.message); 
  }
}

async function getDailyPaymentReport() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const paymentReport = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalPaid: { $sum: { $ifNull: ["$amount", 0] } },
        },
      },
      { $sort: { _id: 1 } }
    ]);
    return paymentReport;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getDailyStockReport() {
  try {
    // Note: Stock reports on a daily basis are tricky with Mongoose. This uses the last update time.
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const stockReport = await Product.aggregate([
      {
        $match: {
          updatedAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
          totalQuantity: { $sum: { $ifNull: ["$quantity", 0] } },
        },
      },
      { $sort: { _id: 1 } }
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
      (acc, payment) => acc + toNum(payment.amount),
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
    const count = await Payment.countDocuments();
    return count;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getAveragePaymentAmount() {
  try {
    const payments = await Payment.find().select("amount");
    const totalPaymentAmount = payments.reduce(
      (acc, payment) => acc + toNum(payment.amount),
      0
    );
    const averagePaymentAmount = payments.length > 0 ? totalPaymentAmount / payments.length : 0;
    return averagePaymentAmount;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// API Endpoints

router.get("/all-data", async (req, res) => {
  try {
    const { store } = req.query;
    const storeFilter = store && store !== 'all' ? { store } : {};

    // Helper function to add store filter to queries
    const addStoreFilter = (query) => {
        if (Object.keys(storeFilter).length > 0) {
            return { ...query, ...storeFilter };
        }
        return query;
    };

    const [
        totalBilledAmount, 
        numberOfInvoices, 
        averageInvoiceValue, 
        recentInvoices, 
        topClients, 
        overdueInvoices, 
        totalUnbilledPayment, 
        lowInventoryProducts, 
        outOfStockProducts, 
        salesReport, 
        dailySalesReport, 
        dailyPaymentReport, 
        dailyStockReport, 
        totalPaymentReceived, 
        totalNumberOfPayments, 
        averagePaymentAmount, 
        totalquantity,
        productinventory,
        productsalsereport
    ] = await Promise.all([
        Invoice.aggregate([
            ...(Object.keys(storeFilter).length > 0 ? [{ $match: storeFilter }] : []),
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]).then(result => toNum(result[0]?.total)),
        Invoice.countDocuments(storeFilter),
        Invoice.find(storeFilter).select("totalAmount").then(invoices => {
            const sum = invoices.reduce((acc, invoice) => acc + toNum(invoice.totalAmount), 0);
            return invoices.length > 0 ? sum / invoices.length : 0;
        }),
        Invoice.find(storeFilter).sort({ date: -1 }).limit(5),
        Client.find().populate({
            path: "invoices",
            match: Object.keys(storeFilter).length > 0 ? storeFilter : {},
        }),
        Invoice.find({ ...storeFilter, paymentStatus: { $regex: /pending/i } }),
        Invoice.find({ ...storeFilter, paymentStatus: { $regex: /pending/i } }).select("totalAmount").then(invoices => {
            return invoices.reduce((acc, invoice) => acc + toNum(invoice.totalAmount), 0);
        }),
        Product.find({ ...storeFilter, quantity: { $lt: 5 } }),
        Product.find({ ...storeFilter, quantity: 0 }),
        Invoice.aggregate([
            ...(Object.keys(storeFilter).length > 0 ? [{ $match: storeFilter }] : []),
            {
                $group: {
                    _id: { $month: "$date" },
                    totalAmount: { $sum: { $ifNull: ["$totalAmount", 0] } },
                },
            },
        ]),
        Invoice.aggregate([
            {
                $match: {
                    ...storeFilter,
                    date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    totalAmount: { $sum: { $ifNull: ["$totalAmount", 0] } },
                },
            },
            { $sort: { _id: 1 } }
        ]),
        Payment.aggregate([
            {
                $match: {
                    ...storeFilter,
                    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalPaid: { $sum: { $ifNull: ["$amount", 0] } },
                },
            },
            { $sort: { _id: 1 } }
        ]),
        Product.aggregate([
            {
                $match: {
                    ...storeFilter,
                    updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
                    totalQuantity: { $sum: { $ifNull: ["$quantity", 0] } },
                },
            },
            { $sort: { _id: 1 } }
        ]),
        Payment.find(storeFilter).select("amount").then(payments => {
            return payments.reduce((acc, payment) => acc + toNum(payment.amount), 0);
        }),
        Payment.countDocuments(storeFilter),
        Payment.find(storeFilter).select("amount").then(payments => {
            const total = payments.reduce((acc, payment) => acc + toNum(payment.amount), 0);
            return payments.length > 0 ? total / payments.length : 0;
        }),
        Product.find(storeFilter).select("quantity").then(products => {
            return products.reduce((acc, product) => acc + toNum(product.quantity), 0);
        }),
        Product.find(storeFilter).select("quantity name"),
        Invoice.find(storeFilter).populate({
            path: "products",
            populate: {
                path: "product",
                model: "Product",
            },
        }).then(invoices => {
            const reports = {};
            invoices.forEach(invoice => {
                const filteredProducts = invoice.products ? invoice.products.filter(p => p && p.product) : [];
                filteredProducts.forEach((productItem) => {
                    if (productItem.product && productItem.product.name) {
                        const productId = productItem.product._id.toString();
                        const productName = productItem.product.name;
                        const amount = toNum(productItem.amount);
                        const totalSales = reports[productId] ? reports[productId].totalSales + amount : amount;
                        const totalOrders = reports[productId] ? reports[productId].totalOrders + 1 : 1;
                        reports[productId] = { productId, productName, totalSales, totalOrders };
                    }
                });
            });
            return Object.values(reports);
        })
    ]);


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
      totalPaymentReceived,
      totalNumberOfPayments,
      averagePaymentAmount,
      productsalsereport,
      // Recalculating these based on fetched data for consistency
      noofoverdueInvoices: overdueInvoices.length, 
      nooflowInventoryProducts: lowInventoryProducts.length,
      noofoutOfStockProducts: outOfStockProducts.length,
    };

    res.json(allData);
  } catch (error) {
    console.error("Error fetching all dashboard data:", error);
    res.status(500).json({ message: "Error fetching all data", details: error.message });
  }
});
module.exports = router;