// src/pages/LoginPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api'; 
import '../styles/LoginPage.css'; 

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/Auth/login', { username, password });
      
      localStorage.setItem('token', response.data.token);
      setMessage('Đăng nhập thành công!');
      
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Đăng nhập thất bại!');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Đăng Nhập</h2>
        
        {message && (
          <div 
            className={`alert ${message.includes('thất bại') || message.includes('không đúng') ? 'alert-danger' : 'alert-success'}`}
          >
            {message}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Tên đăng nhập"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="forgot-password-link">
            <span onClick={() => navigate('/forgot-password')}>
                Quên mật khẩu?
            </span>
        </div>

          <button className="btn-submit" type="submit">Đăng nhập</button>
        
        </form>
      </div>
    </div>
  );
}

export default LoginPage;