import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { api } from "../api";
import { FaArrowLeft, FaUserCircle } from "react-icons/fa";
import "../styles/EmployeePage.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";

const getImageUrl = (path) => {
  if (!path) return null;
  return `http://localhost:5260${path}`;
};

const EmployeeEditPage = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/NhanVien/${employeeId}`);
        setEmployee(res.data);
      } catch (err) {
        console.error("Lỗi tải nhân viên:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [employeeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee({ ...employee, [name]: value });
  };

  const handleSave = async () => {
    try {
      await api.put(`/NhanVien/${employee.maNhanVien}`, employee);
      alert("Cập nhật thành công!");
      navigate(`/nhan-vien/${employee.maNhanVien}`);
    } catch (err) {
      console.error("Lỗi khi lưu:", err);
      alert("Lưu thất bại!");
    }
  };

  if (loading || !employee) {
    return (
      <DashboardLayout>
        <p>Đang tải dữ liệu...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="employee-edit-page">
        <div className="detail-page-header">
          <button onClick={() => navigate(-1)} className="back-button">
            <FaArrowLeft /> Quay lại
          </button>
        </div>

        <div className="detail-card">
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
              <h1>Chỉnh sửa nhân viên</h1>
              <p>{employee.maNhanVien}</p>
            </div>
          </div>

          <div className="employee-form">
            <h3 className="form-section-title">Thông tin cá nhân</h3>
            <div className="form-group">
              <label>Họ tên:</label>
              <input
                type="text"
                name="hoTen"
                value={employee.hoTen || ""}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
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
                className="form-control"
              />
            </div>
            <div className="form-group">
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
            <div className="form-group">
              <label>Dân tộc:</label>
              <input
                type="text"
                name="danToc"
                value={employee.danToc || ""}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Tình trạng hôn nhân:</label>
              <input
                type="text"
                name="tinhTrangHonNhan"
                value={employee.tinhTrangHonNhan || ""}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Quê quán:</label>
              <input
                type="text"
                name="queQuan"
                value={employee.queQuan || ""}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Địa chỉ thường trú:</label>
              <input
                type="text"
                name="diaChiThuongTru"
                value={employee.diaChiThuongTru || ""}
                onChange={handleChange}
              />
            </div>

            <h3 className="form-section-title">
              Thông tin định danh & Liên lạc
            </h3>
            <div className="form-group">
              <label>CCCD:</label>
              <input
                type="text"
                name="cccd"
                value={employee.cccd || ""}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
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
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Nơi cấp:</label>
              <input
                type="text"
                name="noiCapCCCD"
                value={employee.noiCapCCCD || ""}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Số điện thoại:</label>
              <input
                type="text"
                name="sdt_NhanVien"
                value={employee.sdt_NhanVien || ""}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={employee.email || ""}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Tài khoản NH:</label>
              <input
                type="text"
                name="soTaiKhoanNH"
                value={employee.soTaiKhoanNH || ""}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Ngân hàng:</label>
              <input
                type="text"
                name="tenNganHang"
                value={employee.tenNganHang || ""}
                onChange={handleChange}
              />
            </div>

            <h3 className="form-section-title">Thông tin công việc</h3>
            <div className="form-group">
              <label>Chuyên ngành:</label>
              <input
                type="text"
                name="tenChuyenNganh"
                value={employee.tenChuyenNganh || ""}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Trình độ học vấn:</label>
              <input
                type="text"
                name="tenTrinhDoHocVan"
                value={employee.tenTrinhDoHocVan || ""}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Loại nhân viên:</label>
              <input
                type="text"
                name="loaiNhanVien"
                value={employee.loaiNhanVien || ""}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Trạng thái:</label>
              <select
                name="trangThai"
                value={employee.trangThai ? 1 : 0}
                onChange={(e) =>
                  setEmployee({
                    ...employee,
                    trangThai: e.target.value === "1",
                  })
                }
              >
                <option value={1}>Đang hoạt động</option>
                <option value={0}>Đã nghỉ việc</option>
              </select>
            </div>
            <div className="form-actions">
              <button onClick={handleSave} className="save-btn">
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
