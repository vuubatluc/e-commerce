import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { cartAPI } from "../services/cartApi";
import "./CartPage.css";

function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, totalAmount } = useCart();
  const [loading, setLoading] = useState(false);

  // Xử lý xóa sản phẩm
  const handleRemoveFromCart = async (productId) => {
    setLoading(true);
    try {
      await cartAPI.removeFromCart(productId);
      removeFromCart(productId); 
    } catch (error) {
      console.error("Remove from cart error:", error);
      alert("Có lỗi xảy ra khi xóa sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý cập nhật số lượng với API
  const handleUpdateQuantity = async (productId, newQuantity) => {
    setLoading(true);
    try {
      await cartAPI.updateCartItem(productId, newQuantity);
      updateQuantity(productId, newQuantity);
    } catch (error) {
      console.error("Update quantity error:", error);
      alert("Có lỗi xảy ra khi cập nhật số lượng!");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thanh toán
  const handleCheckout = async () => {
    setLoading(true);
    try {
      
      alert("Đặt hàng thành công!");

      // Xóa giỏ hàng sau khi đặt hàng
      await cartAPI.clearCart();

      window.location.reload();
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Có lỗi xảy ra khi đặt hàng!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Giỏ Hàng</h1>
        <Link to="/" className="continue-shopping">
          ← Tiếp tục mua sắm
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <h2>Giỏ hàng trống</h2>
          <p>Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
          <Link to="/">
            <button className="btn-primary">Mua sắm ngay</button>
          </Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  <div className="image-placeholder">📷</div>
                </div>

                <div className="item-details">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-price">
                    {item.price.toLocaleString()} VND
                  </p>
                </div>

                <div className="quantity-controls">
                  <button
                    onClick={() =>
                      handleUpdateQuantity(item.id, item.quantity - 1)
                    }
                    className="quantity-btn"
                    disabled={loading}
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button
                    onClick={() =>
                      handleUpdateQuantity(item.id, item.quantity + 1)
                    }
                    className="quantity-btn"
                    disabled={loading}
                  >
                    +
                  </button>
                </div>

                <div className="item-total">
                  {(item.price * item.quantity).toLocaleString()} VND
                </div>

                <button
                  onClick={() => handleRemoveFromCart(item.id)}
                  className="remove-btn"
                  disabled={loading}
                >
                  {loading ? "..." : "Xóa"}
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <h3>Tổng Giỏ Hàng</h3>

              <div className="summary-row">
                <span>Tạm tính:</span>
                <span>{totalAmount.toLocaleString()} VND</span>
              </div>

              <div className="summary-row">
                <span>Phí vận chuyển:</span>
                <span>Miễn phí</span>
              </div>

              <div className="summary-row total">
                <span>Tổng cộng:</span>
                <span>{totalAmount.toLocaleString()} VND</span>
              </div>

              <button
                className="btn-primary btn-full-width"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Tiến Hành Thanh Toán"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
