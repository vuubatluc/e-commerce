import React, { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import AllProducts from './AllProducts';
import AddProduct from './AddProduct';
import './ProductsManagement.css';

const ProductsManagement = () => {
  const [activeTab, setActiveTab] = useState('all');
  const { products } = useProducts();

  console.log('ProductsManagement: Current products:', products);

  return (
    <div className="products-management">
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <span className="tab-icon">📦</span>
          Tất Cả Sản Phẩm
          {products.length > 0 && (
            <span className="product-count">{products.length}</span>
          )}
        </button>
        <button
          className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          <span className="tab-icon">➕</span>
          Thêm Sản Phẩm
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'all' ? (
          <AllProducts />
        ) : (
          <AddProduct onSuccess={() => setActiveTab('all')} />
        )}
      </div>
    </div>
  );
};

export default ProductsManagement;