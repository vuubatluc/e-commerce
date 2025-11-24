import React, { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import AllProducts from './AllProducts';
import AddProduct from './AddProduct';
import EditProduct from './EditProduct';
import './ProductsManagement.css';

const ProductsManagement = () => {
  const [view, setView] = useState('list'); // 'list', 'add', 'edit'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { products } = useProducts();

  console.log('ProductsManagement: Current products:', products);

  const handleAddSuccess = () => {
    setView('list');
  };

  const handleEditSuccess = () => {
    setView('list');
    setSelectedProduct(null);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setView('edit');
  };

  return (
    <div className="products-management">
      <div className="management-content">
        {view === 'list' && (
          <AllProducts 
            onAddNew={() => setView('add')} 
            onEdit={handleEdit}
          />
        )}
        {view === 'add' && (
          <AddProduct 
            onSuccess={handleAddSuccess} 
            onCancel={() => setView('list')} 
          />
        )}
        {view === 'edit' && selectedProduct && (
          <EditProduct 
            product={selectedProduct}
            onSuccess={handleEditSuccess} 
            onCancel={() => {
              setView('list');
              setSelectedProduct(null);
            }} 
          />
        )}
      </div>
    </div>
  );
};

export default ProductsManagement;