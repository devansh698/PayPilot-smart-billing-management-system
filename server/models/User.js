const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: {type: String,required: true,unique: true,trim: true,},
    otp: {type: Number,required: false,},
    otpExpiresAt: {type: Date,required: false,
    },
    email: {type: String,required: true,unique: true,trim: true,lowercase: true,},
    phone: {type: String,required: true,unique: true,trim: true,},
    password: {type: String,required: true,},
    role: { type: String, enum: ["admin", "Store Admin", "Store Manager", "Client Manager","Invoice Manager","Payment Manager","Product Manager", "Order Manager", "Inventory Manager", "Report Manager", "Employee Manager"], default: "admin" },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false,
    },
    twoFactorMethod: {
        type: String,
        enum: ['email', 'authenticator'],
        default: 'email',
    },
    twoFactorSecret: {
        type: String,
    },
    twoFactorBackupCodes: {
        type: [String],
        default: [],
    },
    notificationPreferences: {
        emailNotifications: { type: Boolean, default: true },
        orderNotifications: { type: Boolean, default: true },
        paymentNotifications: { type: Boolean, default: true },
        inventoryAlerts: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
