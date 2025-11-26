import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI, categoryAPI } from '../services/api';
import { cartAPI } from '../services/cartApi';
import ProductImage from '../components/common/ProductImage'; // Import the new component
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [addingToCart, setAddingToCart] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      if (response.code === 1000) {
        setCategories(response.result || []);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadProducts = async (keyword = '') => {
    try {
      setLoading(true);
      setError('');
      const response = await productAPI.getProducts(keyword || null, selectedCategory, 0, 100);
      
      if (response.code === 1000) {
        let filteredProducts = response.result.content || [];
        
        // Filter by price range
        if (priceRange.min !== '' || priceRange.max !== '') {
          filteredProducts = filteredProducts.filter(product => {
            const price = product.price;
            const min = priceRange.min === '' ? 0 : parseFloat(priceRange.min);
            const max = priceRange.max === '' ? Infinity : parseFloat(priceRange.max);
            return price >= min && price <= max;
          });
        }
        
        setProducts(filteredProducts);
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

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  const handlePriceRangeChange = (field, value) => {
    setPriceRange(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    loadProducts(searchKeyword);
  };

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setPriceRange({ min: '', max: '' });
    setSearchKeyword('');
    setLoading(true);
    setTimeout(() => loadProducts(''), 0);
  };

  useEffect(() => {
    loadProducts(searchKeyword);
  }, [selectedCategory]);

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
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
            Tìm kiếm
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

      {/* Filter Section */}
      <section className="filter-section">
        <div className="filters-container">
            <div className="filter-group">
              <h3>Danh mục</h3>
              <div className="category-filters">
                {categories.map(category => (
                  <label key={category.id} className="category-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedCategory === category.id}
                      onChange={() => handleCategoryChange(category.id)}
                    />
                    <span>{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h3>Khoảng giá</h3>
              <div className="price-range-inputs">
                <input
                  type="number"
                  placeholder="Giá tối thiểu"
                  value={priceRange.min}
                  onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                  className="price-input"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Giá tối đa"
                  value={priceRange.max}
                  onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                  className="price-input"
                />
              </div>
            </div>

            <div className="filter-actions">
              <button onClick={handleApplyFilters} className="apply-filter-btn">
                Áp dụng
              </button>
              <button onClick={handleClearFilters} className="clear-filter-btn">
                Xóa bộ lọc
              </button>
            </div>
          </div>
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

                  <ProductImage src={product.imageUrl} alt={product.name} />

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
                    {/* rating removed */}
                  </div>
                  
                  <div className="product-footer">
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
