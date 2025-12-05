const mongoose = require('mongoose');

const salesReportSchema = new mongoose.Schema({
  reportId: String,
  date: Date,
  totalSales: Number,
  totalOrders: Number,
  status: String
});

module.exports = mongoose.model('SalesReport', salesReportSchema);