import React from "react";
import { useOutletContext } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "../styles/EmployeeDetailPageNV.css";

const getImageUrl = (path) => {
  if (!path) return null;
  return `http://localhost:5260${path}`;
};

const EmployeeDetailPageNV = () => {
  // Nhận dữ liệu employee từ context của Outlet
  const { employee } = useOutletContext();

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (!employee) {
    return <p>Không tìm thấy thông tin nhân viên.</p>;
  }

  return (
    <div className="employee-self-container">
      {/* === HEADER === */}
      <div className="self-header">
        {employee.hinhAnh ? (
          <img
            src={getImageUrl(employee.hinhAnh)}
            alt={employee.hoTen}
            className="self-avatar"
          />
        ) : (
          <FaUserCircle size={110} className="self-avatar-placeholder" />
        )}

        <div className="self-header-info">
          <h1>{employee.hoTen}</h1>
          <p className="self-employee-code">
            {employee.maNhanVien} -{" "}
            <span
              className={
                employee.trangThai ? "status-active" : "status-inactive"
              }
            >
              {employee.trangThai ? "Đang hoạt động" : "Đã nghỉ việc"}
            </span>
          </p>
          <p className="self-position">
            {employee.tenChucVu} tại {employee.tenPhongBan}
          </p>
        </div>
      </div>

      {/* === NỘI DUNG CHÍNH – GRID KHÔNG NHẢY CÓC === */}
      <div className="self-info-wrapper">
        {/* ─────── THÔNG TIN CÁ NHÂN ─────── */}
        <div className="self-section">
          <h3 className="self-section-title">Thông tin cá nhân</h3>
          <div className="self-info-grid">
            <div className="self-info-item">
              <label>Ngày sinh:</label>
              <span>{formatDate(employee.ngaySinh)}</span>
            </div>
            <div className="self-info-item">
              <label>Giới tính:</label>
              <span>{employee.gioiTinh === 1 ? "Nam" : "Nữ"}</span>
            </div>
            <div className="self-info-item">
              <label>Dân tộc:</label>
              <span>{employee.danToc || "N/A"}</span>
            </div>
            <div className="self-info-item">
              <label>Hôn nhân:</label>
              <span>{employee.tinhTrangHonNhan || "N/A"}</span>
            </div>

            <div className="self-info-item span-2">
              <label>Quê quán:</label>
              <span>{employee.queQuan || "N/A"}</span>
            </div>
            <div className="self-info-item span-2">
              <label>Thường trú:</label>
              <span>{employee.diaChiThuongTru || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* ─────── THÔNG TIN ĐỊNH DANH & LIÊN LẠC ─────── */}
        <div className="self-section">
          <h3 className="self-section-title">Thông tin định danh & Liên lạc</h3>
          <div className="self-info-grid">
            <div className="self-info-item">
              <label>CCCD:</label>
              <span>{employee.cccd || "N/A"}</span>
            </div>
            <div className="self-info-item">
              <label>Ngày cấp:</label>
              <span>{formatDate(employee.ngayCapCCCD)}</span>
            </div>
            <div className="self-info-item span-2">
              <label>Nơi cấp:</label>
              <span>{employee.noiCapCCCD || "N/A"}</span>
            </div>

            <div className="self-info-item">
              <label>Điện thoại:</label>
              <span>{employee.sdt_NhanVien || "N/A"}</span>
            </div>
            <div className="self-info-item">
              <label>Email:</label>
              <span>{employee.email || "N/A"}</span>
            </div>
            <div className="self-info-item">
              <label>Tài khoản NH:</label>
              <span>{employee.soTaiKhoanNH || "N/A"}</span>
            </div>
            <div className="self-info-item">
              <label>Ngân hàng:</label>
              <span>{employee.tenNganHang || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* ─────── THÔNG TIN CÔNG VIỆC ─────── */}
        <div className="self-section">
          <h3 className="self-section-title">Thông tin công việc</h3>
          <div className="self-info-grid">
            <div className="self-info-item">
              <label>Chuyên ngành:</label>
              <span>{employee.tenChuyenNganh || "N/A"}</span>
            </div>
            <div className="self-info-item">
              <label>Trình độ học vấn:</label>
              <span>{employee.tenTrinhDoHocVan || "N/A"}</span>
            </div>
            <div className="self-info-item">
              <label>Loại nhân viên:</label>
              <span>{employee.loaiNhanVien || "N/A"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailPageNV;
