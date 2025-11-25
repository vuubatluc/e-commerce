import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import { cartAPI } from '../services/cartApi';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [mainImage, setMainImage] = useState('');

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getById(id);
      
      if (response.code === 1000) {
        setProduct(response.result);
        setMainImage(response.result.imageUrl || '/placeholder-image.png');
      } else {
        setError('Không thể tải thông tin sản phẩm');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Lỗi khi tải sản phẩm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      navigate('/login');
      return;
    }

    try {
      setAddingToCart(true);
      const response = await cartAPI.addToCart(product.id, quantity);
      
      if (response.code === 1000) {
        alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
        setQuantity(1);
      } else {
        alert('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleImageError = (e) => {
    e.target.src = '/placeholder-image.png';
  };

  if (loading) {
    return (
      <div className="product-detail-container">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-container">
        <div className="error-message">
          {error || 'Không tìm thấy sản phẩm'}
          <button onClick={() => navigate('/home')} className="btn-back">
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <div className="breadcrumb">
        <span onClick={() => navigate('/home')} className="breadcrumb-link">
          Trang chủ
        </span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{product.name}</span>
      </div>

      <div className="product-detail-content">
        <div className="product-images">
          <div className="main-image">
            <img
              src={mainImage}
              alt={product.name}
              onError={handleImageError}
            />
          </div>
        </div>

        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>

          <div className="product-rating">
            <div className="rating-stars">
              <span className="stars">⭐⭐⭐⭐⭐</span>
              <span className="rating-text">5.0</span>
            </div>
            <div className="divider">|</div>
            <div className="sold-count">
              <span>Đã bán: {product.sold || 0}</span>
            </div>
          </div>

          <div className="product-price-section">
            <span className="product-price">{formatPrice(product.price)}</span>
          </div>

          <div className="product-stock">
            {product.stock > 0 ? (
              <span className="in-stock">
                ✓ Còn hàng ({product.stock} sản phẩm)
              </span>
            ) : (
              <span className="out-of-stock">✗ Hết hàng</span>
            )}
          </div>

          <div className="quantity-selector">
            <label>Số lượng:</label>
            <div className="quantity-controls">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="quantity-btn"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 1 && value <= product.stock) {
                    setQuantity(value);
                  }
                }}
                min="1"
                max={product.stock}
                className="quantity-input"
              />
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock}
                className="quantity-btn"
              >
                +
              </button>
            </div>
            <span className="available-quantity">
              {product.stock} sản phẩm có sẵn
            </span>
          </div>

          <div className="action-buttons">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addingToCart}
              className="btn-add-to-cart-detail"
            >
              {addingToCart ? (
                <>
                  <span className="btn-spinner"></span>
                  Đang thêm...
                </>
              ) : (
                <>🛒 Thêm vào giỏ hàng</>
              )}
            </button>
            <button
              onClick={() => {
                handleAddToCart();
                setTimeout(() => navigate('/cart'), 500);
              }}
              disabled={product.stock === 0 || addingToCart}
              className="btn-buy-now"
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>

      <div className="product-specifications">
        <h2>Mô tả sản phẩm</h2>
        <div className="product-description-section">
          <p>{product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}</p>
        </div>

        <h2>Thông số kỹ thuật</h2>
        <table className="specs-table">
          <tbody>
            <tr>
              <td className="spec-label">Mã sản phẩm:</td>
              <td className="spec-value">{product.id}</td>
            </tr>
            <tr>
              <td className="spec-label">Danh mục:</td>
              <td className="spec-value">{product.category?.name || 'Chưa phân loại'}</td>
            </tr>
            <tr>
              <td className="spec-label">Tình trạng:</td>
              <td className="spec-value">
                {product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
              </td>
            </tr>
            <tr>
              <td className="spec-label">Số lượng còn:</td>
              <td className="spec-value">{product.stock}</td>
            </tr>
            <tr>
              <td className="spec-label">SKU:</td>
              <td className="spec-value">{product.sku}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductDetail;
