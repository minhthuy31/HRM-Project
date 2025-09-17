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
import DepartmentModal from "../components/modals/DepartmentModal";
import EmployeeListModal from "../components/modals/EmployeeListModal";

const DepartmentPage = () => {
  const [phongBans, setPhongBans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [filterTrangThai, setFilterTrangThai] = useState("true");

  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEmployeeListModalOpen, setIsEmployeeListModalOpen] = useState(false);
  const [activeContextMenu, setActiveContextMenu] = useState(null);

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

  const handleToggleContextMenu = (e, department) => {
    e.stopPropagation();
    setActiveContextMenu((prev) =>
      prev === department.maPhongBan ? null : department.maPhongBan
    );
  };

  useEffect(() => {
    const handleClickOutside = () => setActiveContextMenu(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

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

        // THAY ĐỔI Ở ĐÂY: Cập nhật state trực tiếp thay vì gọi fetchData()
        setPhongBans((prevPhongBans) =>
          prevPhongBans.map(
            (pb) =>
              pb.maPhongBan === dept.maPhongBan
                ? { ...pb, trangThai: false } // Tìm đúng phòng ban và đổi trạng thái
                : pb // Giữ nguyên các phòng ban khác
          )
        );
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

        setPhongBans((prevPhongBans) =>
          prevPhongBans.map((pb) =>
            pb.maPhongBan === dept.maPhongBan ? { ...pb, trangThai: true } : pb
          )
        );
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
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {phongBans.map((dept) => (
                  <tr key={dept.maPhongBan}>
                    <td>{dept.maPhongBan}</td>
                    <td>{dept.tenPhongBan}</td>
                    <td>{dept.diaChi}</td>
                    <td>{dept.sdt_PhongBan}</td>
                    <td style={{ color: dept.trangThai ? "green" : "red" }}>
                      {dept.trangThai ? "Hoạt động" : "Vô hiệu hóa"}
                    </td>
                    <td className="actions-cell">
                      <button
                        className="action-btn"
                        onClick={(e) => handleToggleContextMenu(e, dept)}
                      >
                        <FaEllipsisV />
                      </button>
                      {activeContextMenu === dept.maPhongBan && (
                        <div className="context-menu in-table">
                          <ul>
                            <li onClick={() => handleViewEmployees(dept)}>
                              <FaUsers /> Xem nhân viên
                            </li>
                            <li onClick={() => handleViewDetails(dept)}>
                              <FaEye /> Xem chi tiết
                            </li>
                            <li onClick={() => handleEdit(dept)}>
                              <FaEdit /> Chỉnh sửa
                            </li>
                            {dept.trangThai ? (
                              <li onClick={() => handleDisable(dept)}>
                                <FaTrash /> Vô hiệu hóa
                              </li>
                            ) : (
                              <li onClick={() => handleActivate(dept)}>
                                <FaUndo /> Kích hoạt
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
