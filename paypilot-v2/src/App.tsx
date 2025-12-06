import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import { ThemeProvider } from "./components/ThemeContext.jsx";

// Layout
import MainLayout from "./components/MainLayout.jsx"; 

// Common Components
import LoadingPage from "./components/LoadingPage.jsx";
import NotFoundPage from "./components/NotFoundPage.jsx";

// Main App Components
import Register from "./components/Register.jsx";
import LoginPage from "./components/LoginPage.jsx";
import ProfilePage from "./components/ProfilePage.jsx";
import Dashboard from "./components/Dashboard.jsx";
import AddProduct from "./components/AddProduct.jsx";
import ClientList from "./components/ClientList.jsx";
import CreateInvoice from "./components/CreateInvoice.jsx";
import CreateNewPayment from "./components/CreateNewPayment.jsx";
import EmployeeManager from "./components/EmployeeManager.jsx";
import InventoryManager from "./components/InventoryManager.jsx";
import ReportGenerator from "./components/ReportGenerator.jsx";
import InvoiceList from "./components/InvoiceList.jsx";
import AcceptOrder from "./components/AcceptOrder.jsx";
import PaymentManagement from "./components/PaymentManagement.jsx";
import ProductManagement from "./components/ProductList.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";

// Client Components
import ClientLogin from "./components/client/ClientLogin.jsx";
import ClientPortal from "./components/client/ClientPortal.jsx";
import ClientDashboard from "./components/client/ClientDashboard.jsx";
import ClientProfile from "./components/client/ClientProfile.jsx";
import ClientOrders from "./components/client/ClientOrders.jsx";
import ClientPayments from "./components/client/ClientPayments.jsx";
import CreateOrder from "./components/client/CreateOrder.jsx";
import Landing from "./components/home.jsx";

// Helpers
// import { Buffer } from "buffer";
// window.Buffer = Buffer;

// Axios Interceptor
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const App = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setTimeout(() => setLoading(false), 1500);
    document.title = "PayPilot";
  }, []);

  if (loading) return <LoadingPage />;

  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/client-login" element={<ClientLogin />} />

            {/* Client Portal Routes (Keep existing Client Layout or wrap similarly) */}
            <Route path="/client-dashboard" element={<ClientDashboard />} />
            <Route path="/client-orders" element={<ClientOrders />} />
            {/* Add other client routes here... */}

            {/* Admin Routes Wrapped in MainLayout */}
            <Route element={<MainLayout><Dashboard /></MainLayout>} path="/dashboard" />
            
            <Route
              path="/invoicelist"
              element={<MainLayout><PrivateRoute element={<InvoiceList />} requiredRole="admin" /></MainLayout>}
            />
            <Route
              path="/create-invoice"
              element={<MainLayout><PrivateRoute element={<CreateInvoice />} requiredRole="admin" /></MainLayout>}
            />
            <Route
              path="/client-list"
              element={<MainLayout><PrivateRoute element={<ClientList />} requiredRole="admin" /></MainLayout>}
            />
            <Route
              path="/product-management"
              element={<MainLayout><PrivateRoute element={<ProductManagement />} requiredRole="admin" /></MainLayout>}
            />
            <Route
              path="/add-product"
              element={<MainLayout><PrivateRoute element={<AddProduct />} requiredRole="admin" /></MainLayout>}
            />
            <Route
              path="/report-generator"
              element={<MainLayout><PrivateRoute element={<ReportGenerator />} requiredRole="admin" /></MainLayout>}
            />
            <Route
              path="/employee-manager"
              element={<MainLayout><PrivateRoute element={<EmployeeManager />} requiredRole="admin" /></MainLayout>}
            />
            <Route
              path="/inventory-manager"
              element={<MainLayout><PrivateRoute element={<InventoryManager />} requiredRole="admin" /></MainLayout>}
            />
            <Route
              path="/AcceptOrder"
              element={<MainLayout><PrivateRoute element={<AcceptOrder />} requiredRole="admin" /></MainLayout>}
            />
            <Route
              path="/create-new-payment"
              element={<MainLayout><PrivateRoute element={<CreateNewPayment />} requiredRole="admin" /></MainLayout>}
            />
            <Route
              path="/profile"
              element={<MainLayout><PrivateRoute element={<ProfilePage />} requiredRole="admin" /></MainLayout>}
            />
            <Route
              path="/payment-manager"
              element={<MainLayout><PrivateRoute element={<PaymentManagement />} requiredRole="admin" /></MainLayout>}
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;