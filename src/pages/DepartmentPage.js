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
} from "react-icons/fa";
import "../styles/DepartmentPage.css";
import DepartmentModal from "../components/modals/DepartmentModal";
import EmployeeListModal from "../components/modals/EmployeeListModal";

// Tách ContextMenu ra để dễ quản lý
const ContextMenu = ({
  x,
  y,
  department,
  onShowInfo,
  onEdit,
  onDelete,
  onViewEmployees,
  onClose,
}) => {
  useEffect(() => {
    const handleClickOutside = () => onClose();
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [onClose]);

  return (
    <div className="context-menu" style={{ top: y, left: x }}>
      <ul>
        <li onClick={() => onViewEmployees(department)}>
          <FaUsers /> Xem nhân viên
        </li>
        <li onClick={() => onShowInfo(department)}>
          <FaEye /> Xem chi tiết
        </li>
        <li onClick={() => onEdit(department)}>
          <FaEdit /> Chỉnh sửa
        </li>
        <li onClick={() => onDelete(department)}>
          <FaTrash /> Xóa
        </li>
      </ul>
    </div>
  );
};

const DepartmentPage = () => {
  const [phongBans, setPhongBans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
  });
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEmployeeListModalOpen, setIsEmployeeListModalOpen] = useState(false);

  const fetchData = useCallback(async (currentSearchTerm = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentSearchTerm) params.append("searchTerm", currentSearchTerm);
      const url = `/PhongBan?${params.toString()}`;
      const response = await api.get(url);
      setPhongBans(response.data);
    } catch (error) {
      console.error("Failed to fetch departments", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData(searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchData, searchTerm]);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData(searchTerm);
  };

  const handleContextMenu = (e, dept) => {
    e.preventDefault();
    const windowHeight = window.innerHeight;
    const menuHeight = 160; // Chiều cao ước tính của context menu
    let yPosition = e.pageY;

    if (yPosition + menuHeight > windowHeight) {
      yPosition = e.pageY - menuHeight;
    }
    setCurrentDepartment(dept); // Cập nhật phòng ban đang được chọn
    setContextMenu({ visible: true, x: e.pageX, y: yPosition });
  };

  const closeContextMenu = () => setContextMenu({ visible: false });

  // Các hàm xử lý action từ Context Menu
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

  const handleDelete = async (dept) => {
    if (window.confirm(`Bạn có chắc muốn xóa phòng ban ${dept.tenPhongBan}?`)) {
      try {
        await api.delete(`/PhongBan/${dept.maPhongBan}`);
        fetchData(searchTerm);
      } catch (error) {
        alert(error.response?.data || "Lỗi khi xóa phòng ban.");
      }
    }
  };

  const handleSave = async (deptData) => {
    try {
      if (currentDepartment) {
        // Chế độ sửa
        await api.put(`/PhongBan/${currentDepartment.maPhongBan}`, deptData);
      } else {
        // Chế độ thêm mới
        await api.post("/PhongBan", deptData);
      }
      setIsEditModalOpen(false);
      fetchData(searchTerm);
    } catch (error) {
      alert(error.response?.data || "Lưu thất bại!");
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
                </tr>
              </thead>
              <tbody>
                {phongBans.map((dept) => (
                  <tr key={dept.maPhongBan}>
                    <td>{dept.maPhongBan}</td>
                    <td
                      onContextMenu={(e) => handleContextMenu(e, dept)}
                      className="department-name-cell"
                    >
                      {dept.tenPhongBan}
                    </td>
                    <td>{dept.diaChi}</td>
                    <td>{dept.sdt_PhongBan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          department={currentDepartment}
          onClose={closeContextMenu}
          onShowInfo={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewEmployees={handleViewEmployees}
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
