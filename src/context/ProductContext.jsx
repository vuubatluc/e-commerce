import React, { createContext, useState, useEffect, useContext } from 'react';

const ProductContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load products từ localStorage khi app khởi động
  useEffect(() => {
    console.log('ProductProvider: Loading products from localStorage');
    try {
      const savedProducts = localStorage.getItem('ecommerce_products');
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts);
        console.log('ProductProvider: Loaded products:', parsed);
        setProducts(parsed);
      } else {
        console.log('ProductProvider: No products found');
      }
    } catch (error) {
      console.error('ProductProvider: Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lưu products vào localStorage mỗi khi có thay đổi
  useEffect(() => {
    if (!loading) {
      console.log('ProductProvider: Saving products to localStorage:', products);
      localStorage.setItem('ecommerce_products', JSON.stringify(products));
    }
  }, [products, loading]);

  const addProduct = (productData) => {
    const newProduct = {
      ...productData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    console.log('ProductProvider: Adding product:', newProduct);
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  };

  const deleteProduct = (productId) => {
    console.log('ProductProvider: Deleting product:', productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const updateProduct = (productId, updatedData) => {
    console.log('ProductProvider: Updating product:', productId, updatedData);
    setProducts(prev => 
      prev.map(p => p.id === productId ? { ...p, ...updatedData } : p)
    );
  };

  const value = {
    products,
    loading,
    addProduct,
    deleteProduct,
    updateProduct
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
