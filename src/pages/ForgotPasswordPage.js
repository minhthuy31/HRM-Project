import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import '../styles/LoginPage.css';

function ForgotPasswordPage() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/Auth/forgot-password', { username });
      setMessage(response.data.message);
    } catch (err) {
      setMessage('Đã có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Quên Mật Khẩu</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Nhập tên đăng nhập của bạn. Một liên kết sẽ được gửi đến địa chỉ email đã đăng ký cho tài khoản này.
        </p>

        {message && <div className="alert alert-success">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <button className="btn-submit" type="submit">Gửi yêu cầu</button>
          <button type="button" className="btn-link" onClick={() => navigate('/login')}>
            Quay lại Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;