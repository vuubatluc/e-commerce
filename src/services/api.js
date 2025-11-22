const API_BASE_URL = 'http://localhost:8080/api';

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
    return response.json();
  },

  getMyInfo: async () => {
    const response = await fetch(`${API_BASE_URL}/users/myinfo`, {
      method: 'GET',
      headers: getHeaders()
    });
    return response.json();
  },

  updateMyInfo: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/users/updatemyinfo`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  // Admin API
  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: getHeaders()
    });
    return response.json();
  },

  getUser: async (id) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return response.json();
  },

  updateUser: async (id, userData) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  deleteUser: async (id) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return response.json();
  },

  changePassword: async (id, password) => {
    const response = await fetch(`${API_BASE_URL}/users/changePassword/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ password })
    });
    return response.json();
  },

  changeMyPassword: async (password) => {
    const response = await fetch(`${API_BASE_URL}/users/changePassword`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ password })
    });
    return response.json();
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