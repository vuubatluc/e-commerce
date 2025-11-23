import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";

// Admin Pages - ĐỔI TÊN để tránh trùng
import AdminDashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import ProductsManagement from "./pages/admin/ProductsManagement";
import OrdersManagement from "./pages/admin/OrdersManagement";

// Layouts
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProfileLayout from "./layouts/ProfileLayout";

// Context
import { ProductProvider } from "./context/ProductContext"; 

// Utils
import { isAuthenticated } from "./services/api";

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
  return (
    <ProductProvider>
      <Router>
        <Routes>
          {/* Public Routes with MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
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
                  <OrdersManagement />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* 404 Not Found */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ProductProvider>
  );
}

export default App;