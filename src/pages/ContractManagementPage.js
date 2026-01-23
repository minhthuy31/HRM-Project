import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { api } from "../api";
import { getUserFromToken } from "../utils/auth";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaPrint,
  FaFilter,
  FaFileContract,
} from "react-icons/fa";
import ContractModal from "../components/modals/ContractModal";
import ContractTemplate from "../components/templates/ContractTemplate";
import "../styles/ContractPage.css";

const ContractManagementPage = () => {
  const [contracts, setContracts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // State bộ lọc & tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("HieuLuc"); // Mặc định hiện cái còn hiệu lực

  // State Modal & Preview
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [printingContract, setPrintingContract] = useState(null);

  // --- PHÂN QUYỀN ---
  const user = getUserFromToken();
  const userRole = user?.role || user?.Role || "";

  // Chỉ Giám đốc và HR mới được Thêm/Sửa
  const canModify = ["Giám đốc", "Tổng giám đốc", "Nhân sự trưởng"].includes(
    userRole,
  );

  // --- HÀM TẢI DỮ LIỆU ---
  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      // Gọi API kèm tham số search và trangThai
      const res = await api.get(
        `/HopDong?search=${searchTerm}&trangThai=${statusFilter}`,
      );
      setContracts(res.data);
    } catch (err) {
      console.error("Lỗi tải hợp đồng:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  // Load lại khi filter thay đổi
  useEffect(() => {
    // Debounce search để tránh gọi API liên tục
    const timer = setTimeout(() => fetchContracts(), 500);
    return () => clearTimeout(timer);
  }, [fetchContracts]);

  // Load danh sách nhân viên (để dùng trong Modal)
  useEffect(() => {
    if (canModify) {
      const fetchEmps = async () => {
        try {
          const res = await api.get("/NhanVien?trangThai=true");
          setEmployees(res.data);
        } catch (err) {}
      };
      fetchEmps();
    }
  }, [canModify]);

  // --- XỬ LÝ LƯU (THÊM / SỬA) ---
  const handleSave = async (payload, isUpdate) => {
    try {
      const config = { headers: { "Content-Type": "multipart/form-data" } };
      if (isUpdate) {
        const id = encodeURIComponent(payload.get("soHopDong")); // Encode nếu số HĐ có ký tự đặc biệt
        await api.put(`/HopDong?id=${id}`, payload, config);
      } else {
        await api.post("/HopDong", payload, config);
      }

      alert(isUpdate ? "Cập nhật thành công!" : "Tạo hợp đồng mới thành công!");
      setIsModalOpen(false);
      setEditingContract(null);
      fetchContracts(); // Reload lại bảng
    } catch (err) {
      const msg = err.response?.data?.message || "Có lỗi xảy ra.";
      alert("Lỗi: " + msg);
    }
  };

  // --- HELPER FORMAT ---
  const formatMoney = (val) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("vi-VN") : "---";

  const getStatusBadge = (status, endDate) => {
    if (status === "DaChamDut")
      return <span className="badge badge-red">Đã chấm dứt</span>;
    if (status === "HetHan")
      return <span className="badge badge-gray">Hết hạn</span>;

    // Logic phụ: Nếu trạng thái là Hiệu lực nhưng ngày hiện tại > ngày kết thúc -> Cảnh báo
    if (endDate && new Date(endDate) < new Date()) {
      return <span className="badge badge-warning">Quá hạn (Cần gia hạn)</span>;
    }
    return <span className="badge badge-green">Đang hiệu lực</span>;
  };

  return (
    <DashboardLayout>
      <div className="contract-page">
        {/* Modal Preview In */}
        {printingContract && (
          <ContractTemplate
            data={printingContract}
            onClose={() => setPrintingContract(null)}
          />
        )}

        <div className="page-header">
          <div className="header-title">
            <h1>
              <FaFileContract /> Quản lý Hợp Đồng
            </h1>
          </div>

          {/* Nút Tạo Mới (Chỉ hiện cho HR/Giám đốc) */}
          {canModify && (
            <button
              className="btn-add"
              onClick={() => {
                setEditingContract(null);
                setIsModalOpen(true);
              }}
            >
              <FaPlus /> Tạo mới
            </button>
          )}
        </div>

        {/* --- THANH CÔNG CỤ (SEARCH & FILTER) --- */}
        <div className="toolbar">
          <div className="search-box">
            <FaSearch />
            <input
              placeholder="Tìm theo tên NV, số HĐ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-box">
            <FaFilter className="filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-select"
            >
              <option value="HieuLuc">Đang hiệu lực</option>
              <option value="HetHan">Đã hết hạn</option>
              <option value="DaChamDut">Đã chấm dứt</option>
              <option value="All">Tất cả</option>
            </select>
          </div>
        </div>

        {/* --- BẢNG DỮ LIỆU --- */}
        <div className="table-container">
          {loading ? (
            <div className="loading-state">Đang tải dữ liệu...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Số HĐ</th>
                  <th>Nhân viên</th>
                  <th>Phòng ban</th>
                  <th>Loại HĐ</th>
                  <th>Thời hạn</th>
                  <th>Lương ký</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: "center" }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {contracts.length > 0 ? (
                  contracts.map((c) => (
                    <tr key={c.soHopDong}>
                      <td style={{ fontWeight: "bold", color: "#333" }}>
                        {c.soHopDong}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{c.hoTenNhanVien}</div>
                        <small style={{ color: "#888" }}>{c.maNhanVien}</small>
                      </td>
                      <td>{c.tenPhongBan || "---"}</td>
                      <td>{c.loaiHopDong}</td>
                      <td>
                        {formatDate(c.ngayBatDau)} -{" "}
                        {c.ngayKetThuc
                          ? formatDate(c.ngayKetThuc)
                          : "Vô thời hạn"}
                      </td>
                      <td style={{ fontWeight: "bold", color: "#10b981" }}>
                        {formatMoney(c.luongCoBan)}
                      </td>
                      <td>{getStatusBadge(c.trangThai, c.ngayKetThuc)}</td>

                      <td style={{ textAlign: "center" }}>
                        <div className="action-group">
                          {/* Nút In (Ai cũng thấy nếu được vào trang này) */}
                          <button
                            className="icon-btn print"
                            onClick={() => setPrintingContract(c)}
                            title="Xem & In"
                          >
                            <FaPrint />
                          </button>

                          {/* Nút Sửa (Chỉ HR/Giám đốc thấy) */}
                          {canModify && (
                            <button
                              className="icon-btn edit"
                              onClick={() => {
                                setEditingContract(c);
                                setIsModalOpen(true);
                              }}
                              title="Chỉnh sửa / Chấm dứt / Gia hạn"
                            >
                              <FaEdit />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-data">
                      Không tìm thấy hợp đồng phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Thêm/Sửa */}
        {isModalOpen && (
          <ContractModal
            contract={editingContract}
            employees={employees}
            onSave={handleSave}
            onCancel={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ContractManagementPage;
