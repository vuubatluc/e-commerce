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

  // Thêm sản phẩm mới
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

  // Xóa sản phẩm
  const deleteProduct = (productId) => {
    console.log('ProductProvider: Deleting product:', productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  // Cập nhật sản phẩm
  const updateProduct = (productId, updatedData) => {
    console.log('ProductProvider: Updating product:', productId, updatedData);
    setProducts(prev => 
      prev.map(p => p.id === productId ? { ...p, ...updatedData } : p)
    );
  };

  // Cập nhật số lượng tồn kho theo variant (màu-size)
  const updateVariantStock = (productId, variantKey, quantity) => {
    console.log('ProductProvider: Updating variant stock:', productId, variantKey, quantity);
    setProducts(prev => 
      prev.map(product => {
        if (product.id === productId) {
          const updatedVariantStock = {
            ...product.variantStock,
            [variantKey]: quantity
          };
          
          // Tính tổng số lượng tồn kho
          const totalStock = Object.values(updatedVariantStock).reduce(
            (sum, qty) => sum + (parseInt(qty) || 0), 
            0
          );
          
          return {
            ...product,
            variantStock: updatedVariantStock,
            stock: totalStock
          };
        }
        return product;
      })
    );
  };

  // Giảm số lượng tồn kho (khi bán hàng)
  const decreaseStock = (productId, variantKey, quantity = 1) => {
    console.log('ProductProvider: Decreasing stock:', productId, variantKey, quantity);
    
    const product = products.find(p => p.id === productId);
    if (!product) {
      console.error('Product not found:', productId);
      return false;
    }

    const currentStock = product.variantStock?.[variantKey] || 0;
    const newStock = currentStock - quantity;

    if (newStock < 0) {
      console.warn('Not enough stock:', variantKey, currentStock);
      return false;
    }

    updateVariantStock(productId, variantKey, newStock);
    return true;
  };

  // Tăng số lượng tồn kho (khi hoàn trả)
  const increaseStock = (productId, variantKey, quantity = 1) => {
    console.log('ProductProvider: Increasing stock:', productId, variantKey, quantity);
    
    const product = products.find(p => p.id === productId);
    if (!product) {
      console.error('Product not found:', productId);
      return false;
    }

    const currentStock = product.variantStock?.[variantKey] || 0;
    const newStock = currentStock + quantity;

    updateVariantStock(productId, variantKey, newStock);
    return true;
  };

  // Kiểm tra số lượng tồn kho
  const checkStock = (productId, variantKey, quantity = 1) => {
    const product = products.find(p => p.id === productId);
    if (!product) {
      return false;
    }

    const currentStock = product.variantStock?.[variantKey] || 0;
    return currentStock >= quantity;
  };

  // Lấy thông tin số lượng tồn kho
  const getStock = (productId, variantKey) => {
    const product = products.find(p => p.id === productId);
    if (!product) {
      return 0;
    }

    return product.variantStock?.[variantKey] || 0;
  };

  // Lấy tổng số lượng tồn kho của sản phẩm
  const getTotalStock = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) {
      return 0;
    }

    if (product.variantStock && Object.keys(product.variantStock).length > 0) {
      return Object.values(product.variantStock).reduce(
        (sum, qty) => sum + (parseInt(qty) || 0), 
        0
      );
    }

    return product.stock || 0;
  };

  const value = {
    products,
    loading,
    addProduct,
    deleteProduct,
    updateProduct,
    updateVariantStock,
    decreaseStock,
    increaseStock,
    checkStock,
    getStock,
    getTotalStock
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};