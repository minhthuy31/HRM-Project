import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../styles/MyTimekeepingPage.css";

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
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async (date) => {
      if (!employeeId) return;
      setLoading(true);
      try {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const response = await api.get(
          `/ChamCong/${employeeId}?year=${year}&month=${month}`
        );
        setAttendanceData(response.data);
      } catch (error) {
        console.error("Lỗi tải dữ liệu chấm công:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData(currentDate);
  }, [currentDate, employeeId]);

  const changeMonth = (offset) => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1)
    );
  };

  // Cập nhật hàm tính toán để bao gồm cả ngày làm nửa buổi
  const summary = useMemo(() => {
    return attendanceData.reduce(
      (acc, record) => {
        if (record.ngayCong === 1.0) acc.presentDays++;
        else if (record.ngayCong === 0.5) acc.leaveDays++;
        else if (record.ngayCong === 0.0) acc.absentDays++;
        else if (record.ngayCong === -0.5) acc.halfWorkDays++;
        return acc;
      },
      { presentDays: 0, leaveDays: 0, absentDays: 0, halfWorkDays: 0 }
    );
  }, [attendanceData]);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const allDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getWorkDayStyle = (record) => {
    if (record?.trangThaiDonNghi) {
      switch (record.trangThaiDonNghi) {
        case "Chờ duyệt":
          return { text: "Chờ duyệt", className: "status-pending" };
        case "Từ chối":
          return { text: "Từ chối", className: "status-absent" };
      }
    }

    const ngayCong = record?.ngayCong;
    if (ngayCong === 1.0) return { text: "1.0", className: "status-present" };
    if (ngayCong === 0.5) return { text: "0.5", className: "status-leave" };
    if (ngayCong === 0.0) return { text: "0.0", className: "status-absent" };
    if (ngayCong === -0.5) return { text: "0.5", className: "status-half-day" };
    return { text: "-", className: "" };
  };

  return (
    <div className="my-timekeeping-view">
      <div className="timekeeping-header">
        <div className="month-navigator">
          <button onClick={() => changeMonth(-1)}>
            {" "}
            <FaChevronLeft />{" "}
          </button>
          <h2>{`Tháng ${
            currentDate.getMonth() + 1
          }, ${currentDate.getFullYear()}`}</h2>
          <button onClick={() => changeMonth(1)}>
            {" "}
            <FaChevronRight />{" "}
          </button>
        </div>
        <div className="work-schedule-section">
          <h4>Giờ làm việc quy định</h4>
          <p>
            <strong>Buổi sáng:</strong> 8:00 - 12:00
          </p>
          <p>
            <strong>Buổi chiều:</strong> 13:30 - 17:30
          </p>
        </div>
      </div>

      <div className="timekeeping-list">
        <div className="list-header">
          <div className="header-date">Ngày</div>
          <div className="header-status">Trạng thái chấm công</div>
        </div>
        {loading ? (
          <div className="loading-text">Đang tải dữ liệu...</div>
        ) : (
          allDays.map((day) => {
            const record = attendanceData.find(
              (r) => new Date(r.ngayChamCong).getUTCDate() === day
            );
            const style = getWorkDayStyle(record);
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
                  <span className={style.className}>{style.text}</span>
                  {record?.ghiChu && (
                    <span className="status-note">{record.ghiChu}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="summary-section">
        <h4>Tổng kết công tháng {currentDate.getMonth() + 1}</h4>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-value green">{summary.presentDays}</span>
            <span className="summary-label">Ngày công</span>
          </div>
          <div className="summary-item">
            <span className="summary-value blue">{summary.halfWorkDays}</span>
            <span className="summary-label">Ngày làm nửa buổi</span>
          </div>
          <div className="summary-item">
            <span className="summary-value orange">{summary.leaveDays}</span>
            <span className="summary-label">Ngày nghỉ phép</span>
          </div>
          <div className="summary-item">
            <span className="summary-value red">{summary.absentDays}</span>
            <span className="summary-label">Ngày vắng</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTimekeepingPage;
