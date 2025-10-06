import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../api";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../styles/MyTimekeepingPage.css";

// SỬA 1: Đơn giản hóa hàm helper, loại bỏ logic "mặc định"
const getWorkDayStyle = (dayRecord) => {
  // Nếu không có bản ghi cho ngày này, hiển thị ô trống
  if (!dayRecord) {
    return { text: "", className: "" };
  }

  const ngayCong = dayRecord.ngayCong;
  if (ngayCong === 1.0) return { text: "1.0", className: "status-present" };
  if (ngayCong === 0.5) return { text: "0.5", className: "status-leave" };
  if (ngayCong === 0.0) return { text: "0.0", className: "status-absent" };
  return { text: String(ngayCong), className: "" };
};

const MyTimekeepingPage = () => {
  const { employee } = useOutletContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (date, maNhanVien) => {
    if (!maNhanVien) return;
    setLoading(true);
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const response = await api.get(
        `/ChamCong/${maNhanVien}?year=${year}&month=${month}`
      );

      const dataMap = {};
      response.data.forEach((rec) => {
        const day = parseInt(rec.ngayChamCong.split("-")[2], 10);
        dataMap[day] = rec;
      });
      setAttendanceData(dataMap);
    } catch (error) {
      console.error("Lỗi tải dữ liệu chấm công cá nhân:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(currentDate, employee.maNhanVien);
  }, [currentDate, employee.maNhanVien, fetchData]);

  // SỬA 2: Tính toán LỊCH và BẢNG TỔNG KẾT chỉ dựa trên dữ liệu thực tế
  const { calendarDays, summary } = useMemo(() => {
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();
    const days = [];
    let workDays = 0,
      leaveDays = 0,
      absentDays = 0;

    // Tính tổng kết chỉ dựa trên các bản ghi tồn tại
    Object.values(attendanceData).forEach((record) => {
      if (record.ngayCong === 1.0) workDays++;
      else if (record.ngayCong === 0.5) leaveDays += 0.5;
      else if (record.ngayCong === 0.0) absentDays++;
    });

    // Tạo dữ liệu cho lịch, ngày nào không có dữ liệu thì `data` sẽ là `undefined`
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ day, data: attendanceData[day] });
    }

    return {
      calendarDays: days,
      summary: { workDays, leaveDays, absentDays },
    };
  }, [attendanceData, currentDate]);

  const changeMonth = (offset) => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1)
    );
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
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <>
          <div className="calendar-grid">
            {calendarDays.map(({ day, data }) => {
              const style = getWorkDayStyle(data);
              return (
                <div key={day} className="day-cell">
                  <div className="day-number">{day}</div>
                  <div className={`day-status ${style.className}`}>
                    {style.text}
                  </div>
                  {data?.ghiChu && (
                    <div className="day-note" title={data.ghiChu}>
                      Ghi chú
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="summary-section">
            <h4>Tổng kết tháng</h4>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-value green">{summary.workDays}</span>
                <span className="summary-label">Ngày công</span>
              </div>
              <div className="summary-item">
                <span className="summary-value orange">
                  {summary.leaveDays}
                </span>
                <span className="summary-label">Ngày nghỉ phép</span>
              </div>
              <div className="summary-item">
                <span className="summary-value red">{summary.absentDays}</span>
                <span className="summary-label">Ngày vắng</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MyTimekeepingPage;
