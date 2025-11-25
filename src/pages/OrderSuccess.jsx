import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Đặt hàng thành công - E-Commerce';
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getById(orderId);
      
      if (response.code === 1000) {
        setOrder(response.result);
      } else {
        setError('Không thể tải thông tin đơn hàng');
      }
    } catch (err) {
      console.error('Error loading order:', err);
      setError('Có lỗi xảy ra');
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

  if (loading) {
    return (
      <div className="order-success-page">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-success-page">
        <div className="error-card">
          <h2>⚠️ {error || 'Không tìm thấy đơn hàng'}</h2>
          <button onClick={() => navigate('/')}>Về trang chủ</button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-success-page">
      <div className="success-header">
        <div className="success-icon">✅</div>
        <h1>Đặt hàng thành công!</h1>
        <p>Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất.</p>
      </div>

      <div className="order-details-card">
        <div className="order-info-header">
          <div>
            <h2>Thông tin đơn hàng</h2>
            <p className="order-number">Mã đơn: <strong>{order.orderNumber}</strong></p>
          </div>
          <div className="order-status">
            <span className={`status-badge ${order.status.toLowerCase()}`}>
              {getStatusText(order.status)}
            </span>
          </div>
        </div>

        <div className="order-section">
          <h3>📦 Sản phẩm</h3>
          <div className="order-items">
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-info">
                  <h4>{item.productName}</h4>
                  <p>Số lượng: {item.quantity}</p>
                  <p>Đơn giá: {formatCurrency(item.unitPrice)}</p>
                </div>
                <div className="item-total">
                  {formatCurrency(item.totalPrice)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-section">
          <h3>📍 Địa chỉ giao hàng</h3>
          {order.address && (
            <div className="address-info">
              <p><strong>{order.address.label}</strong></p>
              <p>{order.address.street}</p>
              <p>{order.address.city}, {order.address.state} {order.address.postalCode}</p>
              <p>{order.address.country}</p>
            </div>
          )}
        </div>

        {order.note && (
          <div className="order-section">
            <h3>📝 Ghi chú</h3>
            <p>{order.note}</p>
          </div>
        )}

        <div className="order-section">
          <h3>💰 Tổng thanh toán</h3>
          <div className="payment-summary">
            <div className="summary-row">
              <span>Tạm tính:</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển:</span>
              <span>{formatCurrency(order.shippingFee)}</span>
            </div>
            <div className="summary-row total">
              <span>Tổng cộng:</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
          <p className="payment-method">💳 Thanh toán khi nhận hàng (COD)</p>
        </div>

        <div className="order-section">
          <h3>🕐 Thời gian</h3>
          <p>Đặt hàng lúc: {formatDate(order.placedAt)}</p>
        </div>
      </div>

      <div className="action-buttons">
        <button className="btn-primary" onClick={() => navigate('/profile/orders')}>
          Xem lịch sử đơn hàng
        </button>
        <button className="btn-secondary" onClick={() => navigate('/')}>
          Tiếp tục mua sắm
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;
