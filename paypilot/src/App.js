import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
//import { ThemeProvider } from "@mui/material/styles";
import { AuthProvider } from "./context/AuthContext.js";
import "bootstrap/dist/css/bootstrap.min.css";

//comman components
import LoadingPage from "./components/LoadingPage.js";
import NotFoundPage from "./components/NotFoundPage.js";
import { ThemeProvider } from "./components/ThemeContext.js";

//main app components
import Register from "./components/Register.js";
import LoginPage from "./components/LoginPage.js";
import ProfilePage from "./components/ProfilePage.js";
import Sidebar from "./components/Sidebar.jsx";
import Navbar from "./components/Navbar.js";
import Dashboard from "./components/Dashboard.js";
//import SalesReport from "./components/SaleReport";
import AddProduct from "./components/AddProduct.jsx";
import ClientList from "./components/ClientList.jsx";
import CreateInvoice from "./components/CreateInvoice.jsx";
import CreateNewPayment from "./components/CreateNewPayment.jsx";
import EmployeeManager from "./components/EmployeeManager.jsx";
import InventoryManager from "./components/InventoryManager.jsx";
//import OrderManager from "./components/OrderManager.jsx";
import ReportGenerator from "./components/ReportGenerator.jsx";
import InvoiceList from "./components/InvoiceList.js";
import AcceptOrder from "./components/AcceptOrder.jsx";
import PaymentManagement from "./components/PaymentManagement.jsx";
import ProductManagement from "./components/ProductList.js";
//main app helpears
import PrivateRoute from "./components/PrivateRoute.js";

//client components
import ClientLogin from "./components/client/ClientLogin.jsx";
import ClientPortal from "./components/client/ClientPortal.jsx";
import ClientSidebar from "./components/client/Sidebar.jsx";
import ClientNavbar from "./components/client/clientNavbar.js"; // Client Navbar
import ClientDashboard from "./components/client/ClientDashboard.jsx";
import ClientProfile from "./components/client/ClientProfile.jsx";
import ClientOrders from "./components/client/ClientOrders.jsx";
import ClientPayments from "./components/client/ClientPayments.jsx";
import CreateOrder from "./components/client/CreateOrder.js";
import Landing from "./components/home.js";

//helapers
import { Buffer } from "buffer";
window.Buffer = Buffer;
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
    setTimeout(() => {
      setLoading(false);
    }, 2000);
    document.title = "PayPilot";
  }, []);
  if (loading) {
    return <LoadingPage />;
  }
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/client-login" element={<ClientLogin />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Landing />} />
          {/* Client Portal Routes */}
          <Route element={<ClientPortalLayout />}>
            <Route path="/client-portal" element={<ClientPortal />} />
            <Route path="/client-dashboard" element={<ClientDashboard />} />
            <Route path="/client-profile" element={<ClientProfile />} />
            <Route path="/client-orders" element={<ClientOrders />} />
            <Route path="/client-payments" element={<ClientPayments />} />
            <Route path="/create-order" element={<CreateOrder />} />
          </Route>

          {/* Main Application Routes */}
          <Route element={<MainAppLayout />}>
            <Route
              path="/dashboard"
              element={
                <PrivateRoute element={<Dashboard />} requiredRole="admin" />
              }
            />
            <Route
              path="/invoicelist"
              element={
                <PrivateRoute element={<InvoiceList />} requiredRole="admin" />
              }
            />
            <Route
              path="/create-invoice"
              element={
                <PrivateRoute
                  element={<CreateInvoice />}
                  requiredRole="admin"
                />
              }
            />
            <Route
              path="/client-list"
              element={
                <PrivateRoute element={<ClientList />} requiredRole="admin" />
              }
            />
            <Route
              path="/product-management"
              element={
                <PrivateRoute
                  element={<ProductManagement />}
                  requiredRole="admin"
                />
              }
            />
            <Route
              path="/add-product"
              element={
                <PrivateRoute element={<AddProduct />} requiredRole="admin" />
              }
            />
            <Route
              path="report-generator"
              element={
                <PrivateRoute
                  element={<ReportGenerator />}
                  requiredRole="admin"
                />
              }
            />
            <Route
              path="/employee-manager"
              element={
                <PrivateRoute
                  element={<EmployeeManager />}
                  requiredRole="admin"
                />
              }
            />
            <Route
              path="/inventory-manager"
              element={
                <PrivateRoute
                  element={<InventoryManager />}
                  requiredRole="admin"
                />
              }
            />
            <Route
              path="/AcceptOrder"
              element={
                <PrivateRoute element={<AcceptOrder />} requiredRole="admin" />
              }
            />
            <Route
              path="/create-new-payment"
              element={
                <PrivateRoute
                  element={<CreateNewPayment />}
                  requiredRole="admin"
                />
              }
            />
            <Route
              path="profile"
              element={
                <PrivateRoute element={<ProfilePage />} requiredRole="admin" />
              }
            />
            <Route
              path="/payment-manager"
              element={
                <PrivateRoute
                  element={<PaymentManagement />}
                  requiredRole="admin"
                />
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

const ClientPortalLayout = () => {
  return (
    <div style={{ display: "flex" }}>
      <AuthProvider>
        <ClientSidebar />
        <div style={{ flex: 1, marginLeft: "250px", width: "100%" }}>
          <ClientNavbar />
          <div style={{ marginTop: "145px" }} />

          <Routes>
            <Route path="/client-portal" element={<ClientPortal />} />
            <Route path="/client-dashboard" element={<ClientDashboard />} />
            <Route path="/client-profile" element={<ClientProfile />} />
            <Route path="/client-orders" element={<ClientOrders />} />
            <Route path="/client-payments" element={<ClientPayments />} />
            <Route path="/create-order" element={<CreateOrder />} />
          </Routes>
        </div>
      </AuthProvider>
    </div>
  );
};

const MainAppLayout = () => {
  return (
    <div style={{ display: "flex" }}>
      <AuthProvider>
        <Sidebar />
        <div style={{ flex: 1, marginLeft: "250px", width: "100%" }}>
          <Navbar />
          <div style={{ marginTop: "145px" }} />
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/invoicelist" element={<InvoiceList />} />
            <Route path="/create-invoice" element={<CreateInvoice />} />
            <Route path="/client-list" element={<ClientList />} />
            <Route path="/product-management" element={<ProductManagement />} />
            <Route path="/add-product" element={<AddProduct />} />
            <Route path="/report-generator" element={<ReportGenerator />} />
            <Route path="/employee-manager" element={<EmployeeManager />} />
            <Route path="/inventory-manager" element={<InventoryManager />} />
            <Route path="/AcceptOrder" element={<AcceptOrder />} />
            <Route path="/create-new-payment" element={<CreateNewPayment />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/payment-manager" element={<PaymentManagement />} />
          </Routes>
        </div>
      </AuthProvider>
    </div>
  );
};

export default App;
