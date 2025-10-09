import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { api } from "../api";
import { FaUserCircle, FaArrowLeft } from "react-icons/fa";
import "../styles/EmployeeDetailPage.css"; // Đổi import

const getImageUrl = (path) => {
  if (!path) return null;
  return `http://localhost:5260${path}`;
};

const EmployeeDetailPage = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const { employeeId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      if (!employeeId) return;
      setLoading(true);
      try {
        const response = await api.get(`/NhanVien/${employeeId}`);
        setEmployee(response.data);
      } catch (error) {
        console.error("Không thể tải chi tiết nhân viên:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployeeDetails();
  }, [employeeId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <p>Đang tải chi tiết nhân viên...</p>
      </DashboardLayout>
    );
  }

  if (!employee) {
    return (
      <DashboardLayout>
        <h1>Không tìm thấy nhân viên</h1>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="emp-detail-page">
        <div className="emp-detail-page__header">
          <button
            onClick={() => navigate("/nhan-vien")}
            className="emp-detail-page__back-btn"
          >
            <FaArrowLeft /> Quay lại danh sách
          </button>
        </div>
        <div className="emp-detail-card">
          <div className="emp-detail-card__header">
            {employee.hinhAnh ? (
              <img
                src={getImageUrl(employee.hinhAnh)}
                alt={employee.hoTen}
                className="emp-detail-card__avatar"
              />
            ) : (
              <FaUserCircle
                size={100}
                className="emp-detail-card__avatar-placeholder"
              />
            )}
            <div className="emp-detail-card__header-info">
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
          <div className="emp-detail-card__form">
            <h3 className="emp-detail-card__section-title">
              Thông tin cá nhân
            </h3>
            <div className="emp-detail-card__form-group">
              <label>Ngày sinh:</label>
              <span>{formatDate(employee.ngaySinh)}</span>
            </div>
            <div className="emp-detail-card__form-group">
              <label>Giới tính:</label>
              <span>{employee.gioiTinh === 1 ? "Nam" : "Nữ"}</span>
            </div>
            <div className="emp-detail-card__form-group">
              <label>Dân tộc:</label>
              <span>{employee.danToc || "N/A"}</span>
            </div>
            <div className="emp-detail-card__form-group">
              <label>Tình trạng hôn nhân:</label>
              <span>{employee.tinhTrangHonNhan || "N/A"}</span>
            </div>
            <div className="emp-detail-card__form-group">
              <label>Quê quán:</label>
              <span>{employee.queQuan || "N/A"}</span>
            </div>
            <div className="emp-detail-card__form-group">
              <label>Địa chỉ thường trú:</label>
              <span>{employee.diaChiThuongTru || "N/A"}</span>
            </div>

            <h3 className="emp-detail-card__section-title">
              Thông tin định danh & Liên lạc
            </h3>
            <div className="emp-detail-card__form-group">
              <label>CCCD:</label>
              <span>{employee.cccd || "N/A"}</span>
            </div>
            <div className="emp-detail-card__form-group">
              <label>Ngày cấp:</label>
              <span>{formatDate(employee.ngayCapCCCD)}</span>
            </div>
            <div className="emp-detail-card__form-group">
              <label>Nơi cấp:</label>
              <span>{employee.noiCapCCCD || "N/A"}</span>
            </div>
            <div className="emp-detail-card__form-group">
              <label>Số điện thoại:</label>
              <span>{employee.sdt_NhanVien || "N/A"}</span>
            </div>
            <div className="emp-detail-card__form-group">
              <label>Email:</label>
              <span>{employee.email || "N/A"}</span>
            </div>
            <div className="emp-detail-card__form-group">
              <label>Tài khoản NH:</label>
              <span>{employee.soTaiKhoanNH || "N/A"}</span>
            </div>
            <div className="emp-detail-card__form-group">
              <label>Ngân hàng:</label>
              <span>{employee.tenNganHang || "N/A"}</span>
            </div>

            <h3 className="emp-detail-card__section-title">
              Thông tin công việc
            </h3>
            <div className="emp-detail-card__form-group">
              <label>Chuyên ngành:</label>
              <span>{employee.tenChuyenNganh || "N/A"}</span>
            </div>
            <div className="emp-detail-card__form-group">
              <label>Trình độ học vấn:</label>
              <span>{employee.tenTrinhDoHocVan || "N/A"}</span>
            </div>
            <div className="emp-detail-card__form-group">
              <label>Loại nhân viên:</label>
              <span>{employee.loaiNhanVien || "N/A"}</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDetailPage;
