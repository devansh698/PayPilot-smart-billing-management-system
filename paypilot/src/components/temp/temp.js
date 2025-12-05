import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AuthProvider } from "./context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";



//comman components
import LoadingPage from "./components/LoadingPage"; 
import NotFoundPage from "./components/NotFoundPage";
import theam from '../theme.js';


//main app components
import Register from "./components/Register";
import LoginPage from "./components/LoginPage";
import ProfilePage from "./components/ProfilePage";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
//import SalesReport from "./components/SaleReport";
import AddProduct from "./components/n/AddProduct.jsx";
import ClientList from "./components/n/ClientList.jsx";
import CreateInvoice from "./components/n/CreateInvoice.jsx";
import CreateNewPayment from "./components/n/CreateNewPayment.jsx";
import EmployeeManager from "./components/n/EmployeeManager.jsx";
import InventoryManager from "./components/n/InventoryManager.jsx";
//import OrderManager from "./components/OrderManager.jsx";
import ReportGenerator from "./components/n/ReportGenerator.jsx";
import InvoiceList from "./components/InvoiceList";
import AcceptOrder from "./components/n/AcceptOrder.jsx";
import PaymentManagement from "./components/PaymentManagement";
//main app helpears
import PrivateRoute from "./components/PrivateRoute";


//client components
import ClientLogin from "./components/client/ClientLogin";
import ClientPortal from "./components/client/ClientPortal";
import ClientSidebar from "./components/client/Sidebar"; 
import ClientNavbar from "./components/client/clientNavbar.js"; // Client Navbar
import ClientDashboard from "./components/client/ClientDashboard";
import ClientProfile from "./components/client/ClientProfile";
import ClientOrders from "./components/client/ClientOrders";
import ClientPayments from "./components/client/ClientPayments";
import CreateOrder from "./components/client/CreateOrder";




//helapers
import { Buffer } from 'buffer';
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
    console.log("Theme:");
    console.log(theam);
    document.title = "PayPilot";
  }, [theam]);
  if (loading) {
    return <LoadingPage />;
  }
  return (
    <ThemeProvider theme={theam}>
      <AuthProvider>
        <Routes>
            {/* Public Routes */}
            <Route path="/client-login" element={<ClientLogin />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<Register />} />

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
            <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} requiredRole="admin" />}/>
            <Route path="/invoicelist" element={<PrivateRoute element={<InvoiceList />} requiredRole="admin" />}/>
            <Route path="/create-invoice" element={<PrivateRoute element={<CreateInvoice />} requiredRole="admin" />}/>
            <Route path="/client-list" element={<PrivateRoute element={<ClientList />} requiredRole="admin" />}/>
            <Route path="/product-management" element={<PrivateRoute element={<AddProduct />} requiredRole="admin" />}/>
            <Route path="/add-product" element={<PrivateRoute element={<AddProduct />} requiredRole="admin" />}/>
            <Route path="report-generator" element={<PrivateRoute element={<ReportGenerator />} requiredRole="admin" />}/>
            <Route path="/employee-manager" element={<PrivateRoute element={<EmployeeManager />} requiredRole="admin" />}/>
            <Route path="/inventory-manager" element={<PrivateRoute element={<InventoryManager />} requiredRole="admin" />}/>
            <Route path="/AcceptOrder" element={<PrivateRoute element={<AcceptOrder />} requiredRole="admin" />}/>
            <Route path="/create-new-payment" element={<PrivateRoute element={<CreateNewPayment />} requiredRole="admin" />}/>
            <Route path="profile" element={<PrivateRoute element={<ProfilePage />} requiredRole="admin" />}/>
            <Route path="/payment-manager" element={<PrivateRoute element={<PaymentManagement />} requiredRole="admin" />}/>


            <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}


const ClientPortalLayout = () => {
    return (
        <div style={{ display: "flex" }}>
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
        </div>
    );
};

