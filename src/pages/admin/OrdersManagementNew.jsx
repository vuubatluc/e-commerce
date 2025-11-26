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
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showSelectAddressModal, setShowSelectAddressModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Form states for create/edit
  const [formData, setFormData] = useState({
    userId: '',
    addressId: '',
    items: [],
    shippingFee: 0,
    note: ''
  });

  // Product quantities for modal
  const [productQuantities, setProductQuantities] = useState({});
  
  // Form state for address
  const [addressFormData, setAddressFormData] = useState({
    label: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Việt Nam'
  });
  
  // Vietnam address data
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
  
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

  // Load provinces when address modal opens
  useEffect(() => {
    if (showAddressModal) {
      loadProvinces();
    }
  }, [showAddressModal]);

  // Load districts when province changes
  useEffect(() => {
    if (selectedProvinceCode) {
      loadDistricts(selectedProvinceCode);
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [selectedProvinceCode]);

  // Load wards when district changes
  useEffect(() => {
    if (selectedDistrictCode) {
      loadWards(selectedDistrictCode);
    } else {
      setWards([]);
    }
  }, [selectedDistrictCode]);

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
        addressId: formData.addressId,
        items: formData.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        shippingFee: formData.shippingFee,
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
      addressId: order.addressId || '',
      items: order.items?.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        productName: item.productName
      })) || [],
      shippingFee: order.shippingFee || 0,
      status: order.status,
      note: order.note || ''
    });
    // Load addresses for the user
    if (order.userId) {
      loadUserAddresses(order.userId);
    }
    setShowEditModal(true);
  };

  const handleOpenSelectAddress = () => {
    if (selectedOrder && selectedOrder.userId) {
      loadUserAddresses(selectedOrder.userId);
      setShowSelectAddressModal(true);
    }
  };

  const handleSelectAddress = (addressId) => {
    setFormData({ ...formData, addressId });
  };

  const handleSaveAddressChange = async () => {
    if (!formData.addressId) {
      alert('Vui lòng chọn địa chỉ');
      return;
    }

    try {
      setLoading(true);
      const response = await orderAPI.update(selectedOrder.id, { addressId: formData.addressId });
      
      if (response.code === 1000) {
        // Reload order detail để cập nhật địa chỉ mới
        const detailResponse = await orderAPI.getById(selectedOrder.id);
        if (detailResponse.code === 1000) {
          setSelectedOrder(detailResponse.result);
        }
        setShowSelectAddressModal(false);
        alert('Cập nhật địa chỉ thành công!');
        loadOrders(); // Refresh danh sách
      } else {
        alert(response.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật địa chỉ:', err);
      alert('Không thể cập nhật địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddressForm = () => {
    setShowSelectAddressModal(false);
    setShowAddressModal(true);
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

  const resetAddressForm = () => {
    setAddressFormData({
      label: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Việt Nam'
    });
    setSelectedProvinceCode('');
    setSelectedDistrictCode('');
    setProvinces([]);
    setDistricts([]);
    setWards([]);
  };

  const loadProvinces = async () => {
    try {
      const response = await fetch('https://tinhthanhpho.com/api/v1/provinces?limit=100', {
        headers: {
          'Authorization': 'Bearer hvn_GRrE7dF0iEyO4tASKT0uQBdA8qibyJWA',
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success && data.data) {
        setProvinces(data.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải tỉnh/thành phố:', err);
    }
  };

  const loadDistricts = async (provinceCode) => {
    try {
      const response = await fetch(`https://tinhthanhpho.com/api/v1/provinces/${provinceCode}/districts?limit=100`, {
        headers: {
          'Authorization': 'Bearer hvn_GRrE7dF0iEyO4tASKT0uQBdA8qibyJWA',
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success && data.data) {
        setDistricts(data.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải quận/huyện:', err);
    }
  };

  const loadWards = async (districtCode) => {
    try {
      const response = await fetch(`https://tinhthanhpho.com/api/v1/districts/${districtCode}/wards?limit=100`, {
        headers: {
          'Authorization': 'Bearer hvn_GRrE7dF0iEyO4tASKT0uQBdA8qibyJWA',
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success && data.data) {
        setWards(data.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải phường/xã:', err);
    }
  };

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    
    const userId = formData.userId || (selectedOrder && selectedOrder.userId);
    if (!userId) {
      setError('Vui lòng chọn khách hàng trước');
      return;
    }

    try {
      setLoading(true);
      const response = await addressAPI.create(userId, addressFormData);
      
      if (response.code === 1000) {
        setShowAddressModal(false);
        resetAddressForm();
        // Reload addresses for selected user
        await loadUserAddresses(userId);
        // Auto select the new address
        if (response.result && response.result.id) {
          setFormData(prev => ({ ...prev, addressId: response.result.id }));
        }
        alert('Tạo địa chỉ thành công!');
        // Quay lại modal chọn địa chỉ nếu đang edit
        if (showEditModal) {
          setShowSelectAddressModal(true);
        }
      } else {
        setError(response.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      console.error('Lỗi khi tạo địa chỉ:', err);
      setError('Không thể tạo địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProductModal = () => {
    // Reset quantities to empty
    const quantities = {};
    products.forEach(product => {
      quantities[product.id] = '';
    });
    setProductQuantities(quantities);
    setShowProductModal(true);
  };

  const handleAddProductFromModal = (productId) => {
    const product = products.find(p => p.id === parseInt(productId));
    const quantityValue = productQuantities[productId];
    const quantity = parseInt(quantityValue) || 0;
    
    if (!product) return;
    
    if (quantity <= 0) {
      alert('Vui lòng nhập số lượng hợp lệ');
      return;
    }

    const existingItem = formData.items.find(item => item.productId === product.id);
    
    if (existingItem) {
      setFormData({
        ...formData,
        items: formData.items.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      });
      alert(`Đã thêm ${quantity} sản phẩm "${product.name}" vào đơn hàng`);
    } else {
      setFormData({
        ...formData,
        items: [...formData.items, { productId: product.id, quantity, productName: product.name }]
      });
      alert(`Đã thêm ${quantity} sản phẩm "${product.name}" vào đơn hàng`);
    }
  };

  const handleQuantityChange = (productId, value) => {
    setProductQuantities({
      ...productQuantities,
      [productId]: value
    });
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
          <h1>Quản lý đơn hàng</h1>
          <p className="subtitle">Quản lý tất cả đơn hàng trong hệ thống</p>
        </div>
        <div className="header-actions">
          <button className="btn-refresh" onClick={() => loadOrders()} title="Làm mới">
            Làm mới
          </button>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            Tạo đơn hàng mới
          </button>
        </div>
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
            placeholder="Tìm kiếm theo mã đơn, tên khách hàng..."
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
                        className="btn-edit"
                        onClick={() => handleEdit(order)}
                      >
                        Edit
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
              <h2>Tạo đơn hàng mới</h2>
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
                    <div className="form-group-header">
                      <label>Địa chỉ giao hàng *</label>
                      <button
                        type="button"
                        className="btn-add-address"
                        onClick={() => setShowAddressModal(true)}
                      >
                        Thêm địa chỉ
                      </button>
                    </div>
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
              <h2>Chi tiết đơn hàng #{selectedOrder.orderNumber}</h2>
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
                    <h3>Địa chỉ giao hàng</h3>
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
                  <h3>Sản phẩm ({selectedOrder.items?.length || 0})</h3>
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
                  <h3>Thanh toán</h3>
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
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thông tin đơn hàng #{selectedOrder.orderNumber}</h2>
              <button className="btn-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleUpdateOrder}>
              <div className="modal-body">
                <div className="detail-section">
                  <h3>Thông tin chung</h3>
                  <div className="detail-row">
                    <span className="label">Mã đơn hàng:</span>
                    <span className="value order-number">#{selectedOrder.orderNumber}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Khách hàng:</span>
                    <span className="value">{selectedOrder.userName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Ngày đặt:</span>
                    <span className="value">{new Date(selectedOrder.placedAt).toLocaleString('vi-VN')}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Địa chỉ giao hàng</h3>
                  {selectedOrder.address && (
                    <div className="address-display">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p><strong>Địa chỉ hiện tại:</strong></p>
                        <button 
                          type="button" 
                          className="btn-edit-address"
                          onClick={handleOpenSelectAddress}
                        >
                          Sửa địa chỉ
                        </button>
                      </div>
                      <p>{selectedOrder.address.label} - {selectedOrder.address.street}, {selectedOrder.address.city}
                      {selectedOrder.address.state && `, ${selectedOrder.address.state}`}
                      {selectedOrder.address.postalCode && ` - ${selectedOrder.address.postalCode}`}</p>
                    </div>
                  )}
                </div>

                <div className="detail-section">
                  <h3>Sản phẩm</h3>
                  
                  <div className="form-group">
                    <button 
                      type="button" 
                      className="btn-add-product"
                      onClick={handleOpenProductModal}
                    >
                      Thêm sản phẩm
                    </button>
                  </div>

                  {formData.items.length > 0 && (
                    <div className="order-items-list">
                      <h4>Danh sách sản phẩm:</h4>
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
                </div>

                <div className="detail-section">
                  <h3>Thanh toán</h3>
                  
                  <div className="form-group">
                    <label>Phí vận chuyển (₫)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.shippingFee}
                      onChange={(e) => setFormData({ ...formData, shippingFee: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="detail-row">
                    <span className="label">Tạm tính:</span>
                    <span className="value">
                      {formData.items.reduce((sum, item) => {
                        const product = products.find(p => p.id === item.productId);
                        return sum + (product?.price || 0) * item.quantity;
                      }, 0).toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                  <div className="detail-row total-row">
                    <span className="label">Tổng cộng:</span>
                    <span className="value">
                      {(formData.items.reduce((sum, item) => {
                        const product = products.find(p => p.id === item.productId);
                        return sum + (product?.price || 0) * item.quantity;
                      }, 0) + (formData.shippingFee || 0)).toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Trạng thái & Ghi chú</h3>
                  
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
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                  Đóng
                </button>
                <button 
                  type="button" 
                  className="btn-delete" 
                  onClick={() => {
                    if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
                      handleDeleteOrder(selectedOrder.id);
                      setShowEditModal(false);
                    }
                  }}
                >
                  Xóa
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thêm địa chỉ mới</h2>
              <button className="btn-close" onClick={() => setShowAddressModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleCreateAddress}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nhãn địa chỉ *</label>
                  <input
                    type="text"
                    value={addressFormData.label}
                    onChange={(e) => setAddressFormData({ ...addressFormData, label: e.target.value })}
                    placeholder="VD: Nhà riêng, Văn phòng..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tỉnh/Thành phố *</label>
                  <select
                    value={selectedProvinceCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      setSelectedProvinceCode(code);
                      setSelectedDistrictCode('');
                      const province = provinces.find(p => p.code === code);
                      setAddressFormData({ 
                        ...addressFormData, 
                        city: province ? province.name : '',
                        state: '',
                        postalCode: ''
                      });
                    }}
                    required
                  >
                    <option value="">-- Chọn tỉnh/thành phố --</option>
                    {provinces.map(province => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProvinceCode && (
                  <div className="form-group">
                    <label>Quận/Huyện *</label>
                    <select
                      value={selectedDistrictCode}
                      onChange={(e) => {
                        const code = e.target.value;
                        setSelectedDistrictCode(code);
                        const district = districts.find(d => d.code === code);
                        setAddressFormData({ 
                          ...addressFormData, 
                          state: district ? district.name : '',
                          postalCode: ''
                        });
                      }}
                      required
                    >
                      <option value="">-- Chọn quận/huyện --</option>
                      {districts.map(district => (
                        <option key={district.code} value={district.code}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedDistrictCode && (
                  <div className="form-group">
                    <label>Phường/Xã</label>
                    <select
                      value={addressFormData.postalCode}
                      onChange={(e) => {
                        const code = e.target.value;
                        const ward = wards.find(w => w.code === code);
                        setAddressFormData({ 
                          ...addressFormData, 
                          postalCode: ward ? ward.name : ''
                        });
                      }}
                    >
                      <option value="">-- Chọn phường/xã --</option>
                      {wards.map(ward => (
                        <option key={ward.code} value={ward.code}>
                          {ward.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>Địa chỉ chi tiết *</label>
                  <input
                    type="text"
                    value={addressFormData.street}
                    onChange={(e) => setAddressFormData({ ...addressFormData, street: e.target.value })}
                    placeholder="Số nhà, tên đường..."
                    required
                  />
                </div>


              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAddressModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Đang tạo...' : 'Tạo địa chỉ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal chọn địa chỉ */}
      {showSelectAddressModal && (
        <div className="modal-overlay" onClick={() => setShowSelectAddressModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chọn địa chỉ giao hàng</h2>
              <button className="btn-close" onClick={() => setShowSelectAddressModal(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              {addresses.length === 0 ? (
                <p className="no-data">Khách hàng chưa có địa chỉ nào</p>
              ) : (
                <div className="address-list">
                  {addresses.map(address => (
                    <div 
                      key={address.id} 
                      className={`address-item ${formData.addressId === address.id ? 'selected' : ''}`}
                      onClick={() => handleSelectAddress(address.id)}
                    >
                      <div className="address-info">
                        <h4>{address.label}</h4>
                        <p>{address.street}</p>
                        <p className="address-detail">
                          {address.postalCode && `${address.postalCode}, `}
                          {address.state && `${address.state}, `}
                          {address.city}
                        </p>
                      </div>
                      {formData.addressId === address.id && (
                        <span className="check-icon">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowSelectAddressModal(false)}>
                Đóng
              </button>
              <button type="button" className="btn-primary" onClick={handleOpenAddressForm}>
                Thêm địa chỉ mới
              </button>
              <button 
                type="button" 
                className="btn-success" 
                onClick={handleSaveAddressChange}
                disabled={!formData.addressId || loading}
              >
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chọn sản phẩm */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chọn sản phẩm thêm vào đơn hàng</h2>
              <button className="btn-close" onClick={() => setShowProductModal(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              {products.length === 0 ? (
                <p className="no-data">Không có sản phẩm nào</p>
              ) : (
                <div className="product-list">
                  {products.map(product => (
                    <div key={product.id} className="product-item">
                      <div className="product-info">
                        <h4>{product.name}</h4>
                        <p className="product-price">{product.price?.toLocaleString('vi-VN')}₫</p>
                        <p className="product-stock">Kho: {product.quantity}</p>
                      </div>
                      <div className="product-actions">
                        <input
                          type="number"
                          min="1"
                          max={product.quantity}
                          value={productQuantities[product.id] || ''}
                          onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                          className="quantity-input"
                          placeholder="Nhập SL"
                        />
                        <button
                          type="button"
                          className="btn-add-item"
                          onClick={() => handleAddProductFromModal(product.id)}
                          disabled={product.quantity === 0}
                        >
                          Thêm
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowProductModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagementNew;
