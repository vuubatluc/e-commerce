import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI } from '../services/cartApi';
import { orderAPI, addressAPI } from '../services/api';
import './Checkout.css';

const PROVINCE_API_URL = 'https://tinhthanhpho.com/api/v1';
const PROVINCE_API_TOKEN = 'hvn_GRrE7dF0iEyO4tASKT0uQBdA8qibyJWA';

const Checkout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Cart data
  const [cart, setCart] = useState(null);
  
  // Address data
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  
  // Province/District/Ward data
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  
  // New address form
  const [newAddress, setNewAddress] = useState({
    label: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Vietnam'
  });
  
  // Order data
  const [shippingFee] = useState(30000);
  const [note, setNote] = useState('');

  useEffect(() => {
    document.title = 'Thanh toán - E-Commerce';
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      
      const [cartRes, addressesRes] = await Promise.all([
        cartAPI.getCart(),
        addressAPI.getByUserId(userId)
      ]);
      
      if (cartRes.code === 1000) {
        setCart(cartRes.result);
        if (!cartRes.result || cartRes.result.cartItems.length === 0) {
          alert('Giỏ hàng trống');
          navigate('/cart');
        }
      }
      
      if (addressesRes.code === 1000) {
        setAddresses(addressesRes.result || []);
        if (addressesRes.result && addressesRes.result.length > 0) {
          setSelectedAddressId(addressesRes.result[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const loadProvinces = async () => {
    setLoadingProvinces(true);
    try {
      console.log('=== Loading provinces ===');
      console.log('API URL:', `${PROVINCE_API_URL}/provinces?limit=100`);
      console.log('API Token:', PROVINCE_API_TOKEN);
      
      const response = await fetch(`${PROVINCE_API_URL}/provinces?limit=100`, {
        headers: {
          'Authorization': `Bearer ${PROVINCE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success && data.data) {
        console.log('Provinces loaded:', data.data.length);
        setProvinces(data.data);
      } else {
        console.error('Failed to load provinces:', data);
      }
    } catch (err) {
      console.error('Error loading provinces:', err);
    } finally {
      setLoadingProvinces(false);
    }
  };

  const loadDistricts = async (provinceCode) => {
    setLoadingDistricts(true);
    setDistricts([]);
    setWards([]);
    try {
      const response = await fetch(`${PROVINCE_API_URL}/provinces/${provinceCode}/districts?limit=100`, {
        headers: {
          'Authorization': `Bearer ${PROVINCE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success && data.data) {
        setDistricts(data.data);
      }
    } catch (err) {
      console.error('Error loading districts:', err);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const loadWards = async (districtCode) => {
    setLoadingWards(true);
    setWards([]);
    try {
      const response = await fetch(`${PROVINCE_API_URL}/districts/${districtCode}/wards?limit=100`, {
        headers: {
          'Authorization': `Bearer ${PROVINCE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success && data.data) {
        setWards(data.data);
      }
    } catch (err) {
      console.error('Error loading wards:', err);
    } finally {
      setLoadingWards(false);
    }
  };

  const handleProvinceChange = (e) => {
    const selectedProvince = provinces.find(p => p.name === e.target.value);
    setNewAddress({
      ...newAddress,
      city: e.target.value,
      state: '',
      postalCode: ''
    });
    if (selectedProvince) {
      loadDistricts(selectedProvince.code);
    }
  };

  const handleDistrictChange = (e) => {
    const selectedDistrict = districts.find(d => d.name === e.target.value);
    setNewAddress({
      ...newAddress,
      state: e.target.value,
      postalCode: ''
    });
    if (selectedDistrict) {
      loadWards(selectedDistrict.code);
    }
  };

  const handleWardChange = (e) => {
    setNewAddress({
      ...newAddress,
      postalCode: e.target.value
    });
  };

  const handleShowAddressForm = () => {
    if (!showAddressForm) {
      // Opening form - load provinces
      console.log('Opening address form, loading provinces...');
      loadProvinces();
    }
    setShowAddressForm(!showAddressForm);
  };

  const handleAddAddress = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      const response = await addressAPI.create(userId, newAddress);
      
      if (response.code === 1000) {
        setAddresses([...addresses, response.result]);
        setSelectedAddressId(response.result.id);
        setShowAddressForm(false);
        setNewAddress({
          label: '',
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'Vietnam'
        });
      } else {
        alert(response.message || 'Không thể thêm địa chỉ');
      }
    } catch (err) {
      console.error('Error adding address:', err);
      alert('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert('Vui lòng chọn địa chỉ giao hàng');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const userId = localStorage.getItem('userId');
      const items = cart.cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      const orderData = {
        userId: parseInt(userId),
        addressId: selectedAddressId,
        items: items,
        shippingFee: shippingFee,
        note: note || null
      };

      const response = await orderAPI.create(orderData);
      
      if (response.code === 1000) {
        // Xóa giỏ hàng sau khi đặt hàng thành công
        await cartAPI.clearCart();
        
        // Chuyển đến trang success
        navigate(`/order-success/${response.result.id}`);
      } else {
        setError(response.message || 'Không thể tạo đơn hàng');
      }
    } catch (err) {
      console.error('Error placing order:', err);
      setError('Có lỗi xảy ra khi đặt hàng');
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

  if (loading && !cart) {
    return (
      <div className="checkout-page">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  if (!cart) return null;

  const totalAmount = (cart.totalPrice || 0) + shippingFee;

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h1>🛒 Thanh toán</h1>
        <p>Vui lòng kiểm tra thông tin và hoàn tất đơn hàng</p>
      </div>

      {error && (
        <div className="alert alert-error">
          ⚠️ {error}
        </div>
      )}

      <div className="checkout-content">
        {/* Left - Address & Note */}
        <div className="checkout-left">
          {/* Shipping Address */}
          <div className="section-card">
            <h2>📍 Địa chỉ giao hàng</h2>
            
            {addresses.length > 0 ? (
              <div className="address-list">
                {addresses.map(address => (
                  <div 
                    key={address.id} 
                    className={`address-item ${selectedAddressId === address.id ? 'selected' : ''}`}
                    onClick={() => setSelectedAddressId(address.id)}
                  >
                    <input 
                      type="radio" 
                      name="address" 
                      checked={selectedAddressId === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                    />
                    <div className="address-details">
                      <h4>{address.label}</h4>
                      <p>{address.street}</p>
                      <p>{address.city}, {address.state} {address.postalCode}</p>
                      <p>{address.country}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-address">Chưa có địa chỉ giao hàng</p>
            )}

            <button 
              className="btn-add-address"
              onClick={handleShowAddressForm}
            >
              {showAddressForm ? '✕ Hủy' : '➕ Thêm địa chỉ mới'}
            </button>

            {showAddressForm && (
              <form className="address-form" onSubmit={handleAddAddress}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Tỉnh/Thành phố *</label>
                    <select
                      value={newAddress.city}
                      onChange={handleProvinceChange}
                      disabled={loadingProvinces}
                      required
                    >
                      <option value="">
                        {loadingProvinces ? "Đang tải..." : "-- Chọn Tỉnh/Thành phố --"}
                      </option>
                      {provinces.map((province) => (
                        <option key={province.code} value={province.name}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quận/Huyện *</label>
                    <select
                      value={newAddress.state}
                      onChange={handleDistrictChange}
                      disabled={loadingDistricts || !newAddress.city}
                      required
                    >
                      <option value="">
                        {loadingDistricts ? "Đang tải..." : "-- Chọn Quận/Huyện --"}
                      </option>
                      {districts.map((district) => (
                        <option key={district.code} value={district.name}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phường/Xã</label>
                    <select
                      value={newAddress.postalCode}
                      onChange={handleWardChange}
                      disabled={loadingWards || !newAddress.state}
                    >
                      <option value="">
                        {loadingWards ? "Đang tải..." : "-- Chọn Phường/Xã --"}
                      </option>
                      {wards.map((ward) => (
                        <option key={ward.code} value={ward.name}>
                          {ward.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quốc gia</label>
                    <input
                      type="text"
                      value={newAddress.country}
                      onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Địa chỉ *</label>
                  <input
                    type="text"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                    placeholder="Số nhà, tên đường..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nhãn địa chỉ *</label>
                  <select
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({...newAddress, label: e.target.value})}
                    required
                  >
                    <option value="">-- Chọn loại địa chỉ --</option>
                    <option value="Nhà riêng">Nhà riêng</option>
                    <option value="Văn phòng">Văn phòng</option>
                  </select>
                </div>
                <button type="submit" className="btn-submit" disabled={loading}>
                  Lưu địa chỉ
                </button>
              </form>
            )}
          </div>

          {/* Order Note */}
          <div className="section-card">
            <h2>📝 Ghi chú đơn hàng</h2>
            <textarea
              className="order-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú thêm về đơn hàng (tùy chọn)..."
              rows="4"
            />
          </div>
        </div>

        {/* Right - Order Summary */}
        <div className="checkout-right">
          <div className="order-summary">
            <h2>📋 Đơn hàng ({cart.totalItems} sản phẩm)</h2>
            
            <div className="summary-items">
              {cart.cartItems.map(item => (
                <div key={item.id} className="summary-item">
                  <div className="item-info">
                    {item.productImage && (
                      <img src={item.productImage} alt={item.productName} />
                    )}
                    <div>
                      <h4>{item.productName}</h4>
                      <p>SL: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="item-price">
                    {formatCurrency(item.totalPrice)}
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-totals">
              <div className="total-row">
                <span>Tạm tính:</span>
                <span>{formatCurrency(cart.totalPrice)}</span>
              </div>
              <div className="total-row">
                <span>Phí vận chuyển:</span>
                <span>{formatCurrency(shippingFee)}</span>
              </div>
              <div className="total-row total-final">
                <span>Tổng cộng:</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <button 
              className="btn-place-order"
              onClick={handlePlaceOrder}
              disabled={loading || !selectedAddressId}
            >
              {loading ? 'Đang xử lý...' : '🛒 Đặt hàng'}
            </button>

            <button 
              className="btn-back"
              onClick={() => navigate('/cart')}
            >
              ← Quay lại giỏ hàng
            </button>

            <p className="payment-note">
              💳 Thanh toán khi nhận hàng (COD)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
