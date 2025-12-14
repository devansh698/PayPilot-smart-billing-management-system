const express = require("express");
const router = express.Router();
const mail = require("../helpers/sendMail");
const sendotps = require("../helpers/otp");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // User model (for Admin/Employee)
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const sendMail = require("../helpers/sendMail");
const authMiddleware = require('../middlewares/authMiddleware'); // For CRUD routes

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


// Endpoint to send OTP - *** FIX: Correctly fetch user document ***
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ status: 400, message: "Email is required" });
  }

  try {
    const userDoc = await User.findOne({ email: email.toLowerCase() }); // *** FIXED ***
    if (!userDoc) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    const otp = generateRandomNumber();
    otpStorage[email.toLowerCase()] = { otp: otp, expiresAt: Date.now() + 10 * 60 * 1000 }; // Store OTP with expiration

    // Assuming 'transporter' setup is in '../helpers/sendMail' or global scope.
    // Using the helper function from other auth files for consistency:
    await sendotps.sendOtpMail(email, otp); 

    res.status(200).json({ status: 200, message: "OTP sent successfully." });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 500, message: "Internal Server Error", details: err.message });
  }
});

// Endpoint to verify OTP
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const lowerCaseEmail = email.toLowerCase();

  if (!otpStorage[lowerCaseEmail] || Date.now() > otpStorage[lowerCaseEmail].expiresAt) {
      delete otpStorage[lowerCaseEmail];
      return res.status(400).json({ status: 400, message: "Invalid or expired OTP." });
  }

  // Check if the OTP matches - *** Using string comparison ***
  if (otpStorage[lowerCaseEmail].otp === otp.toString()) {
    delete otpStorage[lowerCaseEmail]; // Clear the OTP after verification
    return res.status(200).json({ status: 200, message: "OTP verified successfully." });
  } else {
    return res.status(400).json({ status: 400, message: "Invalid OTP." });
  }
});

// Endpoint to send OTP (alternative/duplicate) - Removed reliance on global sendotps.SendotpMail
router.post("/otp", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ status: 400, message: "Email is required" });
  }

  try {
    const userDoc = await User.findOne({ email: email.toLowerCase() });
    if (!userDoc) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    const otp = generateRandomNumber();
    const otpExpiresAt = Date.now() + 10 * 60 * 1000; // Consistent 10 minute expiration
    
    // Using the same helper function for consistency
    const sendOtpResponse = await sendotps.sendOtpMail(email, otp); 
    
    if (!sendOtpResponse) {
      return res.status(400).json({ status: 400, message: "OTP not sent (Mail error)" });
    }

    await User.findByIdAndUpdate(
      userDoc._id,
      { otp, otpExpiresAt },
      { new: true }
    );
    res.json({ status: 200, message: "OTP sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 500, message: "Internal Server Error", details: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password, otp } = req.body;
  if (!email || !otp || !password) {
    return res
      .status(400)
      .json({ status: 400, message: "Email, password, and OTP are required" });
  }
  try {
    const userDoc = await User.findOne({ email: email.toLowerCase() });
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

    // *** FIX: Comparing OTPs as strings for robustness ***
    if (userDoc.otp !== otp.toString()) {
      return res.status(401).json({ status: 401, message: "Invalid OTP" });
    }

    if (userDoc.otpExpiresAt < Date.now()) {
      return res.status(401).json({ status: 401, message: "OTP has expired" });
    }
    
    // Clear OTP after successful login
    await User.findByIdAndUpdate(userDoc._id, { otp: null, otpExpiresAt: null });

    // Use environment variable for JWT Secret for consistency
    const secret = process.env.JWT_SECRET || "MySecrateKey"; 
    const token = jwt.sign({ userId: userDoc._id, role: userDoc.role }, secret, {
      expiresIn: "1h",
    });
    
    const tokenExpiryTime =  new Date(Date.now() + 1000 * 60 * 60); // 1 hour expiry
    
    res.json({ 
        status: 200, 
        message: "Login success", 
        data: userDoc, 
        token, 
        tokenExpiryTime: tokenExpiryTime.getTime() 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 500, message: "Internal Server Error", details: err.message });
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
    // Ensure email is unique and lowercased
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        return res.status(400).json({ status: 400, message: "User with this email already exists." });
    }
    
    const userDoc = await User.create({
      username,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role,
      otp: null,
      otpExpiresAt: null,
    });
    
    res.json({ status: 200, message: "User created", data: userDoc });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 500, message: "Internal Server Error", details: err.message });
  }
});

