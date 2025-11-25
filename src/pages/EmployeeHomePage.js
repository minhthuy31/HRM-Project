import React, { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { FaSearch } from "react-icons/fa";
import { FiSun, FiMoon, FiLogOut } from "react-icons/fi";
import { Link, useNavigate, useParams, Outlet } from "react-router-dom";
import "../styles/EmployeeHome.css";
import LeaveRequestModal from "../components/modals/LeaveRequestModal";

import CheckInScanner from "../components/CheckInScanner";
import "../styles/Modal.css";
import "../styles/CheckInScanner.css";

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  // --- STATE MỚI CHO QUÉT QR ---
  const [isScannerOpen, setIsScannerOpen] = useState(false); // 2. State quản lý modal quét
  const [scanResult, setScanResult] = useState(null); // Để lưu thông báo quét
  const [timekeepingSummary, setTimekeepingSummary] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const handleToggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const [currentTime, setCurrentTime] = useState(new Date());

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;

        // Gọi 2 API song song
        const [userRes, timekeepingRes] = await Promise.all([
          api.get(`/NhanVien/${employeeId}`),
          // API này lấy dữ liệu chấm công (bao gồm 'remainingLeaveDays')
          api.get(`/ChamCong/${employeeId}?year=${year}&month=${month}`),
        ]);

        setUser(userRes.data);

        // Lưu summary (chứa "RemainingLeaveDays") vào state
        if (timekeepingRes.data.summaries) {
          setTimekeepingSummary(timekeepingRes.data.summaries[employeeId]);
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu layout:", error);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [employeeId, handleLogout]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(currentTime);

  const formattedTime = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(currentTime);

  const handleSaveLeaveRequest = async (requestData) => {
    // requestData giờ sẽ chứa: ngayBatDau, ngayKetThuc, lyDo, soNgayNghi, file

    // 1. Tạo FormData để gửi file
    const formData = new FormData();

    // 2. Append dữ liệu vào FormData
    // Tên key (vd: "NgayBatDau") phải khớp với DTO (DonNghiPhepCreateDto) ở Backend
    formData.append("NgayBatDau", requestData.ngayBatDau);
    formData.append("NgayKetThuc", requestData.ngayKetThuc);
    formData.append("LyDo", requestData.lyDo);
    formData.append("SoNgayNghi", requestData.soNgayNghi);

    // 3. Thêm file nếu có
    if (requestData.file) {
      formData.append("File", requestData.file);
    }

    try {
      // 4. Gọi API mới (create-with-file) và gửi FormData
      await api.post("/DonNghiPhep/create-with-file", formData, {
        headers: {
          // Bắt buộc set header này khi dùng FormData
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Gửi đơn xin nghỉ thành công!");
      setIsModalOpen(false);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Đã có lỗi xảy ra khi gửi đơn.";
      alert(`Lỗi: ${errorMessage}`);
    }
  };

  // --- HÀM MỚI XỬ LÝ KẾT QUẢ QUÉT ---
  const handleScanSuccess = (message) => {
    // 3. Hàm chạy khi quét thành công
    setScanResult({ type: "success", text: message });
    setIsScannerOpen(false); // Tắt camera
    // Tự động xóa thông báo sau 5 giây
    setTimeout(() => setScanResult(null), 5000);
  };

  const handleScanError = (message) => {
    // 4. Hàm chạy khi quét lỗi
    setScanResult({ type: "error", text: message });
    // Không tắt camera, để người dùng quét lại
  };

  if (loading || !user) {
    return <div className="loading-fullscreen">Đang tải trang cá nhân...</div>;
  }

  return (
    <>
      <div className="employee-home-page">
        <nav className="employee-navbar">
          <div className="datetime">
            <div className="time">{formattedTime}</div>
            <div className="date">{formattedDate}</div>
          </div>
          <div className="navbar-center">
            <div className="search-container">
              <FaSearch />
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
              <button
                className="action-btn"
                onClick={() => setIsModalOpen(true)}
              >
                Đăng ký nghỉ
              </button>
              <button className="action-btn">Đăng ký OT / Công tác</button>
              {/* 5. THÊM NÚT QUÉT QR VÀO ĐÂY */}
              <button
                className="action-btn action-btn-checkin" // Dùng class mới để tô màu
                onClick={() => {
                  setScanResult(null); // Xóa lỗi cũ (nếu có)
                  setIsScannerOpen(true);
                }}
              >
                Quét QR Chấm công
              </button>
            </div>

            <nav className="info-links">
              <ul>
                <li>
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
          <section className="main-feed">
            <Outlet context={{ employee: user }} />
          </section>
          <aside className="right-sidebar"></aside>
        </main>
      </div>

      {isModalOpen && (
        <LeaveRequestModal
          onSave={handleSaveLeaveRequest}
          onCancel={() => setIsModalOpen(false)}
          remainingLeaveDays={timekeepingSummary?.remainingLeaveDays}
        />
      )}

      {/* 6. THÊM MODAL QUÉT QR MỚI VÀO ĐÂY */}
      {isScannerOpen && (
        <div className="modal-overlay">
          <div className="modal-content scanner-modal">
            <h2>Đưa mã QR vào khung hình</h2>

            {/* Đây là component camera */}
            <CheckInScanner
              onScanSuccess={handleScanSuccess}
              onScanError={handleScanError}
            />

            {/* Hiển thị lỗi quét (nếu có) */}
            {scanResult && scanResult.type === "error" && (
              <p className="scan-error">{scanResult.text}</p>
            )}

            <button
              className="modal-close-btn"
              onClick={() => {
                setIsScannerOpen(false);
                setScanResult(null); // Xóa thông báo
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Hiển thị thông báo thành công (bên ngoài modal) */}
      {scanResult && scanResult.type === "success" && (
        <div className="scan-success-popup">{scanResult.text}</div>
      )}
    </>
  );
};

export default EmployeeHomePage;
