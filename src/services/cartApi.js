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
  // GET /carts/{userId} - Lấy giỏ hàng của user
  getCart: async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      throw new Error("User not logged in");
    }
    const response = await fetch(`${API_BASE_URL}/carts/${userId}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return response.json();
  },

  // POST /carts/{userId}/items - Thêm sản phẩm vào giỏ hàng
  // Body: { productId: Long, quantity: Integer }
  addToCart: async (productId, quantity = 1) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      throw new Error("User not logged in");
    }
    const response = await fetch(`${API_BASE_URL}/carts/${userId}/items`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        productId: productId,
        quantity: quantity,
      }),
    });
    return response.json();
  },

  // PUT /carts/{userId}/items/{itemId} - Cập nhật số lượng sản phẩm
  // Body: { quantity: Integer }
  updateCartItem: async (itemId, quantity) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      throw new Error("User not logged in");
    }
    const response = await fetch(`${API_BASE_URL}/carts/${userId}/items/${itemId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ quantity }),
    });
    return response.json();
  },

  // DELETE /carts/{userId}/items/{itemId} - Xóa sản phẩm khỏi giỏ hàng
  removeFromCart: async (itemId) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      throw new Error("User not logged in");
    }
    const response = await fetch(`${API_BASE_URL}/carts/${userId}/items/${itemId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return response.json();
  },

  // DELETE /carts/{userId}/clear - Xóa toàn bộ giỏ hàng
  clearCart: async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      throw new Error("User not logged in");
    }
    const response = await fetch(`${API_BASE_URL}/carts/${userId}/clear`, {
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
