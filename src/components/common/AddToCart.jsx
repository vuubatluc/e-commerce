import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { cartAPI } from "../services/cartAPI";

function AddToCart({ product }) {
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    setLoading(true);

    try {
      await cartAPI.addToCart(product);
      addToCart(product);
      alert("Đã thêm vào giỏ hàng!");
    } catch (error) {
      console.error("Add to cart error:", error);
      alert("Có lỗi xảy ra khi thêm vào giỏ hàng!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="add-to-cart-btn"
      onClick={handleAddToCart}
      disabled={loading}
    >
      {loading ? "Đang thêm..." : "Thêm vào giỏ"}
    </button>
  );
}

export default AddToCart;