const MainAppLayout = () => {
    return (
        <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ flex: 1, marginLeft: "250px", width: "100%" }}>
            <Navbar />
            <div style={{ marginTop: "145px" }} />
            <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/invoicelist" element={<InvoiceList />} />
            <Route path="/create-invoice" element={<CreateInvoice />} />
            <Route path="/client-list" element={<ClientList />} />
            <Route path="/product-management" element={<AddProduct />} />
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
        </div>
    );
};


export default App;















import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AuthProvider } from "./context/AuthContext";
import Register from "./components/Register";
import LoginPage from "./components/LoginPage";
import LoadingPage from "./components/LoadingPage"; 
import ProfilePage from "./components/ProfilePage";
import ProductsPage from "./components/ProductsPage";
import PrivateRoute from "./components/PrivateRoute";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import ClientLogin from "./components/client/ClientLogin";
import ClientPortal from "./components/client/ClientPortal";
import UserManagement from "./components/User Management";
import ClientManagement from "./components/client/ClientManagement";
import InvoiceManagement from "./components/InvoiceManagement";
import PaymentManagement from "./components/PaymentManagement";
import ProductManagement from "./components/ProductList";
import SalesReport from "./components/SaleReport";
import Notification from "./components/Notification";
import ClientSidebar from "./components/client/Sidebar"; // Client Sidebar
import ClientNavbar from "./components/client/clientNavbar.js"; // Client Navbar
import ClientDashboard from "./components/client/ClientDashboard";
import ClientProfile from "./components/client/ClientProfile";
import ClientOrders from "./components/client/ClientOrders";
import ClientPayments from "./components/client/ClientPayments";
import "bootstrap/dist/css/bootstrap.min.css"; // Ensure Bootstrap CSS is imported
import NotFoundPage from "./components/NotFoundPage";
import CreateOrder from "./components/client/CreateOrder";

