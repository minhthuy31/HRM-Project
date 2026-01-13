import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import { FaChevronLeft, FaChevronRight, FaPlus } from "react-icons/fa";
import "../styles/MyTimekeepingPage.css";
// IMPORT MODAL CŨ ĐÃ CÓ (Theo yêu cầu của bạn)
import LeaveRequestModal from "../components/modals/LeaveRequestModal";

const getDayOfWeek = (year, month, day) => {
  const date = new Date(year, month, day);
  const days = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  return days[date.getDay()];
};

const MyTimekeepingPage = () => {
  const { employeeId } = useParams();
  const [currentDate, setCurrentDate] = useState(new Date());

  const [summary, setSummary] = useState(null);
  const [recordsMap, setRecordsMap] = useState(new Map());
  const [pendingRequestsMap, setPendingRequestsMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(
    async (date) => {
      if (!employeeId) return;
      setLoading(true);
      try {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const response = await api.get(
          `/ChamCong/${employeeId}?year=${year}&month=${month}`
        );

        const {
          dailyRecords = [],
          summaries = {},
          pendingRequests = [],
        } = response.data;
        setSummary(summaries[employeeId] || null);

        const records = new Map();
        dailyRecords.forEach((rec) => {
          const day = parseInt(rec.ngayChamCong.split("-")[2], 10);
          records.set(day, rec);
        });
        setRecordsMap(records);

        const pending = new Map();
        pendingRequests.forEach((req) => {
          const day = new Date(req.ngayNghi).getUTCDate();
          pending.set(day, req);
        });
        setPendingRequestsMap(pending);
      } catch (error) {
        console.error("Lỗi tải dữ liệu chấm công:", error);
      } finally {
        setLoading(false);
      }
    },
    [employeeId]
  );

  useEffect(() => {
    fetchData(currentDate);
  }, [currentDate, fetchData]);

  const changeMonth = (offset) => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1)
    );
  };

  const handleLeaveRequestSubmit = async (requestData) => {
    try {
      const leaveRequestPayload = {
        maNhanVien: employeeId,
        ngayNghi: requestData.ngayNghi,
        lyDo: requestData.lyDo,
      };

      const response = await api.post("/DonNghiPhep", leaveRequestPayload);

      alert("Gửi đơn xin nghỉ thành công! Vui lòng chờ quản lý duyệt.");
      setIsModalOpen(false);

      // Cập nhật UI ngay lập tức
      const newPendingRequest = response.data;
      const day = new Date(newPendingRequest.ngayNghi).getUTCDate();
      setPendingRequestsMap((prevMap) =>
        new Map(prevMap).set(day, newPendingRequest)
      );
    } catch (error) {
      let errorMessage = "Gửi đơn thất bại. Vui lòng thử lại.";
      if (error.response?.data) {
        const { errors, message, title } = error.response.data;
        if (errors) errorMessage = Object.values(errors).flat().join("\n");
        else if (message) errorMessage = message;
        else if (title) errorMessage = title;
        else errorMessage = JSON.stringify(error.response.data, null, 2);
      } else {
        errorMessage = error.message;
      }
      alert("Đã xảy ra lỗi:\n" + errorMessage);
    }
  };

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const allDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // --- HÀM XỬ LÝ TRẠNG THÁI (Đã loại bỏ logic hiển thị OT) ---
  const getWorkDayStyleAndStatus = (day) => {
    // 1. Ưu tiên hiển thị dữ liệu chấm công đã có
    if (recordsMap.has(day)) {
      const record = recordsMap.get(day);
      const ngayCong = record?.ngayCong;

      // LOGIC CŨ: Không check OT, chỉ check công
      if (ngayCong === 1.0)
        return {
          text: "1.0",
          className: record.ghiChu ? "status-leave" : "status-present",
          note: record.ghiChu,
        };
      if (ngayCong === 0.5)
        return {
          text: "0.5",
          className: "status-half-day",
          note: record.ghiChu,
        };
      if (ngayCong === 0.0)
        return {
          text: "0.0",
          className: "status-absent",
          note: record.ghiChu,
        };
    }

    // 2. Nếu không có chấm công, kiểm tra đơn chờ duyệt
    if (pendingRequestsMap.has(day)) {
      const request = pendingRequestsMap.get(day);
      return {
        text: "Chờ duyệt",
        className: "status-pending",
        note: request.lyDo,
      };
    }

    return { text: "", className: "", note: "" };
  };

  return (
    <div className="my-timekeeping-view">
      <div className="timekeeping-header">
        <div className="month-navigator">
          <button onClick={() => changeMonth(-1)}>
            <FaChevronLeft />
          </button>
          <h2>{`Tháng ${
            currentDate.getMonth() + 1
          }, ${currentDate.getFullYear()}`}</h2>
          <button onClick={() => changeMonth(1)}>
            <FaChevronRight />
          </button>
        </div>
        <button className="add-btn" onClick={() => setIsModalOpen(true)}>
          <FaPlus /> Đăng ký nghỉ
        </button>
      </div>

      <div className="timekeeping-list">
        <div className="list-header">
          <div className="header-date">Ngày</div>
          <div className="header-status">Trạng thái</div>
        </div>
        {loading ? (
          <div className="loading-text">Đang tải dữ liệu...</div>
        ) : (
          allDays.map((day) => {
            const { text, className, note } = getWorkDayStyleAndStatus(day);
            return (
              <div className="day-row" key={day}>
                <div className="date-col">
                  <span className="date-text">{`${day}/${
                    currentDate.getMonth() + 1
                  }/${currentDate.getFullYear()}`}</span>
                  <span className="day-of-week-text">
                    {getDayOfWeek(
                      currentDate.getFullYear(),
                      currentDate.getMonth(),
                      day
                    )}
                  </span>
                </div>
                <div className="status-col">
                  <span className={className}>{text}</span>
                  {note && <span className="reason-note">{note}</span>}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="summary-section">
        <h4>Tổng kết công tháng {currentDate.getMonth() + 1}</h4>
        {summary ? (
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-value">
                {summary.tongCong?.toFixed(1) || "0.0"}
              </span>
              <span className="summary-label">Tổng công</span>
            </div>
            <div className="summary-item">
              <span className="summary-value green">
                {summary.diLamDu || 0}
              </span>
              <span className="summary-label">Ngày đi đủ</span>
            </div>
            <div className="summary-item">
              <span className="summary-value orange">
                {summary.nghiCoPhep || 0}
              </span>
              <span className="summary-label">Ngày nghỉ phép</span>
            </div>
            <div className="summary-item">
              <span className="summary-value blue">
                {summary.lamNuaNgay || 0}
              </span>
              <span className="summary-label">Ngày làm nửa buổi</span>
            </div>
            <div className="summary-item">
              <span className="summary-value red">
                {summary.nghiKhongPhep || 0}
              </span>
              <span className="summary-label">Ngày vắng</span>
            </div>
          </div>
        ) : (
          <p>Chưa có dữ liệu chấm công cho tháng này.</p>
        )}
      </div>

      {/* MODAL ĐƯỢC IMPORT VÀ SỬ DỤNG LẠI */}
      {isModalOpen && (
        <LeaveRequestModal
          onSave={handleLeaveRequestSubmit}
          onCancel={() => setIsModalOpen(false)}
          // --- SỬA Ở ĐÂY: Truyền thêm prop remainingLeave ---
          remainingLeave={summary?.remainingLeaveDays || 0}
        />
      )}
    </div>
  );
};

export default MyTimekeepingPage;
