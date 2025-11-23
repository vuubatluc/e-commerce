const API_BASE_URL = "http://localhost:8080/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

// Cart API
export const cartAPI = {
  // Lấy giỏ hàng
  getCart: async () => {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: "GET",
      headers: getHeaders(),
    });
    return response.json();
  },

  // Thêm sản phẩm vào giỏ hàng
  addToCart: async (productId, quantity = 1) => {
    const response = await fetch(`${API_BASE_URL}/cart/items`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        productId: productId,
        quantity: quantity,
      }),
    });
    return response.json();
  },

  // Cập nhật số lượng sản phẩm (THEO ITEM ID)
  updateCartItem: async (itemId, quantity) => {
    const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ quantity }),
    });
    return response.json();
  },

  // Xóa sản phẩm khỏi giỏ hàng (THEO ITEM ID)
  removeFromCart: async (itemId) => {
    const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return response.json();
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: async () => {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return response.json();
  },
};

// Helper để lấy số lượng sản phẩm trong giỏ
export const getCartItemCount = async () => {
  try {
    const cartData = await cartAPI.getCart();
    if (cartData.items) {
      return cartData.items.reduce((total, item) => total + item.quantity, 0);
    }
    return 0;
  } catch (error) {
    console.error("Get cart count error:", error);
    return 0;
  }
};

// Helper để kiểm tra giỏ hàng có sản phẩm không
export const isCartEmpty = async () => {
  try {
    const cartData = await cartAPI.getCart();
    return !cartData.items || cartData.items.length === 0;
  } catch (error) {
    console.error("Check cart empty error:", error);
    return true;
  }
};
