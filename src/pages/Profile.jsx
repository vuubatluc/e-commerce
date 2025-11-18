import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { Input, Button, Alert, Card } from '../components/common';
import '../assets/styles/Profile.css';

function Profile() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  // Kiểm tra role từ localStorage
  const roles = JSON.parse(localStorage.getItem('roles') || '[]');
  const isAdmin = roles.includes('ADMIN');

  useEffect(() => {
    document.title = 'Hồ sơ của tôi';
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await userAPI.getMyInfo();
      if (response.result) {
        setUserInfo(response.result);
        setFormData({
          name: response.result.name || '',
          email: response.result.email || '',
          phone: response.result.phone || '',
          password: ''
        });
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      setError('Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      };

      // Chỉ gửi password nếu người dùng nhập
      if (formData.password) {
        if (formData.password.length < 8) {
          setError('Mật khẩu phải có ít nhất 8 ký tự!');
          setSaving(false);
          return;
        }
        updateData.password = formData.password;
      }

      const response = await userAPI.updateMyInfo(updateData);
      
      if (response.result) {
        setUserInfo(response.result);
        setSuccess('Cập nhật thông tin thành công!');
        setIsEditing(false);
        setFormData({
          ...formData,
          password: ''
        });
        
        // Cập nhật localStorage
        const storedUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        localStorage.setItem('userInfo', JSON.stringify({...storedUserInfo, ...response.result}));
      } else {
        setError(response.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Error updating user info:', error);
      setError('Không thể cập nhật thông tin. Vui lòng thử lại!');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: userInfo?.name || '',
      email: userInfo?.email || '',
      phone: userInfo?.phone || '',
      password: ''
    });
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="profile-container">
        <Card>
          <div className="loading">Đang tải...</div>
        </Card>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="profile-container">
        <Alert variant="error">Không thể tải thông tin người dùng</Alert>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Card 
        title="Hồ sơ của tôi"
        headerActions={
          !isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="primary">
              Chỉnh sửa
            </Button>
          )
        }
        className="profile-card"
      >
        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <div className="profile-section">
            <h3>Thông tin cơ bản</h3>
            
            <Input
              label="Tên đăng nhập"
              type="text"
              value={userInfo.username}
              disabled
              helperText="Không thể thay đổi tên đăng nhập"
            />

            <Input
              label="Họ và tên"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />

            <Input
              label="Số điện thoại"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          {isEditing && (
            <div className="profile-section">
              <h3>Đổi mật khẩu (tùy chọn)</h3>
              <Input
                label="Mật khẩu mới"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Để trống nếu không đổi mật khẩu"
                helperText="Tối thiểu 8 ký tự"
              />
            </div>
          )}

          {isEditing && (
            <div className="button-group">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
              <Button type="button" onClick={handleCancel} variant="secondary">
                Hủy
              </Button>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}

export default Profile;
