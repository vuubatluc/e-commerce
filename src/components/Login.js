import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, userAPI } from '../services/api';
import './styles/Auth.css';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
              navigate('/dashboard');
              return;
            }
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
        }

        
        navigate('/');
      } else {
        setError(data.message || 'Tên đăng nhập hoặc mật khẩu không đúng!');
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
      <div className="auth-box">
        <h2>Đăng Nhập</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Nhập tên đăng nhập"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Nhập mật khẩu"
              disabled={loading}
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="forgot-password-link">
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </p>
          <p>Chưa có tài khoản? <Link to="/signup">Đăng ký ngay</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
