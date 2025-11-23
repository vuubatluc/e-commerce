import React, { useState, useEffect } from 'react';
import './AllOrders.css';

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Load orders từ localStorage
  useEffect(() => {
    const savedOrders = localStorage.getItem('ecommerce_orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    } else {
      // Sample data cho demo
      const sampleOrders = [
        {
          id: 'ORD-001',
          orderNumber: '001',
          customer: { name: 'Nguyễn Văn A', phone: '0123456789', email: 'a@email.com' },
          items: [
            { productId: 'P1', name: 'Áo thun nam', quantity: 2, price: 250000, color: 'Đen', size: 'L', subtotal: 500000 }
          ],
          pricing: { subtotal: 500000, discount: 50000, total: 450000 },
          payment: { method: 'cash', status: 'paid', amountPaid: 500000, change: 50000 },
          status: 'completed',
          createdAt: '2025-01-22T10:30:00',
          notes: ''
        },
        {
          id: 'ORD-002',
          orderNumber: '002',
          customer: { name: 'Trần Thị B', phone: '0987654321', email: 'b@email.com' },
          items: [
            { productId: 'P2', name: 'Quần jean', quantity: 1, price: 450000, color: 'Xanh', size: '30', subtotal: 450000 }
          ],
          pricing: { subtotal: 450000, discount: 0, total: 450000 },
          payment: { method: 'banking', status: 'paid' },
          status: 'paid',
          createdAt: '2025-01-22T11:00:00',
          notes: ''
        },
        {
          id: 'ORD-003',
          orderNumber: '003',
          customer: { name: 'Lê Văn C', phone: '0369852147', email: '' },
          items: [
            { productId: 'P3', name: 'Giày thể thao', quantity: 1, price: 850000, color: 'Trắng', size: '42', subtotal: 850000 }
          ],
          pricing: { subtotal: 850000, discount: 100000, total: 750000 },
          payment: { method: 'card', status: 'pending' },
          status: 'pending',
          createdAt: '2025-01-22T14:20:00',
          notes: 'Khách yêu cầu giữ hàng'
        }
      ];
      setOrders(sampleOrders);
      localStorage.setItem('ecommerce_orders', JSON.stringify(sampleOrders));
    }
  }, []);

  // Lọc đơn hàng
  const filteredOrders = orders.filter(order => {
    // Lọc theo trạng thái
    if (filterStatus !== 'all' && order.status !== filterStatus) {
      return false;
    }

    // Lọc theo phương thức thanh toán
    if (filterPayment !== 'all' && order.payment.method !== filterPayment) {
      return false;
    }

    // Lọc theo ngày
    if (filterDate !== 'all') {
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      
      if (filterDate === 'today') {
        if (orderDate.toDateString() !== today.toDateString()) return false;
      } else if (filterDate === 'week') {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (orderDate < weekAgo) return false;
      } else if (filterDate === 'month') {
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (orderDate < monthAgo) return false;
      }
    }

    // Lọc theo giá
    if (minPrice && order.pricing.total < parseFloat(minPrice)) {
      return false;
    }
    if (maxPrice && order.pricing.total > parseFloat(maxPrice)) {
      return false;
    }

    // Tìm kiếm
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(search) ||
        order.customer.name.toLowerCase().includes(search) ||
        order.customer.phone.includes(search)
      );
    }

    return true;
  });

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Thống kê
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    paid: orders.filter(o => o.status === 'paid').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalRevenue: orders
      .filter(o => o.status === 'completed' || o.status === 'paid')
      .reduce((sum, o) => sum + o.pricing.total, 0)
  };

  // Trạng thái badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Chờ thanh toán', color: '#FFA726', icon: '🟡' },
      paid: { label: 'Đã thanh toán', color: '#66BB6A', icon: '🟢' },
      completed: { label: 'Hoàn thành', color: '#42A5F5', icon: '✅' },
      cancelled: { label: 'Đã hủy', color: '#EF5350', icon: '🔴' },
      refunded: { label: 'Hoàn trả', color: '#78909C', icon: '⚫' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className="status-badge" style={{ backgroundColor: config.color }}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    );
  };

  // Xem chi tiết
  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilterStatus('all');
    setFilterDate('all');
    setFilterPayment('all');
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setCurrentPage(1);
  };

  return (
    <div className="all-orders-container">
      {/* Thống kê */}
      <div className="orders-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#E3F2FD' }}>📦</div>
          <div className="stat-info">
            <span className="stat-label">Tổng đơn hàng</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#FFF3E0' }}>🟡</div>
          <div className="stat-info">
            <span className="stat-label">Chờ thanh toán</span>
            <span className="stat-value">{stats.pending}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#E8F5E9' }}>🟢</div>
          <div className="stat-info">
            <span className="stat-label">Đã thanh toán</span>
            <span className="stat-value">{stats.paid}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#E1F5FE' }}>✅</div>
          <div className="stat-info">
            <span className="stat-label">Hoàn thành</span>
            <span className="stat-value">{stats.completed}</span>
          </div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-icon" style={{ backgroundColor: '#C8E6C9' }}>💰</div>
          <div className="stat-info">
            <span className="stat-label">Doanh thu</span>
            <span className="stat-value">{stats.totalRevenue.toLocaleString('vi-VN')}₫</span>
          </div>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="orders-filters">
        <div className="filters-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Tìm kiếm theo mã đơn, tên, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">📋 Tất cả trạng thái</option>
            <option value="pending">🟡 Chờ thanh toán</option>
            <option value="paid">🟢 Đã thanh toán</option>
            <option value="completed">✅ Hoàn thành</option>
            <option value="cancelled">🔴 Đã hủy</option>
            <option value="refunded">⚫ Hoàn trả</option>
          </select>

          <select 
            className="filter-select"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          >
            <option value="all">📅 Tất cả thời gian</option>
            <option value="today">Hôm nay</option>
            <option value="week">7 ngày qua</option>
            <option value="month">30 ngày qua</option>
          </select>

          <select 
            className="filter-select"
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
          >
            <option value="all">💳 Tất cả thanh toán</option>
            <option value="cash">💵 Tiền mặt</option>
            <option value="banking">🏦 Chuyển khoản</option>
            <option value="card">💳 Thẻ</option>
          </select>
        </div>

        <div className="filters-row">
          <div className="price-filter">
            <input
              type="number"
              placeholder="Giá tối thiểu"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="price-input"
            />
            <span className="price-separator">-</span>
            <input
              type="number"
              placeholder="Giá tối đa"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="price-input"
            />
          </div>

          <button className="btn-reset" onClick={handleResetFilters}>
            🔄 Reset bộ lọc
          </button>

          <div className="filter-result">
            Hiển thị <strong>{filteredOrders.length}</strong> đơn hàng
          </div>
        </div>
      </div>

      {/* Danh sách đơn hàng */}
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>SĐT</th>
              <th>SL sản phẩm</th>
              <th>Tổng tiền</th>
              <th>Thanh toán</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-orders">
                  <div className="no-orders-content">
                    <div className="no-orders-icon">📦</div>
                    <p>Không tìm thấy đơn hàng nào</p>
                    <span>Thử thay đổi bộ lọc hoặc tìm kiếm</span>
                  </div>
                </td>
              </tr>
            ) : (
              currentOrders.map((order) => (
                <tr key={order.id} className="order-row">
                  <td className="order-number">#{order.orderNumber}</td>
                  <td className="customer-name">{order.customer.name || 'Khách lẻ'}</td>
                  <td>{order.customer.phone || '-'}</td>
                  <td className="text-center">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </td>
                  <td className="order-total">{order.pricing.total.toLocaleString('vi-VN')}₫</td>
                  <td>
                    <span className="payment-method">
                      {order.payment.method === 'cash' && '💵 Tiền mặt'}
                      {order.payment.method === 'banking' && '🏦 Chuyển khoản'}
                      {order.payment.method === 'card' && '💳 Thẻ'}
                    </span>
                  </td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>{new Date(order.createdAt).toLocaleString('vi-VN')}</td>
                  <td>
                    <button 
                      className="btn-view"
                      onClick={() => handleViewDetail(order)}
                      title="Xem chi tiết"
                    >
                      👁️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ← Trước
          </button>
          
          <div className="pagination-pages">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                className={`pagination-page ${currentPage === index + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Sau →
          </button>
        </div>
      )}

      {/* Modal chi tiết đơn hàng */}
      {showDetailModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content order-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Chi tiết đơn hàng #{selectedOrder.orderNumber}</h2>
              <button className="btn-close" onClick={() => setShowDetailModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              {/* Thông tin đơn hàng */}
              <div className="order-detail-section">
                <h3>📦 Thông tin đơn hàng</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Mã đơn:</span>
                    <span className="info-value">#{selectedOrder.orderNumber}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Trạng thái:</span>
                    <span className="info-value">{getStatusBadge(selectedOrder.status)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Ngày tạo:</span>
                    <span className="info-value">{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                </div>
              </div>

              {/* Thông tin khách hàng */}
              <div className="order-detail-section">
                <h3>👤 Thông tin khách hàng</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Tên:</span>
                    <span className="info-value">{selectedOrder.customer.name || 'Khách lẻ'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">SĐT:</span>
                    <span className="info-value">{selectedOrder.customer.phone || '-'}</span>
                  </div>
                  {selectedOrder.customer.email && (
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{selectedOrder.customer.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sản phẩm */}
              <div className="order-detail-section">
                <h3>🛍️ Sản phẩm ({selectedOrder.items.length})</h3>
                <table className="order-items-table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Màu/Size</th>
                      <th>Đơn giá</th>
                      <th>SL</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.color} / {item.size}</td>
                        <td>{item.price.toLocaleString('vi-VN')}₫</td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-right">{item.subtotal.toLocaleString('vi-VN')}₫</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Thanh toán */}
              <div className="order-detail-section">
                <h3>💰 Thanh toán</h3>
                <div className="payment-summary">
                  <div className="payment-row">
                    <span>Tạm tính:</span>
                    <span>{selectedOrder.pricing.subtotal.toLocaleString('vi-VN')}₫</span>
                  </div>
                  {selectedOrder.pricing.discount > 0 && (
                    <div className="payment-row discount">
                      <span>Giảm giá:</span>
                      <span>-{selectedOrder.pricing.discount.toLocaleString('vi-VN')}₫</span>
                    </div>
                  )}
                  <div className="payment-row total">
                    <span>Tổng cộng:</span>
                    <span>{selectedOrder.pricing.total.toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="payment-row">
                    <span>Phương thức:</span>
                    <span>
                      {selectedOrder.payment.method === 'cash' && '💵 Tiền mặt'}
                      {selectedOrder.payment.method === 'banking' && '🏦 Chuyển khoản'}
                      {selectedOrder.payment.method === 'card' && '💳 Thẻ'}
                    </span>
                  </div>
                  {selectedOrder.payment.method === 'cash' && selectedOrder.payment.amountPaid && (
                    <>
                      <div className="payment-row">
                        <span>Khách đưa:</span>
                        <span>{selectedOrder.payment.amountPaid.toLocaleString('vi-VN')}₫</span>
                      </div>
                      <div className="payment-row change">
                        <span>Tiền thừa:</span>
                        <span>{selectedOrder.payment.change.toLocaleString('vi-VN')}₫</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Ghi chú */}
              {selectedOrder.notes && (
                <div className="order-detail-section">
                  <h3>📝 Ghi chú</h3>
                  <p className="order-notes">{selectedOrder.notes}</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>
                Đóng
              </button>
              <button className="btn-primary" onClick={() => window.print()}>
                🖨️ In hóa đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllOrders;