import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import "../styles/LoginPage.css";
import logo from "../assets/logo.png";
import "../App.css";

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
      const { token, role, maNhanVien } = response.data;

      localStorage.setItem("token", token);

      const normalizedRole = role?.toLowerCase();

      if (
        normalizedRole === "giám đốc" ||
        normalizedRole === "trưởng phòng" ||
        normalizedRole === "nhân sự phòng" ||
        normalizedRole === "nhân sự tổng"
      ) {
        navigate("/dashboard");
      } else if (normalizedRole === "nhân viên") {
        navigate(`/employee-home/${maNhanVien}`);
      } else {
        setError(`Vai trò người dùng không hợp lệ: '${role}'`);
        localStorage.removeItem("token");
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
        {error && <div className="alert alert-danger">{error}</div>}
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
