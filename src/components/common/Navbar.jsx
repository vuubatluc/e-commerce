import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isAuthenticated, handleLogout } from '../../services/api';
import './Navbar.css';

function Navbar({ variant = 'default' }) {
  const isDashboard = variant === 'dashboard';
  const isLoggedIn = isAuthenticated();
  const username = localStorage.getItem('username');
  const roles = JSON.parse(localStorage.getItem('roles') || '[]');
  const isAdmin = roles.includes('ADMIN');
  const location = useLocation();
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

  // Dashboard variant
  if (isDashboard) {
    return (
      <nav className="navbar navbar-dashboard">
        <div className="navbar-container">
          <Link to="/dashboard" className="navbar-logo">
            Dashboard
          </Link>

          <ul className="navbar-menu navbar-menu-center">
            <li className="navbar-item">
              <Link 
                to="/dashboard" 
                className={location.pathname === '/dashboard' ? 'navbar-link active' : 'navbar-link'}
              >
                Tổng quan
              </Link>
            </li>
            <li className="navbar-item">
              <Link 
                to="/dashboard/users" 
                className={location.pathname === '/dashboard/users' ? 'navbar-link active' : 'navbar-link'}
              >
                Người dùng
              </Link>
            </li>
            <li className="navbar-item">
              <Link 
                to="/dashboard/products" 
                className={location.pathname === '/dashboard/products' ? 'navbar-link active' : 'navbar-link'}
              >
                Sản phẩm
              </Link>
            </li>
            <li className="navbar-item">
              <Link 
                to="/dashboard/orders" 
                className={location.pathname === '/dashboard/orders' ? 'navbar-link active' : 'navbar-link'}
              >
                Đơn hàng
              </Link>
            </li>
          </ul>

          <div className="navbar-user-section">
            <Link to="/" className="navbar-back-link">
              Về trang chủ
            </Link>
            
            <div className="navbar-dropdown" ref={dropdownRef}>
              <button 
                className="navbar-user" 
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {username} ▼
              </button>
              {showDropdown && (
                <div className="dropdown-menu">
                  <Link 
                    to="/profile" 
                    className="dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    Hồ sơ của tôi
                  </Link>
                  <button onClick={onLogout} className="dropdown-item logout-item">
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

  // Default variant (Home/User pages)
  return (
    <nav className="navbar navbar-default">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Shop
        </Link>

        <ul className="navbar-menu">
          {isLoggedIn ? (
            <>
              {!isAdmin && (
                <>
                  <li className="navbar-item">
                    <Link to="/cart" className="navbar-link navbar-cart">
                      Giỏ hàng
                    </Link>
                  </li>
                  <li className="navbar-item">
                    <Link to="/profile/orders" className="navbar-link">
                      Lịch sử đơn hàng
                    </Link>
                  </li>
                </>
              )}
              <li className="navbar-item navbar-dropdown" ref={dropdownRef}>
                <button 
                  className="navbar-user" 
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  {username} ▼
                </button>
                {showDropdown && (
                  <div className="dropdown-menu">
                    <Link 
                      to="/profile" 
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      Hồ sơ của tôi
                    </Link>
                    <button onClick={onLogout} className="dropdown-item logout-item">
                      Đăng xuất
                    </button>
                  </div>
                )}
              </li>
            </>
          ) : (
            <>
              <li className="navbar-item">
                <Link 
                  to="/login" 
                  className={location.pathname === '/login' ? 'navbar-link active' : 'navbar-link'}
                >
                  Đăng nhập
                </Link>
              </li>
              <li className="navbar-item">
                <Link 
                  to="/signup" 
                  className={location.pathname === '/signup' ? 'navbar-link active' : 'navbar-link'}
                >
                  Đăng ký
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
  
<Link to="/dashboard/products">Quản Lý Sản Phẩm</Link>
export default Navbar;
