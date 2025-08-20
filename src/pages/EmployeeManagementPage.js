import React, { useState, useEffect, useCallback,  } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { api } from '../api';
import { FaEye, FaEdit, FaTrash, FaPlus, FaUserCircle, FaSearch } from 'react-icons/fa';
import '../styles/EmployeePage.css';
import EmployeeModal from '../components/modals/EmployeeModal';

// --- HÀM TRỢ GIÚP ---
const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('blob:')) return path;
    return `http://localhost:5260${path}`;
};

// --- COMPONENT CON: MENU CHUỘT PHẢI ---
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

// --- COMPONENT TRANG CHÍNH ---
const EmployeePage = () => {
    const [employees, setEmployees] = useState([]);
    const [phongBans, setPhongBans] = useState([]);
    const [chucVus, setChucVus] = useState([]);
    const [chuyenNganhs, setChuyenNganhs] = useState([]);
    const [trinhDoHocVans, setTrinhDoHocVans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
    const [currentEmployee, setCurrentEmployee] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedPhongBan, setSelectedPhongBan] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = useCallback(async (filterPhongBan = '', currentSearchTerm = '') => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterPhongBan) params.append('maPhongBan', filterPhongBan);
            if (currentSearchTerm) params.append('searchTerm', currentSearchTerm);
            
            const employeeUrl = `/NhanVien?${params.toString()}`;
            
            const [empRes, pbRes, cvRes, cnRes, tdRes, ] = await Promise.all([
                api.get(employeeUrl),
                api.get('/PhongBan'),
                api.get('/ChucVuNhanVien'),
                api.get('/ChuyenNganh'),
                api.get('/TrinhDoHocVan'),
            ]);
            
            setEmployees(empRes.data);
            setPhongBans(pbRes.data);
            setChucVus(cvRes.data);
            setChuyenNganhs(cnRes.data);
            setTrinhDoHocVans(tdRes.data);

        } catch (error) { 
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchData(selectedPhongBan, searchTerm);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [fetchData, selectedPhongBan, searchTerm]);
    
    const handleFilterChange = (e) => { setSelectedPhongBan(e.target.value); };
    const handleSearchChange = (e) => { setSearchTerm(e.target.value); };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchData(selectedPhongBan, searchTerm);
    };

    const handleContextMenu = (e, employee) => {
        e.preventDefault();
        setCurrentEmployee(employee);
        setContextMenu({ visible: true, x: e.pageX, y: e.pageY });
    };

    const closeContextMenu = () => setContextMenu({ visible: false, x: 0, y: 0 });
    
    const handleAdd = () => {
        setCurrentEmployee(null);
        setIsEditModalOpen(true);
    };

    const handleShowInfo = async (openEditModalAfter = false) => {
        if (!currentEmployee) return;
        try {
            const response = await api.get(`/NhanVien/${currentEmployee.maNhanVien}`);
            setCurrentEmployee(response.data);
            
            if (openEditModalAfter) {
                setIsEditModalOpen(true);
            } else {
                setIsViewModalOpen(true);
            }
        } catch (error) {
            console.error("Không thể tải chi tiết nhân viên:", error);
            alert("Không thể tải chi tiết nhân viên.");
        }
    };
    
    const handleEdit = () => {
        handleShowInfo(true);
    };

    const handleDelete = async () => {
        if (window.confirm(`Bạn có chắc muốn xóa nhân viên ${currentEmployee.hoTen}?`)) {
            try {
                await api.delete(`/NhanVien/${currentEmployee.maNhanVien}`);
                fetchData(selectedPhongBan, searchTerm);
            } catch (error) {
                alert(error.response?.data || "Lỗi khi xóa nhân viên.");
            }
        }
    };
    
    const handleSave = async (employeeData, imageFile) => {
        const dataToSave = { ...employeeData, trangThai: employeeData.trangThai.toString() === 'true' };
        try {
            if (imageFile) {
                const formData = new FormData();
                formData.append('file', imageFile);
                const uploadRes = await api.post('/NhanVien/UploadImage', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                dataToSave.hinhAnh = uploadRes.data.filePath;
            }

            if (currentEmployee) {
                await api.put(`/NhanVien/${currentEmployee.maNhanVien}`, dataToSave);
            } else {
                await api.post('/NhanVien', dataToSave);
            }
            
            setIsEditModalOpen(false);
            fetchData(selectedPhongBan, searchTerm);
        } catch (error) {
            const errorMsg = error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : (error.response?.data || "Lưu thất bại!");
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
                                    placeholder="Tìm kiếm và nhấn Enter..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                            </div>
                        </form>
                        <div className="filter-container">
                            <select id="phongban-filter" value={selectedPhongBan} onChange={handleFilterChange}>
                                <option value="">Tất cả phòng ban</option>
                                {phongBans.map(pb => (
                                    <option key={pb.maPhongBan} value={pb.maPhongBan}>{pb.tenPhongBan}</option>
                                ))}
                            </select>
                        </div>
                        <button onClick={handleAdd} className="add-btn">
                            <FaPlus /> Thêm mới
                        </button>
                    </div>
                </div>

                {loading ? <p>Đang tải...</p> : (
                    <div className="table-container">
                        <table className="employee-table">
                            <thead>
                                <tr>
                                    <th>Ảnh</th>
                                    <th>Họ tên</th>
                                    <th>Mã NV</th>
                                    <th>Chức vụ</th>
                                    <th>Phòng ban</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map(emp => (
                                    <tr key={emp.maNhanVien}>
                                        <td>
                                            {emp.hinhAnh ? (
                                                <img 
                                                    src={getImageUrl(emp.hinhAnh)} 
                                                    alt={emp.hoTen} 
                                                    className="table-avatar" 
                                                />
                                            ) : (
                                                <FaUserCircle 
                                                    size={30} 
                                                    style={{ color: 'var(--toggle-icon-color)' }} 
                                                />
                                            )}
                                        </td>
                                        <td 
                                            onContextMenu={(e) => handleContextMenu(e, emp)} 
                                            className="employee-name-cell"
                                        >
                                            {emp.hoTen}
                                        </td>
                                        <td>{emp.maNhanVien}</td>
                                        <td>{emp.tenChucVu}</td>
                                        <td>{emp.tenPhongBan}</td>
                                        <td>{emp.trangThai ? 'Hoạt động' : 'Đã nghỉ'}</td>
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
                    onShowInfo={() => { handleShowInfo(); closeContextMenu(); }}
                    onEdit={() => { handleEdit(); closeContextMenu(); }}
                    onDelete={() => { handleDelete(); closeContextMenu(); }}
                    onClose={closeContextMenu}
                />
            )}
            
            {(isViewModalOpen || isEditModalOpen) && (
                <EmployeeModal 
                    employee={currentEmployee} 
                    onCancel={() => { setIsViewModalOpen(false); setIsEditModalOpen(false); }} 
                    onSave={handleSave}
                    isViewOnly={isViewModalOpen} 
                    phongBans={phongBans} 
                    chucVus={chucVus} 
                    chuyenNganhs={chuyenNganhs}
                    trinhDoHocVans={trinhDoHocVans}

                />
            )}
        </DashboardLayout>
    );
};

export default EmployeePage;