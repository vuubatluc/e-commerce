import React, { useState, useEffect } from 'react';
import { userAPI, roleAPI, permissionAPI } from '../../services/api';
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
  const [isManagingRoles, setIsManagingRoles] = useState(false);
  const [isManagingRolesCRUD, setIsManagingRolesCRUD] = useState(false);
  const [isManagingPermissionsCRUD, setIsManagingPermissionsCRUD] = useState(false);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [isAddingPermission, setIsAddingPermission] = useState(false);
  const [rolesToDelete, setRolesToDelete] = useState([]);
  const [permissionsToDelete, setPermissionsToDelete] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newPermissionName, setNewPermissionName] = useState('');
  const [newPermissionDescription, setNewPermissionDescription] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    password: '',
    confirmPassword: '',
    roles: []
  });
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    document.title = 'Quản lý người dùng';
    fetchUsers();
    fetchRolesAndPermissions();
  }, []);

  const fetchRolesAndPermissions = async () => {
    try {
      const [rolesResponse, permissionsResponse] = await Promise.all([
        roleAPI.getAll(),
        permissionAPI.getAll()
      ]);
      if (rolesResponse.result) {
        setRoles(rolesResponse.result);
      }
      if (permissionsResponse.result) {
        setPermissions(permissionsResponse.result);
      }
    } catch (error) {
      console.error('Error fetching roles and permissions:', error);
    }
  };

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

  // Filter users based on search term (username, email, phone)
  const filteredUsers = users.filter(user => {
    if (searchTerm === '') return true;
    const term = searchTerm.toLowerCase();
    return (
      (user.username && user.username.toLowerCase().includes(term)) ||
      (user.email && user.email.toLowerCase().includes(term)) ||
      (user.phone && user.phone.includes(searchTerm))
    );
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
          currentPassword: '',
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
      currentPassword: '',
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
      currentPassword: '',
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
      if (!formData.currentPassword) {
        setError('Vui lòng nhập mật khẩu hiện tại!');
        setSaving(false);
        return;
      }

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

      const response = await userAPI.changePassword(selectedUser.id, formData.currentPassword, formData.password);
      
      if (response.result) {
        setSuccessMessage('Đổi mật khẩu thành công!');
        setIsChangingPassword(false);
        setFormData({
          ...formData,
          currentPassword: '',
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

  const handleTogglePermission = async (roleName, permissionName) => {
    try {
      const role = roles.find(r => r.name === roleName);
      const hasPermission = role.permissions.some(p => p.name === permissionName);
      
      let updatedPermissions;
      if (hasPermission) {
        updatedPermissions = role.permissions.filter(p => p.name !== permissionName).map(p => p.name);
      } else {
        updatedPermissions = [...role.permissions.map(p => p.name), permissionName];
      }

      const response = await roleAPI.update(roleName, {
        name: roleName,
        description: role.description,
        permissions: updatedPermissions
      });

      if (response.result) {
        await fetchRolesAndPermissions();
        setSuccessMessage('Cập nhật quyền thành công!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Error updating role permissions:', error);
      setError('Không thể cập nhật quyền');
    }
  };

  const handleAddRole = async () => {
    if (!newRoleName.trim()) {
      setError('Vui lòng nhập tên role!');
      return;
    }
    try {
      const response = await roleAPI.create({
        name: newRoleName,
        description: newRoleDescription,
        permissions: []
      });
      if (response.result) {
        setSuccessMessage('Thêm role thành công!');
        setNewRoleName('');
        setNewRoleDescription('');
        await fetchRolesAndPermissions();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response.message || 'Thêm role thất bại');
      }
    } catch (error) {
      console.error('Error creating role:', error);
      setError('Không thể tạo role');
    }
  };

  const handleOpenAddRole = () => {
    setIsManagingRolesCRUD(false);
    setIsAddingRole(true);
  };

  const handleOpenAddPermission = () => {
    setIsManagingPermissionsCRUD(false);
    setIsAddingPermission(true);
  };

  const handleAddPermission = async () => {
    if (!newPermissionName.trim()) {
      setError('Vui lòng nhập tên permission!');
      return;
    }
    try {
      const response = await permissionAPI.create({
        name: newPermissionName,
        description: newPermissionDescription
      });
      if (response.result) {
        setSuccessMessage('Thêm permission thành công!');
        setNewPermissionName('');
        setNewPermissionDescription('');
        await fetchRolesAndPermissions();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response.message || 'Thêm permission thất bại');
      }
    } catch (error) {
      console.error('Error creating permission:', error);
      setError('Không thể tạo permission');
    }
  };

  const handleDeleteRoles = async () => {
    if (rolesToDelete.length === 0) {
      setError('Vui lòng chọn ít nhất một role để xóa!');
      return;
    }
    try {
      await Promise.all(rolesToDelete.map(roleName => roleAPI.delete(roleName)));
      setSuccessMessage(`Xóa ${rolesToDelete.length} role thành công!`);
      setRolesToDelete([]);
      await fetchRolesAndPermissions();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting roles:', error);
      setError('Không thể xóa role');
    }
  };

  const handleDeletePermissions = async () => {
    if (permissionsToDelete.length === 0) {
      setError('Vui lòng chọn ít nhất một permission để xóa!');
      return;
    }
    try {
      await Promise.all(permissionsToDelete.map(permissionName => permissionAPI.delete(permissionName)));
      setSuccessMessage(`Xóa ${permissionsToDelete.length} permission thành công!`);
      setPermissionsToDelete([]);
      await fetchRolesAndPermissions();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting permissions:', error);
      setError('Không thể xóa permission');
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

      <Card>
          <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              onClick={() => setIsManagingRoles(true)} 
              variant="primary"
            >
              Roles & Permissions
            </Button>
          </div>
          <div className="filter-section">
            <Input
              label="Tìm kiếm"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nhập tên đăng nhập, email hoặc số điện thoại"
              containerClassName="filter-input"
            />
            {searchTerm && (
              <Button 
                onClick={() => setSearchTerm('')} 
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
                <Table.Header style={{ textAlign: 'center' }}>ID</Table.Header>
                <Table.Header style={{ textAlign: 'center' }}>Họ tên</Table.Header>
                <Table.Header style={{ textAlign: 'center' }}>Email</Table.Header>
                <Table.Header style={{ textAlign: 'center' }}>Số điện thoại</Table.Header>
                <Table.Header style={{ textAlign: 'center' }}>Thao tác</Table.Header>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {filteredUsers.map((user) => (
                <Table.Row key={user.id}>
                  <Table.Cell style={{ textAlign: 'center' }}>{user.id}</Table.Cell>
                  <Table.Cell style={{ textAlign: 'center' }}>{user.name}</Table.Cell>
                  <Table.Cell style={{ textAlign: 'center' }}>{user.email}</Table.Cell>
                  <Table.Cell style={{ textAlign: 'center' }}>{user.phone || 'N/A'}</Table.Cell>
                  <Table.Cell style={{ textAlign: 'center' }}>
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
                {roles.map(role => (
                  <label key={role.name} className="role-checkbox-item">
                    <input
                      type="checkbox"
                      checked={formData.roles.includes(role.name)}
                      onChange={() => handleRoleChange(role.name)}
                    />
                    <span>{role.name}</span>
                  </label>
                ))}
              </div>
              <small className="role-helper-text">Có thể chọn nhiều vai trò</small>
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
              label="Mật khẩu hiện tại"
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Nhập mật khẩu hiện tại"
              required
            />

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

      {/* Modal Quản lý Roles & Permissions */}
      <Modal
        isOpen={isManagingRoles}
        onClose={() => setIsManagingRoles(false)}
        title="Quản lý Roles & Permissions"
        size="large"
      >
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button onClick={() => setIsManagingRolesCRUD(true)} variant="primary">
            Quản lý Role
          </Button>
          <Button onClick={() => setIsManagingPermissionsCRUD(true)} variant="primary">
            Quản lý Permission
          </Button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr>
                <th style={{ padding: '12px', border: '1px solid #ddd', backgroundColor: '#f5f5f5', textAlign: 'left' }}>
                  Role / Permission
                </th>
                {permissions.map(permission => (
                  <th key={permission.name} style={{ padding: '12px', border: '1px solid #ddd', backgroundColor: '#f5f5f5', textAlign: 'center', minWidth: '100px' }}>
                    {permission.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map(role => (
                <tr key={role.name}>
                  <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold' }}>
                    {role.name}
                  </td>
                  {permissions.map(permission => {
                    const hasPermission = role.permissions?.some(p => p.name === permission.name);
                    return (
                      <td key={permission.name} style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={hasPermission || false}
                          onChange={() => handleTogglePermission(role.name, permission.name)}
                          style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* Modal Quản lý Role - Danh sách */}
      <Modal
        isOpen={isManagingRolesCRUD}
        onClose={() => {
          setIsManagingRolesCRUD(false);
          setRolesToDelete([]);
          setError('');
        }}
        title="Quản lý Role"
        size="large"
      >
        {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}
        
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleOpenAddRole} variant="primary">
            Thêm Role
          </Button>
        </div>

        {/* Danh sách role */}
        <div>
          <h3 style={{ marginBottom: '15px' }}>Danh sách Role</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px', padding: '10px', marginBottom: '15px' }}>
            {roles.map(role => (
              <div key={role.name} style={{ display: 'flex', alignItems: 'center', padding: '10px', borderBottom: '1px solid #f0f0f0' }}>
                <input
                  type="checkbox"
                  checked={rolesToDelete.includes(role.name)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setRolesToDelete([...rolesToDelete, role.name]);
                    } else {
                      setRolesToDelete(rolesToDelete.filter(r => r !== role.name));
                    }
                  }}
                  style={{ marginRight: '10px', width: '18px', height: '18px' }}
                />
                <div style={{ flex: 1 }}>
                  <div><strong>{role.name}</strong></div>
                  <div style={{ fontSize: '14px', color: '#666' }}>{role.description}</div>
                </div>
              </div>
            ))}
          </div>
          <Button onClick={handleDeleteRoles} variant="danger" disabled={rolesToDelete.length === 0}>
            Xóa đã chọn ({rolesToDelete.length})
          </Button>
        </div>
      </Modal>

      {/* Modal Thêm Role */}
      <Modal
        isOpen={isAddingRole}
        onClose={() => {
          setIsAddingRole(false);
          setNewRoleName('');
          setNewRoleDescription('');
          setIsManagingRolesCRUD(true);
          setError('');
        }}
        title="Thêm Role mới"
        size="medium"
      >
        {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}
        
        <Input
          label="Tên Role"
          type="text"
          value={newRoleName}
          onChange={(e) => setNewRoleName(e.target.value)}
          placeholder="VD: MANAGER, EDITOR"
          required
        />
        <Input
          label="Mô tả"
          type="text"
          value={newRoleDescription}
          onChange={(e) => setNewRoleDescription(e.target.value)}
          placeholder="Mô tả vai trò"
          required
        />
        <div className="button-group" style={{ marginTop: '20px' }}>
          <Button onClick={handleAddRole} variant="primary">
            Thêm Role
          </Button>
          <Button 
            onClick={() => {
              setIsAddingRole(false);
              setNewRoleName('');
              setNewRoleDescription('');
              setIsManagingRolesCRUD(true);
              setError('');
            }} 
            variant="secondary"
          >
            Hủy
          </Button>
        </div>
      </Modal>

      {/* Modal Quản lý Permission - Danh sách */}
      <Modal
        isOpen={isManagingPermissionsCRUD}
        onClose={() => {
          setIsManagingPermissionsCRUD(false);
          setPermissionsToDelete([]);
          setError('');
        }}
        title="Quản lý Permission"
        size="large"
      >
        {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}
        
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleOpenAddPermission} variant="primary">
            Thêm Permission
          </Button>
        </div>

        {/* Danh sách permission */}
        <div>
          <h3 style={{ marginBottom: '15px' }}>Danh sách Permission</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px', padding: '10px', marginBottom: '15px' }}>
            {permissions.map(permission => (
              <div key={permission.name} style={{ display: 'flex', alignItems: 'center', padding: '10px', borderBottom: '1px solid #f0f0f0' }}>
                <input
                  type="checkbox"
                  checked={permissionsToDelete.includes(permission.name)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPermissionsToDelete([...permissionsToDelete, permission.name]);
                    } else {
                      setPermissionsToDelete(permissionsToDelete.filter(p => p !== permission.name));
                    }
                  }}
                  style={{ marginRight: '10px', width: '18px', height: '18px' }}
                />
                <div style={{ flex: 1 }}>
                  <div><strong>{permission.name}</strong></div>
                  <div style={{ fontSize: '14px', color: '#666' }}>{permission.description}</div>
                </div>
              </div>
            ))}
          </div>
          <Button onClick={handleDeletePermissions} variant="danger" disabled={permissionsToDelete.length === 0}>
            Xóa đã chọn ({permissionsToDelete.length})
          </Button>
        </div>
      </Modal>

      {/* Modal Thêm Permission */}
      <Modal
        isOpen={isAddingPermission}
        onClose={() => {
          setIsAddingPermission(false);
          setNewPermissionName('');
          setNewPermissionDescription('');
          setIsManagingPermissionsCRUD(true);
          setError('');
        }}
        title="Thêm Permission mới"
        size="medium"
      >
        {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}
        
        <Input
          label="Tên Permission"
          type="text"
          value={newPermissionName}
          onChange={(e) => setNewPermissionName(e.target.value)}
          placeholder="VD: CREATE_USER, DELETE_PRODUCT"
          required
        />
        <Input
          label="Mô tả"
          type="text"
          value={newPermissionDescription}
          onChange={(e) => setNewPermissionDescription(e.target.value)}
          placeholder="Mô tả quyền hạn"
          required
        />
        <div className="button-group" style={{ marginTop: '20px' }}>
          <Button onClick={handleAddPermission} variant="primary">
            Thêm Permission
          </Button>
          <Button 
            onClick={() => {
              setIsAddingPermission(false);
              setNewPermissionName('');
              setNewPermissionDescription('');
              setIsManagingPermissionsCRUD(true);
              setError('');
            }} 
            variant="secondary"
          >
            Hủy
          </Button>
        </div>
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
