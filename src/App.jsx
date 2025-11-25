import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";

// Cloudinary
import { Cloudinary } from '@cloudinary/url-gen';

// Pages
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import CartPageNew from "./pages/CartPageNew";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import OrderHistory from "./pages/OrderHistory";

// Admin Pages - ĐỔI TÊN để tránh trùng
import AdminDashboard from "./pages/admin/DashboardNew";
import UserManagement from "./pages/admin/UserManagement";
import ProductsManagement from "./pages/admin/ProductsManagement";
import OrdersManagementNew from "./pages/admin/OrdersManagementNew";

// Layouts
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProfileLayout from "./layouts/ProfileLayout";

// Context
import { ProductProvider } from "./context/ProductContext";
import { CartProvider } from "./context/CartContext";

// Utils
import { isAuthenticated } from "./services/api";

// Components
import { Alert } from "./components/common";

// Initialize Cloudinary
export const cld = new Cloudinary({ 
  cloud: { 
    cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'dijdluasd' 
  } 
});

// Protected Route Component
function ProtectedRoute({ children, requireAdmin = false }) {
  const isLoggedIn = isAuthenticated();
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  const isAdmin = roles.includes("ADMIN");

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Public Route Component (redirect if already logged in)
function PublicRoute({ children }) {
  const isLoggedIn = isAuthenticated();

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const [tokenExpiredMessage, setTokenExpiredMessage] = useState('');

  useEffect(() => {
    // Lắng nghe sự kiện token expired
    const handleTokenExpired = (event) => {
      setTokenExpiredMessage(event.detail.message);
      
      // Tự động ẩn thông báo sau 2 giây
      setTimeout(() => {
        setTokenExpiredMessage('');
      }, 5000);
    };

    window.addEventListener('tokenExpired', handleTokenExpired);

    // Cleanup
    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, []);

  return (
    <ProductProvider>
      <CartProvider>
        <Router>
          {/* Global Alert cho token expired */}
          {tokenExpiredMessage && (
            <div style={{ 
              position: 'fixed', 
              top: '20px', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              zIndex: 9999,
              width: '90%',
              maxWidth: '500px',
              backgroundColor: 'white'
            }}>
              <Alert variant="error" onClose={() => setTokenExpiredMessage('')}>
                {tokenExpiredMessage}
              </Alert>
            </div>
          )}

          <Routes>
            {/* Public Routes with MainLayout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<CartPageNew />} />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order-success/:orderId"
                element={
                  <ProtectedRoute>
                    <OrderSuccess />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/orders"
                element={
                  <ProtectedRoute>
                    <OrderHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicRoute>
                    <Signup />
                  </PublicRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <PublicRoute>
                    <ForgotPassword />
                  </PublicRoute>
                }
              />
            </Route>

            {/* Profile Route with ProfileLayout (shows navbar based on role) */}
            <Route element={<ProfileLayout />}>
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Admin Routes with DashboardLayout */}
            <Route element={<DashboardLayout />}>
              {/* Dashboard - Trang tổng quan thống kê */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* User Management - Quản lý người dùng */}
              <Route
                path="/dashboard/users"
                element={
                  <ProtectedRoute requireAdmin>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />

              {/* Products Management - Quản lý sản phẩm */}
              <Route
                path="/dashboard/products"
                element={
                  <ProtectedRoute requireAdmin>
                    <ProductsManagement />
                  </ProtectedRoute>
                }
              />

              {/* Orders Management - Quản lý đơn hàng */}
              <Route
                path="/dashboard/orders"
                element={
                  <ProtectedRoute requireAdmin>
                    <OrdersManagementNew />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* 404 Not Found */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CartProvider>
    </ProductProvider>
  );
}

export default App;
