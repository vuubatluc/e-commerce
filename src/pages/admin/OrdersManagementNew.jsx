import React, { useState, useEffect } from 'react';
import { orderAPI, userAPI, productAPI, addressAPI } from '../../services/api';
import './OrdersManagementNew.css';

const OrdersManagementNew = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Form states for create/edit
  const [formData, setFormData] = useState({
    userId: '',
    addressId: '',
    items: [],
    shippingFee: 0,
    note: ''
  });
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadOrders();
    loadUsers();
    loadProducts();
  }, [currentPage]);

  // Load addresses when user is selected
  useEffect(() => {
    if (formData.userId) {
      loadUserAddresses(formData.userId);
    } else {
      setAddresses([]);
      setFormData(prev => ({ ...prev, addressId: '' }));
    }
  }, [formData.userId]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAll(currentPage, pageSize, 'placedAt', 'DESC');
      
      if (response.code === 1000 && response.result) {
        setOrders(response.result.content || []);
        setTotalPages(response.result.totalPages || 0);
      }
    } catch (err) {
      console.error('Lỗi khi tải đơn hàng:', err);
      setError('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userAPI.getUsers();
      if (response.code === 1000 && response.result) {
        setUsers(response.result);
      }
    } catch (err) {
      console.error('Lỗi khi tải người dùng:', err);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productAPI.getProducts();
      if (response.code === 1000 && response.result) {
        setProducts(response.result.content || []);
      }
    } catch (err) {
      console.error('Lỗi khi tải sản phẩm:', err);
    }
  };

  const loadUserAddresses = async (userId) => {
    try {
      const response = await addressAPI.getByUserId(userId);
      if (response.code === 1000 && response.result) {
        setAddresses(response.result);
      }
    } catch (err) {
      console.error('Lỗi khi tải địa chỉ:', err);
      setAddresses([]);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    
    if (!formData.userId || !formData.addressId || formData.items.length === 0) {
      setError('Vui lòng chọn người dùng, địa chỉ và thêm ít nhất 1 sản phẩm');
      return;
    }

    try {
      setLoading(true);
      const response = await orderAPI.create(formData);
      
      if (response.code === 1000) {
        setShowCreateModal(false);
        resetForm();
        loadOrders();
        alert('Tạo đơn hàng thành công!');
      } else {
        setError(response.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      console.error('Lỗi khi tạo đơn hàng:', err);
      setError('Không thể tạo đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    
    if (!selectedOrder) return;

    try {
      setLoading(true);
      const updateData = {
        status: formData.status,
        note: formData.note
      };
      
      const response = await orderAPI.update(selectedOrder.id, updateData);
      
      if (response.code === 1000) {
        setShowEditModal(false);
        resetForm();
        loadOrders();
        alert('Cập nhật đơn hàng thành công!');
      } else {
        setError(response.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật đơn hàng:', err);
      setError('Không thể cập nhật đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) return;

    try {
      setLoading(true);
      const response = await orderAPI.delete(id);
      
      if (response.code === 1000) {
        loadOrders();
        alert('Xóa đơn hàng thành công!');
      } else {
        setError(response.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      console.error('Lỗi khi xóa đơn hàng:', err);
      setError('Không thể xóa đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setFormData({
      status: order.status,
      note: order.note || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      addressId: '',
      items: [],
      shippingFee: 0,
      note: ''
    });
    setSelectedOrder(null);
    setAddresses([]);
    setError('');
  };

  const addProductToOrder = (productId) => {
    const product = products.find(p => p.id === parseInt(productId));
    if (!product) return;

    const existingItem = formData.items.find(item => item.productId === product.id);
    
    if (existingItem) {
      setFormData({
        ...formData,
        items: formData.items.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      });
    } else {
      setFormData({
        ...formData,
        items: [...formData.items, { productId: product.id, quantity: 1, productName: product.name }]
      });
    }
  };

  const updateItemQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeProductFromOrder(productId);
      return;
    }

    setFormData({
      ...formData,
      items: formData.items.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    });
  };

  const removeProductFromOrder = (productId) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.productId !== productId)
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { label: 'Chờ xử lý', class: 'status-pending' },
      'confirmed': { label: 'Đã xác nhận', class: 'status-confirmed' },
      'shipping': { label: 'Đang giao', class: 'status-shipping' },
      'completed': { label: 'Hoàn thành', class: 'status-completed' },
      'cancelled': { label: 'Đã hủy', class: 'status-cancelled' }
    };
    
    const statusInfo = statusMap[status] || { label: status, class: 'status-default' };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.userName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="orders-management-new">
      <div className="page-header">
        <div className="header-left">
          <h1>📦 Quản lý đơn hàng</h1>
          <p className="subtitle">Quản lý tất cả đơn hàng trong hệ thống</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          ➕ Tạo đơn hàng mới
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm theo mã đơn, tên khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label>Trạng thái:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Tất cả</option>
            <option value="pending">Chờ xử lý</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="shipping">Đang giao</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Số sản phẩm</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày đặt</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="order-number">#{order.orderNumber}</td>
                    <td>{order.userName}</td>
                    <td className="text-center">{order.items?.length || 0}</td>
                    <td className="order-total">{order.total?.toLocaleString('vi-VN')}₫</td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td>{new Date(order.placedAt).toLocaleString('vi-VN')}</td>
                    <td className="actions">
                      <button 
                        className="btn-icon btn-view"
                        onClick={() => handleViewDetail(order)}
                        title="Xem chi tiết"
                      >
                        👁️
                      </button>
                      <button 
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(order)}
                        title="Sửa"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-icon btn-delete"
                        onClick={() => handleDeleteOrder(order.id)}
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
          >
            ← Trước
          </button>
          
          <span className="page-info">
            Trang {currentPage + 1} / {totalPages}
          </span>
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage === totalPages - 1}
          >
            Sau →
          </button>
        </div>
      )}

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Tạo đơn hàng mới</h2>
              <button className="btn-close" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleCreateOrder}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Khách hàng *</label>
                  <select
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value, addressId: '' })}
                    required
                  >
                    <option value="">-- Chọn khách hàng --</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.username} - {user.email}</option>
                    ))}
                  </select>
                </div>

                {formData.userId && (
                  <div className="form-group">
                    <label>Địa chỉ giao hàng *</label>
                    <select
                      value={formData.addressId}
                      onChange={(e) => setFormData({ ...formData, addressId: e.target.value })}
                      required
                    >
                      <option value="">-- Chọn địa chỉ --</option>
                      {addresses.map(address => (
                        <option key={address.id} value={address.id}>
                          {address.label} - {address.street}, {address.city}
                        </option>
                      ))}
                    </select>
                    {addresses.length === 0 && (
                      <small className="text-muted">Khách hàng chưa có địa chỉ nào</small>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label>Thêm sản phẩm</label>
                  <select onChange={(e) => {
                    if (e.target.value) {
                      addProductToOrder(e.target.value);
                      e.target.value = '';
                    }
                  }}>
                    <option value="">-- Chọn sản phẩm --</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {product.price?.toLocaleString('vi-VN')}₫
                      </option>
                    ))}
                  </select>
                </div>

                {formData.items.length > 0 && (
                  <div className="order-items-list">
                    <h4>Sản phẩm đã chọn:</h4>
                    {formData.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <span className="item-name">{item.productName}</span>
                        <div className="item-controls">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(item.productId, parseInt(e.target.value))}
                          />
                          <button
                            type="button"
                            className="btn-remove"
                            onClick={() => removeProductFromOrder(item.productId)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="form-group">
                  <label>Phí vận chuyển (₫)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.shippingFee}
                    onChange={(e) => setFormData({ ...formData, shippingFee: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="form-group">
                  <label>Ghi chú</label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    rows="3"
                    placeholder="Ghi chú cho đơn hàng..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Đang tạo...' : 'Tạo đơn hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Chi tiết đơn hàng #{selectedOrder.orderNumber}</h2>
              <button className="btn-close" onClick={() => setShowDetailModal(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="order-detail-grid">
                <div className="detail-section">
                  <h3>Thông tin đơn hàng</h3>
                  <div className="detail-row">
                    <span className="label">Mã đơn:</span>
                    <span className="value">#{selectedOrder.orderNumber}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Khách hàng:</span>
                    <span className="value">{selectedOrder.userName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Trạng thái:</span>
                    <span className="value">{getStatusBadge(selectedOrder.status)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Ngày đặt:</span>
                    <span className="value">{new Date(selectedOrder.placedAt).toLocaleString('vi-VN')}</span>
                  </div>
                  {selectedOrder.note && (
                    <div className="detail-row">
                      <span className="label">Ghi chú:</span>
                      <span className="value">{selectedOrder.note}</span>
                    </div>
                  )}
                </div>

                {selectedOrder.address && (
                  <div className="detail-section">
                    <h3>📍 Địa chỉ giao hàng</h3>
                    <div className="detail-row">
                      <span className="label">Nhãn:</span>
                      <span className="value">{selectedOrder.address.label}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Địa chỉ:</span>
                      <span className="value">
                        {selectedOrder.address.street}, {selectedOrder.address.city}
                        {selectedOrder.address.state && `, ${selectedOrder.address.state}`}
                        {selectedOrder.address.postalCode && ` - ${selectedOrder.address.postalCode}`}
                      </span>
                    </div>
                    {selectedOrder.address.country && (
                      <div className="detail-row">
                        <span className="label">Quốc gia:</span>
                        <span className="value">{selectedOrder.address.country}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="detail-section">
                  <h3>🛍️ Sản phẩm ({selectedOrder.items?.length || 0})</h3>
                  <table className="detail-items-table">
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>Đơn giá</th>
                        <th>Số lượng</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, index) => (
                        <tr key={index}>
                          <td>{item.productName}</td>
                          <td>{item.unitPrice?.toLocaleString('vi-VN')}₫</td>
                          <td className="text-center">{item.quantity}</td>
                          <td>{item.totalPrice?.toLocaleString('vi-VN')}₫</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="detail-section">
                  <h3>💰 Thanh toán</h3>
                  <div className="detail-row">
                    <span className="label">Tạm tính:</span>
                    <span className="value">{selectedOrder.subtotal?.toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Phí vận chuyển:</span>
                    <span className="value">{selectedOrder.shippingFee?.toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="detail-row total-row">
                    <span className="label">Tổng cộng:</span>
                    <span className="value">{selectedOrder.total?.toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Cập nhật đơn hàng #{selectedOrder.orderNumber}</h2>
              <button className="btn-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleUpdateOrder}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Trạng thái *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    required
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="shipping">Đang giao</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Ghi chú</label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    rows="3"
                    placeholder="Ghi chú cho đơn hàng..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagementNew;
