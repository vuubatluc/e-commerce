import React, { createContext, useState, useContext, useEffect } from "react";
import { cartAPI } from "../services/cartApi";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load giỏ hàng từ backend
  useEffect(() => {
    const loadCart = async () => {
      try {
        const response = await cartAPI.getCart();
        // Backend trả về { result: { items: [...] } }
        if (response.result && response.result.items) {
          setCartItems(response.result.items);
        }
      } catch (error) {
        console.error("Load cart error:", error);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  // Thêm sản phẩm vào giỏ
  const addToCart = async (productId) => {
    try {
      const response = await cartAPI.addToCart(productId, 1);
      if (response.result && response.result.items) {
        setCartItems(response.result.items);
      }
      return response;
    } catch (error) {
      console.error("Add to cart error:", error);
      throw error;
    }
  };

  // Cập nhật số lượng
  const updateQuantity = async (itemId, newQuantity) => {
    try {
      const response = await cartAPI.updateCartItem(itemId, newQuantity);
      if (response.result && response.result.items) {
        setCartItems(response.result.items);
      }
      return response;
    } catch (error) {
      console.error("Update quantity error:", error);
      throw error;
    }
  };

  // Xóa sản phẩm
  const removeFromCart = async (itemId) => {
    try {
      const response = await cartAPI.removeFromCart(itemId);
      if (response.result && response.result.items) {
        setCartItems(response.result.items);
      }
      return response;
    } catch (error) {
      console.error("Remove from cart error:", error);
      throw error;
    }
  };

  // Tính tổng tiền
  const totalAmount = cartItems.reduce((total, item) => {
    const price = item.product?.price || item.price || 0;
    const quantity = item.quantity || 0;
    return total + price * quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        totalAmount,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
