import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { api } from "../api";
import "../styles/LeaveManagementPage.css";

const LeaveManagementPage = () => {
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("Chờ duyệt");

  const fetchAllRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/DonNghiPhep");
      setAllRequests(response.data);
    } catch (err) {
      console.error("Lỗi tải danh sách đơn từ:", err);
      setError("Không thể tải danh sách đơn từ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const handleApprove = async (request) => {
    try {
      await api.put(`/DonNghiPhep/${request.id}/approve`);
      alert("Đã duyệt đơn thành công!");
      fetchAllRequests();
    } catch (err) {
      alert("Đã có lỗi xảy ra khi duyệt đơn.");
      console.error("Lỗi duyệt đơn:", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/DonNghiPhep/${id}/reject`);
      alert("Đã từ chối đơn.");
      fetchAllRequests();
    } catch (err) {
      alert("Đã có lỗi xảy ra khi từ chối đơn.");
      console.error("Lỗi từ chối đơn:", err);
    }
  };

  const filteredRequests = useMemo(() => {
    if (filter === "Tất cả") {
      return allRequests;
    }
    return allRequests.filter((req) => req.trangThai === filter);
  }, [allRequests, filter]);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("vi-VN");

  const StatusBadge = ({ status }) => {
    const statusMap = {
      "Chờ duyệt": "pending",
      "Đã duyệt": "approved",
      "Từ chối": "rejected",
    };
    const statusClass = `status-badge ${statusMap[status] || "default"}`;
    return <span className={statusClass}>{status}</span>;
  };

  return (
    <DashboardLayout>
      <div className="leave-management-container">
        <h1>Quản lý Đơn Xin Nghỉ Phép</h1>

        <div className="filter-buttons">
          <button
            onClick={() => setFilter("Chờ duyệt")}
            className={filter === "Chờ duyệt" ? "active" : ""}
          >
            Chờ duyệt
          </button>
          <button
            onClick={() => setFilter("Đã duyệt")}
            className={filter === "Đã duyệt" ? "active" : ""}
          >
            Đã duyệt
          </button>
          <button
            onClick={() => setFilter("Từ chối")}
            className={filter === "Từ chối" ? "active" : ""}
          >
            Đã từ chối
          </button>
          <button
            onClick={() => setFilter("Tất cả")}
            className={filter === "Tất cả" ? "active" : ""}
          >
            Tất cả
          </button>
        </div>

        {!loading && (
          <table className="requests-table">
            <thead>
              <tr>
                {/* ***** 1. THÊM TIÊU ĐỀ CỘT MÃ NHÂN VIÊN ***** */}
                <th>Mã NV</th>
                <th>Tên Nhân Viên</th>
                <th>Ngày Gửi</th>
                <th>Ngày Nghỉ</th>
                <th>Lý Do</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id}>
                  {/* ***** 2. THÊM Ô DỮ LIỆU MÃ NHÂN VIÊN ***** */}
                  <td>{request.maNhanVien}</td>
                  <td>{request.hoTenNhanVien || "N/A"}</td>
                  <td>{formatDate(request.ngayGuiDon)}</td>
                  <td>{formatDate(request.ngayNghi)}</td>
                  <td className="reason-cell">{request.lyDo || "Không có"}</td>
                  <td>
                    <StatusBadge status={request.trangThai} />
                  </td>
                  <td>
                    {request.trangThai === "Chờ duyệt" && (
                      <div className="action-buttons">
                        <button
                          className="approve-btn"
                          onClick={() => handleApprove(request)}
                        >
                          Duyệt
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => handleReject(request.id)}
                        >
                          Từ chối
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LeaveManagementPage;
