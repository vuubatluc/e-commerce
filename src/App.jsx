import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ForgotPassword from "./components/ForgotPassword";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import UserManagement from "./components/UserManagement";
import { isAuthenticated, handleLogout } from "./services/api";

function Home() {
  const isLoggedIn = isAuthenticated();
  const username = localStorage.getItem("username");
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");

  useEffect(() => {
    document.title = 'Trang chủ';
  }, []);

  const onLogout = () => {
    handleLogout();
    window.location.reload();
  };

  return (
    <div className="home-container">
      <h1>Hello</h1>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<><Navbar /><Home /></>} />
          <Route path="/login" element={<><Navbar /><Login /></>} />
          <Route path="/signup" element={<><Navbar /><Signup /></>} />
          <Route path="/forgot-password" element={<><Navbar /><ForgotPassword /></>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/users" element={<UserManagement />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
