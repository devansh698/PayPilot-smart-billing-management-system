const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");

router.get("/all", async (req, res) => {
  try {
    const invoices = await Invoice.find().exec();

    const reports = invoices.reduce(
      (acc, invoice) => {
        const totalSales = acc.totalSales + invoice.totalAmount;
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
      end = new Date(endDate);
    } catch (err) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (!(start instanceof Date) || !(end instanceof Date)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const invoices = await Invoice.find({
      date: { $gte: start, $lte: end },
    }).exec();

    const reports = invoices.reduce((acc, invoice) => {
      const date = invoice.date.toISOString().split("T")[0];
      const totalSales = acc[date]
        ? acc[date].totalSales + invoice.totalAmount
        : invoice.totalAmount;
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
    console.log(startDate, endDate);
    let start, end;

    try {
      start = new Date(startDate);
      end = new Date(endDate);
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
        (product) => product !== null
      );
      filteredProducts.forEach((product) => {
        console.log(invoice.products);
          console.log(filteredProducts);
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

    res.json(Object.values(reports));
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error fetching sales reports by product" });
  }
});

module.exports = router;
