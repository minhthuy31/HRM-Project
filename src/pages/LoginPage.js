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

      // SỬA Ở ĐÂY: Lấy thêm refreshToken từ response.data
      const { token, refreshToken, role, maNhanVien } = response.data;

      // SỬA Ở ĐÂY: Lưu cả 2 token vào localStorage
      localStorage.setItem("token", token);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      const normalizeRole = (r) => {
        if (!r) return "";
        return r
          .toString()
          .toLowerCase()
          .trim()
          .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a")
          .replace(/[èéẹẻẽêềếệểễ]/g, "e")
          .replace(/[ìíịỉĩ]/g, "i")
          .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o")
          .replace(/[ùúụủũưừứựửữ]/g, "u")
          .replace(/[ỳýỵỷỹ]/g, "y")
          .replace(/[đ]/g, "d")
          .replace(/\s+/g, "");
      };

      const cleanRole = normalizeRole(role);

      // Danh sách role được vào dashboard
      const dashboardRoles = [
        "giamdoc",
        "truongphong",
        "ketoantruong",
        "nhansutruong",
      ];

      if (cleanRole === "nhanvien") {
        navigate(`/employee-home/${maNhanVien}`);
      } else if (dashboardRoles.includes(cleanRole)) {
        navigate("/dashboard");
      } else {
        setError("Role không được hỗ trợ: " + role);
        // SỬA Ở ĐÂY: Xóa cả 2 token nếu role không hợp lệ
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.",
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
