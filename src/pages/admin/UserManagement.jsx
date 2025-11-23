import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { Input, Button, Alert, Card, Table, Badge, Modal } from '../../components/common';
import '../../assets/styles/UserManagement.css';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    roles: []
  });
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterPhone, setFilterPhone] = useState('');

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

  // Filter users based on email and phone
  const filteredUsers = users.filter(user => {
    const emailMatch = filterEmail === '' || 
      (user.email && user.email.toLowerCase().includes(filterEmail.toLowerCase()));
    const phoneMatch = filterPhone === '' || 
      (user.phone && user.phone.includes(filterPhone));
    return emailMatch && phoneMatch;
  });

  const handleEdit = async (userId) => {
    try {
      const response = await userAPI.getUser(userId);
      if (response.result) {
        setSelectedUser(response.result);
        const userRoles = response.result.roles ? response.result.roles.map(r => r.name) : [];
        setFormData({
          name: response.result.name || '',
          email: response.result.email || '',
          phone: response.result.phone || '',
          password: '',
          confirmPassword: '',
          roles: userRoles
        });
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setError('Không thể tải thông tin người dùng');
    }
  };

  const handleDelete = async (userId, username) => {
    setUserToDelete({ id: userId, name: username });
    setIsConfirmingDelete(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      const response = await userAPI.deleteUser(userToDelete.id);
      if (response.code === 1000) {
        setSuccessMessage('Xóa người dùng thành công!');
        setIsConfirmingDelete(false);
        setUserToDelete(null);
        setIsEditing(false);
        setSelectedUser(null);
        fetchUsers();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response.message || 'Xóa người dùng thất bại');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Không thể xóa người dùng');
    }
  };

  const cancelDelete = () => {
    setIsConfirmingDelete(false);
    setUserToDelete(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleChange = (roleName) => {
    setFormData(prevData => {
      const currentRoles = prevData.roles || [];
      const hasRole = currentRoles.includes(roleName);
      
      return {
        ...prevData,
        roles: hasRole 
          ? currentRoles.filter(r => r !== roleName)
          : [...currentRoles, roleName]
      };
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
        phone: formData.phone,
        roles: formData.roles
      };

      if (formData.password) {
        if (formData.password.length < 8) {
          setError('Mật khẩu phải có ít nhất 8 ký tự!');
          setSaving(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Mật khẩu xác nhận không khớp!');
          setSaving(false);
          return;
        }
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
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      roles: []
    });
    setError('');
  };

  const handleChangePassword = () => {
    setIsChangingPassword(true);
  };

  const handleCancelChangePassword = () => {
    setIsChangingPassword(false);
    setFormData({
      ...formData,
      password: '',
      confirmPassword: ''
    });
    setError('');
  };

  const handleSubmitChangePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (!formData.password) {
        setError('Vui lòng nhập mật khẩu mới!');
        setSaving(false);
        return;
      }

      if (formData.password.length < 8) {
        setError('Mật khẩu phải có ít nhất 8 ký tự!');
        setSaving(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Mật khẩu xác nhận không khớp!');
        setSaving(false);
        return;
      }

      const response = await userAPI.changePassword(selectedUser.id, formData.password);
      
      if (response.result) {
        setSuccessMessage('Đổi mật khẩu thành công!');
        setIsChangingPassword(false);
        setFormData({
          ...formData,
          password: '',
          confirmPassword: ''
        });
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response.message || 'Đổi mật khẩu thất bại');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setError('Không thể đổi mật khẩu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="user-management-container">
        <Card>
          <div className="loading">Đang tải...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="user-management-container">
      <div className="page-header">
        <h1>Quản lý người dùng</h1>
      </div>

      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}
      {successMessage && <Alert variant="success" onClose={() => setSuccessMessage('')}>{successMessage}</Alert>}

      {!isEditing && (
        <Card>
          <div className="filter-section">
            <Input
              label="Lọc theo Email"
              type="text"
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
              placeholder="Nhập email để tìm kiếm"
              containerClassName="filter-input"
            />
            <Input
              label="Lọc theo Số điện thoại"
              type="text"
              value={filterPhone}
              onChange={(e) => setFilterPhone(e.target.value)}
              placeholder="Nhập số điện thoại để tìm kiếm"
              containerClassName="filter-input"
            />
            {(filterEmail || filterPhone) && (
              <Button 
                onClick={() => {
                  setFilterEmail('');
                  setFilterPhone('');
                }} 
                variant="secondary"
                className="clear-filter-btn"
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
          <div className="filter-result">
            <p>Hiển thị: <strong>{filteredUsers.length}</strong> / {users.length} người dùng</p>
          </div>
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.Header>ID</Table.Header>
                <Table.Header>Họ tên</Table.Header>
                <Table.Header>Email</Table.Header>
                <Table.Header>Số điện thoại</Table.Header>
                <Table.Header>Thao tác</Table.Header>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {filteredUsers.map((user) => (
                <Table.Row key={user.id}>
                  <Table.Cell>{user.id}</Table.Cell>
                  <Table.Cell>{user.name}</Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                  <Table.Cell>{user.phone || 'N/A'}</Table.Cell>
                  <Table.Cell>
                    <div className="action-buttons">
                      {user.username !== 'admin' ? (
                        <Button 
                          onClick={() => handleEdit(user.id)} 
                          variant="primary"
                          className="btn-sm"
                        >
                          Edit
                        </Button>
                      ) : (
                        <Badge variant="secondary">Protected</Badge>
                      )}
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>
      )}

      <Modal
        isOpen={isEditing && selectedUser !== null}
        onClose={handleCancel}
        title="Chỉnh sửa người dùng"
        size="large"
      >
        {selectedUser && (
          <form onSubmit={handleSubmit} className="edit-form">
            <Input
              label="Tên đăng nhập"
              type="text"
              value={selectedUser.username}
              disabled
              helperText="Không thể thay đổi tên đăng nhập"
            />

            <Input
              label="Họ tên"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              label="Số điện thoại"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />

            <div className="role-selection">
              <label className="role-selection-label">Vai trò *</label>
              <div className="role-checkboxes">
                <label className="role-checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.roles.includes('USER')}
                    onChange={() => handleRoleChange('USER')}
                  />
                  <span>USER</span>
                </label>
                <label className="role-checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.roles.includes('ADMIN')}
                    onChange={() => handleRoleChange('ADMIN')}
                  />
                  <span>ADMIN</span>
                </label>
              </div>
              <small className="role-helper-text">Có thể chọn cả 2 vai trò</small>
            </div>

            <div className="button-group">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
              <Button 
                type="button" 
                onClick={handleChangePassword}
                variant="warning"
                disabled={saving}
              >
                Đổi mật khẩu
              </Button>
              <Button 
                type="button" 
                onClick={() => {
                  handleDelete(selectedUser.id, selectedUser.username);
                }} 
                variant="danger"
                disabled={saving}
              >
                Xóa tài khoản
              </Button>
              <Button type="button" onClick={handleCancel} variant="secondary">
                Hủy
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={isChangingPassword && selectedUser !== null}
        onClose={handleCancelChangePassword}
        title="Đổi mật khẩu"
        size="medium"
      >
        {selectedUser && (
          <form onSubmit={handleSubmitChangePassword} className="change-password-form">
            {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

            <Input
              label="Mật khẩu mới"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu mới"
              helperText="Tối thiểu 8 ký tự"
              required
            />

            <Input
              label="Nhập lại mật khẩu mới"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu mới"
              required
            />

            <div className="button-group">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Đang đổi...' : 'Đổi mật khẩu'}
              </Button>
              <Button type="button" onClick={handleCancelChangePassword} variant="secondary">
                Hủy
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal Xác nhận xóa người dùng */}
      <Modal
        isOpen={isConfirmingDelete}
        onClose={cancelDelete}
        title="Xác nhận xóa người dùng"
        size="small"
      >
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '16px', marginBottom: '10px' }}>
            Bạn có chắc chắn muốn xóa người dùng:
          </p>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#d32f2f' }}>
            {userToDelete?.name}
          </p>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            Hành động này không thể hoàn tác!
          </p>
        </div>
        <div className="button-group">
          <Button onClick={confirmDelete} variant="danger">
            Xác nhận xóa
          </Button>
          <Button onClick={cancelDelete} variant="secondary">
            Hủy
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default UserManagement;
