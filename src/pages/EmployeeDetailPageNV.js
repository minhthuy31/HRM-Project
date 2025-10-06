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
    <div className="employee-self-view">
      <div className="detail-header">
        {employee.hinhAnh ? (
          <img
            src={getImageUrl(employee.hinhAnh)}
            alt={employee.hoTen}
            className="detail-avatar"
          />
        ) : (
          <FaUserCircle size={100} className="detail-avatar-placeholder" />
        )}
        <div className="detail-header-info">
          <h1>{employee.hoTen}</h1>
          <p>
            {employee.maNhanVien} -{" "}
            {employee.trangThai ? "Đang hoạt động" : "Đã nghỉ việc"}
          </p>
          <span>
            {employee.tenChucVu} tại {employee.tenPhongBan}
          </span>
        </div>
      </div>

      {/* SỬA 3: Toàn bộ form được đặt trong một lưới duy nhất */}
      <div className="form-grid">
        <h3 className="form-section-title">Thông tin cá nhân</h3>

        <div className="form-group">
          <label>Ngày sinh:</label>
          <span>{formatDate(employee.ngaySinh)}</span>
        </div>
        <div className="form-group">
          <label>Giới tính:</label>
          <span>{employee.gioiTinh === 1 ? "Nam" : "Nữ"}</span>
        </div>
        <div className="form-group">
          <label>Dân tộc:</label>
          <span>{employee.danToc || "N/A"}</span>
        </div>
        <div className="form-group">
          <label>Hôn nhân:</label>
          <span>{employee.tinhTrangHonNhan || "N/A"}</span>
        </div>

        <div className="form-group span-2">
          <label>Quê quán:</label>
          <span>{employee.queQuan || "N/A"}</span>
        </div>
        <div className="form-group span-2">
          <label>Thường trú:</label>
          <span>{employee.diaChiThuongTru || "N/A"}</span>
        </div>

        <h3 className="form-section-title">Thông tin định danh & Liên lạc</h3>

        <div className="form-group">
          <label>CCCD:</label>
          <span>{employee.cccd || "N/A"}</span>
        </div>
        <div className="form-group">
          <label>Ngày cấp:</label>
          <span>{formatDate(employee.ngayCapCCCD)}</span>
        </div>
        <div className="form-group span-2">
          <label>Nơi cấp:</label>
          <span>{employee.noiCapCCCD || "N/A"}</span>
        </div>

        <div className="form-group">
          <label>Điện thoại:</label>
          <span>{employee.sdt_NhanVien || "N/A"}</span>
        </div>
        <div className="form-group">
          <label>Email:</label>
          <span>{employee.email || "N/A"}</span>
        </div>
        <div className="form-group">
          <label>Tài khoản NH:</label>
          <span>{employee.soTaiKhoanNH || "N/A"}</span>
        </div>
        <div className="form-group">
          <label>Ngân hàng:</label>
          <span>{employee.tenNganHang || "N/A"}</span>
        </div>

        <h3 className="form-section-title">Thông tin công việc</h3>

        <div className="form-group">
          <label>Chuyên ngành:</label>
          <span>{employee.tenChuyenNganh || "N/A"}</span>
        </div>
        <div className="form-group">
          <label>Trình độ học vấn:</label>
          <span>{employee.tenTrinhDoHocVan || "N/A"}</span>
        </div>
        <div className="form-group">
          <label>Loại nhân viên:</label>
          <span>{employee.loaiNhanVien || "N/A"}</span>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailPageNV;
