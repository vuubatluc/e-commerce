import React, { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import './AddProduct.css';

const AddProduct = ({ onSuccess }) => {
  const { addProduct } = useProducts();
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    colors: [],
    sizes: [],
    description: '',
    category: ''
  });

  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [colorInput, setColorInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages(prev => [...prev, reader.result]);
        setImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviewImages(previewImages.filter((_, i) => i !== index));
  };

  const addColor = () => {
    if (colorInput.trim() && !formData.colors.includes(colorInput.trim())) {
      setFormData({
        ...formData,
        colors: [...formData.colors, colorInput.trim()]
      });
      setColorInput('');
    }
  };

  const removeColor = (colorToRemove) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter(color => color !== colorToRemove)
    });
  };

  const addSize = () => {
    if (sizeInput.trim() && !formData.sizes.includes(sizeInput.trim())) {
      setFormData({
        ...formData,
        sizes: [...formData.sizes, sizeInput.trim()]
      });
      setSizeInput('');
    }
  };

  const removeSize = (sizeToRemove) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter(size => size !== sizeToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    try {
      const newProduct = {
        ...formData,
        images: images,
        price: parseFloat(formData.price)
      };

      console.log('AddProduct: Submitting product:', newProduct);
      addProduct(newProduct);
      
      alert('Thêm sản phẩm thành công!');
      
      // Reset form
      setFormData({
        name: '',
        price: '',
        colors: [],
        sizes: [],
        description: '',
        category: ''
      });
      setImages([]);
      setPreviewImages([]);
      
      // Callback về component cha để chuyển tab
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Có lỗi xảy ra khi thêm sản phẩm!');
    }
  };

  return (
    <div className="add-product-container">
      <h1>Thêm Sản Phẩm Mới</h1>
      
      <form onSubmit={handleSubmit} className="add-product-form">
        <div className="form-group">
          <label>Hình Ảnh Sản Phẩm</label>
          <div className="image-upload-area">
            <input
              type="file"
              id="imageUpload"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="imageUpload" className="upload-label">
              <div className="upload-icon">📷</div>
              <p>Chọn hoặc kéo thả ảnh vào đây</p>
              <span>Hỗ trợ: JPG, PNG, GIF</span>
            </label>
          </div>
          
          {previewImages.length > 0 && (
            <div className="image-preview-container">
              {previewImages.map((preview, index) => (
                <div key={index} className="image-preview">
                  <img src={preview} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => removeImage(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="name">Tên Sản Phẩm *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Nhập tên sản phẩm"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Giá Sản Phẩm (VNĐ) *</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Nhập giá sản phẩm"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Danh Mục</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
          >
            <option value="">Chọn danh mục</option>
            <option value="ao">Áo</option>
            <option value="quan">Quần</option>
            <option value="giay">Giày</option>
            <option value="phukien">Phụ kiện</option>
          </select>
        </div>

        <div className="form-group">
          <label>Màu Sắc</label>
          <div className="input-with-button">
            <input
              type="text"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              placeholder="Nhập màu sắc"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
            />
            <button type="button" onClick={addColor} className="add-btn">
              Thêm
            </button>
          </div>
          <div className="tags-container">
            {formData.colors.map((color, index) => (
              <span key={index} className="tag">
                {color}
                <button type="button" onClick={() => removeColor(color)}>✕</button>
              </span>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Kích Thước</label>
          <div className="input-with-button">
            <input
              type="text"
              value={sizeInput}
              onChange={(e) => setSizeInput(e.target.value)}
              placeholder="Nhập kích thước (S, M, L, XL...)"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
            />
            <button type="button" onClick={addSize} className="add-btn">
              Thêm
            </button>
          </div>
          <div className="tags-container">
            {formData.sizes.map((size, index) => (
              <span key={index} className="tag">
                {size}
                <button type="button" onClick={() => removeSize(size)}>✕</button>
              </span>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Mô Tả Sản Phẩm</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Nhập mô tả chi tiết về sản phẩm"
            rows="5"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            ➕ Thêm Sản Phẩm
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;