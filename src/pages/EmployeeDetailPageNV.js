import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/EmployeeDetailPage.css";

const getImageUrl = (path) => {
  if (!path) return null;
  return `http://localhost:5260${path}`;
};

const EmployeeDetailPageNV = () => {
  // Lấy dữ liệu từ Context
  const { employee } = useOutletContext();
  const [activeTab, setActiveTab] = useState("personal");

  if (!employee) {
    return <div style={{ padding: "20px" }}>Đang tải thông tin...</div>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Helper format tiền tệ
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "---";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const tabs = [
    { id: "personal", label: "Thông tin cá nhân" },
    { id: "identity", label: "Giấy tờ tùy thân" },
    { id: "contact", label: "Liên hệ" },
    { id: "job", label: "Quá trình làm việc & HĐ" },
    { id: "bank", label: "Thông tin tài khoản" },
    { id: "education", label: "Trình độ học vấn" },
    { id: "insurance", label: "Bảo hiểm" },
  ];

  // Helper render field
  const renderField = (label, value) => (
    <div className="form-group">
      <label>{label}</label>
      <span className="view-field">{value || "---"}</span>
    </div>
  );

  // --- CÁC PHẦN RENDER NỘI DUNG ---
  const renderPersonal = () => (
    <div className="tab-content">
      <div className="form-section-title">Thông tin cơ bản</div>
      <div style={{ display: "flex", gap: "25px" }}>
        <div className="avatar-section">
          <div className="avatar-preview">
            {employee.hinhAnh ? (
              <img src={getImageUrl(employee.hinhAnh)} alt="Avatar" />
            ) : (
              <FaUserCircle size={80} color="#ccc" />
            )}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="form-grid grid-2">
            {renderField("Mã nhân viên", employee.maNhanVien)}
            {renderField("Họ và tên", employee.hoTen)}
            {renderField("Phòng ban", employee.tenPhongBan)}
            {renderField("Ngày sinh", formatDate(employee.ngaySinh))}
          </div>
        </div>
      </div>
      <div className="form-section-title">Chi tiết cá nhân</div>
      <div className="form-grid grid-3">
        {renderField(
          "Giới tính",
          employee.gioiTinh === 1
            ? "Nam"
            : employee.gioiTinh === 0
            ? "Nữ"
            : "Khác"
        )}
        {renderField("Hôn nhân", employee.tinhTrangHonNhan)}
        {renderField("Dân tộc", employee.danToc)}
        {renderField("Tôn giáo", employee.tonGiao)}
        {renderField("Quốc tịch", employee.quocTich)}
        {renderField("Nơi sinh", employee.noiSinh)}
        {renderField("Quê quán", employee.queQuan)}
      </div>
    </div>
  );

  const renderIdentity = () => (
    <div className="tab-content">
      <div className="form-section-title">Thẻ CCCD / CMND</div>
      <div className="form-grid grid-2">
        {renderField("Số CCCD", employee.cccd)}
        {renderField("Nơi cấp", employee.noiCapCCCD)}
        {renderField("Ngày cấp", formatDate(employee.ngayCapCCCD))}
        {renderField("Ngày hết hạn", formatDate(employee.ngayHetHanCCCD))}
      </div>
    </div>
  );

  const renderContact = () => (
    <div className="tab-content">
      <div className="form-section-title">Liên hệ chính</div>
      <div className="form-grid grid-2">
        {renderField("Email", employee.email)}
        {renderField("Số điện thoại", employee.sdt_NhanVien)}
      </div>
      <div className="form-section-title">Địa chỉ</div>
      <div className="form-grid grid-1">
        {renderField("Địa chỉ chi tiết", employee.diaChiThuongTru)}
      </div>
    </div>
  );

  // 4. Công việc (CẬP NHẬT: phuCap -> luongTroCap)
  const renderJob = () => (
    <div className="tab-content">
      <div className="form-section-title">Quản lý</div>
      <div className="form-grid grid-2">
        {renderField("Quản lý trực tiếp", employee.tenQuanLyTrucTiep)}
        {renderField("Ngày vào làm", formatDate(employee.ngayVaoLam))}
      </div>
      <div className="form-section-title">Công việc</div>
      <div className="form-grid grid-3">
        {renderField("Phòng ban", employee.tenPhongBan)}
        {renderField("Chức vụ", employee.tenChucVu)}
        {renderField("Loại nhân viên", employee.loaiNhanVien)}
      </div>
      <div className="form-section-title">Hợp đồng & Lương</div>
      <div className="form-grid grid-3">
        {renderField("Số HĐ", employee.soHopDong)}

        {/* --- ĐÃ SỬA: Hiển thị đúng luongTroCap --- */}
        {renderField("Lương CB", formatCurrency(employee.luongCoBan))}
        {renderField("Lương trợ cấp", formatCurrency(employee.luongTroCap))}
      </div>
    </div>
  );

  const renderBank = () => (
    <div className="tab-content">
      <div className="form-section-title">Tài khoản ngân hàng</div>
      <div className="form-grid grid-2">
        {renderField("Tên ngân hàng", employee.tenNganHang)}
        {renderField("Số tài khoản", employee.soTaiKhoanNH)}
      </div>
    </div>
  );
  const renderEducation = () => (
    <div className="tab-content">
      <div className="form-section-title">Học vấn</div>
      <div className="form-grid grid-2">
        {renderField("Trình độ", employee.tenTrinhDoHocVan)}
        {renderField("Chuyên ngành", employee.tenChuyenNganh)}
      </div>
    </div>
  );
  const renderInsurance = () => (
    <div className="tab-content">
      <div className="form-section-title">Bảo hiểm</div>
      <div className="form-grid grid-2">
        {renderField("Số BHYT", employee.soBHYT)}
        {renderField("Số BHXH", employee.soBHXH)}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "personal":
        return renderPersonal();
      case "identity":
        return renderIdentity();
      case "contact":
        return renderContact();
      case "job":
        return renderJob();
      case "bank":
        return renderBank();
      case "education":
        return renderEducation();
      case "insurance":
        return renderInsurance();
      default:
        return null;
    }
  };

  // --- STYLES CHO MENU NGANG ---
  const horizontalMenuContainerStyle = {
    display: "flex",
    flexDirection: "row",
    overflowX: "auto",
    width: "100%",
    backgroundColor: "#f8f9fa",
    borderBottom: "1px solid #dce0e4",
    padding: "0",
  };

  const horizontalMenuItemStyle = (isActive) => ({
    padding: "15px 25px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: isActive ? "700" : "500",
    color: isActive ? "#0e7c7b" : "#55606d",
    borderBottom: isActive ? "3px solid #0e7c7b" : "3px solid transparent",
    borderLeft: "none",
    backgroundColor: isActive ? "#fff" : "transparent",
    whiteSpace: "nowrap",
    transition: "all 0.2s",
  });

  return (
    <div
      className="emp-detail-page"
      style={{ padding: "0", height: "100%", backgroundColor: "transparent" }}
    >
      <div
        className="emp-layout-container"
        style={{
          height: "100%",
          borderRadius: "8px",
          border: "none",
          boxShadow: "none",
        }}
      >
        <div className="emp-layout-header">
          <h1>Hồ sơ của tôi: {employee.hoTen}</h1>
          <span
            className={`emp-layout-status ${
              employee.trangThai ? "status-active" : "status-inactive"
            }`}
          >
            {employee.trangThai ? "Đang hoạt động" : "Đã nghỉ việc"}
          </span>
        </div>

        <div className="emp-layout-body" style={{ flexDirection: "column" }}>
          <div style={horizontalMenuContainerStyle}>
            {tabs.map((tab) => (
              <div
                key={tab.id}
                style={horizontalMenuItemStyle(activeTab === tab.id)}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </div>
            ))}
          </div>

          <div className="emp-main" style={{ padding: "30px" }}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailPageNV;
