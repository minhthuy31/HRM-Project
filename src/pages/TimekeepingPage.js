import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { api } from "../api";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../styles/TimekeepingPage.css";
import AttendanceModal from "../components/modals/AttendanceModal";
import BulkEditModal from "../components/modals/BulkEditModal";

const TimekeepingPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState({});

  // State cho việc chỉnh sửa và lựa chọn
  const [editingCell, setEditingCell] = useState(null); // Sửa 1 ô
  const [selection, setSelection] = useState({ type: null, id: null }); // Chọn hàng/cột
  const [isDragging, setIsDragging] = useState(false); // Kéo chuột
  const [startCell, setStartCell] = useState(null);
  const [endCell, setEndCell] = useState(null);
  const [bulkEditData, setBulkEditData] = useState(null); // Mở modal sửa hàng loạt

  const fetchData = useCallback(async (date) => {
    setLoading(true);
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const [empRes, attendanceRes] = await Promise.all([
        api.get("/NhanVien?trangThai=true"),
        api.get(`/ChamCong?year=${year}&month=${month}`),
      ]);

      setEmployees(empRes.data);

      const { dailyRecords, summaries: summaryData } = attendanceRes.data;

      setSummaries(summaryData || {});
      const attendanceMap = {};
      if (dailyRecords) {
        dailyRecords.forEach((rec) => {
          const dateKey = parseInt(rec.ngayChamCong.split("-")[2], 10);

          if (!attendanceMap[rec.maNhanVien]) {
            attendanceMap[rec.maNhanVien] = {};
          }
          attendanceMap[rec.maNhanVien][dateKey] = rec;
        });
      }
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

  const getWorkDayStyle = (record) => {
    const ngayCong = record?.ngayCong;
    if (ngayCong === 1.0) {
      // Nếu có GhiChu (lý do) -> "Nghỉ có phép"
      return {
        text: "1.0",
        className: record?.ghiChu ? "status-leave" : "status-present",
      };
    }
    if (ngayCong === 0.5) {
      return { text: "0.5", className: "status-half-day" };
    }
    if (ngayCong === 0.0) {
      return { text: "0.0", className: "status-absent" };
    }
    return { text: "", className: "" };
  };
  /*
  const handleCellClick = (maNhanVien, day) => {
    const record = attendance[maNhanVien]?.[day] || {};
    setEditingCell({
      maNhanVien,
      day,
      ngayCong: record.ngayCong,
      ghiChu: record.ghiChu,
    });
  };
  */

  // --- CÁC HÀM XỬ LÝ SỰ KIỆN MỚI ---
  const clearSelections = () => {
    setSelection({ type: null, id: null });
    setIsDragging(false);
    setStartCell(null);
    setEndCell(null);
    document.body.style.userSelect = "auto";
  };

  const handleSelectRow = (maNhanVien) => {
    clearSelections();
    setSelection({ type: "row", id: maNhanVien });
    setBulkEditData({ type: "row", id: maNhanVien }); // Mở modal
  };

  const handleSelectColumn = (day) => {
    clearSelections();
    setSelection({ type: "column", id: day });
    setBulkEditData({ type: "column", id: day }); // Mở modal
  };

  const handleMouseDown = (maNhanVien, day) => {
    clearSelections();
    setIsDragging(true);
    const cell = { maNhanVien, day };
    setStartCell(cell);
    setEndCell(cell);
    document.body.style.userSelect = "none";
  };

  const handleMouseEnter = (maNhanVien, day) => {
    if (isDragging) {
      setEndCell({ maNhanVien, day });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      // Chỉ mở modal nếu kéo nhiều hơn 1 ô
      if (
        startCell &&
        endCell &&
        (startCell.maNhanVien !== endCell.maNhanVien ||
          startCell.day !== endCell.day)
      ) {
        setBulkEditData({ type: "range", start: startCell, end: endCell });
      }
      setIsDragging(false); // Dừng kéo ngay cả khi chỉ kéo 1 ô
    }
    document.body.style.userSelect = "auto";
  };

  const isCellSelected = (maNhanVien, day) => {
    // 1. Kiểm tra chọn hàng/cột
    if (selection.type === "row" && selection.id === maNhanVien) return true;
    if (selection.type === "column" && selection.id === day) return true;

    // 2. Kiểm tra chọn vùng (kéo chuột)
    if (!isDragging || !startCell || !endCell) return false;
    const empIds = employees.map((e) => e.maNhanVien);
    const startRow = empIds.indexOf(startCell.maNhanVien);
    const endRow = empIds.indexOf(endCell.maNhanVien);
    const startCol = startCell.day;
    const endCol = endCell.day;
    const currentRow = empIds.indexOf(maNhanVien);
    const currentCol = day;
    return (
      currentRow >= Math.min(startRow, endRow) &&
      currentRow <= Math.max(startRow, endRow) &&
      currentCol >= Math.min(startCol, endCol) &&
      currentCol <= Math.max(startCol, endCol)
    );
  };

  const handleBulkSave = async (dataToSave) => {
    if (!bulkEditData) return;

    const promises = [];
    const empIds = employees.map((e) => e.maNhanVien);
    const { type, id, start, end } = bulkEditData;

    let cellsToUpdate = [];
    if (type === "row") {
      daysArray.forEach((day) => cellsToUpdate.push({ maNhanVien: id, day }));
    } else if (type === "column") {
      employees.forEach((emp) =>
        cellsToUpdate.push({ maNhanVien: emp.maNhanVien, day: id })
      );
    } else if (type === "range") {
      const startRow = empIds.indexOf(start.maNhanVien);
      const endRow = empIds.indexOf(end.maNhanVien);
      const startCol = start.day;
      const endCol = end.day;
      for (
        let r = Math.min(startRow, endRow);
        r <= Math.max(startRow, endRow);
        r++
      ) {
        for (
          let c = Math.min(startCol, endCol);
          c <= Math.max(startCol, endCol);
          c++
        ) {
          cellsToUpdate.push({ maNhanVien: empIds[r], day: c });
        }
      }
    }

    cellsToUpdate.forEach(({ maNhanVien, day }) => {
      const formattedDate = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const record = { maNhanVien, ngayChamCong: formattedDate, ...dataToSave };
      promises.push(api.post("/ChamCong/upsert", record));
    });

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error("Lỗi cập nhật hàng loạt:", error);
    } finally {
      setBulkEditData(null);
      clearSelections();
      fetchData(currentDate);
    }
  };

  const handleSave = async (editData) => {
    if (!editingCell) return;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const day = editingCell.day;
    const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    const record = {
      maNhanVien: editingCell.maNhanVien,
      ngayChamCong: formattedDate,
      ngayCong: editData.ngayCong,
      ghiChu: editData.ghiChu,
    };

    try {
      const response = await api.post("/ChamCong/upsert", record);
      setEditingCell(null);

      if (response.data.wasConverted) {
        alert("Lưu thành công!\nBạn đã hết ngày nghỉ có phép.");
      }

      fetchData(currentDate);
    } catch (error) {
      if (error.response && error.response.data) {
        alert(`Lỗi: ${error.response.data}`);
      } else {
        console.error("Lỗi cập nhật chấm công:", error);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="timekeeping-page">
        {/* Header điều hướng tháng */}
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

        {/* Bảng chấm công */}
        <div
          className="timekeeping-table-container"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {loading ? (
            <p>Đang tải...</p>
          ) : (
            <table className="timekeeping-table">
              <thead>
                <tr>
                  <th className="employee-name-col">Nhân viên</th>
                  {daysArray.map((day) => (
                    <th
                      key={day}
                      className={`day-header ${
                        selection.type === "column" && selection.id === day
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => handleSelectColumn(day)}
                    >
                      {day}
                    </th>
                  ))}
                  <th className="summary-col">Tổng công</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const summary = summaries[emp.maNhanVien] || {};
                  return (
                    <tr key={emp.maNhanVien}>
                      <td
                        className="employee-name-col"
                        onClick={() => handleSelectRow(emp.maNhanVien)}
                      >
                        <div className="employee-info">
                          <span className="font-bold">{emp.hoTen}</span>
                          <br />
                          <span
                            style={{ color: "#f87171", opacity: 0.6 }}
                            className="font-normal text-sm"
                          >
                            {emp.maNhanVien}
                          </span>
                        </div>
                      </td>

                      {daysArray.map((day) => {
                        const record = attendance[emp.maNhanVien]?.[day] || {};
                        const style = getWorkDayStyle(record);
                        const selected = isCellSelected(emp.maNhanVien, day);
                        return (
                          <td
                            key={day}
                            className={`attendance-cell ${style.className} ${
                              selected ? "selected" : ""
                            }`}
                            onMouseDown={() =>
                              handleMouseDown(emp.maNhanVien, day)
                            }
                            onMouseEnter={() =>
                              handleMouseEnter(emp.maNhanVien, day)
                            }
                            onClick={() =>
                              setEditingCell({
                                maNhanVien: emp.maNhanVien,
                                day,
                                ...record,
                              })
                            }
                          >
                            <span>{style.text}</span>
                            <br></br>
                            {record.ghiChu && (
                              <span className="reason-note">
                                {record.ghiChu}
                              </span>
                            )}
                          </td>
                        );
                      })}

                      <td className="summary-col">
                        <strong>
                          {summary.tongCong !== undefined
                            ? summary.tongCong.toFixed(1)
                            : "N/A"}
                        </strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal sửa 1 ô */}
      {editingCell && (
        <AttendanceModal
          cellData={editingCell}
          onSave={handleSave}
          onCancel={() => setEditingCell(null)}
          remainingLeave={summaries[editingCell.maNhanVien]?.remainingLeaveDays}
        />
      )}

      {/* Modal sửa hàng loạt */}
      {bulkEditData && (
        <BulkEditModal
          onSave={handleBulkSave}
          onCancel={() => {
            setBulkEditData(null);
            clearSelections();
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default TimekeepingPage;
