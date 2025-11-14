import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isAuthenticated, handleLogout } from '../services/api';
import './styles/Navbar.css';

function Navbar() {
  const isLoggedIn = isAuthenticated();
  const username = localStorage.getItem('username');
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

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
         Shop
        </Link>

        <ul className="navbar-menu">
          {isLoggedIn ? (
            <>
              <li className="navbar-item user-dropdown" ref={dropdownRef}>
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

export default Navbar;
