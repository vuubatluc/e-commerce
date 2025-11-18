import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import Navbar from './Navbar';
import DashboardNavbar from './DashboardNavbar';
import './styles/Profile.css';

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
      <>
        {isAdmin ? <DashboardNavbar /> : <Navbar />}
        <div className="profile-container">
          <div className="loading">Đang tải...</div>
        </div>
      </>
    );
  }

  if (!userInfo) {
    return (
      <>
        {isAdmin ? <DashboardNavbar /> : <Navbar />}
        <div className="profile-container">
          <div className="error-box">Không thể tải thông tin người dùng</div>
        </div>
      </>
    );
  }

  return (
    <>
      {isAdmin ? <DashboardNavbar /> : <Navbar />}
      <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1>Hồ sơ của tôi</h1>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="edit-button">
              Chỉnh sửa
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="profile-section">
            <h3>Thông tin cơ bản</h3>
            
            <div className="form-group">
              <label>Tên đăng nhập</label>
              <input
                type="text"
                value={userInfo.username}
                disabled
                className="input-disabled"
              />
              <small>Không thể thay đổi tên đăng nhập</small>
            </div>

            <div className="form-group">
              <label htmlFor="name">Họ và tên</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Số điện thoại</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          {isEditing && (
            <div className="profile-section">
              <h3>Đổi mật khẩu (tùy chọn)</h3>
              <div className="form-group">
                <label htmlFor="password">Mật khẩu mới</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Để trống nếu không đổi mật khẩu"
                />
                <small>Tối thiểu 8 ký tự</small>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="button-group">
              <button type="submit" className="save-button" disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              <button type="button" onClick={handleCancel} className="cancel-button">
                Hủy
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
    </>
  );
}

export default Profile;
