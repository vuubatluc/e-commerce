import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { Input, Button, Alert, Card } from '../components/common';
import '../assets/styles/Auth.css';

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Đăng ký';
  }, []);

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
    
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp!');
      return;
    }

    if (formData.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự!');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = await userAPI.createUser({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      if (data.result) {
        setSuccess('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Đăng ký thất bại. Vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('Không thể kết nối đến server. Vui lòng thử lại sau!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card title="Đăng Ký" className="auth-box">
        <form onSubmit={handleSubmit}>
          {error && <Alert variant="error">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Input
            label="Họ và tên"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Nhập họ và tên"
            disabled={loading}
          />

          <Input
            label="Tên đăng nhập"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            placeholder="Nhập tên đăng nhập"
            disabled={loading}
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Nhập email của bạn"
            disabled={loading}
          />

          <Input
            label="Số điện thoại"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Nhập số điện thoại"
            disabled={loading}
          />
          
          <Input
            label="Mật khẩu (ít nhất 8 ký tự)"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Nhập mật khẩu"
            disabled={loading}
          />

          <Input
            label="Xác nhận mật khẩu"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Nhập lại mật khẩu"
            disabled={loading}
          />

          <Button type="submit" variant="primary" disabled={loading} className="auth-button">
            {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
          </Button>

          <div className="auth-footer">
            <p>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default Signup;
