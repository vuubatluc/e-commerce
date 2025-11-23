import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { Input, Button, Alert, Card, Modal } from '../components/common';
import '../assets/styles/Profile.css';

function Profile() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    password: '',
    confirmPassword: ''
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
          currentPassword: '',
          password: '',
          confirmPassword: ''
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

      const response = await userAPI.updateMyInfo(updateData);
      
      if (response.result) {
        setUserInfo(response.result);
        setSuccess('Cập nhật thông tin thành công!');
        
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

  const handleChangePassword = () => {
    setIsChangingPassword(true);
    setError('');
    setSuccess('');
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

      const response = await userAPI.changeMyPassword(formData.currentPassword, formData.password);
      
      if (response.result) {
        setSuccess('Đổi mật khẩu thành công!');
        setIsChangingPassword(false);
        setFormData({
          ...formData,
          currentPassword: '',
          password: '',
          confirmPassword: ''
        });
        setTimeout(() => setSuccess(''), 3000);
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
          </div>
        </form>
      </Card>

      <Modal
        isOpen={isChangingPassword}
        onClose={handleCancelChangePassword}
        title="Đổi mật khẩu"
        size="medium"
      >
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
      </Modal>
    </div>
  );
}

export default Profile;
