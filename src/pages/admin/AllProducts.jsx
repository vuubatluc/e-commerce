import React, { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import './AllProducts.css';

const AllProducts = ({ onAddNew, onEdit }) => {
  const { products, deleteProduct, loading } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const itemsPerPage = 50;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(currentProducts.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const handleProductNameClick = (product, e) => {
    e.stopPropagation();
    if (expandedProduct?.id === product.id) {
      setExpandedProduct(null);
    } else {
      setExpandedProduct(product);
    }
  };

  const handleEdit = () => {
    if (selectedProducts.length === 0) {
      alert('Vui lòng chọn sản phẩm cần sửa!');
      return;
    }
    if (selectedProducts.length > 1) {
      alert('Chỉ được chọn 1 sản phẩm để sửa!');
      return;
    }
    const product = products.find(p => p.id === selectedProducts[0]);
    onEdit(product);
  };

  const handleDelete = async () => {
    if (selectedProducts.length === 0) {
      alert('Vui lòng chọn sản phẩm cần xóa!');
      return;
    }

    const confirmMessage = selectedProducts.length === 1 
      ? 'Bạn có chắc chắn muốn xóa sản phẩm này?'
      : `Bạn có chắc chắn muốn xóa ${selectedProducts.length} sản phẩm?`;

    if (window.confirm(confirmMessage)) {
      try {
        for (const productId of selectedProducts) {
          deleteProduct(productId);
        }
        setSelectedProducts([]);
        setExpandedProduct(null);
        alert('Xóa sản phẩm thành công!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Có lỗi xảy ra khi xóa sản phẩm!');
      }
    }
  };

  const getTotalStock = (product) => {
    if (product.variantStock && Object.keys(product.variantStock).length > 0) {
      return Object.values(product.variantStock).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0);
    }
    return product.stock || 0;
  };

  const filteredProducts = products.filter(product => {
    const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       product.id.toString().includes(searchTerm);
    const matchCategory = categoryFilter === '' || product.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

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
        <h1>Danh sách sản phẩm</h1>
      </div>

      <div className="filter-section">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Tên, mã sản phẩm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="category-select"
          >
            <option value="">Danh mục</option>
            <option value="ao">Áo</option>
            <option value="quan">Quần</option>
            <option value="giay">Giày</option>
            <option value="phukien">Phụ kiện</option>
          </select>
          <button className="btn-filter">Lọc</button>
        </div>
        <div className="action-buttons-top">
          <button className="btn-add" onClick={onAddNew}>
            ➕ Thêm mới
          </button>
          <button 
            className="btn-edit" 
            onClick={handleEdit}
            disabled={selectedProducts.length !== 1}
          >
            ✏️ Sửa
          </button>
          <button 
            className="btn-delete-top" 
            onClick={handleDelete}
            disabled={selectedProducts.length === 0}
          >
            🗑️ Xóa
          </button>
        </div>
      </div>

      {selectedProducts.length > 0 && (
        <div className="selection-info">
          Đã chọn {selectedProducts.length} sản phẩm
        </div>
      )}

      <div className="table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox" 
                  checked={currentProducts.length > 0 && selectedProducts.length === currentProducts.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Ảnh</th>
              <th>Tên</th>
              <th>Giá vốn</th>
              <th>Giá bán</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-products">
                  <div className="no-products-icon">📦</div>
                  <p>Chưa có sản phẩm nào</p>
                </td>
              </tr>
            ) : (
              currentProducts.map((product) => (
                <React.Fragment key={product.id}>
                  <tr 
                    className={selectedProducts.includes(product.id) ? 'selected' : ''}
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                      />
                    </td>
                    <td>
                      <div className="product-image-cell">
                        {product.images && product.images.length > 0 ? (
                          <img src={product.images[0]} alt={product.name} />
                        ) : (
                          <div className="no-image-small">📷</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span 
                        className="product-name-link" 
                        onClick={(e) => handleProductNameClick(product, e)}
                      >
                        {expandedProduct?.id === product.id ? '▼' : '▶'} {product.name}
                      </span>
                      {product.category && (
                        <span className="category-badge">👔 {product.category}</span>
                      )}
                    </td>
                    <td>{parseInt((product.costPrice || product.price * 0.7)).toLocaleString('vi-VN')} ₫</td>
                    <td className="price-cell">{parseInt(product.price).toLocaleString('vi-VN')} ₫</td>
                  </tr>
                  
                  {expandedProduct?.id === product.id && (
                    <tr className="expanded-row">
                      <td colSpan="5">
                        <div className="product-detail-panel">
                          <h4>📊 Chi tiết số lượng sản phẩm</h4>
                          
                          {product.variantStock && Object.keys(product.variantStock).length > 0 ? (
                            <div className="variant-detail-container">
                              {/* Layout 2 cột: Bảng bên trái, Summary bên phải */}
                              <div className="variant-layout">
                                {/* Bảng chi tiết bên trái */}
                                <div className="variant-table-section">
                                  <div className="variant-full-table">
                                    <table className="stock-table">
                                      <thead>
                                        <tr>
                                          <th>Màu sắc</th>
                                          <th>Kích thước</th>
                                          <th>Số lượng</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {Object.entries(product.variantStock).map(([variant, quantity]) => {
                                          const [color, size] = variant.split('-');
                                          return (
                                            <tr key={variant}>
                                              <td>
                                                <span className="color-badge">{color}</span>
                                              </td>
                                              <td>
                                                <span className="size-badge">{size}</span>
                                              </td>
                                              <td className="quantity-cell">{quantity}</td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>

                                {/* Summary bên phải */}
                                <div className="variant-summary-section">
                                  {/* Thống kê theo màu */}
                                  {product.colors && product.colors.length > 0 && (
                                    <div className="summary-section">
                                      <h5>🎨 Tổng theo màu:</h5>
                                      <div className="summary-items">
                                        {product.colors.map(color => {
                                          const totalByColor = Object.entries(product.variantStock)
                                            .filter(([key]) => key.startsWith(`${color}-`))
                                            .reduce((sum, [_, qty]) => sum + (parseInt(qty) || 0), 0);
                                          return (
                                            <div key={color} className="summary-item">
                                              <span className="color-badge">{color}</span>
                                              <span className="summary-value">{totalByColor}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {/* Thống kê theo size */}
                                  {product.sizes && product.sizes.length > 0 && (
                                    <div className="summary-section">
                                      <h5>📏 Tổng theo kích thước:</h5>
                                      <div className="summary-items">
                                        {product.sizes.map(size => {
                                          const totalBySize = Object.entries(product.variantStock)
                                            .filter(([key]) => key.endsWith(`-${size}`))
                                            .reduce((sum, [_, qty]) => sum + (parseInt(qty) || 0), 0);
                                          return (
                                            <div key={size} className="summary-item">
                                              <span className="size-badge">{size}</span>
                                              <span className="summary-value">{totalBySize}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="no-variant-info">
                              <p>Sản phẩm chưa có phân chia theo màu sắc và kích thước</p>
                              <p>Tổng số lượng: <strong>{product.stock || 0}</strong></p>
                            </div>
                          )}
                          
                          <div className="final-stock-summary">
                            <strong>🔢 Tổng số lượng sản phẩm: {getTotalStock(product)}</strong>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span className="pagination-info">
          {startIndex + 1} - {Math.min(endIndex, filteredProducts.length)} / {filteredProducts.length}
        </span>
        <div className="pagination-controls">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          >⏮</button>
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >◀</button>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >▶</button>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >⏭</button>
          <button>☰</button>
        </div>
      </div>
    </div>
  );
};

export default AllProducts;