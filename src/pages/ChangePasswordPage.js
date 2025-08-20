import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import DashboardLayout from '../layouts/DashboardLayout'; 
import '../styles/ChangePasswordPage.css';

function ChangePasswordPage() {
  // Bỏ state username vì sẽ lấy tự động
  const [username, setUsername] = useState(''); 
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // 3. Lấy username của người dùng đang đăng nhập
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get('/Auth/me');
        setUsername(response.data.username); // Lưu lại username
      } catch (err) {
        console.error("Không thể lấy thông tin người dùng", err);
        setError("Không thể xác định người dùng. Vui lòng đăng nhập lại.");
      }
    };
    fetchCurrentUser();
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và mật khẩu xác nhận không khớp!');
      return;
    }

    try {
      // 4. Gửi request với username đã lấy được từ state
      await api.post('/Auth/change-password', {
        username,
        oldPassword,
        newPassword,
      });

      setMessage('Đổi mật khẩu thành công! Bạn sẽ được đăng xuất để đăng nhập lại.');
      setTimeout(() => {
        localStorage.removeItem('token'); // Xóa token cũ
        navigate('/login');
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.message || 'Đã có lỗi xảy ra.');
    }
  };

  return (
    // 5. Bọc toàn bộ trang trong DashboardLayout
    <DashboardLayout>
      <div className="change-password-container">
        <div className="change-password-card">
          <h1>Đổi Mật Khẩu</h1>

          {/* Hiển thị thông báo */}
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* 6. Bỏ ô nhập username */}
            <div className="input-group">
              <input
                type="password"
                placeholder="Mật khẩu hiện tại"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Mật khẩu mới"
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
            <button className="btn-submit" type="submit" disabled={!username}>
              Xác nhận thay đổi
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ChangePasswordPage;