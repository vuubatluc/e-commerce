import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import DashboardNavbar from './DashboardNavbar';
import './styles/UserManagement.css';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    document.title = 'Quản lý người dùng';
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUsers();
      if (response.result) {
        setUsers(response.result);
      } else {
        setError(response.message || 'Không thể tải danh sách người dùng');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (userId) => {
    try {
      const response = await userAPI.getUser(userId);
      if (response.result) {
        setSelectedUser(response.result);
        setIsViewing(true);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setError('Không thể tải thông tin người dùng');
    }
  };

  const handleEdit = async (userId) => {
    try {
      const response = await userAPI.getUser(userId);
      if (response.result) {
        setSelectedUser(response.result);
        setFormData({
          name: response.result.name || '',
          email: response.result.email || '',
          phone: response.result.phone || '',
          password: ''
        });
        setIsEditing(true);
        setIsViewing(false);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setError('Không thể tải thông tin người dùng');
    }
  };

  const handleDelete = async (userId, username) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${username}"?`)) {
      try {
        const response = await userAPI.deleteUser(userId);
        if (response.code === 1000) {
          setSuccessMessage('Xóa người dùng thành công!');
          fetchUsers();
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          setError(response.message || 'Xóa người dùng thất bại');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Không thể xóa người dùng');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await userAPI.updateUser(selectedUser.id, updateData);
      
      if (response.result) {
        setSuccessMessage('Cập nhật người dùng thành công!');
        setIsEditing(false);
        setSelectedUser(null);
        fetchUsers();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Không thể cập nhật người dùng');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsViewing(false);
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: ''
    });
    setError('');
  };

  if (loading) {
    return (
      <>
        <DashboardNavbar />
        <div className="user-management-container">
          <div className="loading">Đang tải...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardNavbar />
      <div className="user-management-container">
        <div className="page-header">
          <h1>Quản lý người dùng</h1>
          <p>Tổng số: {users.length} người dùng</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {!isEditing && !isViewing && (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên đăng nhập</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Vai trò</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone || 'N/A'}</td>
                    <td>
                      <div className="roles-cell">
                        {user.roles?.map((role, index) => (
                          <span key={index} className="role-badge">
                            {role.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {!user.roles?.some(role => role.name === 'ADMIN') ? (
                          <>
                            <button 
                              onClick={() => handleView(user.id)} 
                              className="btn-view"
                              title="Xem"
                            >
                              Xem
                            </button>
                            <button 
                              onClick={() => handleEdit(user.id)} 
                              className="btn-edit"
                              title="Sửa"
                            >
                              Sửa
                            </button>
                            <button 
                              onClick={() => handleDelete(user.id, user.username)} 
                              className="btn-delete"
                              title="Xóa"
                            >
                              Xóa
                            </button>
                          </>
                        ) : (
                          <span className="admin-protected"></span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isViewing && selectedUser && (
          <div className="user-detail-card">
            <div className="card-header">
              <h2>Chi tiết người dùng</h2>
              <button onClick={handleCancel} className="btn-close">✕</button>
            </div>
            <div className="user-detail-content">
              <div className="detail-row">
                <span className="detail-label">ID:</span>
                <span className="detail-value">{selectedUser.id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Tên đăng nhập:</span>
                <span className="detail-value">{selectedUser.username}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Họ tên:</span>
                <span className="detail-value">{selectedUser.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedUser.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Số điện thoại:</span>
                <span className="detail-value">{selectedUser.phone || 'Chưa cập nhật'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Vai trò:</span>
                <div className="roles-display">
                  {selectedUser.roles?.map((role, index) => (
                    <span key={index} className="role-badge">{role.name}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="card-footer">
              <button onClick={() => handleEdit(selectedUser.id)} className="btn-primary">
                Chỉnh sửa
              </button>
              <button onClick={handleCancel} className="btn-secondary">
                Đóng
              </button>
            </div>
          </div>
        )}

        {isEditing && selectedUser && (
          <div className="user-edit-card">
            <div className="card-header">
              <h2>Chỉnh sửa người dùng</h2>
              <button onClick={handleCancel} className="btn-close">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="edit-form">
              <div className="form-group">
                <label>Tên đăng nhập</label>
                <input
                  type="text"
                  value={selectedUser.username}
                  disabled
                  className="input-disabled"
                />
                <small>Không thể thay đổi tên đăng nhập</small>
              </div>

              <div className="form-group">
                <label>Họ tên *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Mật khẩu mới</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Để trống nếu không đổi mật khẩu"
                />
                <small>Tối thiểu 8 ký tự</small>
              </div>


              <div className="button-group">
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                <button type="button" onClick={handleCancel} className="btn-cancel">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}

export default UserManagement;
