const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
//const auth = require('./middleware/authenticate');
const dbconnect = require('./middlewares/dB');
const productRouter = require('./routes/Product');
const auth1=require("./routes/authenticate.js");
const invoiceRouter = require('./routes/Invoice');
const clientRouter = require('./routes/Client');
const clientportalRouter = require('./routes/Clients');
const orderRouter = require('./routes/Order');
const overview = require('./routes/overview');
const salesReports =require('./routes/SalesReport')
const payment=require('./routes/Payment');
const user=require('./routes/LoginPage');
const chartData=require('./routes/chartsdata');
const bodyParser = require('body-parser');

const { json } = require('express');
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:3001', // Adjust this to your frontend URL
  credentials: true,
}));
app.use(bodyParser.urlencoded({ extended: true }));
require('dotenv').config();
const path = require('path');
const auth = require('./routes/auth.js');


dbconnect();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS,PATCH");
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));



app.use('/api/product', productRouter);
app.use('/api/invoices', invoiceRouter);
app.use('/api/client',clientRouter);
app.use('/api/overview',overview);
app.use('/api/sales-reports',salesReports);
app.use('/api/payments',payment);
app.use('/api/user', user);
app.use('/api/chartsdata', chartData);
app.use('/api/clientroutes',clientportalRouter);
app.use('/api/orders', orderRouter);

app.use('/api/auth',auth);
app.get('/', (req, res) => {
  res.send('Welcome to the Invoice App');
});



app.use((req, res, next) => {
  res.status(404).send('Not Found');
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});