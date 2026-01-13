import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { api } from "../api";
import "../styles/LeaveManagementPage.css";

const LeaveManagementPage = () => {
  const [activeTab, setActiveTab] = useState("leave"); // 'leave', 'ot', 'trip'
  const [statusFilter, setStatusFilter] = useState("Chờ duyệt");

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- HÀM LOAD DỮ LIỆU THEO TAB ---
  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = "";
      switch (activeTab) {
        case "leave":
          endpoint = "/DonNghiPhep";
          break;
        case "ot":
          endpoint = "/DangKyOT";
          break;
        case "trip":
          endpoint = "/DangKyCongTac";
          break;
        default:
          endpoint = "/DonNghiPhep";
      }

      const response = await api.get(endpoint);
      setRequests(response.data);
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
      // alert("Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]); // Load lại khi chuyển Tab

  // --- XỬ LÝ DUYỆT / TỪ CHỐI ---
  const handleAction = async (id, action) => {
    // action: 'approve' hoặc 'reject'
    try {
      let endpointPrefix = "";
      switch (activeTab) {
        case "leave":
          endpointPrefix = "/DonNghiPhep";
          break;
        case "ot":
          endpointPrefix = "/DangKyOT";
          break;
        case "trip":
          endpointPrefix = "/DangKyCongTac";
          break;
        default:
          return;
      }

      await api.post(`${endpointPrefix}/${action}/${id}`);
      alert(action === "approve" ? "Đã duyệt đơn!" : "Đã từ chối đơn!");
      fetchData(); // Reload lại bảng
    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi xử lý đơn.";
      alert(msg);
    }
  };

  // --- LỌC DỮ LIỆU THEO TRẠNG THÁI ---
  const filteredData = useMemo(() => {
    if (statusFilter === "Tất cả") return requests;
    return requests.filter((r) => r.trangThai === statusFilter);
  }, [requests, statusFilter]);

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "");

  // Format giờ cho OT (TimeSpan từ C# về là "HH:mm:ss")
  const formatTime = (t) => (t ? t.substring(0, 5) : "");

  // Format tiền tệ VNĐ
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // --- COMPONENT TRẠNG THÁI ---
  const StatusBadge = ({ status }) => {
    const map = {
      "Chờ duyệt": "pending",
      "Đã duyệt": "approved",
      "Từ chối": "rejected",
    };
    return (
      <span className={`status-badge ${map[status] || "default"}`}>
        {status}
      </span>
    );
  };

  // --- RENDER BẢNG THEO TAB ---
  const renderTable = () => {
    if (loading) return <p>Đang tải dữ liệu...</p>;
    if (filteredData.length === 0)
      return <p className="no-data">Không có dữ liệu.</p>;

    return (
      <div className="requests-table-container">
        <table className="requests-table">
          <thead>
            <tr>
              <th>Mã NV</th>
              <th>Họ tên</th>
              <th>Ngày gửi</th>

              {/* Cột động theo từng loại đơn */}
              {activeTab === "leave" && (
                <>
                  <th>Phép còn</th>
                  <th>Từ ngày</th>
                  <th>Đến ngày</th>
                  <th>Số ngày</th>
                  <th>Lý do</th>
                  <th>Tệp</th>
                </>
              )}
              {activeTab === "ot" && (
                <>
                  <th>Ngày làm</th>
                  <th>Từ giờ</th>
                  <th>Đến giờ</th>
                  <th>Tổng giờ</th>
                  <th>Lý do / Dự án</th>
                </>
              )}
              {activeTab === "trip" && (
                <>
                  <th>Nơi công tác</th>
                  <th>Thời gian</th>
                  {/* <th>Phương tiện</th> */}
                  <th>Mục đích</th>
                  {/* --- CỘT MỚI CHO KINH PHÍ --- */}
                  <th>Kinh phí DK</th>
                  <th>Tạm ứng</th>
                </>
              )}

              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id}>
                <td>{item.maNhanVien}</td>
                <td>{item.hoTenNhanVien || item.nhanVien?.hoTen || "---"}</td>
                <td>{formatDate(item.ngayGuiDon)}</td>

                {/* --- BODY: NGHỈ PHÉP --- */}
                {activeTab === "leave" && (
                  <>
                    <td
                      style={{
                        fontWeight: "bold",
                        color: item.remainingLeaveDays > 0 ? "green" : "red",
                      }}
                    >
                      {item.remainingLeaveDays ?? "-"}
                    </td>
                    <td>{formatDate(item.ngayBatDau)}</td>
                    <td>{formatDate(item.ngayKetThuc)}</td>
                    <td>{item.soNgayNghi}</td>
                    <td className="reason-cell">{item.lyDo}</td>
                    <td>
                      {item.tepDinhKem ? (
                        <a
                          href={`http://localhost:5260${item.tepDinhKem}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Xem
                        </a>
                      ) : (
                        "Không"
                      )}
                    </td>
                  </>
                )}

                {/* --- BODY: OT --- */}
                {activeTab === "ot" && (
                  <>
                    <td>{formatDate(item.ngayLamThem)}</td>
                    <td>{formatTime(item.gioBatDau)}</td>
                    <td>{formatTime(item.gioKetThuc)}</td>
                    <td>{item.soGio ? item.soGio.toFixed(1) : 0}h</td>
                    <td className="reason-cell">{item.lyDo}</td>
                  </>
                )}

                {/* --- BODY: CÔNG TÁC --- */}
                {activeTab === "trip" && (
                  <>
                    <td style={{ fontWeight: 500 }}>
                      {item.noiCongTac}
                      <div style={{ fontSize: "0.85em", color: "#666" }}>
                        ({item.phuongTien})
                      </div>
                    </td>
                    <td>
                      {formatDate(item.ngayBatDau)} <br />
                      <span style={{ fontSize: "0.85em", color: "#666" }}>
                        đến
                      </span>{" "}
                      {formatDate(item.ngayKetThuc)}
                    </td>
                    {/* <td>{item.phuongTien}</td> */}
                    <td className="reason-cell">{item.mucDich}</td>

                    {/* --- HIỂN THỊ KINH PHÍ MỚI --- */}
                    <td style={{ fontWeight: "500" }}>
                      {formatCurrency(item.kinhPhiDuKien)}
                    </td>
                    <td>
                      {item.soTienTamUng > 0 ? (
                        <div>
                          <span
                            style={{ color: "#d97706", fontWeight: "bold" }}
                          >
                            {formatCurrency(item.soTienTamUng)}
                          </span>
                          {item.lyDoTamUng && (
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#666",
                                fontStyle: "italic",
                                maxWidth: "150px",
                                whiteSpace: "normal",
                                lineHeight: "1.2",
                              }}
                            >
                              Lý do: {item.lyDoTamUng}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "#6b7280", fontSize: "0.9em" }}>
                          Tự túc
                        </span>
                      )}
                    </td>
                  </>
                )}

                <td>
                  <StatusBadge status={item.trangThai} />
                </td>

                <td>
                  {item.trangThai === "Chờ duyệt" && (
                    <div className="action-buttons">
                      <button
                        className="approve-btn"
                        onClick={() => handleAction(item.id, "approve")}
                      >
                        Duyệt
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleAction(item.id, "reject")}
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
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="leave-management-container">
        <h1>Quản lý Đơn từ & Phê duyệt</h1>

        {/* --- TAB CHÍNH (LOẠI ĐƠN) --- */}
        <div className="main-tabs">
          <button
            className={activeTab === "leave" ? "active" : ""}
            onClick={() => {
              setActiveTab("leave");
              setStatusFilter("Chờ duyệt");
            }}
          >
            Nghỉ phép
          </button>
          <button
            className={activeTab === "ot" ? "active" : ""}
            onClick={() => {
              setActiveTab("ot");
              setStatusFilter("Chờ duyệt");
            }}
          >
            Làm thêm giờ (OT)
          </button>
          <button
            className={activeTab === "trip" ? "active" : ""}
            onClick={() => {
              setActiveTab("trip");
              setStatusFilter("Chờ duyệt");
            }}
          >
            Công tác
          </button>
        </div>

        {/* --- TAB CON (TRẠNG THÁI) --- */}
        <div className="sub-filters">
          {["Chờ duyệt", "Đã duyệt", "Từ chối", "Tất cả"].map((status) => (
            <button
              key={status}
              className={statusFilter === status ? "active" : ""}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        {renderTable()}
      </div>
    </DashboardLayout>
  );
};

export default LeaveManagementPage;
