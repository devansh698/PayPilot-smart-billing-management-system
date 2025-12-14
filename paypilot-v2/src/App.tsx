import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { StoreProvider } from "./context/StoreContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layouts
import MainLayout from "./components/MainLayout"; 
import ClientPortal from "./components/client/ClientPortal"; 

// Public / Auth
import Landing from "./components/home";
import LoginPage from "./components/LoginPage";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword"; 
import NotFoundPage from "./components/NotFoundPage";
import LoadingPage from "./components/LoadingPage";

// Admin/Employee Components
import Dashboard from "./components/Dashboard";
import InvoiceList from "./components/InvoiceList";
import CreateInvoice from "./components/CreateInvoice";
import ClientList from "./components/ClientList";
import AddClient from "./components/AddClient"; 
import EditClient from "./components/EditClient"; 
import ProductList from "./components/ProductList";
import AddProduct from "./components/AddProduct";
import ReportGenerator from "./components/ReportGenerator";
import EmployeeManager from "./components/EmployeeManager";
import InventoryManager from "./components/InventoryManager";
import AcceptOrder from "./components/AcceptOrder";
import CreateNewPayment from "./components/CreateNewPayment";
import PaymentManagement from "./components/PaymentManagement";
import AdminRazorpayDashboard from "./components/AdminRazorpayDashboard"; 
import ProfilePage from "./components/ProfilePage";
import PrivateRoute from "./components/PrivateRoute";
import StoreList from "./components/StoreList";
import AddStore from "./components/AddStore";
import EditStore from "./components/EditStore";
import Settings from "./components/Settings";
import AddEditEmployee from "./components/AddEditEmployee";

// Client Portal Components
import ClientLogin from "./components/client/ClientLogin";
import ClientDashboard from "./components/client/ClientDashboard";
import ClientInvoices from "./components/client/ClientInvoices";
import ClientOrders from "./components/client/ClientOrders";
import CreateOrder from "./components/client/CreateOrder";
import ClientPayments from "./components/client/ClientPayments";
import ClientProfile from "./components/client/ClientProfile";
import OrderDetails from "./components/client/OrderDetails"; 


const App = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) return <LoadingPage />;

  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <StoreProvider>
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<Register />} /> 
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* --- Client Portal Routes (Nested Layout) --- */}
            <Route path="/client-login" element={<ClientLogin />} />
            <Route path="/client-portal" element={<ClientPortal />}> 
                <Route index element={<ClientDashboard />} /> 
                <Route path="dashboard" element={<ClientDashboard />} />
                <Route path="invoices" element={<ClientInvoices />} />
                <Route path="orders" element={<ClientOrders />} />
                <Route path="orders/create" element={<CreateOrder />} />
                <Route path="orders/:id" element={<OrderDetails />} />
                <Route path="payments" element={<ClientPayments />} />
                <Route path="profile" element={<ClientProfile />} />
            </Route>

            {/* --- Admin/Employee Routes (Protected and Nested) --- */}
            <Route 
                path="/" 
                element={<PrivateRoute element={<MainLayout />} requiredRole="admin" />}
            >
                <Route path="dashboard" element={<Dashboard />} />
                
                <Route path="invoicelist" element={<InvoiceList />} />
                <Route path="create-invoice" element={<CreateInvoice />} />
                
                <Route path="client-list" element={<ClientList />} />
                <Route path="add-client" element={<AddClient />} />
                <Route path="edit-client/:id" element={<EditClient />} />

                <Route path="product-management" element={<ProductList />} />
                <Route path="add-product" element={<AddProduct />} />
                
                <Route path="inventory-manager" element={<InventoryManager />} />
                <Route path="AcceptOrder" element={<AcceptOrder />} />
                
                <Route path="payment-manager" element={<PaymentManagement />} />
                <Route path="create-new-payment" element={<CreateNewPayment />} />
                <Route path="payments/razorpay-admin" element={<AdminRazorpayDashboard />} />
                
                <Route path="report-generator" element={<ReportGenerator />} />
                <Route path="employee-manager" element={<EmployeeManager />} />
                <Route path="add-employee" element={<AddEditEmployee />} />
                <Route path="edit-employee/:id" element={<AddEditEmployee />} />
                
                <Route path="store-list" element={<StoreList />} />
                <Route path="add-store" element={<AddStore />} />
                <Route path="edit-store/:id" element={<EditStore />} />
                
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<ProfilePage />} />
                
                {/* Redirect '/' to '/dashboard' for authenticated users */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>


            {/* Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
          </StoreProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;