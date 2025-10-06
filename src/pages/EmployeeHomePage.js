import React, { useState, useEffect } from "react";
import { api } from "../api";
import { FaSearch } from "react-icons/fa";
import { FiSun, FiMoon, FiLogOut } from "react-icons/fi";
// Thêm Outlet và Link
import { Link, useNavigate, useParams, Outlet } from "react-router-dom";
import "../styles/EmployeeHome.css";

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("blob:")) return path;
  return `http://localhost:5260${path}`;
};

const EmployeeHomePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { employeeId } = useParams();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const handleToggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRes = await api.get(`/NhanVien/${employeeId}`);
        setUser(userRes.data);
      } catch (error) {
        console.error("Lỗi tải dữ liệu layout:", error);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [employeeId]); // Bỏ handleLogout khỏi dependencies để tránh re-render vô hạn

  if (loading || !user) {
    return <div className="loading-fullscreen">Đang tải trang cá nhân...</div>;
  }

  return (
    <div className="employee-home-page">
      <nav className="employee-navbar">
        <div className="navbar-center">
          {" "}
          <div className="search-container">
            <FaSearch /> {/* Giờ đã hợp lệ */}
            <input type="text" placeholder="Tìm kiếm tin tức, tài liệu..." />
          </div>
        </div>
        <div className="navbar-right">
          <div className="dark-mode-toggle" onClick={handleToggleDarkMode}>
            {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </div>
          <div className="avatar-container">
            <img
              src={getImageUrl(user.hinhAnh)}
              alt="Avatar"
              className="avatar"
            />
            <div className="dropdown-menu">
              <Link to="/change-password">Đổi mật khẩu</Link>
              <button onClick={handleLogout}>
                <FiLogOut /> Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="employee-main-content">
        <aside className="left-sidebar">
          <div className="profile-summary">
            <img
              src={getImageUrl(user.hinhAnh)}
              alt="Avatar"
              className="profile-avatar"
            />
            <h3>{user.hoTen}</h3>
            <p>{user.tenChucVu}</p>
          </div>
          <div className="action-buttons">
            <button className="action-btn">Đăng ký nghỉ</button>
            <button className="action-btn">Đăng ký OT / Công tác</button>
          </div>
          <nav className="info-links">
            <ul>
              <li>
                {/* SỬA LẠI LINK NÀY */}
                <Link to={`/employee-home/${user.maNhanVien}/details`}>
                  Thông tin chung
                </Link>
              </li>
              <li>
                <Link to={`/employee-home/${user.maNhanVien}/timekeeping`}>
                  Bảng công tháng
                </Link>
              </li>
              <li>
                <Link to={`/employee-home/${user.maNhanVien}/payslip`}>
                  Bảng lương
                </Link>
              </li>
              <li>
                <a href="#" onClick={handleLogout}>
                  Đăng xuất
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        {/* --- THAY THẾ NỘI DUNG GIỮA BẰNG OUTLET --- */}
        <section className="main-feed">
          <Outlet context={{ employee: user }} />
        </section>

        <aside className="right-sidebar"></aside>
      </main>
    </div>
  );
};

export default EmployeeHomePage;
