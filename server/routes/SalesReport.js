const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");

router.get("/all", async (req, res) => {
  try {
    const invoices = await Invoice.find().exec();

    const reports = invoices.reduce(
      (acc, invoice) => {
        const amount = Number(invoice.totalAmount) || 0; // Ensure numeric conversion
        const totalSales = acc.totalSales + amount;
        const totalOrders = acc.totalOrders + 1;
        acc = { totalSales, totalOrders };
        return acc;
      },
      { totalSales: 0, totalOrders: 0 }
    );

    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching sales reports" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "startDate and endDate are required" });
    }
    let start, end;
    try {
      start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0); // Set to start of the day
      end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999); // Set to end of the day
    } catch (err) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }


    const invoices = await Invoice.find({
      date: { $gte: start, $lte: end },
    }).exec();

    const reports = invoices.reduce((acc, invoice) => {
      const date = invoice.date.toISOString().split("T")[0];
      const amount = Number(invoice.totalAmount) || 0;
      
      const totalSales = acc[date]
        ? acc[date].totalSales + amount
        : amount;
      const totalOrders = acc[date] ? acc[date].totalOrders + 1 : 1;
      acc[date] = { totalSales, totalOrders };
      return acc;
    }, {});

    // Return the sales report as a JSON response
    res.json(Object.keys(reports).map((date) => ({ date, ...reports[date] })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching sales reports" });
  }
});

router.get("/by-product", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "startDate and endDate are required" });
    }
    let start, end;

    try {
      start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);
      end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
    } catch (err) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const invoices = await Invoice.find({ date: { $gte: start, $lte: end } })
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
        (p) => p && p.product 
      );
      
      filteredProducts.forEach((productItem) => {
        
        if (productItem.product && productItem.product.name) {
          const productId = productItem.product._id.toString();
          const productName = productItem.product.name;
          const amount = Number(productItem.amount) || 0; 
          const quantity = Number(productItem.quantity) || 0;

          const totalSales = acc[productId]
            ? acc[productId].totalSales + amount
            : amount;
          const totalOrders = acc[productId] 
            ? acc[productId].totalOrders + 1
            : 1;
          const totalQuantitySold = acc[productId] 
            ? acc[productId].totalQuantitySold + quantity
            : quantity;

          acc[productId] = { 
            productId, 
            productName, 
            totalSales, 
            totalOrders, 
            totalQuantitySold 
          }; 
        }
      });
      return acc;
    }, {});

    res.json(Object.values(reports));
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error fetching sales reports by product" });
  }
});

module.exports = router;