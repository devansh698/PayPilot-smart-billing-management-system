import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./components/ThemeContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// CSS
import "./index.css"; // Tailwind directives must be here

// Layouts
import MainLayout from "./components/MainLayout"; 

// Public / Auth
import Landing from "./components/home";
import LoginPage from "./components/LoginPage";
import Register from "./components/Register";
import NotFoundPage from "./components/NotFoundPage";
import LoadingPage from "./components/LoadingPage";

// Admin Components
import Dashboard from "./components/Dashboard";
import InvoiceList from "./components/InvoiceList";
import CreateInvoice from "./components/CreateInvoice";
import ClientList from "./components/ClientList";
import ProductList from "./components/ProductList";
import AddProduct from "./components/AddProduct";
import ReportGenerator from "./components/ReportGenerator";
import EmployeeManager from "./components/EmployeeManager";
import InventoryManager from "./components/InventoryManager";
import AcceptOrder from "./components/AcceptOrder";
import CreateNewPayment from "./components/CreateNewPayment";
import PaymentManagement from "./components/PaymentManagement";
import ProfilePage from "./components/ProfilePage";
import PrivateRoute from "./components/PrivateRoute";

// Client Portal Components
import ClientLogin from "./components/client/ClientLogin";
import ClientDashboard from "./components/client/ClientDashboard";
import ClientOrders from "./components/client/ClientOrders";
import CreateOrder from "./components/client/CreateOrder";
import ClientPayments from "./components/client/ClientPayments";
import ClientProfile from "./components/client/ClientProfile";

const App = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate initial load
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) return <LoadingPage />;

  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<Register />} />
            
            {/* --- Client Portal Routes --- */}
            <Route path="/client-login" element={<ClientLogin />} />
            {/* Wrap client routes in a check or separate layout if needed */}
            <Route path="/client-dashboard" element={<ClientDashboard />} />
            <Route path="/client-orders" element={<ClientOrders />} />
            <Route path="/create-order" element={<CreateOrder />} />
            <Route path="/client-payments" element={<ClientPayments />} />
            <Route path="/client-profile" element={<ClientProfile />} />

            {/* --- Admin Routes (Protected) --- */}
            <Route path="/dashboard" element={<MainLayout><PrivateRoute element={<Dashboard />} requiredRole="admin" /></MainLayout>} />
            
            <Route path="/invoicelist" element={<MainLayout><PrivateRoute element={<InvoiceList />} requiredRole="admin" /></MainLayout>} />
            <Route path="/create-invoice" element={<MainLayout><PrivateRoute element={<CreateInvoice />} requiredRole="admin" /></MainLayout>} />
            
            <Route path="/client-list" element={<MainLayout><PrivateRoute element={<ClientList />} requiredRole="admin" /></MainLayout>} />
            <Route path="/add-client" element={<MainLayout><PrivateRoute element={<ClientList />} requiredRole="admin" /></MainLayout>} /> {/* Reusing list component as it has Modal */}

            <Route path="/product-management" element={<MainLayout><PrivateRoute element={<ProductList />} requiredRole="admin" /></MainLayout>} />
            <Route path="/add-product" element={<MainLayout><PrivateRoute element={<AddProduct />} requiredRole="admin" /></MainLayout>} />
            
            <Route path="/inventory-manager" element={<MainLayout><PrivateRoute element={<InventoryManager />} requiredRole="admin" /></MainLayout>} />
            
            <Route path="/AcceptOrder" element={<MainLayout><PrivateRoute element={<AcceptOrder />} requiredRole="admin" /></MainLayout>} />
            
            <Route path="/payment-manager" element={<MainLayout><PrivateRoute element={<PaymentManagement />} requiredRole="admin" /></MainLayout>} />
            <Route path="/create-new-payment" element={<MainLayout><PrivateRoute element={<CreateNewPayment />} requiredRole="admin" /></MainLayout>} />
            
            <Route path="/report-generator" element={<MainLayout><PrivateRoute element={<ReportGenerator />} requiredRole="admin" /></MainLayout>} />
            <Route path="/employee-manager" element={<MainLayout><PrivateRoute element={<EmployeeManager />} requiredRole="admin" /></MainLayout>} />
            
            <Route path="/profile" element={<MainLayout><PrivateRoute element={<ProfilePage />} requiredRole="admin" /></MainLayout>} />

            {/* Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;