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
        <p>Tổng số: {users.length} người dùng</p>
      </div>

      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}
      {successMessage && <Alert variant="success" onClose={() => setSuccessMessage('')}>{successMessage}</Alert>}

      {!isEditing && !isViewing && (
        <Card>
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.Header>ID</Table.Header>
                <Table.Header>Tên đăng nhập</Table.Header>
                <Table.Header>Họ tên</Table.Header>
                <Table.Header>Email</Table.Header>
                <Table.Header>Số điện thoại</Table.Header>
                <Table.Header>Vai trò</Table.Header>
                <Table.Header>Thao tác</Table.Header>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {users.map((user) => (
                <Table.Row key={user.id}>
                  <Table.Cell>{user.id}</Table.Cell>
                  <Table.Cell>{user.username}</Table.Cell>
                  <Table.Cell>{user.name}</Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                  <Table.Cell>{user.phone || 'N/A'}</Table.Cell>
                  <Table.Cell>
                    <div className="roles-cell">
                      {user.roles?.map((role, index) => (
                        <Badge key={index} variant={role.name === 'ADMIN' ? 'danger' : 'primary'}>
                          {role.name}
                        </Badge>
                      ))}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="action-buttons">
                      {!user.roles?.some(role => role.name === 'ADMIN') ? (
                        <>
                          <Button 
                            onClick={() => handleView(user.id)} 
                            variant="info"
                            className="btn-sm"
                          >
                            Xem
                          </Button>
                          <Button 
                            onClick={() => handleEdit(user.id)} 
                            variant="warning"
                            className="btn-sm"
                          >
                            Sửa
                          </Button>
                          <Button 
                            onClick={() => handleDelete(user.id, user.username)} 
                            variant="danger"
                            className="btn-sm"
                          >
                            Xóa
                          </Button>
                        </>
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
        isOpen={isViewing && selectedUser !== null}
        onClose={handleCancel}
        title="Chi tiết người dùng"
        footer={
          <>
            <Button onClick={() => handleEdit(selectedUser?.id)} variant="primary">
              Chỉnh sửa
            </Button>
            <Button onClick={handleCancel} variant="secondary">
              Đóng
            </Button>
          </>
        }
      >
        {selectedUser && (
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
                  <Badge key={index} variant={role.name === 'ADMIN' ? 'danger' : 'primary'}>
                    {role.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

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

            <Input
              label="Mật khẩu mới"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Để trống nếu không đổi mật khẩu"
              helperText="Tối thiểu 8 ký tự"
            />

            <div className="button-group">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
              <Button type="button" onClick={handleCancel} variant="secondary">
                Hủy
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default UserManagement;
