import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import { cartAPI } from '../services/cartApi';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [addingToCart, setAddingToCart] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async (keyword = '') => {
    try {
      setLoading(true);
      setError('');
      const response = await productAPI.getProducts(keyword || null, null, 0, 100);
      
      if (response.code === 1000) {
        setProducts(response.result.content || []);
      } else {
        setError('Không thể tải danh sách sản phẩm');
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Đã xảy ra lỗi khi tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts(searchKeyword);
  };

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Hiển thị prompt để nhập số lượng
    const quantityStr = prompt(
      `Nhập số lượng sản phẩm "${product.name}" (Tối đa: ${product.quantity})`,
      '1'
    );

    // Nếu user cancel hoặc không nhập gì
    if (!quantityStr) return;

    const quantity = parseInt(quantityStr);

    // Validate số lượng
    if (isNaN(quantity) || quantity < 1) {
      alert('Số lượng phải là số nguyên dương!');
      return;
    }

    if (quantity > product.quantity) {
      alert(`Số lượng không được vượt quá ${product.quantity}!`);
      return;
    }

    try {
      setAddingToCart(prev => ({ ...prev, [product.id]: true }));
      setError('');

      console.log('=== CALLING addToCart ===');
      console.log('Product ID:', product.id);
      console.log('Quantity:', quantity);
      
      const response = await cartAPI.addToCart(product.id, quantity);
      
      console.log('=== RESPONSE ===');
      console.log('Full response:', response);

      if (response.code === 1000) {
        setSuccessMessage(`Đã thêm ${quantity} "${product.name}" vào giỏ hàng!`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        console.error('Error response:', response);
        setError(response.message || 'Không thể thêm vào giỏ hàng');
      }
    } catch (err) {
      console.error('=== EXCEPTION ===');
      console.error('Error adding to cart:', err);
      console.error('Error details:', err.message);
      setError('Đã xảy ra lỗi khi thêm vào giỏ hàng: ' + err.message);
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Chào mừng đến với cửa hàng của chúng tôi</h1>
          <p>Khám phá những sản phẩm tuyệt vời với giá tốt nhất</p>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            🔍 Tìm kiếm
          </button>
          {searchKeyword && (
            <button
              type="button"
              onClick={() => {
                setSearchKeyword('');
                loadProducts('');
              }}
              className="clear-search-button"
            >
              ✕ Xóa
            </button>
          )}
        </form>
      </section>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError('')} className="alert-close">✕</button>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
          <button onClick={() => setSuccessMessage('')} className="alert-close">✕</button>
        </div>
      )}

      {/* Products Grid */}
      <section className="products-section">
        <div className="section-header">
          <h2>Sản phẩm của chúng tôi</h2>
          <p>Tìm thấy {products.length} sản phẩm</p>
        </div>

        {products.length === 0 ? (
          <div className="no-products">
            <div className="empty-icon">📦</div>
            <h3>Không tìm thấy sản phẩm</h3>
            <p>Thử tìm kiếm với từ khóa khác</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <article key={product.id} className="product-card">
                {/* Square Image Area (1:1) */}
                <div className="product-image-wrapper" onClick={() => navigate(`/product/${product.id}`)}>
                  <div className="product-badges">
                    <span className="badge badge-favorite">Yêu thích</span>
                  </div>

                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      loading="lazy"
                      className="product-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const noImageDiv = document.createElement('div');
                        noImageDiv.className = 'no-image';
                        noImageDiv.innerHTML = '<span>📷</span><p>Chưa có ảnh</p>';
                        e.target.parentElement.appendChild(noImageDiv);
                      }}
                    />
                  ) : (
                    <div className="no-image">
                      <span>📷</span>
                      <p>Chưa có ảnh</p>
                    </div>
                  )}

                  {product.stock === 0 && (
                    <div className="badge-out-of-stock">Hết hàng</div>
                  )}
                </div>

                {/* Product Info */}
                <div className="product-info">
                  <h3 
                    className="product-name" 
                    title={product.name}
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {product.name}
                  </h3>
                  
                  <div className="product-meta">
                    <div className="product-price-wrapper">
                      <span className="product-price">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    <div className="product-rating">
                      <span className="rating-stars">⭐</span>
                      <span className="rating-value">4.8</span>
                    </div>
                  </div>
                  
                  <div className="product-footer">
                    <span className="sold-count">Đã bán {product.sold || 0}</span>
                    <button 
                      className="btn-add-cart"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${product.id}`);
                      }}
                    >
                      Mua ngay
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
