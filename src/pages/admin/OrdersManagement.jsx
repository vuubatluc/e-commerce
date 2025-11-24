import React, { useState, useEffect } from 'react';
import AllOrders from './AllOrders';
import './OrdersManagement.css';

const OrdersManagement = () => {
  useEffect(() => {
      document.title = 'Quản lý đơn hàng';
    }, []);
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="orders-management">
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <span className="tab-icon">📋</span>
          Danh Sách Đơn Hàng
        </button>
        <button
          className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          <span className="tab-icon">🛒</span>
          Tạo Đơn Hàng
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'all' && <AllOrders />}
        {activeTab === 'create' && <div style={{padding: '40px', textAlign: 'center'}}>
          <h2>🛒 Tạo đơn hàng (Coming soon...)</h2>
        </div>}
      </div>
    </div>
  );
};

export default OrdersManagement;