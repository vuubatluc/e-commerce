import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, userAPI } from '../services/api';
import { Input, Button, Alert, Card } from '../components/common';
import '../assets/styles/Auth.css';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Đăng nhập';
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
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = await authAPI.login(formData.username, formData.password);

      if (data.result && data.result.authenticated) {
        // Lưu token và username vào localStorage
        localStorage.setItem('token', data.result.token);
        localStorage.setItem('username', formData.username);

        // Lấy thông tin user để lưu roles
        try {
          const userInfo = await userAPI.getMyInfo();
          if (userInfo.result) {
            localStorage.setItem('userInfo', JSON.stringify(userInfo.result));
            const roles = userInfo.result.roles ? userInfo.result.roles.map(r => r.name) : [];
            localStorage.setItem('roles', JSON.stringify(roles));
            
            // Kiểm tra nếu là ADMIN thì chuyển đến dashboard
            if (roles.includes('ADMIN')) {
              setSuccess('Đăng nhập thành công!');
              setTimeout(() => navigate('/dashboard'), 1500);
              return;
            }
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
        }

        setSuccess('Đăng nhập thành công!');
        setTimeout(() => navigate('/'), 1500);
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không đúng!');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Không thể kết nối đến server. Vui lòng thử lại sau!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card title="Đăng Nhập" className="auth-box">
        <form onSubmit={handleSubmit}>
          {error && <Alert variant="error">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
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
            label="Mật khẩu"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Nhập mật khẩu"
            disabled={loading}
          />

          <Button type="submit" variant="primary" disabled={loading} className="auth-button">
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </Button>

          <div className="auth-footer">
            <p className="forgot-password-link">
              <Link to="/forgot-password">Quên mật khẩu?</Link>
            </p>
            <p>Chưa có tài khoản? <Link to="/signup">Đăng ký ngay</Link></p>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default Login;
