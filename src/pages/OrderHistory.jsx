import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import './OrderHistory.css';

const OrderHistory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    document.title = 'Lịch sử đơn hàng - E-Commerce';
    loadOrders();
  }, [currentPage]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const userId = localStorage.getItem('userId');
      
      const response = await orderAPI.getByUserId(userId, currentPage, pageSize);
      
      if (response.code === 1000) {
        setOrders(response.result.content || []);
        setTotalPages(response.result.totalPages || 0);
      } else {
        setError('Không thể tải danh sách đơn hàng');
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Vui lòng đăng nhập để xem lịch sử đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusText = (status) => {
    const statusMap = {
      'PENDING': 'Chờ xác nhận',
      'CONFIRMED': 'Đã xác nhận',
      'SHIPPING': 'Đang giao',
      'DELIVERED': 'Đã giao',
      'CANCELLED': 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'PENDING': 'warning',
      'CONFIRMED': 'info',
      'SHIPPING': 'primary',
      'DELIVERED': 'success',
      'CANCELLED': 'danger'
    };
    return colorMap[status] || 'default';
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="order-history-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải lịch sử đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-history-page">
        <div className="error-message">
          <h2>⚠️ {error}</h2>
          <button onClick={() => navigate('/login')}>Đăng nhập</button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history-page">
      <div className="page-header">
        <h1>📋 Lịch sử đơn hàng</h1>
        <p>Quản lý và theo dõi các đơn hàng của bạn</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-icon">📦</div>
          <h2>Chưa có đơn hàng nào</h2>
          <p>Hãy bắt đầu mua sắm ngay!</p>
          <button onClick={() => navigate('/')}>Khám phá sản phẩm</button>
        </div>
      ) : (
        <>
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <div className="order-number">
                    <h3>Đơn hàng #{order.orderNumber}</h3>
                    <p className="order-date">
                      {formatDate(order.placedAt)}
                    </p>
                  </div>
                  <span className={`status-badge ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div className="order-card-body">
                  {/* Order Items */}
                  <div className="order-items-preview">
                    {order.items && order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="item-preview">
                        <span className="item-name">{item.productName}</span>
                        <span className="item-quantity">x{item.quantity}</span>
                      </div>
                    ))}
                    {order.items && order.items.length > 3 && (
                      <p className="more-items">
                        +{order.items.length - 3} sản phẩm khác
                      </p>
                    )}
                  </div>

                  {/* Total */}
                  <div className="order-total">
                    <span>Tổng tiền:</span>
                    <strong>{formatCurrency(order.total)}</strong>
                  </div>
                </div>

                <div className="order-card-footer">
                  <button 
                    className="btn-view-detail"
                    onClick={() => navigate(`/order-success/${order.id}`)}
                  >
                    Xem chi tiết
                  </button>
                  
                  {order.status === 'PENDING' && (
                    <button className="btn-cancel">
                      Hủy đơn
                    </button>
                  )}
                  
                  {order.status === 'DELIVERED' && (
                    <button className="btn-reorder" onClick={() => navigate('/')}>
                      Mua lại
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="btn-page"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                ← Trước
              </button>
              
              <div className="page-numbers">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    className={`btn-page ${currentPage === index ? 'active' : ''}`}
                    onClick={() => handlePageChange(index)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <button 
                className="btn-page"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrderHistory;
