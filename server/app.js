import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function App() {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [salesReports, setSalesReports] = useState([]);
  const [user, setUser] = useState({});

  
  useEffect(() => {
    axios.get('http://localhost:3000/add-product')
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error(error);
      });

    axios.get('http://localhost:3000/client-list')
      .then(response => {
        setClients(response.data);
      })
      .catch(error => {
        console.error(error);
      });

    axios.get('http://localhost:3000/company-list')
      .then(response => {
        setCompanies(response.data);
      })
      .catch(error => {
        console.error(error);
      });

    axios.get('http://localhost:3000/invoice-list')
      .then(response => {
        setInvoices(response.data);
      })
      .catch(error => {
        console.error(error);
      });

      
    axios.get('http://localhost:3000/payment-list')
      .then(response => {
        setPayments(response.data);
      })
      .catch(error => {
        console.error(error);
      });

    axios.get('http://localhost:3000/sales-report')
      .then(response => {
        setSalesReports(response.data);
      })
      .catch(error => {
        console.error(error);
      });

    axios.get('http://localhost:3000/profile')
      .then(response => {
        setUser(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  return (
    <div>
      <h1>Invoika</h1>
      <ul>
        <li><Link to="/products">Products</Link></li>
        <li><Link to="/clients">Clients</Link></li>
        <li><Link to="/companies">Companies</Link></li>
        <li><Link to="/invoices">Invoices</Link></li>
        <li><Link to="/payments">Payments</Link></li>
        <li><Link to="/sales-report">Sales Report</Link></li>
        <li><Link to="/profile">Profile</Link></li>
      </ul>
    </div>
  );
}

export default App;