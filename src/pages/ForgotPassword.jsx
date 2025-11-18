import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Input, Button, Alert, Card } from '../components/common';
import '../assets/styles/Auth.css';

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Quên mật khẩu';
  }, []);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.forgetPassword(email);
      
      if (response.code === 1000) {
        setSuccess('Mã OTP đã được gửi đến email của bạn!');
        setTimeout(() => {
          setStep(2);
          setSuccess('');
        }, 2000);
      } else {
        setError('Email không tồn tại trong hệ thống');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError('Không thể gửi mã OTP. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (otp.length !== 6) {
      setError('Mã OTP phải có 6 ký tự');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.verifyOtp(email, otp);
      
      if (response.code === 1000) {
        setSuccess('Xác thực OTP thành công!');
        setTimeout(() => {
          setStep(3);
          setSuccess('');
        }, 1500);
      } else {
        setError('Mã OTP không chính xác hoặc đã hết hạn');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError('Không thể xác thực OTP. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.resetPassword(email, otp, newPassword);
      
      if (response.code === 1000) {
        setSuccess('Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError('Không thể đặt lại mật khẩu');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('Không thể đặt lại mật khẩu. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.forgetPassword(email);
      
      if (response.code === 1000) {
        setSuccess('Mã OTP mới đã được gửi đến email của bạn!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Không thể gửi lại mã OTP');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      setError('Không thể gửi lại mã OTP. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card title="Quên mật khẩu" className="auth-box">
        <div className="steps-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Email</div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Xác thực OTP</div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Mật khẩu mới</div>
        </div>

        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <p className="step-description">
              Nhập email của bạn để nhận mã OTP xác thực
            </p>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Nhập Email"
              disabled={loading}
            />
            <Button type="submit" variant="primary" disabled={loading} className="auth-button">
              {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit}>
            <p className="step-description">
              Mã OTP đã được gửi đến <strong>{email}</strong>
            </p>
            <Input
              label="Mã OTP (6 ký tự)"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength="6"
              disabled={loading}
              className="otp-input"
            />
            <Button type="submit" variant="primary" disabled={loading} className="auth-button">
              {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
            </Button>
            <div className="resend-otp">
              <Button 
                type="button" 
                onClick={handleResendOtp} 
                variant="link"
                disabled={loading}
              >
                Gửi lại mã OTP
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordSubmit}>
            <p className="step-description">
              Nhập mật khẩu mới của bạn
            </p>
            <Input
              label="Mật khẩu mới"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Tối thiểu 8 ký tự"
              disabled={loading}
            />
            <Input
              label="Xác nhận mật khẩu"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Nhập lại mật khẩu mới"
              disabled={loading}
            />
            <Button type="submit" variant="primary" disabled={loading} className="auth-button">
              {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
            </Button>
          </form>
        )}

        <div className="auth-footer">
          <p><Link to="/login">← Quay lại đăng nhập</Link></p>
        </div>
      </Card>
    </div>
  );
}

export default ForgotPassword;
