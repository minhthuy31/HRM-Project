import React, { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { api } from "../api";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaPrint } from "react-icons/fa";
import ContractModal from "../components/modals/ContractModal";
import ContractTemplate from "../components/templates/ContractTemplate";
import "../styles/ContractPage.css";

const ContractManagementPage = () => {
  const [contracts, setContracts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // State quản lý Modal thêm/sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState(null);

  // --- STATE MỚI CHO TÍNH NĂNG IN ---
  const [printingContract, setPrintingContract] = useState(null);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/HopDong?search=${searchTerm}`);
      setContracts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [searchTerm]);

  useEffect(() => {
    const fetchEmps = async () => {
      try {
        const res = await api.get("/NhanVien?trangThai=true");
        setEmployees(res.data);
      } catch (err) {}
    };
    fetchEmps();
  }, []);

  const handleSave = async (payload, isUpdate) => {
    try {
      const config = { headers: { "Content-Type": "multipart/form-data" } };
      if (isUpdate) {
        const id = encodeURIComponent(payload.get("soHopDong"));
        await api.put(`/HopDong?id=${id}`, payload, config);
      } else {
        await api.post("/HopDong", payload, config);
      }
      alert(isUpdate ? "Cập nhật thành công!" : "Tạo mới thành công!");
      setIsModalOpen(false);
      setEditingContract(null);
      fetchContracts();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Bạn chắc chắn muốn xóa hợp đồng số ${id}?`)) return;
    try {
      const encodedId = encodeURIComponent(id);
      await api.delete(`/HopDong?id=${encodedId}`);
      alert("Đã xóa hợp đồng.");
      fetchContracts();
    } catch (err) {
      alert("Lỗi khi xóa: " + (err.response?.data?.message || err.message));
    }
  };

  // Helper format
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
    if (endDate && new Date(endDate) < new Date())
      return <span className="badge badge-gray">Hết hạn</span>;
    return <span className="badge badge-green">Hiệu lực</span>;
  };

  return (
    <DashboardLayout>
      <div className="contract-page">
        {/* --- KHU VỰC HIỂN THỊ PREVIEW (QUAN TRỌNG) --- */}
        {/* Nếu printingContract có dữ liệu -> Hiển thị Template phủ lên màn hình */}
        {printingContract && (
          <ContractTemplate
            data={printingContract}
            onClose={() => setPrintingContract(null)} // Truyền hàm đóng để tắt Preview
          />
        )}
        {/* ----------------------------------------------- */}

        <div className="page-header">
          <h1>Quản lý Hợp Đồng</h1>
          <button
            className="btn-add"
            onClick={() => {
              setEditingContract(null);
              setIsModalOpen(true);
            }}
          >
            <FaPlus /> Tạo mới
          </button>
        </div>

        <div className="toolbar">
          <div className="search-box">
            <FaSearch />
            <input
              placeholder="Tìm theo tên NV, số HĐ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <p>Đang tải...</p>
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
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((c) => (
                  <tr key={c.soHopDong}>
                    <td style={{ fontWeight: "bold" }}>{c.soHopDong}</td>
                    <td>
                      <div>{c.hoTenNhanVien}</div>
                      <small style={{ color: "#666" }}>{c.maNhanVien}</small>
                    </td>
                    <td>{c.tenPhongBan || "---"}</td>
                    <td>{c.loaiHopDong}</td>
                    <td>
                      {formatDate(c.ngayBatDau)} -{" "}
                      {c.ngayKetThuc
                        ? formatDate(c.ngayKetThuc)
                        : "Vô thời hạn"}
                    </td>
                    <td style={{ fontWeight: "500" }}>
                      {formatMoney(c.luongCoBan)}
                    </td>
                    <td>{getStatusBadge(c.trangThai, c.ngayKetThuc)}</td>
                    <td>
                      {/* NÚT IN MỚI */}
                      <button
                        className="icon-btn print"
                        onClick={() => setPrintingContract(c)} // Bấm vào đây để mở Preview
                        title="Xem trước & In hợp đồng"
                      >
                        <FaPrint />
                      </button>

                      <button
                        className="icon-btn edit"
                        onClick={() => {
                          setEditingContract(c);
                          setIsModalOpen(true);
                        }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="icon-btn delete"
                        onClick={() => handleDelete(c.soHopDong)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

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
