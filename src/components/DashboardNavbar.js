import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { handleLogout } from '../services/api';
import '../styles/DashboardNavbar.css';

function DashboardNavbar() {
  const location = useLocation();
  const username = localStorage.getItem('username');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
  

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onLogout = () => {
    handleLogout();
    window.location.href = '/';
  };

  return (
    <nav className="dashboard-navbar">
      <div className="dashboard-navbar-container">
        <Link to="/dashboard" className="dashboard-logo">
          Dashboard
        </Link>

        <ul className="dashboard-menu">
          <li className="dashboard-menu-item">
            <Link 
              to="/dashboard" 
              className={location.pathname === '/dashboard' ? 'dashboard-menu-link active' : 'dashboard-menu-link'}
            >
              Tổng quan
            </Link>
          </li>
          <li className="dashboard-menu-item">
            <Link 
              to="/dashboard/users" 
              className={location.pathname === '/dashboard/users' ? 'dashboard-menu-link active' : 'dashboard-menu-link'}
            >
              Người dùng
            </Link>
          </li>
          <li className="dashboard-menu-item">
            <Link 
              to="/dashboard/products" 
              className={location.pathname === '/dashboard/products' ? 'dashboard-menu-link active' : 'dashboard-menu-link'}
            >
              Sản phẩm
            </Link>
          </li>
          <li className="dashboard-menu-item">
            <Link 
              to="/dashboard/orders" 
              className={location.pathname === '/dashboard/orders' ? 'dashboard-menu-link active' : 'dashboard-menu-link'}
            >
              Đơn hàng
            </Link>
          </li>
        </ul>

        <div className="dashboard-user-section">
          <Link to="/" className="back-to-shop">
            Về trang chủ
          </Link>
          
          <div className="dashboard-user-dropdown" ref={dropdownRef}>
            <button 
              className="dashboard-user-btn" 
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {username} ▼
            </button>
            {showDropdown && (
              <div className="dashboard-dropdown-menu">
                <Link 
                  to="/profile" 
                  className="dashboard-dropdown-item"
                  onClick={() => setShowDropdown(false)}
                >
                  Hồ sơ của tôi
                </Link>
                <button onClick={onLogout} className="dashboard-dropdown-item logout-item">
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default DashboardNavbar;