// New routes
import AddProduct from "./components/n/AddProduct.jsx";
import ClientList from "./components/n/ClientList.jsx";
import CreateInvoice from "./components/n/CreateInvoice.jsx";
import CreateNewPayment from "./components/n/CreateNewPayment.jsx";
import EmployeeManager from "./components/n/EmployeeManager.jsx";
import InventoryManager from "./components/n/InventoryManager.jsx";
import OrderManager from "./components/n/OrderManager.jsx";
import ReportGenerator from "./components/n/ReportGenerator.jsx";
import InvoiceList from "./components/InvoiceList";
import AcceptOrder from "./components/n/AcceptOrder.jsx";
// Axios interceptor for authorization
import "bootstrap/dist/css/bootstrap.min.css";
import { Buffer } from 'buffer';
window.Buffer = Buffer;
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const App = () => {
  const theme = createTheme({
    palette: {
      primary: {
        main: "#1976d2",
      },
      secondary: {
        main: "#dc004e",
      },
    },
    typography: {
      fontFamily: "Roboto, sans-serif",
    },
  });
  const [loading, setLoading] = useState(true); 
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
    console.log("Theme:");
    console.log(theme);
    document.title = "PayPilot";
  }, [theme]);
  if (loading) {
    return <LoadingPage />;
  }

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/client-login" element={<ClientLogin />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<Register />} />

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
              {/* Private Routes */}
              <Route
                path="/dashboard"
                element={<PrivateRoute element={<Dashboard />} requiredRole="admin" />}
              />
              <Route
                path="/products"
                element={<PrivateRoute element={<ProductsPage />} requiredRole="admin" />}
              />
              <Route
                path="/user-management"
                element={<PrivateRoute element={<UserManagement />} requiredRole="admin" />}
              />
              <Route
                path="/client-management"
                element={<PrivateRoute element={<ClientManagement />} requiredRole="Client Manager" />}
              />
              <Route
                path="/invoice-management"
                element={<PrivateRoute element={<InvoiceManagement />} requiredRole="Invoice Manager" />}
              />
              <Route
                path="/payment-management"
                element={<PrivateRoute element={<PaymentManagement />} requiredRole="Payment Manager" />}
              />
              <Route
                path="/product-management"
                element={<PrivateRoute element={<ProductManagement />} requiredRole="Product Manager" />}
              />
              <Route
                path="/sales-report"
                element={<PrivateRoute element={<SalesReport />} requiredRole="admin" />}
              />
              <Route
                path="/notification"
                element={<PrivateRoute element={<Notification />} requiredRole="admin" />}
              />
              <Route
                path="/add-product"
                element={<PrivateRoute element={<AddProduct />} requiredRole="admin" />}
              />
              <Route
                path="/client-list"
                element={<PrivateRoute element={<ClientList />} requiredRole="admin" />}
              />
              <Route
                path="/create-invoice"
                element={<PrivateRoute element={<CreateInvoice />} requiredRole="admin" />}
              />
              <Route
                path="/create-new-payment"
                element={<PrivateRoute element={<CreateNewPayment />} requiredRole="admin" />}
              />
              <Route
                path="/employee-manager"
                element={<PrivateRoute element={<EmployeeManager />} requiredRole="admin" />}
              />
              <Route
                path="/inventory-manager"
                element={<PrivateRoute element={<InventoryManager />} requiredRole="Product Manager" />}
              />
              <Route
                path="/order-manager"
                element={<PrivateRoute element={<OrderManager />} requiredRole="admin" />}
              />
              <Route
                path="/report-generator"
                element={<PrivateRoute element={<ReportGenerator />} requiredRole="admin" />}
              />
              <Route
                path="/invoicelist"
                element={<PrivateRoute element={<InvoiceList />} requiredRole="admin" />}
              />
              <Route
                path="/AcceptOrder"
                element={<PrivateRoute element={<AcceptOrder />} requiredRole="user" />}
              />
              
              {/* Fallback Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

// Client Layout Component
const ClientPortalLayout = () => {
  return (
    <div style={{ display: "flex" }}>
      <ClientSidebar /> {/* Client Sidebar */}
      <div style={{ flex: 1, marginLeft: "250px", width: "100%" }}>
        <ClientNavbar /> {/* Client Navbar */}
        <div style={{ marginTop: "145px" }} /> {/* Adjust margin for navbar */}
        <Routes>
          <Route path="/client-portal" element={<ClientPortal />} />
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="/client-profile" element={<ClientProfile />} />
          <Route path="/client-orders" element={<ClientOrders />} />
          <Route path="/client-payments" element={<ClientPayments />} />
          <Route path="/create-order" element={<CreateOrder />} />
          {/* Add more client-specific routes here */}
        </Routes>
      </div>
    </div>
  );
};

// Main Application Layout Component
const MainAppLayout = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar /> {/* Main App Sidebar */}
      <div style={{ flex: 1, marginLeft: "250px", width: "100%" }}>
        <Navbar /> {/* Main App Navbar */}
        <div style={{ marginTop: "145px" }} /> {/* Adjust margin for navbar */}
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/client-management" element={<ClientManagement />} />
          <Route path="/invoice-management" element={<InvoiceManagement />} />
          <Route path="/payment-management" element={<PaymentManagement />} />
          <Route path="/product-management" element={<ProductManagement />} />
          <Route path="/sales-report" element={<SalesReport />} />
          <Route path="/notification" element={<Notification />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/client-list" element={<ClientList />} />
          <Route path="/create-invoice" element={<CreateInvoice />} />
          <Route path="/create-new-payment" element={<CreateNewPayment />} />
          <Route path="/employee-manager" element={<EmployeeManager />} />
          <Route path="/inventory-manager" element={<InventoryManager />} />
          <Route path="/order-manager" element={<OrderManager />} />
          <Route path="/report-generator" element={<ReportGenerator />} />
          <Route path="/invoicelist" element={<InvoiceList />} />
          <Route path="/AcceptOrder" element={<AcceptOrder />} />
          {/* Add more main app routes here */}
        </Routes>
      </div>
    </div>
  );
};
export default App;


