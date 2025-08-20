// src/pages/ResetPasswordPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import '../styles/LoginPage.css'; 

function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Không tìm thấy token. Vui lòng thử lại từ email.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      const response = await api.post('/Auth/reset-password', { token, newPassword });
      setMessage(response.data.message + " Bạn sẽ được chuyển đến trang đăng nhập sau 3 giây.");
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi không xác định.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Đặt Lại Mật Khẩu</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        {!message && (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="password"
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Xác nhận mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button className="btn-submit" type="submit" disabled={!token}>
              Xác nhận
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordPage;