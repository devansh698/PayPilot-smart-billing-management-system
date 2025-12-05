const mongoose = require("mongoose");
const Client = require("./Client");
const Invoice = require("./Invoice");

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice",
    required: true,
  },
  paymentMethod: {
    type: String,

    enum: ["Credit Card","Debit Card", "UPI", "Bank Transfer", "Cash","RTGS","NEFT","IMPS","UPI"],

    required: true,
  },
 
  amount: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Payment", paymentSchema);
