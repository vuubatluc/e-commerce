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

  changePassword: async (id, currentPassword, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/users/changePassword/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return response.json();
  },

  changeMyPassword: async (currentPassword, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/users/changePassword`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
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

// Role API
export const roleAPI = {
  create: async (roleData) => {
    const response = await fetch(`${API_BASE_URL}/roles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(roleData)
    });
    return response.json();
  },

  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/roles`, {
      method: 'GET',
      headers: getHeaders()
    });
    return response.json();
  },

  update: async (roleName, roleData) => {
    const response = await fetch(`${API_BASE_URL}/roles/${roleName}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(roleData)
    });
    return response.json();
  },

  delete: async (roleName) => {
    const response = await fetch(`${API_BASE_URL}/roles/${roleName}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return response.json();
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
    return response.json();
  },

  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/permissions`, {
      method: 'GET',
      headers: getHeaders()
    });
    return response.json();
  },

  update: async (permissionName, permissionData) => {
    const response = await fetch(`${API_BASE_URL}/permissions/${permissionName}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(permissionData)
    });
    return response.json();
  },

  delete: async (permissionName) => {
    const response = await fetch(`${API_BASE_URL}/permissions/${permissionName}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return response.json();
  }
};