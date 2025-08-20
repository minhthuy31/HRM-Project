import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { api } from '../api';
import { FaEye, FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import '../styles/DepartmentPage.css';
import DepartmentModal from '../components/modals/DepartmentModal';

const ContextMenu = ({ x, y, onShowInfo, onEdit, onDelete, onClose }) => { 
  useEffect(() => {
          const handleClickOutside = () => onClose();
          document.addEventListener('click', handleClickOutside);
          return () => document.removeEventListener('click', handleClickOutside);
      }, [onClose]);
  
      return (
          <div className="context-menu" style={{ top: y, left: x }}>
              <ul>
                  <li onClick={onShowInfo}><FaEye /> Xem chi tiết</li>
                  <li onClick={onEdit}><FaEdit /> Chỉnh sửa</li>
                  <li onClick={onDelete}><FaTrash /> Xóa</li>
              </ul>
          </div>
      );
 };

const DepartmentPage = () => {
    const [phongBans, setPhongBans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
    const [currentDepartment, setCurrentDepartment] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const fetchData = useCallback(async (currentSearchTerm = '') => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (currentSearchTerm) params.append('searchTerm', currentSearchTerm);
            const url = `/PhongBan?${params.toString()}`;
            const response = await api.get(url);
            setPhongBans(response.data);
        } catch (error) { console.error("Failed to fetch departments", error); }
        setLoading(false);
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchData(searchTerm);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [fetchData, searchTerm]);

    const handleSearchChange = (e) => setSearchTerm(e.target.value);
    const handleSearchSubmit = (e) => { e.preventDefault(); fetchData(searchTerm); };
    const handleContextMenu = (e, dept) => { e.preventDefault(); setCurrentDepartment(dept); setContextMenu({ visible: true, x: e.pageX, y: e.pageY }); };
    const closeContextMenu = () => setContextMenu({ visible: false, x: 0, y: 0 });
    const handleAdd = () => { setCurrentDepartment(null); setIsEditModalOpen(true); };
    const handleShowInfo = () => setIsViewModalOpen(true);
    const handleEdit = () => setIsEditModalOpen(true);
    
    const handleDelete = async () => {
        if (window.confirm(`Bạn có chắc muốn xóa phòng ban ${currentDepartment.tenPhongBan}?`)) {
            try {
                await api.delete(`/PhongBan/${currentDepartment.maPhongBan}`);
                fetchData(searchTerm);
            } catch (error) { alert(error.response?.data || "Lỗi khi xóa phòng ban."); }
        }
    };
    
    const handleSave = async (deptData) => {
        try {
            if (currentDepartment) {
                await api.put(`/PhongBan/${currentDepartment.maPhongBan}`, deptData);
            } else {
                await api.post('/PhongBan', deptData);
            }
            setIsEditModalOpen(false);
            fetchData(searchTerm);
        } catch (error) { alert(error.response?.data || "Lưu thất bại!"); }
    };

    return (
        <DashboardLayout>
            <div className="department-page">
                <div className="page-header">
                    <h1>Quản lý Phòng ban</h1>
                    <div className="header-right-panel">
                        <form onSubmit={handleSearchSubmit}><div className="search-container"><FaSearch className="search-icon" /><input type="text" placeholder="Tìm theo tên, mã..." value={searchTerm} onChange={handleSearchChange}/></div></form>
                        <button onClick={handleAdd} className="add-btn"><FaPlus /> Thêm mới</button>
                    </div>
                </div>

                {loading ? <p>Đang tải...</p> : (
                  <div className="department-table-container">
                    <table className="department-table">
                        <thead><tr><th>Mã phòng ban</th><th>Tên phòng ban</th><th>Địa chỉ</th><th>Số điện thoại</th></tr></thead>
                        <tbody>
                            {phongBans.map(dept => (
                                <tr key={dept.maPhongBan}>
                                    <td>{dept.maPhongBan}</td>
                                    <td onContextMenu={(e) => handleContextMenu(e, dept)} className="department-name-cell">{dept.tenPhongBan}</td>
                                    <td>{dept.diaChi}</td>
                                    <td>{dept.sdt_PhongBan}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                )}
            </div>
            {contextMenu.visible && <ContextMenu x={contextMenu.x} y={contextMenu.y} onShowInfo={() => { handleShowInfo(); closeContextMenu(); }} onEdit={() => { handleEdit(); closeContextMenu(); }} onDelete={() => { handleDelete(); closeContextMenu(); }} onClose={closeContextMenu} />}
            {(isViewModalOpen || isEditModalOpen) && <DepartmentModal department={currentDepartment} onCancel={() => { setIsViewModalOpen(false); setIsEditModalOpen(false); }} onSave={handleSave} isViewOnly={isViewModalOpen} />}
        </DashboardLayout>
    );
};

export default DepartmentPage;