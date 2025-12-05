const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Routes
const productRouter = require('./routes/Product');
const invoiceRouter = require('./routes/Invoice');
const clientRouter = require('./routes/Client');
const clientportalRouter = require('./routes/Clients');
const orderRouter = require('./routes/Order');
const overview = require('./routes/overview');
const salesReports = require('./routes/SalesReport');
const payment = require('./routes/Payment');
const user = require('./routes/LoginPage');
const chartData = require('./routes/chartsdata');
const notifications = require('./routes/notifications'); 
const auth = require('./routes/auth.js');

const dbconnect = require('./middlewares/dB');

const app = express();

// --- FIX: Add this line to resolve the Rate Limit Error ---
app.set('trust proxy', 1); 
// ---------------------------------------------------------

// 1. Security Middleware
app.use(helmet()); 
app.use(mongoSanitize());

// 2. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again later."
});
app.use('/api/', limiter);

// 3. CORS & Body Parser
app.use(cors({
  origin: 'http://localhost:3000', // Update this if your frontend runs on a different port (e.g., 3001)
  credentials: true,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// 4. Static Files
app.use('/uploads', express.static('uploads'));

// 5. Database
dbconnect();

// 6. Routes
app.use('/api/product', productRouter);
app.use('/api/invoices', invoiceRouter);
app.use('/api/client', clientRouter);
app.use('/api/overview', overview);
app.use('/api/sales-reports', salesReports);
app.use('/api/payments', payment);
app.use('/api/user', user);
app.use('/api/chartsdata', chartData);
app.use('/api/clientroutes', clientportalRouter);
app.use('/api/orders', orderRouter);
app.use('/api/auth', auth);
app.use('/api/notifications', notifications);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something went wrong!', error: err.message });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});