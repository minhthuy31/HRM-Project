import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import "../styles/LoginPage.css";
import logo from "../assets/logo.png";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/Auth/login", { email, password });

      // Lấy các dữ liệu cần thiết từ API response
      const { token, role, maNhanVien } = response.data;

      // Lưu token vào localStorage
      localStorage.setItem("token", token);

      // Phân luồng người dùng dựa trên vai trò
      if (
        role === "Admin" ||
        role === "Giám đốc" ||
        role === "Trưởng phòng" ||
        role === "Nhân viên nhân sự" ||
        role === "Phó phòng"
      ) {
        navigate("/dashboard"); // Các role quản lý vào trang dashboard
      } else if (role === "Nhân viên") {
        navigate(`/employee-home/${maNhanVien}`); // Nhân viên vào trang home của họ với ID
      } else {
        // Mặc định hoặc xử lý cho các role không xác định
        setError("Vai trò người dùng không hợp lệ.");
        localStorage.removeItem("token"); // Xóa token nếu role không đúng
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo} alt="Logo Công ty" className="login-logo" />
        <h2>Đăng nhập Hệ thống</h2>
        {error && <div className="login-alert">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="forgot-password-link">
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </div>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
