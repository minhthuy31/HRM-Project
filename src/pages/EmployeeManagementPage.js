import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { api } from "../api";
// import { getUserFromToken } from "../utils/auth";
// import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaUserCircle,
  FaSearch,
  FaEllipsisV,
  FaDownload,
} from "react-icons/fa";
import "../styles/EmployeePage.css";
import EmployeeModal from "../components/modals/EmployeeModal";
import * as XLSX from "xlsx";

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
  // const navigate = useNavigate();
  // const currentUser = getUserFromToken();

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

  // useEffect(() => {
  //   if (currentUser) {
  //     //check role
  //     if (currentUser.role === "Nhân viên") {
  //       //gọi đến api
  //       navigate(`/nhan-vien/${currentUser.maNhanVien}`);
  //     }
  //   } else {
  //     navigate("/login");
  //   }
  // }, [currentUser, navigate]);

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
  // // check role nhân viên để hiện
  // if (currentUser && currentUser.role === "Nhân viên") {
  //   return (
  //     <DashboardLayout>
  //       <p>Đang tải hồ sơ của bạn...</p>
  //     </DashboardLayout>
  //   );
  // }
  const handleExportExcel = () => {
    if (employees.length === 0) {
      alert("Không có dữ liệu nhân viên để xuất.");
      return;
    }
    const dataToExport = employees.map((emp) => {
      return {
        "Mã NV": emp.maNhanVien,
        "Họ Tên": emp.hoTen,
        Email: emp.email,
        "Phòng Ban": emp.tenPhongBan,
        "Chức Vụ": emp.tenChucVu,
        "Trạng Thái": emp.trangThai ? "Hoạt động" : "Đã nghỉ",
        SĐT: emp.sdt_NhanVien,
        CCCD: emp.cccd,
        "Ngày Sinh": emp.ngaySinh
          ? new Date(emp.ngaySinh).toLocaleDateString("vi-VN")
          : "",
        "Trình Độ": emp.tenTrinhDoHocVan,
        "Chuyên Ngành": emp.tenChuyenNganh,
      };
    });

    // 2. Tạo một worksheet (trang tính) từ mảng JSON
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const cols = [
      { wch: 10 }, // Mã NV
      { wch: 25 }, // Họ Tên
      { wch: 30 }, // Email
      { wch: 20 }, // Phòng Ban
      { wch: 20 }, // Chức Vụ
      { wch: 15 }, // Trạng Thái
      { wch: 15 }, // SĐT
      { wch: 15 }, // CCCD
      { wch: 15 }, // Ngày Sinh
      { wch: 20 }, // Trình Độ
      { wch: 20 }, // Chuyên Ngành
    ];
    ws["!cols"] = cols;
    // 3. Tạo một workbook (file Excel) mới
    const wb = XLSX.utils.book_new();

    // 4. Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(wb, ws, "DanhSachNhanVien");
    // 5. Tạo file và kích hoạt tải về
    const fileName = `DanhSachNhanVien_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    XLSX.writeFile(wb, fileName);
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
                onChange={handleFilterChange}
              >
                <option value="">Tất cả phòng ban</option>
                {phongBans.map((pb) => (
                  <option key={pb.maPhongBan} value={pb.maPhongBan}>
                    {pb.tenPhongBan}
                  </option>
                ))}
              </select>
            </div>

            {/* Lọc theo chức vụ */}
            <div className="filter-container">
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

            {/* Lọc theo trạng thái */}
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

            {/* Lọc theo trình độ học vấn */}
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
              onClick={handleExportExcel}
              className="add-btn"
              style={{ marginRight: "10px", backgroundColor: "#1D6F42" }} // Màu xanh lá
            >
              <FaDownload /> Xuất Excel
            </button>
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
                    <td
                      style={{
                        color: emp.trangThai ? "green" : "red",
                      }}
                    >
                      {emp.trangThai ? "Hoạt động" : "Đã nghỉ"}
                    </td>
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
