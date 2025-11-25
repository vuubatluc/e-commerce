import React, { useState, useEffect } from 'react';
import { categoryAPI, productAPI } from '../../services/api';
import { cld } from '../../App';
import './ProductsManagement.css';

const ProductsManagement = () => {
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'categories'
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Product form state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    imageUrl: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);
  
  // Category form state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });

  // Fetch data
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getAll();
      if (response.code === 1000) {
        setCategories(response.result || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getProducts(searchKeyword, selectedCategory);
      if (response.code === 1000) {
        setProducts(response.result?.content || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Product handlers
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploadingImage(true);
      let imageUrl = productForm.imageUrl;

      // Upload ảnh lên Cloudinary nếu có file được chọn
      if (selectedImage) {
        const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'dijdluasd';
        const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'ml_default';
        
        const formData = new FormData();
        formData.append('file', selectedImage);
        formData.append('upload_preset', uploadPreset);

        console.log('Uploading to Cloudinary:', { cloudName, uploadPreset });

        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData
          }
        );

        const cloudinaryData = await cloudinaryResponse.json();
        console.log('Cloudinary response:', cloudinaryData);

        if (cloudinaryData.secure_url) {
          imageUrl = cloudinaryData.secure_url;
          console.log('Image uploaded successfully:', imageUrl);
        } else if (cloudinaryData.error) {
          throw new Error(`Cloudinary error: ${cloudinaryData.error.message}`);
        } else {
          throw new Error('Upload ảnh thất bại - không nhận được URL');
        }
      }

      const data = {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        categoryId: parseInt(productForm.categoryId),
        imageUrl: imageUrl
      };

      if (editingProduct) {
        const response = await productAPI.update(editingProduct.id, data);
        if (response.code === 1000) {
          alert('Cập nhật sản phẩm thành công!');
        }
      } else {
        const response = await productAPI.create(data);
        if (response.code === 1000) {
          alert('Thêm sản phẩm thành công!');
        }
      }
      
      setShowProductModal(false);
      setEditingProduct(null);
      resetProductForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert(`Có lỗi xảy ra: ${error.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    
    try {
      const response = await productAPI.delete(id);
      if (response.code === 1000) {
        alert('Xóa sản phẩm thành công!');
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Có lỗi xảy ra khi xóa sản phẩm!');
    }
  };

  const openProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        price: product.price || '',
        stock: product.stock || '',
        categoryId: product.category?.id || '',
        imageUrl: product.imageUrl || ''
      });
      setImagePreview(product.imageUrl || null);
    } else {
      resetProductForm();
    }
    setShowProductModal(true);
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      sku: '',
      description: '',
      price: '',
      stock: '',
      categoryId: '',
      imageUrl: ''
    });
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh!');
        return;
      }
      // Validate file size (max 10MB cho Cloudinary)
      if (file.size > 10 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 10MB!');
        return;
      }
      setSelectedImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Category handlers
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const response = await categoryAPI.update(editingCategory.id, categoryForm);
        if (response.code === 1000) {
          alert('Cập nhật danh mục thành công!');
        }
      } else {
        const response = await categoryAPI.create(categoryForm);
        if (response.code === 1000) {
          alert('Thêm danh mục thành công!');
        }
      }
      
      setShowCategoryModal(false);
      setEditingCategory(null);
      resetCategoryForm();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Có lỗi xảy ra khi lưu danh mục!');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    
    try {
      const response = await categoryAPI.delete(id);
      if (response.code === 1000) {
        alert('Xóa danh mục thành công!');
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Có lỗi xảy ra khi xóa danh mục!');
    }
  };

  const openCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name || '',
        description: category.description || ''
      });
    } else {
      resetCategoryForm();
    }
    setShowCategoryModal(true);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: ''
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="products-management">
      <div className="management-header">
        <h1>Quản lý Sản phẩm & Danh mục</h1>
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Sản phẩm
          </button>
          <button 
            className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            Danh mục
          </button>
        </div>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="products-section">
          <div className="section-header">
            <div className="search-filter">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Tất cả danh mục</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <button onClick={fetchProducts} className="btn-search">Tìm kiếm</button>
            </div>
            <button onClick={() => openProductModal()} className="btn-add">
              + Thêm sản phẩm
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Hình ảnh</th>
                  <th>SKU</th>
                  <th>Tên sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Tồn kho</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="9">Đang tải...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan="9">Không có sản phẩm nào</td></tr>
                ) : (
                  products.map(product => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl.startsWith('http') ? product.imageUrl : `http://localhost:8080${product.imageUrl}`} 
                            alt={product.name} 
                            style={{
                              width: '60px', 
                              height: '60px', 
                              objectFit: 'cover',
                              borderRadius: '4px',
                              border: '1px solid #ddd',
                              cursor: 'pointer'
                            }}
                            onClick={() => setViewingImage(product.imageUrl.startsWith('http') ? product.imageUrl : `http://localhost:8080${product.imageUrl}`)}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          style={{
                            width: '60px',
                            height: '60px',
                            backgroundColor: '#f0f0f0',
                            display: product.imageUrl ? 'none' : 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            fontSize: '24px',
                            color: '#999'
                          }}
                        >
                          📷
                        </div>
                      </td>
                      <td>{product.sku}</td>
                      <td>{product.name}</td>
                      <td>{product.category?.name || 'N/A'}</td>
                      <td>{formatPrice(product.price)}</td>
                      <td>{product.stock}</td>
                      <td>
                        <span className={`status ${product.isActive ? 'active' : 'inactive'}`}>
                          {product.isActive ? 'Hoạt động' : 'Tắt'}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => openProductModal(product)} className="btn-edit">Sửa</button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="btn-delete">Xóa</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="categories-section">
          <div className="section-header">
            <h2>Danh sách danh mục</h2>
            <button onClick={() => openCategoryModal()} className="btn-add">
              + Thêm danh mục
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên danh mục</th>
                  <th>Mô tả</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4">Đang tải...</td></tr>
                ) : categories.length === 0 ? (
                  <tr><td colSpan="4">Không có danh mục nào</td></tr>
                ) : (
                  categories.map(category => (
                    <tr key={category.id}>
                      <td>{category.id}</td>
                      <td>{category.name}</td>
                      <td>{category.description}</td>
                      <td>
                        <button onClick={() => openCategoryModal(category)} className="btn-edit">Sửa</button>
                        <button onClick={() => handleDeleteCategory(category.id)} className="btn-delete">Xóa</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => {
          setShowProductModal(false);
          setEditingProduct(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
            <form onSubmit={handleProductSubmit}>
              <div className="form-group">
                <label>Tên sản phẩm *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>SKU</label>
                <input
                  type="text"
                  value={productForm.sku}
                  onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Giá *</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tồn kho *</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Danh mục *</label>
                <select
                  value={productForm.categoryId}
                  onChange={(e) => setProductForm({...productForm, categoryId: e.target.value})}
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Hình ảnh sản phẩm</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div style={{ marginTop: '10px' }}>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ 
                        maxWidth: '200px', 
                        maxHeight: '200px', 
                        objectFit: 'cover',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                      }} 
                    />
                  </div>
                )}
                {uploadingImage && (
                  <p style={{ color: '#2196F3', marginTop: '10px' }}>Đang tải ảnh lên Cloudinary...</p>
                )}
              </div>
              <div className="form-group">
                <label>URL hình ảnh (tùy chọn)</label>
                <input
                  type="text"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({...productForm, imageUrl: e.target.value})}
                  placeholder="Hoặc nhập URL ảnh trực tiếp"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => {
                  setShowProductModal(false);
                  setEditingProduct(null);
                }} className="btn-cancel">
                  Hủy
                </button>
                <button type="submit" className="btn-submit" disabled={uploadingImage}>
                  {uploadingImage ? 'Đang xử lý...' : (editingProduct ? 'Cập nhật' : 'Thêm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => {
          setShowCategoryModal(false);
          setEditingCategory(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h2>
            <form onSubmit={handleCategorySubmit}>
              <div className="form-group">
                <label>Tên danh mục *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                }} className="btn-cancel">
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  {editingCategory ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div 
          className="modal-overlay" 
          onClick={() => setViewingImage(null)}
          style={{ zIndex: 2000 }}
        >
          <div 
            className="image-viewer-content" 
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              background: 'white',
              borderRadius: '8px',
              padding: '20px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <button
              onClick={() => setViewingImage(null)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1
              }}
            >
              ×
            </button>
            <img 
              src={viewingImage} 
              alt="Product" 
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManagement;