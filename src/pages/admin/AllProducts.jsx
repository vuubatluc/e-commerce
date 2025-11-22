import React, { useState, useEffect } from 'react';
import { useProducts } from '../../context/ProductContext';
import './AllProducts.css';

const AllProducts = () => {
  const { products, deleteProduct, loading } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    console.log('AllProducts: Received products:', products);
  }, [products]);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleEdit = (product) => {
    alert(`Chức năng chỉnh sửa sản phẩm: ${product.name}`);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        deleteProduct(productId);
        setSelectedProduct(null);
        alert('Xóa sản phẩm thành công!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Có lỗi xảy ra khi xóa sản phẩm!');
      }
    }
  };

  if (loading) {
    return (
      <div className="all-products-container">
        <div className="loading">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="all-products-container">
      <div className="products-header">
        <h1>Tất Cả Sản Phẩm</h1>
        <div className="products-stats">
          <span className="stat-item">
            <strong>{products.length}</strong> sản phẩm
          </span>
        </div>
      </div>
      
      <div className="products-content">
        <div className="products-list">
          {products.length === 0 ? (
            <div className="no-products">
              <div className="no-products-icon">📦</div>
              <p>Chưa có sản phẩm nào</p>
              <span>Hãy thêm sản phẩm đầu tiên của bạn!</span>
            </div>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className={`product-item ${selectedProduct?.id === product.id ? 'selected' : ''}`}
                onClick={() => handleProductClick(product)}
              >
                <div className="product-image">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.name} />
                  ) : (
                    <div className="no-image">📷</div>
                  )}
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="price">{parseInt(product.price).toLocaleString('vi-VN')} ₫</p>
                  <div className="product-details">
                    {product.colors && product.colors.length > 0 && (
                      <span className="detail-badge">
                        🎨 {product.colors.length} màu
                      </span>
                    )}
                    {product.sizes && product.sizes.length > 0 && (
                      <span className="detail-badge">
                        📏 {product.sizes.length} size
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedProduct && (
          <div className="product-actions">
            <h2>Chi Tiết Sản Phẩm</h2>
            
            <div className="selected-product-detail">
              {selectedProduct.images && selectedProduct.images.length > 0 ? (
                <img src={selectedProduct.images[0]} alt={selectedProduct.name} />
              ) : (
                <div className="no-image-large">📷 Không có ảnh</div>
              )}
              
              <div className="detail-info">
                <h3>{selectedProduct.name}</h3>
                <p className="detail-price">
                  {parseInt(selectedProduct.price).toLocaleString('vi-VN')} ₫
                </p>
                
                {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                  <div className="detail-section">
                    <label>Màu sắc:</label>
                    <div className="tags">
                      {selectedProduct.colors.map((color, index) => (
                        <span key={index} className="tag color-tag">{color}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                  <div className="detail-section">
                    <label>Kích thước:</label>
                    <div className="tags">
                      {selectedProduct.sizes.map((size, index) => (
                        <span key={index} className="tag size-tag">{size}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedProduct.description && (
                  <div className="detail-section">
                    <label>Mô tả:</label>
                    <p className="description">{selectedProduct.description}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="action-buttons">
              <button 
                className="btn-edit"
                onClick={() => handleEdit(selectedProduct)}
              >
                ✏️ Sửa Sản Phẩm
              </button>
              <button 
                className="btn-delete"
                onClick={() => handleDelete(selectedProduct.id)}
              >
                🗑️ Xóa Sản Phẩm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllProducts;