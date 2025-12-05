const express = require("express");
const router = express.Router();
const mail = require("../helpers/sendMail");
const sendotps = require("../helpers/otp");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const user = require("../models/User");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const sendMail = require("../helpers/sendMail");

router.use(express.json());

// In-memory storage for OTPs (for demonstration purposes only)
const otpStorage = {};
// Generate random OTP
function generateRandomNumber() {
  return crypto.randomInt(100000, 999999).toString();
}

router.post("/send-email", async (req, res) => {
  const { to, subject, text } = req.body;
  if (!to || !subject || !text) {
    return res
      .status(400)
      .json({ status: 400, message: "Email, subject, and text are required" });
  }
  try{
    await sendMail.sendMail(to, subject, text);
    res.json({ status: 200, message: "Email sent" });
  }
  catch(err){
    console.error(err);
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}
  
// Endpoint to send OTP
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ status: 400, message: "Email is required" });
  }

  try {
    const userDoc = email;
    if (!userDoc) {
      return res.status(404).json({ status: 404, message: "User  not found" });
    }

    const otp = generateRandomNumber();
    otpStorage[email] = otp; // Store OTP in memory (you should use a database in production)

    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ status: 500, message: "Failed to send OTP." });
      }
      res.status(200).json({ status: 200, message: "OTP sent successfully." });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

// Endpoint to verify OTP
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  // Check if the OTP matches
  if (otpStorage[email] && otpStorage[email] === otp) {
    delete otpStorage[email]; // Clear the OTP after verification
    return res.status(200).json({ status: 200, message: "OTP verified successfully." });
  } else {
    return res.status(400).json({ status: 400, message: "Invalid OTP." });
  }
});
router.post("/otp", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ status: 400, message: "Email is required" });
  }

  try {
    const userDoc = await user.findOne({ email });
    if (!userDoc) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    const otp = generateRandomNumber();
    const otpExpiresAt = Date.now() + 120000;
    const sendOtpResponse = await sendotps.SendotpMail(email, otp);
    if (!sendOtpResponse) {
      return res.status(400).json({ status: 400, message: "OTP not sent" });
    }

    await user.findByIdAndUpdate(
      userDoc._id,
      { otp, otpExpiresAt },
      { new: true }
    );
    res.json({ status: 200, message: "OTP sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password, otp } = req.body;
  if (!email || !otp || !password) {
    return res
      .status(400)
      .json({ status: 400, message: "Email and OTP are required" });
  }
  try {
    const userDoc = await user.findOne({ email });
    if (!userDoc) {
      return res
        .status(401)
        .json({ status: 401, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, userDoc.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ status: 401, message: "Invalid credentials" });
    }

    const otpNumber = Number(otp);
    const otpNumber1 = Number(userDoc.otp);
    if (otpNumber !== otpNumber1) {
      return res.status(401).json({ status: 401, message: "Invalid OTP" });
    }

    if (userDoc.otpExpiresAt < Date.now()) {
      return res.status(401).json({ status: 401, message: "OTP has expired" });
    }

    const token = jwt.sign({ userId: userDoc._id }, "MySecrateKey", {
      expiresIn: "1h",
    });
    const tokenExpiryTime =  new Date();
    tokenExpiryTime.setHours(tokenExpiryTime.getHours() + 1);
    res.json({ status: 200, message: "Login success", data: userDoc, token, tokenExpiryTime: tokenExpiryTime.getTime() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.post("/register", async (req, res) => {
  const { username, email, phone, password, role } = req.body;

  if (!username || !email || !phone || !password || !role) {
    return res
      .status(400)
      .json({ status: 400, message: "All fields are required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const userDoc = await user.create({
      username,
      email,
      phone,
      password: hashedPassword,
      role,
      otp: null,
      otpExpiresAt: null,
    });
    if (!userDoc) {
      return res.status(400).json({ status: 400, message: "User not created" });
    }

    res.json({ status: 200, message: "User created", data: userDoc });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});
router.get("/", async (req, res) => {
  try {
    const users = await user.find().exec();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

router.patch("/:id/change-password", async (req, res) => {
  try {
    const {id}= req.params;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({
          status: 400,
          message: "Old password and new password are required",
        });
    }
    console.log(id);
    const userDoc = await user.findById(id).exec();
    console.log(userDoc);
    if (!userDoc) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, userDoc.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ status: 401, message: "Invalid old password" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await user.findByIdAndUpdate(
      id,
      { password: hashedNewPassword },
      { new: true }
    );

    res.json({ status: 200, message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const userDoc = await user.findById(req.params.id).exec();
    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(userDoc);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user" });
  }
});
router.put("/:id", async (req, res) => {
  try {
    const userDoc = await user
      .findByIdAndUpdate(req.params.id, req.body, { new: true })
      .exec();
    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(userDoc);
  } catch (err) {
    res.status(500).json({ message: "Error updating user" });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const userDoc = await user.findByIdAndDelete(req.params.id).exec();
    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user" });
  }
});



router.patch("/:id", async (req, res) => {
  try {
    const userDoc = await user
      .findByIdAndUpdate(req.params.id, req.body, { new: true })
      .exec();
    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(userDoc);
  } catch (err) {
    res.status(500).json({ message: "Error updating user" });
  }
});

module.exports = router;
