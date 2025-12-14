// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// IMPORTANT: Make sure these two paths point to the correct model files in your project.
// e.g. User model might be in '../models/User' or '../models/Usermodel'
const Usermodel = require('../models/User');   // <-- fix this path
const Client = require('../models/Client');    // <-- keep this path if correct

const authMiddleware = async (req, res, next) => {
  try {
    // Accept Authorization header in various forms
    const authHeader = req.headers.authorization || req.headers.Authorization || req.header('Authorization');
    if (!authHeader) {
      console.log('No Authorization header present');
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    if (!token) {
      console.log('No token extracted from header');
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error('JWT verify error:', err);
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }

    console.log('Decoded token:', decoded);

    // Gather possible id fields from token
    const candidates = [
      decoded.userId,
      decoded.user_id,
      decoded.id,
      decoded._id,
      decoded.clientID,
      decoded.clientId,
      decoded.client_id
    ].filter(Boolean);

    // Debug: mongoose connection state & collection names
    console.log('Mongoose readyState:', mongoose.connection.readyState);
    if (Usermodel && Usermodel.collection) console.log('Usermodel collection:', Usermodel.collection.name);
    if (Client && Client.collection) console.log('Client collection:', Client.collection.name);

    let principal = null;

    // Try searching by candidate ids (validate as ObjectId first)
    for (const cand of candidates) {
      if (!mongoose.isValidObjectId(cand)) {
        console.warn('Candidate not a valid ObjectId, skipping:', cand);
        continue;
      }

      // Try Usermodel
      principal = await Usermodel.findById(cand).select('-password').exec();
      if (principal) {
        console.log('Found principal in Usermodel by id:', cand);
        break;
      }

      // Try Client model
      principal = await Client.findById(cand).select('-password').exec();
      if (principal) {
        console.log('Found principal in Client by id:', cand);
        break;
      }
    }

    // Fallback: try token-provided email or username if present
    if (!principal && decoded.email) {
      principal =
        (await Usermodel.findOne({ email: decoded.email }).select('-password').exec()) ||
        (await Client.findOne({ email: decoded.email }).select('-password').exec());
      if (principal) console.log('Found principal by token email:', decoded.email);
    }
    if (!principal && decoded.username) {
      principal =
        (await Usermodel.findOne({ username: decoded.username }).select('-password').exec()) ||
        (await Client.findOne({ username: decoded.username }).select('-password').exec());
      if (principal) console.log('Found principal by token username:', decoded.username);
    }

    console.log('Fetched principal:', principal);

    if (!principal) {
      console.warn('No principal found for token. Candidates tried:', candidates);
      return res.status(401).json({ message: 'User not found for provided token.' });
    }

    // Attach to request and continue
    req.user = principal;
    next();
  } catch (err) {
    console.error('Auth middleware unexpected error:', err);
    res.status(500).json({ message: 'Server error in auth middleware.' });
  }
};

const roleMiddleware = (requiredRole) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'User not found.' });
  if (req.user.role !== requiredRole) {
    return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
  }
  next();
};

// Export both middlewares correctly
module.exports = { authMiddleware, roleMiddleware };
module.exports = authMiddleware;