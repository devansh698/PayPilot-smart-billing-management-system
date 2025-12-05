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
    role: { type: String, enum: ["admin", "Client Manager","Invoice Manager","Payment Manager","Product Manager"], default: "admin" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
