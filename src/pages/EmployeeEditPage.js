import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { api } from "../api";
import { FaArrowLeft, FaUserCircle, FaCamera } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import "../styles/EmployeeDetailPage.css"; // Đổi import

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("blob:")) return path;
  return `http://localhost:5260${path}`;
};

const EmployeeEditPage = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [phongBans, setPhongBans] = useState([]);
  const [chucVuNhanViens, setChucVus] = useState([]);
  const [chuyenNganhs, setChuyenNganhs] = useState([]);
  const [trinhDoHocVans, setTrinhDoHocVans] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [empRes, pbRes, cvRes, cnRes, tdRes] = await Promise.all([
          api.get(`/NhanVien/${employeeId}`),
          api.get("/PhongBan"),
          api.get("/ChucVuNhanVien"),
          api.get("/ChuyenNganh"),
          api.get("/TrinhDoHocVan"),
        ]);
        setEmployee(empRes.data);
        setPhongBans(pbRes.data);
        setChucVus(cvRes.data);
        setChuyenNganhs(cnRes.data);
        setTrinhDoHocVans(tdRes.data);
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [employeeId]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee({ ...employee, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSave = async () => {
    if (!employee) return;

    let dataToSave = { ...employee };

    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadRes = await api.post("/NhanVien/UploadImage", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        dataToSave.hinhAnh = uploadRes.data.filePath;
      }

      await api.put(`/NhanVien/${dataToSave.maNhanVien}`, dataToSave);

      alert("Cập nhật thành công!");
      navigate(`/nhan-vien/${dataToSave.maNhanVien}`);
    } catch (err) {
      console.error("Lỗi khi lưu:", err);
      const errorMsg =
        err.response?.data?.errors || err.response?.data || "Lưu thất bại!";
      alert(JSON.stringify(errorMsg));
    }
  };

  if (loading || !employee) {
    return (
      <DashboardLayout>
        <p>Đang tải dữ liệu...</p>
      </DashboardLayout>
    );
  }

  const displayImage = imagePreview || getImageUrl(employee.hinhAnh);

  return (
    <DashboardLayout>
      <div className="emp-detail-page">
        <div className="emp-detail-page__header">
          <button
            onClick={() => navigate(-1)}
            className="emp-detail-page__back-btn"
          >
            <FaArrowLeft /> Quay lại
          </button>
        </div>

        <div className="emp-detail-card">
          <div className="emp-detail-card__header">
            <div className="emp-detail-card__avatar-edit-container">
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={employee.hoTen}
                  className="emp-detail-card__avatar"
                />
              ) : (
                <FaUserCircle
                  size={100}
                  className="emp-detail-card__avatar-placeholder"
                />
              )}
              <label
                htmlFor="avatar-upload"
                className="emp-detail-card__avatar-edit-btn"
              >
                <FaCamera />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </div>
            <div className="emp-detail-card__header-info">
              <h1>Chỉnh sửa nhân viên</h1>
              <p>{employee.maNhanVien}</p>
            </div>
          </div>

          <div className="emp-detail-card__form">
            <h3 className="emp-detail-card__section-title">
              Thông tin cá nhân
            </h3>
            <div className="emp-detail-card__form-group">
              <label>Họ tên:</label>
              <input
                type="text"
                name="hoTen"
                value={employee.hoTen || ""}
                onChange={handleChange}
              />
            </div>
            <div className="emp-detail-card__form-group">
              <label>Mật khẩu</label>
              <input
                name="MatKhau"
                type="password"
                placeholder="Để trống nếu không muốn thay đổi"
                onChange={handleChange}
              />
            </div>
            <div className="emp-detail-card__form-group">
              <label>Ngày sinh:</label>
              <DatePicker
                selected={
                  employee.ngaySinh ? new Date(employee.ngaySinh) : null
                }
                onChange={(date) =>
                  setEmployee({
                    ...employee,
                    ngaySinh: date ? dayjs(date).format("YYYY-MM-DD") : null,
                  })
                }
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/MM/yyyy"
              />
            </div>
            <div className="emp-detail-card__form-group">
              <label>Giới tính:</label>
              <select
                name="gioiTinh"
                value={employee.gioiTinh}
                onChange={handleChange}
              >
                <option value={1}>Nam</option>
                <option value={0}>Nữ</option>
              </select>
            </div>
            <div className="emp-detail-card__form-group">
              <label>Dân tộc:</label>
              <input
                type="text"
                name="danToc"
                value={employee.danToc || ""}
                onChange={handleChange}
              />
            </div>
            <div className="emp-detail-card__form-group">
              <label>Tình trạng hôn nhân:</label>
              <input
                type="text"
                name="tinhTrangHonNhan"
                value={employee.tinhTrangHonNhan || ""}
                onChange={handleChange}
              />
            </div>
            <div className="emp-detail-card__form-group">
              <label>Quê quán:</label>
              <input
                type="text"
                name="queQuan"
                value={employee.queQuan || ""}
                onChange={handleChange}
              />
            </div>
            <div className="emp-detail-card__form-group">
              <label>Địa chỉ thường trú:</label>
              <input
                type="text"
                name="diaChiThuongTru"
                value={employee.diaChiThuongTru || ""}
                onChange={handleChange}
              />
            </div>

            <h3 className="emp-detail-card__section-title">
              Thông tin định danh & Liên lạc
            </h3>
            <div className="emp-detail-card__form-group">
              <label>CCCD:</label>
              <input
                type="text"
                name="cccd"
                value={employee.cccd || ""}
                onChange={handleChange}
              />
            </div>
            <div className="emp-detail-card__form-group">
              <label>Ngày cấp:</label>
              <DatePicker
                selected={
                  employee.ngayCapCCCD ? new Date(employee.ngayCapCCCD) : null
                }
                onChange={(date) =>
                  setEmployee({
                    ...employee,
                    ngayCapCCCD: date ? dayjs(date).format("YYYY-MM-DD") : null,
                  })
                }
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/MM/yyyy"
              />
            </div>
            <div className="emp-detail-card__form-group">
              <label>Nơi cấp:</label>
              <input
                type="text"
                name="noiCapCCCD"
                value={employee.noiCapCCCD || ""}
                onChange={handleChange}
              />
            </div>
            <div className="emp-detail-card__form-group">
              <label>Số điện thoại:</label>
              <input
                type="text"
                name="sdt_NhanVien"
                value={employee.sdt_NhanVien || ""}
                onChange={handleChange}
              />
            </div>
            <div className="emp-detail-card__form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={employee.email || ""}
                onChange={handleChange}
              />
            </div>
            <div className="emp-detail-card__form-group">
              <label>Tài khoản NH:</label>
              <input
                type="text"
                name="soTaiKhoanNH"
                value={employee.soTaiKhoanNH || ""}
                onChange={handleChange}
              />
            </div>
            <div className="emp-detail-card__form-group">
              <label>Ngân hàng:</label>
              <input
                type="text"
                name="tenNganHang"
                value={employee.tenNganHang || ""}
                onChange={handleChange}
              />
            </div>

            <h3 className="emp-detail-card__section-title">
              Thông tin công việc
            </h3>
            <div className="emp-detail-card__form-group">
              <label>Phòng ban</label>
              <select
                name="maPhongBan"
                value={employee.maPhongBan || ""}
                onChange={handleChange}
              >
                <option value="">-- Chọn --</option>
                {phongBans.map((pb) => (
                  <option key={pb.maPhongBan} value={pb.maPhongBan}>
                    {pb.tenPhongBan}
                  </option>
                ))}
              </select>
            </div>
            <div className="emp-detail-card__form-group">
              <label>Chức vụ:</label>
              <select
                name="maChucVuNV"
                value={employee.maChucVuNV || ""}
                onChange={handleChange}
              >
                <option value="">-- Chọn --</option>
                {chucVuNhanViens.map((cv) => (
                  <option key={cv.maChucVuNV} value={cv.maChucVuNV}>
                    {cv.tenChucVu}
                  </option>
                ))}
              </select>
            </div>
            <div className="emp-detail-card__form-group">
              <label>Chuyên ngành:</label>
              <select
                name="maChuyenNganh"
                value={employee.maChuyenNganh || ""}
                onChange={handleChange}
              >
                <option value="">-- Chọn chuyên ngành --</option>
                {chuyenNganhs.map((cn) => (
                  <option key={cn.maChuyenNganh} value={cn.maChuyenNganh}>
                    {cn.tenChuyenNganh}
                  </option>
                ))}
              </select>
            </div>
            <div className="emp-detail-card__form-group">
              <label>Trình độ học vấn:</label>
              <select
                name="maTrinhDoHocVan"
                value={employee.maTrinhDoHocVan || ""}
                onChange={handleChange}
              >
                <option value="">-- Chọn --</option>
                {trinhDoHocVans.map((tdhv) => (
                  <option
                    key={tdhv.maTrinhDoHocVan}
                    value={tdhv.maTrinhDoHocVan}
                  >
                    {tdhv.tenTrinhDo}
                  </option>
                ))}
              </select>
            </div>
            <div className="emp-detail-card__form-group">
              <label>Loại nhân viên:</label>
              <input
                type="text"
                name="loaiNhanVien"
                value={employee.loaiNhanVien || ""}
                onChange={handleChange}
              />
            </div>
            <div className="emp-detail-card__form-group">
              <label>Trạng thái:</label>
              <select
                name="trangThai"
                value={employee.trangThai}
                onChange={(e) =>
                  setEmployee({
                    ...employee,
                    trangThai: e.target.value === "true",
                  })
                }
              >
                <option value={true}>Đang hoạt động</option>
                <option value={false}>Đã nghỉ việc</option>
              </select>
            </div>
            <div className="emp-detail-card__form-actions">
              <button
                onClick={handleSave}
                className="emp-detail-card__save-btn"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeEditPage;
