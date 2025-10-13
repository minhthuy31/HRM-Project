// src/pages/LeaveManagementPage.js

import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { api } from "../api";
import "../styles/LeaveManagementPage.css"; // Có thể cần thêm style cho bộ lọc

const LeaveManagementPage = () => {
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("Pending"); // Mặc định hiển thị đơn chờ duyệt

  // Sử dụng endpoint mới để lấy TẤT CẢ đơn
  const fetchAllRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/DonNghiPhep"); // API LẤY TẤT CẢ
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

  // Hàm xử lý duyệt/từ chối (giữ nguyên logic gọi API của bạn)
  const handleApprove = async (request) => {
    /* ... giữ nguyên ... */
  };
  const handleReject = async (id) => {
    /* ... giữ nguyên ... */
  };

  // Lọc danh sách đơn dựa trên state 'filter'
  const filteredRequests = useMemo(() => {
    if (filter === "All") {
      return allRequests;
    }
    return allRequests.filter((req) => req.trangThai === filter);
  }, [allRequests, filter]);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("vi-VN");

  // Component hiển thị trạng thái dưới dạng huy hiệu cho đẹp
  const StatusBadge = ({ status }) => {
    const statusClass = `status-badge ${status?.toLowerCase()}`;
    return <span className={statusClass}>{status}</span>;
  };

  return (
    <DashboardLayout>
      <div className="leave-management-container">
        <h1>Quản lý Đơn Xin Nghỉ Phép</h1>

        {/* BỘ LỌC MỚI */}
        <div className="filter-buttons">
          <button
            onClick={() => setFilter("Pending")}
            className={filter === "Pending" ? "active" : ""}
          >
            Chờ duyệt
          </button>
          <button
            onClick={() => setFilter("Approved")}
            className={filter === "Approved" ? "active" : ""}
          >
            Đã duyệt
          </button>
          <button
            onClick={() => setFilter("Rejected")}
            className={filter === "Rejected" ? "active" : ""}
          >
            Đã từ chối
          </button>
          <button
            onClick={() => setFilter("All")}
            className={filter === "All" ? "active" : ""}
          >
            Tất cả
          </button>
        </div>

        {loading && <p>Đang tải danh sách...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && filteredRequests.length === 0 && (
          <p>Không có đơn nào phù hợp với bộ lọc.</p>
        )}

        {!loading && filteredRequests.length > 0 && (
          <table className="requests-table">
            <thead>
              <tr>
                <th>Tên Nhân Viên</th>
                <th>Ngày Gửi</th>
                <th>Ngày Nghỉ</th>
                <th>Lý Do</th>
                <th>Trạng Thái</th> {/* CỘT MỚI */}
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id}>
                  <td>{request.nhanVien?.hoTen || "N/A"}</td>
                  <td>{formatDate(request.ngayGuiDon)}</td>
                  <td>{formatDate(request.ngayNghi)}</td>
                  <td className="reason-cell">{request.lyDo || "Không có"}</td>
                  <td>
                    <StatusBadge status={request.trangThai} />
                  </td>
                  <td>
                    {/* Chỉ hiển thị nút khi đơn đang chờ duyệt */}
                    {request.trangThai === "Pending" && (
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
