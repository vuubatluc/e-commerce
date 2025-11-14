import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardNavbar from './DashboardNavbar';
import './styles/Dashboard.css';

function Dashboard() {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const roles = JSON.parse(localStorage.getItem('roles') || '[]');

  useEffect(() => {
    document.title = 'Dashboard';
  }, []);

  return (
    <>
      <DashboardNavbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
        </div>

        
      </div>
    </>
  );
}

export default Dashboard;
