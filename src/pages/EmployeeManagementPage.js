import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { api } from "../api";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaUserCircle,
  FaSearch,
  FaEllipsisV,
} from "react-icons/fa";
import "../styles/EmployeePage.css";
import EmployeeModal from "../components/modals/EmployeeModal";

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("blob:")) return path;
  return `http://localhost:5260${path}`;
};

// --- ContextMenu ---
const ContextMenu = ({ employee, onAction, onClose, x, y }) => {
  useEffect(() => {
    const handleClickOutside = () => onClose();
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [onClose]);

  return (
    <div className="context-menu" style={{ top: y, left: x }}>
      <ul>
        <li onClick={() => onAction("view", employee)}>
          <FaEye /> Xem chi tiết
        </li>
        <li onClick={() => onAction("edit", employee)}>
          <FaEdit /> Chỉnh sửa
        </li>
        <li onClick={() => onAction("delete", employee)}>
          <FaTrash /> Vô hiệu hóa
        </li>
      </ul>
      <hr />
      <ul>
        <li onClick={() => onAction("view-external", employee)}>
          <FaEye /> Xem chi tiết ngoài
        </li>
        <li onClick={() => onAction("edit-external", employee)}>
          <FaEdit /> Chỉnh sửa ngoài
        </li>
      </ul>
    </div>
  );
};

// --- COMPONENT TRANG CHÍNH ---
const EmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [phongBans, setPhongBans] = useState([]);
  const [chucVus, setChucVus] = useState([]);
  const [chuyenNganhs, setChuyenNganhs] = useState([]);
  const [trinhDoHocVans, setTrinhDoHocVans] = useState([]);
  const [hopDongs, setHopDongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeMenu, setActiveMenu] = useState({
    id: null,
    x: 0,
    y: 0,
  });

  const [modal, setModal] = useState({ type: null, data: null });

  const [filters, setFilters] = useState({
    selectedPhongBan: "",
    searchTerm: "",
    selectedChucVu: "",
    selectedTrangThai: "",
    selectedTrinhDo: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.selectedPhongBan)
        params.append("maPhongBan", filters.selectedPhongBan);
      if (filters.selectedChucVu)
        params.append("maChucVuNV", filters.selectedChucVu);
      if (filters.selectedTrangThai !== "")
        params.append("trangthai", filters.selectedTrangThai);
      if (filters.selectedTrinhDo)
        params.append("maTrinhDoHocVan", filters.selectedTrinhDo);
      if (filters.searchTerm) params.append("searchTerm", filters.searchTerm);
      const employeeUrl = `/NhanVien?${params.toString()}`;

      const [empRes, pbRes, cvRes, cnRes, tdRes, hdRes] = await Promise.all([
        api.get(employeeUrl),
        api.get("/PhongBan"),
        api.get("/ChucVuNhanVien"),
        api.get("/ChuyenNganh"),
        api.get("/TrinhDoHocVan"),
        api.get("/HopDong"),
      ]);

      setEmployees(empRes.data);
      setPhongBans(pbRes.data);
      setChucVus(cvRes.data);
      setChuyenNganhs(cnRes.data);
      setTrinhDoHocVans(tdRes.data);
      setHopDongs(hdRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => fetchData(), 500);
    return () => clearTimeout(timer);
  }, [fetchData]);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenu({ id: null, x: 0, y: 0 });
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  //hàm chung xử lý lọc
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleSearchChange = (e) =>
    setFilters((f) => ({ ...f, searchTerm: e.target.value }));
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleToggleMenu = (e, employee) => {
    e.preventDefault();
    e.stopPropagation();

    const menuWidth = 200;
    const menuHeight = 200;

    let x = e.clientX;
    let y = e.clientY;

    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10;
    }
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 10;
    }

    setActiveMenu({ id: employee.maNhanVien, x, y });
  };

  const handleAction = async (actionType, employee) => {
    setActiveMenu({ id: null, x: 0, y: 0 });

    if (actionType === "view") {
      try {
        const response = await api.get(`/NhanVien/${employee.maNhanVien}`);
        setModal({ type: "view", data: response.data });
      } catch (error) {
        alert("Không thể tải dữ liệu để xem.");
      }
      return;
    }

    if (actionType === "edit") {
      try {
        const response = await api.get(`/NhanVien/${employee.maNhanVien}`);
        setModal({ type: "edit", data: response.data });
      } catch (error) {
        alert("Không thể tải dữ liệu để sửa.");
      }
      return;
    }

    if (actionType === "delete") {
      if (
        window.confirm(
          `Bạn có chắc muốn vô hiệu hóa nhân viên ${employee.hoTen}?`
        )
      ) {
        try {
          await api.delete(`/NhanVien/${employee.maNhanVien}`);
          fetchData();
        } catch (error) {
          alert(error.response?.data || "Lỗi khi vô hiệu hóa.");
        }
      }
      return;
    }

    if (actionType === "view-external") {
      window.open(`/nhan-vien/${employee.maNhanVien}`, "_blank");
      return;
    }

    if (actionType === "edit-external") {
      window.open(`/nhan-vien/${employee.maNhanVien}/edit`, "_blank");
      return;
    }
  };

  const handleSave = async (employeeData, imageFile) => {
    const dataToSave = {
      ...employeeData,
      trangThai: employeeData.trangThai.toString() === "true",
    };
    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadRes = await api.post("/NhanVien/UploadImage", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        dataToSave.hinhAnh = uploadRes.data.filePath;
      }
      if (modal.data) {
        await api.put(`/NhanVien/${modal.data.maNhanVien}`, dataToSave);
      } else {
        await api.post("/NhanVien", dataToSave);
      }
      setModal({ type: null, data: null });
      fetchData();
    } catch (error) {
      const errorMsg = error.response?.data?.errors
        ? JSON.stringify(error.response.data.errors)
        : error.response?.data || "Lưu thất bại!";
      alert(errorMsg);
    }
  };

  return (
    <DashboardLayout>
      <div className="employee-page">
        <div className="page-header">
          <h1>Quản lý nhân viên</h1>
          <div className="header-right-panel">
            <form onSubmit={handleSearchSubmit}>
              <div className="search-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={filters.searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </form>
            <div className="filter-container">
              <select
                name="selectedPhongBan"
                value={filters.selectedPhongBan}
                onChange={handleFilterChange} // <-- Dùng hàm chung
              >
                <option value="">Tất cả phòng ban</option>
                {phongBans.map((pb) => (
                  <option key={pb.maPhongBan} value={pb.maPhongBan}>
                    {pb.tenPhongBan}
                  </option>
                ))}
              </select>
            </div>

            {/* THÊM MỚI BỘ LỌC CHỨC VỤ */}
            <div>
              <select
                name="selectedChucVu"
                value={filters.selectedChucVu}
                onChange={handleFilterChange}
              >
                <option value="">Tất cả chức vụ</option>
                {chucVus.map((cv) => (
                  <option key={cv.maChucVuNV} value={cv.maChucVuNV}>
                    {cv.tenChucVu}
                  </option>
                ))}
              </select>
            </div>

            {/* THÊM MỚI BỘ LỌC TRẠNG THÁI */}
            <div className="filter-container">
              <select
                name="selectedTrangThai"
                value={filters.selectedTrangThai}
                onChange={handleFilterChange}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="true">Hoạt động</option>
                <option value="false">Đã nghỉ</option>
              </select>
            </div>

            {/* THÊM MỚI BỘ LỌC TRÌNH ĐỘ HỌC VẤN */}
            <div className="filter-container">
              <select
                name="selectedTrinhDo"
                value={filters.selectedTrinhDo}
                onChange={handleFilterChange}
              >
                <option value="">Tất cả trình độ</option>
                {trinhDoHocVans.map((td) => (
                  <option key={td.maTrinhDoHocVan} value={td.maTrinhDoHocVan}>
                    {td.tenTrinhDo}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setModal({ type: "edit", data: null })}
              className="add-btn"
            >
              <FaPlus /> Thêm mới
            </button>
          </div>
        </div>
        <div className="table-container">
          {loading ? (
            <p>Đang tải...</p>
          ) : (
            <table className="employee-table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Họ tên</th>
                  <th>Mã NV</th>
                  <th>Chức vụ</th>
                  <th>Phòng ban</th>
                  <th>Trạng thái</th>
                  <th style={{ width: "60px" }}></th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.maNhanVien}>
                    <td>
                      {emp.hinhAnh ? (
                        <img
                          src={getImageUrl(emp.hinhAnh)}
                          alt={emp.hoTen}
                          className="table-avatar"
                        />
                      ) : (
                        <FaUserCircle size={30} />
                      )}
                    </td>
                    <td
                      onContextMenu={(e) => handleToggleMenu(e, emp)}
                      className="employee-name-cell"
                    >
                      {emp.hoTen}
                    </td>
                    <td>{emp.maNhanVien}</td>
                    <td>{emp.tenChucVu}</td>
                    <td>{emp.tenPhongBan}</td>
                    <td>{emp.trangThai ? "Hoạt động" : "Đã nghỉ"}</td>
                    <td className="actions-cell">
                      <button
                        className="action-btn"
                        onClick={(e) => handleToggleMenu(e, emp)}
                      >
                        <FaEllipsisV />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {activeMenu.id && (
        <ContextMenu
          employee={employees.find((e) => e.maNhanVien === activeMenu.id)}
          onAction={handleAction}
          onClose={() => setActiveMenu({ id: null, x: 0, y: 0 })}
          x={activeMenu.x}
          y={activeMenu.y}
        />
      )}

      {modal.type && (
        <EmployeeModal
          employee={modal.data}
          onCancel={() => setModal({ type: null, data: null })}
          onSave={handleSave}
          isViewOnly={modal.type === "view"}
          phongBans={phongBans}
          chucVus={chucVus}
          chuyenNganhs={chuyenNganhs}
          trinhDoHocVans={trinhDoHocVans}
          hopDongs={hopDongs}
        />
      )}
    </DashboardLayout>
  );
};

export default EmployeePage;
