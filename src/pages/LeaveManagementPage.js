import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { api } from "../api";
import "../styles/LeaveManagementPage.css";

const LeaveManagementPage = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPendingRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/DonNghiPhep/pending");
      setPendingRequests(response.data);
    } catch (err) {
      console.error("Lỗi tải danh sách đơn từ:", err);
      setError("Không thể tải danh sách đơn từ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  const handleApprove = async (id) => {
    try {
      await api.put(`/DonNghiPhep/${id}/approve`);
      alert("Đã duyệt đơn thành công!");
      fetchPendingRequests();
    } catch (err) {
      alert("Đã có lỗi xảy ra khi duyệt đơn.");
      console.error("Lỗi duyệt đơn:", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/DonNghiPhep/${id}/reject`);
      alert("Đã từ chối đơn.");
      // Tải lại danh sách
      fetchPendingRequests();
    } catch (err) {
      alert("Đã có lỗi xảy ra khi từ chối đơn.");
      console.error("Lỗi từ chối đơn:", err);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("vi-VN");

  return (
    <DashboardLayout>
      <div className="leave-management-container">
        <h1>Duyệt Đơn Xin Nghỉ Phép</h1>

        {loading && <p>Đang tải danh sách...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && pendingRequests.length === 0 && (
          <p>Không có đơn nào đang chờ duyệt.</p>
        )}

        {!loading && pendingRequests.length > 0 && (
          <table className="requests-table">
            <thead>
              <tr>
                <th>Mã NV</th>
                <th>Tên Nhân Viên</th>
                <th>Ngày Đăng Ký</th>
                <th>Ngày Muốn Nghỉ</th>
                <th>Lý Do</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map((request) => (
                <tr key={request.id}>
                  <td>{request.maNhanVien}</td>
                  <td>{request.nhanVien?.hoTen || "N/A"}</td>
                  <td>{formatDate(request.ngayGuiDon)}</td>
                  <td>{formatDate(request.ngayNghi)}</td>
                  <td className="reason-cell">{request.lyDo || "Không có"}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="approve-btn"
                        onClick={() => handleApprove(request.id)}
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
