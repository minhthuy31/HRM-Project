import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { api } from "../api";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../styles/TimekeepingPage.css";
import AttendanceModal from "../components/modals/AttendanceModal";

const TimekeepingPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState(null);

  const fetchData = useCallback(async (date) => {
    setLoading(true);
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const [empRes, attendanceRes] = await Promise.all([
        api.get("/NhanVien"),
        api.get(`/ChamCong?year=${year}&month=${month}`),
      ]);

      setEmployees(empRes.data);
      const attendanceMap = {};
      attendanceRes.data.forEach((rec) => {
        const dateKey = new Date(rec.ngayChamCong).getDate();
        if (!attendanceMap[rec.maNhanVien]) {
          attendanceMap[rec.maNhanVien] = {};
        }
        attendanceMap[rec.maNhanVien][dateKey] = rec;
      });
      setAttendance(attendanceMap);
    } catch (error) {
      console.error("Lỗi tải dữ liệu chấm công:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(currentDate);
  }, [currentDate, fetchData]);

  const changeMonth = (offset) => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1)
    );
  };

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const daysInMonth = getDaysInMonth(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleCellClick = (maNhanVien, day) => {
    const record = attendance[maNhanVien]?.[day] || {};
    setEditingCell({
      maNhanVien,
      day,
      month: currentDate.getMonth() + 1,
      status: record.trangThai,
      gioVao: record.gioVao,
      gioRa: record.gioRa,
    });
  };

  const handleSave = async (editData) => {
    if (!editingCell) return;
    const record = {
      maNhanVien: editingCell.maNhanVien,
      ngayChamCong: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        editingCell.day
      ),
      trangThai: editData.trangThai || "Vắng",
      gioVao: editData.gioVao ? `${editData.gioVao}:00` : null,
      gioRa: editData.gioRa ? `${editData.gioRa}:00` : null,
    };
    try {
      await api.post("/ChamCong/upsert", record);
      setEditingCell(null);
      fetchData(currentDate);
    } catch (error) {
      console.error("Lỗi cập nhật chấm công:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="timekeeping-page">
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

        <div className="timekeeping-table-container">
          {loading ? (
            <p>Đang tải...</p>
          ) : (
            <table className="timekeeping-table">
              <thead>
                <tr>
                  <th className="employee-name-col">Nhân viên</th>
                  {daysArray.map((day) => (
                    <th key={day}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.maNhanVien}>
                    <td className="employee-name-col">{emp.hoTen}</td>
                    {daysArray.map((day) => {
                      const record = attendance[emp.maNhanVien]?.[day] || {};
                      const status = record.trangThai || "";
                      let cellClass = "attendance-cell";
                      if (status === "Đi làm") cellClass += " status-present";
                      if (status === "Vắng") cellClass += " status-absent";
                      if (status === "Nghỉ phép") cellClass += " status-leave";

                      return (
                        <td
                          key={day}
                          className={cellClass}
                          onClick={() => handleCellClick(emp.maNhanVien, day)}
                        >
                          <span>{status}</span>
                          {(record.gioVao || record.gioRa) && (
                            <span className="time-range">{`${
                              record.gioVao?.substring(0, 5) || "--"
                            } - ${
                              record.gioRa?.substring(0, 5) || "--"
                            }`}</span>
                          )}
                          <div className="cell-tooltip">
                            Giờ vào: {record.gioVao || "N/A"}
                            <br />
                            Giờ ra: {record.gioRa || "N/A"}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {editingCell && (
        <AttendanceModal
          cellData={editingCell}
          onSave={handleSave}
          onCancel={() => setEditingCell(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default TimekeepingPage;
