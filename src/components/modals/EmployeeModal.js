import React, { useState, useRef, useEffect } from "react";
import { FaTimes, FaUserCircle } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// Import file CSS thông thường
import "../../styles/EmployeeModal.css";

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("blob:")) return path;
  return `http://localhost:5260${path}`;
};

const EmployeeModal = ({
  employee,
  onSave,
  onCancel,
  phongBans,
  chucVus,
  chuyenNganhs,
  trinhDoHocVans,
  hopDongs,
  isViewOnly = false,
}) => {
  const [formData, setFormData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const initialData = employee
      ? { ...employee }
      : { trangThai: true, gioiTinh: "1" };
    setFormData(initialData);
    setPreviewUrl(initialData.hinhAnh || null);
    setSelectedFile(null);
  }, [employee]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDateChange = (date, name) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, selectedFile);
  };

  const getTitle = () => {
    if (isViewOnly && employee) return `Thông tin chi tiết: ${employee.hoTen}`;
    return employee ? `Sửa thông tin: ${employee.hoTen}` : "Thêm nhân viên mới";
  };

  return (
    <div className="employee-modal-overlay">
      <div className="employee-modal__content">
        <div className="employee-modal__header">
          <h2>{getTitle()}</h2>
          <button onClick={onCancel} className="employee-modal__close-btn">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="employee-modal__avatar-uploader">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleImageChange}
              disabled={isViewOnly}
            />
            <div
              className="employee-modal__avatar-preview"
              onClick={() => !isViewOnly && fileInputRef.current.click()}
            >
              {previewUrl ? (
                <img src={getImageUrl(previewUrl)} alt="Avatar" />
              ) : (
                <span>
                  <FaUserCircle size={60} /> <br /> Chọn ảnh
                </span>
              )}
            </div>
          </div>

          <div className="employee-modal__form">
            <h3 className="employee-modal__section-title">Thông tin cá nhân</h3>

            {formData.maNhanVien && (
              <div className="employee-modal__form-group">
                <label>Mã nhân viên</label>
                <input type="text" value={formData.maNhanVien} disabled />
              </div>
            )}

            <div className="employee-modal__form-group">
              <label>Họ tên</label>
              <input
                type="text"
                name="hoTen"
                value={formData.hoTen || ""}
                onChange={handleChange}
                disabled={isViewOnly}
                required
              />
            </div>

            {!isViewOnly ? (
              <div className="employee-modal__form-group">
                <label>Mật khẩu</label>
                <input
                  type="password"
                  name="matKhau"
                  placeholder={employee ? "Để trống nếu không đổi" : ""}
                  onChange={handleChange}
                  required={!employee}
                />
              </div>
            ) : (
              <div className="employee-modal__form-group">
                <label>Mật khẩu</label>
                <input type="password" value="********" disabled />
              </div>
            )}
            <div className="employee-modal__form-group">
              <label>Ngày sinh</label>
              {isViewOnly ? (
                <input
                  type="text"
                  value={
                    formData.ngaySinh
                      ? new Date(formData.ngaySinh).toLocaleDateString("vi-VN")
                      : ""
                  }
                  disabled
                />
              ) : (
                <DatePicker
                  selected={
                    formData.ngaySinh ? new Date(formData.ngaySinh) : null
                  }
                  onChange={(date) => handleDateChange(date, "ngaySinh")}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="dd/mm/yyyy"
                  className="employee-modal__datepicker"
                />
              )}
            </div>

            <div className="employee-modal__form-group">
              <label>Giới tính</label>
              <select
                name="gioiTinh"
                value={formData.gioiTinh ?? ""}
                onChange={handleChange}
                disabled={isViewOnly}
              >
                <option value="">-- Chọn --</option>
                <option value="1">Nam</option>
                <option value="0">Nữ</option>
                <option value="2">Khác</option>
              </select>
            </div>

            <div className="employee-modal__form-group">
              <label>Dân tộc</label>
              <input
                type="text"
                name="danToc"
                value={formData.danToc || ""}
                onChange={handleChange}
                disabled={isViewOnly}
              />
            </div>

            <div className="employee-modal__form-group">
              <label>Tình trạng hôn nhân</label>
              <input
                type="text"
                name="tinhTrangHonNhan"
                value={formData.tinhTrangHonNhan || ""}
                onChange={handleChange}
                disabled={isViewOnly}
              />
            </div>
            {/* ... Các input khác cũng tương tự ... */}
            <div className="employee-modal__form-group">
              <label>Quê quán</label>
              <input
                type="text"
                name="queQuan"
                value={formData.queQuan || ""}
                onChange={handleChange}
                disabled={isViewOnly}
              />
            </div>
            <div className="employee-modal__form-group">
              <label>Địa chỉ thường trú</label>
              <input
                type="text"
                name="diaChiThuongTru"
                value={formData.diaChiThuongTru || ""}
                onChange={handleChange}
                disabled={isViewOnly}
              />
            </div>
            <div className="employee-modal__form-group">
              <label>Địa chỉ tạm trú</label>
              <input
                type="text"
                name="diaChiTamTru"
                value={formData.diaChiTamTru || ""}
                onChange={handleChange}
                disabled={isViewOnly}
              />
            </div>

            <h3 className="employee-modal__section-title">
              Thông tin định danh & Liên lạc
            </h3>
            <div className="employee-modal__form-group">
              <label>CCCD</label>
              <input
                type="text"
                name="cccd"
                value={formData.cccd || ""}
                onChange={handleChange}
                disabled={isViewOnly}
              />
            </div>
            <div className="employee-modal__form-group">
              <label>Ngày cấp CCCD</label>
              {isViewOnly ? (
                <input
                  type="text"
                  value={
                    formData.ngayCapCCCD
                      ? new Date(formData.ngayCapCCCD).toLocaleDateString(
                          "vi-VN"
                        )
                      : ""
                  }
                  disabled
                />
              ) : (
                <DatePicker
                  selected={
                    formData.ngayCapCCCD ? new Date(formData.ngayCapCCCD) : null
                  }
                  onChange={(date) => handleDateChange(date, "ngayCapCCCD")}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="dd/mm/yyyy"
                  className="employee-modal__datepicker"
                />
              )}
            </div>
            <div className="employee-modal__form-group">
              <label>Nơi cấp CCCD</label>
              <input
                type="text"
                name="noiCapCCCD"
                value={formData.noiCapCCCD || ""}
                onChange={handleChange}
                disabled={isViewOnly}
              />
            </div>
            <div className="employee-modal__form-group">
              <label>Số điện thoại</label>
              <input
                type="text"
                name="sdt_NhanVien"
                value={formData.sdt_NhanVien || ""}
                onChange={handleChange}
                disabled={isViewOnly}
              />
            </div>
            <div className="employee-modal__form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                disabled={isViewOnly}
              />
            </div>
            <div className="employee-modal__form-group">
              <label>Số tài khoản NH</label>
              <input
                type="text"
                name="soTaiKhoanNH"
                value={formData.soTaiKhoanNH || ""}
                onChange={handleChange}
                disabled={isViewOnly}
              />
            </div>
            <div className="employee-modal__form-group">
              <label>Tên ngân hàng</label>
              <input
                type="text"
                name="tenNganHang"
                value={formData.tenNganHang || ""}
                onChange={handleChange}
                disabled={isViewOnly}
              />
            </div>
            <h3 className="employee-modal__section-title">
              Thông tin công việc
            </h3>

            {/* ... Tương tự cho các select và input còn lại ... */}
            <div className="employee-modal__form-group">
              <label>Phòng ban</label>
              <select
                name="maPhongBan"
                value={formData.maPhongBan || ""}
                onChange={handleChange}
                disabled={isViewOnly}
              >
                <option value="">-- Chọn --</option>
                {(phongBans || []).map((pb) => (
                  <option key={pb.maPhongBan} value={pb.maPhongBan}>
                    {pb.tenPhongBan}
                  </option>
                ))}
              </select>
            </div>
            <div className="employee-modal__form-group">
              <label>Chức vụ</label>
              <select
                name="maChucVuNV"
                value={formData.maChucVuNV || ""}
                onChange={handleChange}
                disabled={isViewOnly}
              >
                <option value="">-- Chọn --</option>
                {(chucVus || []).map((cv) => (
                  <option key={cv.maChucVuNV} value={cv.maChucVuNV}>
                    {cv.tenChucVu}
                  </option>
                ))}
              </select>
            </div>
            <div className="employee-modal__form-group">
              <label>Chuyên ngành</label>
              <select
                name="maChuyenNganh"
                value={formData.maChuyenNganh || ""}
                onChange={handleChange}
                disabled={isViewOnly}
              >
                <option value="">-- Chọn --</option>
                {(chuyenNganhs || []).map((cn) => (
                  <option key={cn.maChuyenNganh} value={cn.maChuyenNganh}>
                    {cn.tenChuyenNganh}
                  </option>
                ))}
              </select>
            </div>
            <div className="employee-modal__form-group">
              <label>Trình độ học vấn</label>
              <select
                name="maTrinhDoHocVan"
                value={formData.maTrinhDoHocVan || ""}
                onChange={handleChange}
                disabled={isViewOnly}
              >
                <option value="">-- Chọn --</option>
                {(trinhDoHocVans || []).map((td) => (
                  <option key={td.maTrinhDoHocVan} value={td.maTrinhDoHocVan}>
                    {td.tenTrinhDo}
                  </option>
                ))}
              </select>
            </div>
            <div className="employee-modal__form-group">
              <label>Hợp đồng</label>
              <select
                name="maHopDong"
                value={formData.maHopDong || ""}
                onChange={handleChange}
                disabled={isViewOnly}
              >
                <option value="">-- Chọn --</option>
                {(hopDongs || []).map((hd) => (
                  <option key={hd.maHopDong} value={hd.maHopDong}>
                    {hd.loaiHopDong}
                  </option>
                ))}
              </select>
            </div>
            <div className="employee-modal__form-group">
              <label>Loại nhân viên</label>
              <input
                type="text"
                name="loaiNhanVien"
                value={formData.loaiNhanVien || ""}
                onChange={handleChange}
                disabled={isViewOnly}
              />
            </div>
            <div className="employee-modal__form-group">
              <label>Trạng thái</label>
              <select
                name="trangThai"
                value={formData.trangThai}
                onChange={handleChange}
                disabled={isViewOnly}
              >
                <option value={true}>Đang hoạt động</option>
                <option value={false}>Đã nghỉ việc</option>
              </select>
            </div>

            {!isViewOnly && (
              <div className="employee-modal__form-group employee-modal__form-group--full-width">
                <button type="submit" className="employee-modal__submit-btn">
                  {employee ? "Lưu thay đổi" : "Thêm mới"}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;
