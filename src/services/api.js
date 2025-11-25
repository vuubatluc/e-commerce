const API_BASE_URL = 'http://localhost:8080/api';

// Helper function để handle response và check token expiration
const handleResponse = async (response) => {
  const data = await response.json();
  
  // Kiểm tra nếu token hết hạn hoặc không hợp lệ
  if (response.status === 401 || data.code === 1007) { // 1007 là UNAUTHENTICATED code
    // Xóa token và thông tin user
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('roles');
    
    // Hiển thị thông báo
    const event = new CustomEvent('tokenExpired', { 
      detail: { message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!' } 
    });
    window.dispatchEvent(event);
    
    // Chuyển hướng về trang login sau 2 giây
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
  }
  
  return data;
};

// Helper function để lấy headers với token
const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Authentication API
export const authAPI = {
  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, password })
    });
    return response.json();
  },

  logout: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ token })
    });
    return response.json();
  },

  introspect: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/introspect`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ token })
    });
    return response.json();
  },

  forgetPassword: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/forget-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email })
    });
    return response.json();
  },

  verifyOtp: async (email, otp) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, otp })
    });
    return response.json();
  },

  resetPassword: async (email, otp, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, otp, newPassword })
    });
    return response.json();
  }
};

// User API
export const userAPI = {
  createUser: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  getMyInfo: async () => {
    const response = await fetch(`${API_BASE_URL}/users/myinfo`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  updateMyInfo: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/users/updatemyinfo`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  // Admin API
  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getUser: async (id) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  updateUser: async (id, userData) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  deleteUser: async (id) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  changePassword: async (id, currentPassword, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/users/changePassword/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return handleResponse(response);
  },

  changeMyPassword: async (currentPassword, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/users/changePassword`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return handleResponse(response);
  }
};

// Helper để kiểm tra token còn hợp lệ không
export const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// Helper để logout
export const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('roles');
  localStorage.removeItem('userInfo');
};

// Role API
export const roleAPI = {
  create: async (roleData) => {
    const response = await fetch(`${API_BASE_URL}/roles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(roleData)
    });
    return handleResponse(response);
  },

  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/roles`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  update: async (roleName, roleData) => {
    const response = await fetch(`${API_BASE_URL}/roles/${roleName}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(roleData)
    });
    return handleResponse(response);
  },

  delete: async (roleName) => {
    const response = await fetch(`${API_BASE_URL}/roles/${roleName}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

// Permission API
export const permissionAPI = {
  create: async (permissionData) => {
    const response = await fetch(`${API_BASE_URL}/permissions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(permissionData)
    });
    return handleResponse(response);
  },

  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/permissions`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  update: async (permissionName, permissionData) => {
    const response = await fetch(`${API_BASE_URL}/permissions/${permissionName}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(permissionData)
    });
    return handleResponse(response);
  },

  delete: async (permissionName) => {
    const response = await fetch(`${API_BASE_URL}/permissions/${permissionName}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

// Category API
export const categoryAPI = {
  create: async (categoryData) => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(categoryData)
    });
    return handleResponse(response);
  },

  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  update: async (id, categoryData) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(categoryData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

// Product API
export const productAPI = {
  getProducts: async (keyword = null, categoryId = null, page = 0, size = 100) => {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (categoryId) params.append('categoryId', categoryId);
    params.append('page', page);
    params.append('size', size);
    
    const response = await fetch(`${API_BASE_URL}/products?${params.toString()}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  create: async (productData) => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    });
    return handleResponse(response);
  },

  update: async (id, productData) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

// Order API
export const orderAPI = {
  // GET /orders - Lấy tất cả đơn hàng (có phân trang)
  getAll: async (page = 0, size = 10, sortBy = 'placedAt', direction = 'DESC') => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    params.append('sortBy', sortBy);
    params.append('direction', direction);
    
    const response = await fetch(`${API_BASE_URL}/orders?${params.toString()}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // GET /orders/user/{userId} - Lấy đơn hàng theo user
  getByUserId: async (userId, page = 0, size = 10, sortBy = 'placedAt', direction = 'DESC') => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    params.append('sortBy', sortBy);
    params.append('direction', direction);
    
    const response = await fetch(`${API_BASE_URL}/orders/user/${userId}?${params.toString()}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // GET /orders/{id} - Lấy chi tiết đơn hàng
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // POST /orders - Tạo đơn hàng mới
  // Body: { userId, addressId, items: [{ productId, quantity }], shippingFee, note }
  create: async (orderData) => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData)
    });
    return handleResponse(response);
  },

  // PUT /orders/{id} - Cập nhật đơn hàng
  // Body: { status, note }
  update: async (id, orderData) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(orderData)
    });
    return handleResponse(response);
  },

  // DELETE /orders/{id} - Xóa đơn hàng
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

// Address API
export const addressAPI = {
  // GET /addresses - Lấy tất cả địa chỉ
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/addresses`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // GET /addresses/user/{userId} - Lấy địa chỉ theo user
  getByUserId: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/addresses/user/${userId}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // GET /addresses/{id} - Lấy chi tiết địa chỉ
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // POST /addresses/user/{userId} - Tạo địa chỉ mới
  // Body: { label, street, city, state, postalCode, country }
  create: async (userId, addressData) => {
    const response = await fetch(`${API_BASE_URL}/addresses/user/${userId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(addressData)
    });
    return handleResponse(response);
  },

  // PUT /addresses/{id} - Cập nhật địa chỉ
  // Body: { label, street, city, state, postalCode, country }
  update: async (id, addressData) => {
    const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(addressData)
    });
    return handleResponse(response);
  },

  // DELETE /addresses/{id} - Xóa địa chỉ
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};