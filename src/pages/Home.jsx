import React, { useEffect } from 'react';
import { isAuthenticated } from '../services/api';
import '../App.css';

function Home() {
  const isLoggedIn = isAuthenticated();
  const username = localStorage.getItem("username");
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  const isAdmin = roles.includes("ADMIN");

  useEffect(() => {
    document.title = 'Trang chủ - E-Commerce';
  }, []);

  return (
    <div className="home-container">
      <h1>🛒 Chào mừng đến với E-Commerce</h1>
      
      {isLoggedIn ? (
        <div className="welcome-section">
          <h2>Xin chào, {username}!</h2>
          {isAdmin && (
            <p>Bạn là quản trị viên. <a href="/dashboard">Đi đến Dashboard</a></p>
          )}
        </div>
      ) : (
        <div className="welcome-section">
          <p>Vui lòng <a href="/login">đăng nhập</a> hoặc <a href="/signup">đăng ký</a> để tiếp tục</p>
        </div>
      )}
    </div>
  );
}

export default Home;