// Get all users (Employees/Admins) - *** FIX: Added Pagination, Sorting, and Filtering ***
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search = '', role } = req.query;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const filter = {};
    if (search) {
        // Search by username, email, or phone
        filter.$or = [
            { username: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
        ];
    }
    if (role) {
        filter.role = role;
    }

    const users = await User.find(filter)
      .select('-password -otp -otpExpiresAt')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .exec();
    
    const totalUsers = await User.countDocuments(filter);

    res.json({ 
        users, 
        totalPages: Math.ceil(totalUsers / parseInt(limit)),
        currentPage: parseInt(page),
        totalUsers,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", details: err.message });
  }
});

// Change Password Route
router.patch("/:id/change-password", authMiddleware, async (req, res) => {
  try {
    const {id}= req.params;
    const { oldPassword, newPassword } = req.body;
    
    // Security check: only allow user to change their own password
    if (req.user._id.toString() !== id) {
        // Or if the user has an 'admin' role, allow it
        if (req.user.role !== 'admin') {
            return res.status(403).json({ status: 403, message: "Access denied. Cannot change another user's password." });
        }
    }


    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({
          status: 400,
          message: "Old password and new password are required",
        });
    }
    
    const userDoc = await User.findById(id).exec();
    
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
    await User.findByIdAndUpdate(
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

// Get single user
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const userDoc = await User.findById(req.params.id).select('-password -otp -otpExpiresAt').exec();
    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(userDoc);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user" });
  }
});

// Update User (PUT) - *** FIX: Added authMiddleware and runValidators: true ***
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updateData = req.body;
    // Prevent changing password or sensitive fields via PUT
    delete updateData.password; 
    delete updateData.otp;
    delete updateData.otpExpiresAt;
    
    const userDoc = await User
      .findByIdAndUpdate(req.params.id, updateData, { 
          new: true, 
          runValidators: true // Added validation
      })
      .exec();
    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(userDoc);
  } catch (err) {
    res.status(500).json({ message: "Error updating user", details: err.message });
  }
});

// Delete User
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userDoc = await User.findByIdAndDelete(req.params.id).exec();
    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user" });
  }
});


// Partial Update User (PATCH) - *** FIX: Added authMiddleware and runValidators: true ***
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const updateData = req.body;
    // Prevent changing password or sensitive fields via PATCH
    delete updateData.password; 
    delete updateData.otp;
    delete updateData.otpExpiresAt;

    const userDoc = await User
      .findByIdAndUpdate(req.params.id, updateData, { 
          new: true, 
          runValidators: true 
      })
      .exec();
    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(userDoc);
  } catch (err) {
    res.status(500).json({ message: "Error updating user", details: err.message });
  }
});

// Forgot Password - Send OTP
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ status: 400, message: "Email is required" });
    }

    try {
        const userDoc = await User.findOne({ email: email.toLowerCase() });
        if (!userDoc) {
            return res.status(404).json({ status: 404, message: "User not found" });
        }

        const otp = generateRandomNumber();
        otpStorage[email.toLowerCase()] = { otp: otp, expiresAt: Date.now() + 10 * 60 * 1000 };
        
        const { getPasswordResetTemplate } = require("../helpers/emailTemplates");
        const Auth = { user: process.env.USER1, pass: process.env.PASS1 };
        const mail = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: Auth,
            timeout: 500000,
        });

        await mail.sendMail({
            from: `PayPilot <${process.env.USER1}>`,
            to: email,
            subject: "PayPilot - Password Reset",
            html: getPasswordResetTemplate(otp),
        });

        res.status(200).json({ status: 200, message: "Password reset OTP sent to your email" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: "Internal Server Error", details: err.message });
    }
});

// Reset Password - Verify OTP and set new password
router.post("/reset-password", async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.status(400).json({ status: 400, message: "Email, OTP, and new password are required" });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ status: 400, message: "Password must be at least 6 characters" });
    }

    try {
        const lowerCaseEmail = email.toLowerCase();
        const storedOtp = otpStorage[lowerCaseEmail];

        if (!storedOtp || Date.now() > storedOtp.expiresAt) {
            delete otpStorage[lowerCaseEmail];
            return res.status(400).json({ status: 400, message: "Invalid or expired OTP" });
        }

        if (storedOtp.otp !== otp.toString()) {
            return res.status(400).json({ status: 400, message: "Invalid OTP" });
        }

        const userDoc = await User.findOne({ email: lowerCaseEmail });
        if (!userDoc) {
            return res.status(404).json({ status: 404, message: "User not found" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(userDoc._id, { password: hashedPassword });

        delete otpStorage[lowerCaseEmail];
        res.status(200).json({ status: 200, message: "Password reset successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: "Internal Server Error", details: err.message });
    }
});

module.exports = router;