import React, { useState, useEffect } from 'react';
import './AllOrders.css';

const AllOrders = ({ onAddNew, onEdit }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Load orders từ localStorage
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    const savedOrders = localStorage.getItem('ecommerce_orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    } else {
      setOrders([]);
    }
  };

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  // Trạng thái badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Chờ thanh toán', color: '#FFA726', icon: '🟡' },
      paid: { label: 'Đã thanh toán', color: '#66BB6A', icon: '🟢' },
      completed: { label: 'Hoàn thành', color: '#42A5F5', icon: '✅' },
      cancelled: { label: 'Đã hủy', color: '#EF5350', icon: '🔴' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className="status-badge" style={{ backgroundColor: config.color }}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    );
  };

  // Chọn tất cả
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrders(currentOrders.map(o => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  // Chọn đơn hàng
  const handleSelectOrder = (orderId) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  // Sửa đơn hàng
  const handleEdit = () => {
    if (selectedOrders.length === 0) {
      alert('Vui lòng chọn đơn hàng cần sửa!');
      return;
    }
    if (selectedOrders.length > 1) {
      alert('Chỉ được chọn 1 đơn hàng để sửa!');
      return;
    }
    const order = orders.find(o => o.id === selectedOrders[0]);
    
    // Kiểm tra nếu đơn hàng đã hoàn thành thì không cho sửa
    if (order.status === 'completed') {
      alert('Không thể sửa đơn hàng đã hoàn thành!');
      return;
    }
    
    onEdit(order);
  };

  // Xem chi tiết
  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  // In đơn hàng - Tự động chuyển sang Hoàn thành
  const handlePrintOrder = () => {
    if (selectedOrder) {
      // Cập nhật trạng thái đơn hàng thành "completed"
      const updatedOrders = orders.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, status: 'completed' }
          : order
      );
      
      setOrders(updatedOrders);
      localStorage.setItem('ecommerce_orders', JSON.stringify(updatedOrders));
      
      // Cập nhật selectedOrder để hiển thị trạng thái mới
      setSelectedOrder({ ...selectedOrder, status: 'completed' });
      
      // In đơn hàng
      window.print();
      
      alert('✅ Đơn hàng đã được chuyển sang trạng thái Hoàn thành!');
    }
  };

  return (
    <div className="all-orders-container">
      {/* Header với nút Thêm mới và Sửa */}
      <div className="orders-header">
        <h1>Danh Sách Đơn Hàng</h1>
        <div className="header-actions">
          <button 
            className="btn-edit" 
            onClick={handleEdit}
            disabled={selectedOrders.length !== 1}
          >
            ✏️ Sửa
          </button>
          <button className="btn-add-new" onClick={onAddNew}>
            ➕ Thêm mới
          </button>
        </div>
      </div>

      {/* Thông tin số đơn đã chọn */}
      {selectedOrders.length > 0 && (
        <div className="selection-info">
          Đã chọn <strong>{selectedOrders.length}</strong> đơn hàng
        </div>
      )}

      {/* Danh sách đơn hàng */}
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>
                <input
                  type="checkbox"
                  checked={currentOrders.length > 0 && selectedOrders.length === currentOrders.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>SĐT</th>
              <th>SL sản phẩm</th>
              <th>Tổng tiền</th>
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
                    <p>Chưa có đơn hàng nào</p>
                    <span>Bấm "Thêm mới" để tạo đơn hàng đầu tiên</span>
                  </div>
                </td>
              </tr>
            ) : (
              currentOrders.map((order) => (
                <tr key={order.id} className="order-row">
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleSelectOrder(order.id)}
                    />
                  </td>
                  <td className="order-number">#{order.orderNumber}</td>
                  <td className="customer-name">{order.customer.name || 'Khách lẻ'}</td>
                  <td>{order.customer.phone || '-'}</td>
                  <td className="text-center">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </td>
                  <td className="order-total">{order.pricing.total.toLocaleString('vi-VN')}₫</td>
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
                  {selectedOrder.customer.address && (
                    <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                      <span className="info-label">Địa chỉ:</span>
                      <span className="info-value">
                        {selectedOrder.customer.address}
                        {selectedOrder.customer.ward && `, ${selectedOrder.customer.ward}`}
                        {selectedOrder.customer.district && `, ${selectedOrder.customer.district}`}
                        {selectedOrder.customer.city && `, ${selectedOrder.customer.city}`}
                      </span>
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
                      <span>Giảm giá ({selectedOrder.pricing.discountPercent}%):</span>
                      <span>-{selectedOrder.pricing.discount.toLocaleString('vi-VN')}₫</span>
                    </div>
                  )}
                  <div className="payment-row total">
                    <span>Tổng cộng:</span>
                    <span>{selectedOrder.pricing.total.toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>
              </div>

              {/* Ghi chú */}
              {(selectedOrder.customer.notesForPrint || selectedOrder.customer.notesInternal) && (
                <div className="order-detail-section">
                  <h3>📝 Ghi chú</h3>
                  {selectedOrder.customer.notesForPrint && (
                    <div className="note-item">
                      <strong>Ghi chú (In ra):</strong>
                      <p className="order-notes">{selectedOrder.customer.notesForPrint}</p>
                    </div>
                  )}
                  {selectedOrder.customer.notesInternal && (
                    <div className="note-item">
                      <strong>Ghi chú nội bộ:</strong>
                      <p className="order-notes">{selectedOrder.customer.notesInternal}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>
                Đóng
              </button>
              <button className="btn-primary" onClick={handlePrintOrder}>
                🖨️ In đơn hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllOrders;