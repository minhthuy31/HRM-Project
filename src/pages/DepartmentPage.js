import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { api } from "../api";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaUsers,
  FaEllipsisV,
  FaUndo,
} from "react-icons/fa";
import "../styles/DepartmentPage.css";
import "../styles/EmployeePage.css";
import DepartmentModal from "../components/modals/DepartmentModal";
import EmployeeListModal from "../components/modals/EmployeeListModal";

// --- Component ContextMenu riêng cho Phòng ban ---
const DepartmentContextMenu = ({ department, onAction, onClose, x, y }) => {
  useEffect(() => {
    const handleClickOutside = () => onClose();
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [onClose]);

  return (
    <div className="context-menu" style={{ top: y, left: x }}>
      <ul>
        <li onClick={() => onAction("viewEmployees", department)}>
          <FaUsers /> Xem nhân viên
        </li>
        <li onClick={() => onAction("viewDetails", department)}>
          <FaEye /> Xem chi tiết
        </li>
        <li onClick={() => onAction("edit", department)}>
          <FaEdit /> Chỉnh sửa
        </li>
        {department.trangThai ? (
          <li onClick={() => onAction("disable", department)}>
            <FaTrash /> Vô hiệu hóa
          </li>
        ) : (
          <li onClick={() => onAction("activate", department)}>
            <FaUndo /> Kích hoạt
          </li>
        )}
      </ul>
    </div>
  );
};

const DepartmentPage = () => {
  const [phongBans, setPhongBans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTrangThai, setFilterTrangThai] = useState("true");
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEmployeeListModalOpen, setIsEmployeeListModalOpen] = useState(false);

  const [activeMenu, setActiveMenu] = useState({ id: null, x: 0, y: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("searchTerm", searchTerm);
      if (filterTrangThai !== "") params.append("trangThai", filterTrangThai);

      const url = `/PhongBan?${params.toString()}`;
      const response = await api.get(url);
      setPhongBans(response.data);
    } catch (error) {
      console.error("Failed to fetch departments", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterTrangThai]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchData]);

  const handleToggleMenu = (e, department) => {
    e.preventDefault();
    e.stopPropagation();
    const menuWidth = 200;
    const menuHeight = 170; // Chiều cao ước tính của menu
    let x = e.clientX;
    let y = e.clientY;

    if (x + menuWidth > window.innerWidth)
      x = window.innerWidth - menuWidth - 10;
    if (y + menuHeight > window.innerHeight)
      y = window.innerHeight - menuHeight - 10;

    setActiveMenu({ id: department.maPhongBan, x, y });
  };

  const handleAction = (actionType, dept) => {
    setActiveMenu({ id: null, x: 0, y: 0 }); // Đóng menu

    switch (actionType) {
      case "viewEmployees":
        handleViewEmployees(dept);
        break;
      case "viewDetails":
        handleViewDetails(dept);
        break;
      case "edit":
        handleEdit(dept);
        break;
      case "disable":
        handleDisable(dept);
        break;
      case "activate":
        handleActivate(dept);
        break;
      default:
        break;
    }
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };
  const handleAdd = () => {
    setCurrentDepartment(null);
    setIsEditModalOpen(true);
  };
  const handleViewDetails = (dept) => {
    setCurrentDepartment(dept);
    setIsViewModalOpen(true);
  };
  const handleEdit = (dept) => {
    setCurrentDepartment(dept);
    setIsEditModalOpen(true);
  };
  const handleViewEmployees = (dept) => {
    setCurrentDepartment(dept);
    setIsEmployeeListModalOpen(true);
  };

  const handleDisable = async (dept) => {
    if (
      window.confirm(
        `Bạn có chắc muốn vô hiệu hóa phòng ban ${dept.tenPhongBan}?`
      )
    ) {
      try {
        await api.post(`/PhongBan/${dept.maPhongBan}/disable`);
        fetchData();
      } catch (error) {
        alert(
          error.response?.data?.message || "Lỗi khi vô hiệu hóa phòng ban."
        );
      }
    }
  };

  const handleActivate = async (dept) => {
    if (
      window.confirm(
        `Bạn có chắc muốn kích hoạt lại phòng ban ${dept.tenPhongBan}?`
      )
    ) {
      try {
        await api.post(`/PhongBan/${dept.maPhongBan}/activate`);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.message || "Lỗi khi kích hoạt lại.");
      }
    }
  };

  const handleSave = async (deptData) => {
    try {
      const dataToSave = {
        ...deptData,
        trangThai: deptData.trangThai === "true" || deptData.trangThai === true,
      };
      if (currentDepartment) {
        await api.put(`/PhongBan/${currentDepartment.maPhongBan}`, dataToSave);
      } else {
        await api.post("/PhongBan", dataToSave);
      }
      setIsEditModalOpen(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Lưu thất bại!");
    }
  };

  return (
    <DashboardLayout>
      <div className="department-page">
        <div className="page-header">
          <h1>Quản lý Phòng ban</h1>
          <div className="header-right-panel">
            <form onSubmit={handleSearchSubmit}>
              <div className="search-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, mã..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </form>

            <div className="filter-container">
              <select
                value={filterTrangThai}
                onChange={(e) => setFilterTrangThai(e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="true">Hoạt động</option>
                <option value="false">Vô hiệu hóa</option>
              </select>
            </div>

            <button onClick={handleAdd} className="add-btn">
              <FaPlus /> Thêm mới
            </button>
          </div>
        </div>

        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="table-container">
            <table className="department-table">
              <thead>
                <tr>
                  <th>Mã phòng ban</th>
                  <th>Tên phòng ban</th>
                  <th>Địa chỉ</th>
                  <th>Số điện thoại</th>
                  <th>Trạng thái</th>
                  <th style={{ width: "60px" }}></th>
                </tr>
              </thead>
              <tbody>
                {phongBans.map((dept) => (
                  <tr key={dept.maPhongBan}>
                    <td>{dept.maPhongBan}</td>
                    <td
                      className="employee-name-cell"
                      onContextMenu={(e) => handleToggleMenu(e, dept)}
                    >
                      {dept.tenPhongBan}
                    </td>
                    <td>{dept.diaChi}</td>
                    <td>{dept.sdt_PhongBan}</td>
                    <td style={{ color: dept.trangThai ? "green" : "red" }}>
                      {dept.trangThai ? "Hoạt động" : "Vô hiệu hóa"}
                    </td>
                    <td className="actions-cell">
                      <button
                        className="action-btn"
                        onClick={(e) => handleToggleMenu(e, dept)}
                      >
                        <FaEllipsisV />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {activeMenu.id && (
        <DepartmentContextMenu
          department={phongBans.find((d) => d.maPhongBan === activeMenu.id)}
          onAction={handleAction}
          onClose={() => setActiveMenu({ id: null, x: 0, y: 0 })}
          x={activeMenu.x}
          y={activeMenu.y}
        />
      )}

      {isEditModalOpen && (
        <DepartmentModal
          department={currentDepartment}
          onCancel={() => setIsEditModalOpen(false)}
          onSave={handleSave}
        />
      )}
      {isViewModalOpen && (
        <DepartmentModal
          department={currentDepartment}
          onCancel={() => setIsViewModalOpen(false)}
          isViewOnly={true}
        />
      )}
      {isEmployeeListModalOpen && (
        <EmployeeListModal
          phongBan={currentDepartment}
          onCancel={() => setIsEmployeeListModalOpen(false)}
        />
      )}
    </DashboardLayout>
  );
};

export default DepartmentPage;
