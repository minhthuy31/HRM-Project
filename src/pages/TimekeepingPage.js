import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { api } from "../api";
import { getUserFromToken } from "../utils/auth";
import {
  FaChevronLeft,
  FaChevronRight,
  FaLock,
  FaUnlock,
} from "react-icons/fa";
import "../styles/TimekeepingPage.css";
import AttendanceModal from "../components/modals/AttendanceModal";
import BulkEditModal from "../components/modals/BulkEditModal";

const TimekeepingPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState({});

  // State kiểm tra trạng thái khóa công
  const [isLocked, setIsLocked] = useState(false);

  // State cho việc chỉnh sửa
  const [editingCell, setEditingCell] = useState(null);
  const [selection, setSelection] = useState({ type: null, id: null });
  const [isDragging, setIsDragging] = useState(false);
  const [startCell, setStartCell] = useState(null);
  const [endCell, setEndCell] = useState(null);
  const [bulkEditData, setBulkEditData] = useState(null);

  const user = getUserFromToken();
  const userRole = user?.role || user?.Role || "";

  // Logic phân quyền
  const canEdit =
    ["Nhân sự trưởng", "Giám đốc", "Trưởng phòng"].includes(userRole) &&
    !isLocked;
  const isAdmin = ["Nhân sự trưởng", "Giám đốc", "Tổng giám đốc"].includes(
    userRole,
  );

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

      const {
        dailyRecords,
        summaries: summaryData,
        isLocked: lockedStatus,
      } = attendanceRes.data;

      setSummaries(summaryData || {});
      setIsLocked(lockedStatus);

      const attendanceMap = {};
      if (dailyRecords) {
        dailyRecords.forEach((rec) => {
          const dateKey = parseInt(rec.ngayChamCong.split("-")[2], 10);
          if (!attendanceMap[rec.maNhanVien])
            attendanceMap[rec.maNhanVien] = {};
          attendanceMap[rec.maNhanVien][dateKey] = rec;
        });
      }
      setAttendance(attendanceMap);
    } catch (error) {
      console.error("Lỗi:", error);
      if (error.response?.status === 403) alert("Không có quyền truy cập.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(currentDate);
  }, [currentDate, fetchData]);

  const changeMonth = (offset) => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1),
    );
  };

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const daysInMonth = getDaysInMonth(
    currentDate.getFullYear(),
    currentDate.getMonth(),
  );
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getWorkDayStyle = (record) => {
    const ngayCong = record?.ngayCong;
    if (ngayCong === 1.0)
      return {
        text: "1.0",
        className: record?.ghiChu ? "status-leave" : "status-present",
      };
    if (ngayCong === 0.5) return { text: "0.5", className: "status-half-day" };
    if (ngayCong === 0.0) return { text: "0.0", className: "status-absent" };
    return { text: "", className: "" };
  };

  // --- SELECTION & DRAG LOGIC ---
  const clearSelections = () => {
    setSelection({ type: null, id: null });
    setIsDragging(false);
    setStartCell(null);
    setEndCell(null);
    document.body.style.userSelect = "auto";
  };

  const handleCellClick = (maNhanVien, day) => {
    if (!canEdit) {
      if (isLocked) alert("Bảng công tháng này đã bị khóa.");
      return;
    }
    const record = attendance[maNhanVien]?.[day] || {};
    setEditingCell({
      maNhanVien,
      day,
      ngayCong: record.ngayCong,
      ghiChu: record.ghiChu,
    });
  };

  const handleMouseDown = (maNhanVien, day) => {
    if (!canEdit) return;
    clearSelections();
    setIsDragging(true);
    setStartCell({ maNhanVien, day });
    setEndCell({ maNhanVien, day });
    document.body.style.userSelect = "none";
  };

  const handleMouseEnter = (maNhanVien, day) => {
    if (isDragging) setEndCell({ maNhanVien, day });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      if (
        startCell &&
        endCell &&
        (startCell.maNhanVien !== endCell.maNhanVien ||
          startCell.day !== endCell.day)
      ) {
        setBulkEditData({ type: "range", start: startCell, end: endCell });
      }
      setIsDragging(false);
    }
    document.body.style.userSelect = "auto";
  };

  const handleSelectRow = (id) => {
    if (canEdit) {
      clearSelections();
      setSelection({ type: "row", id });
      setBulkEditData({ type: "row", id });
    }
  };

  const handleSelectColumn = (id) => {
    if (canEdit) {
      clearSelections();
      setSelection({ type: "column", id });
      setBulkEditData({ type: "column", id });
    }
  };

  const isCellSelected = (maNhanVien, day) => {
    if (selection.type === "row" && selection.id === maNhanVien) return true;
    if (selection.type === "column" && selection.id === day) return true;
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

  // --- SAVE ACTIONS ---
  const handleSave = async (editData) => {
    if (!editingCell || !canEdit) return;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(
      editingCell.day,
    ).padStart(2, "0")}`;

    try {
      await api.post("/ChamCong/upsert", {
        maNhanVien: editingCell.maNhanVien,
        ngayChamCong: formattedDate,
        ngayCong: editData.ngayCong,
        ghiChu: editData.ghiChu,
      });
      setEditingCell(null);
      fetchData(currentDate);
    } catch (error) {
      const msg = error.response?.data?.message || "Lỗi lưu dữ liệu.";
      alert(msg);
    }
  };

  const handleBulkSave = async (dataToSave) => {
    if (!bulkEditData || !canEdit) return;
    const promises = [];
    const empIds = employees.map((e) => e.maNhanVien);
    const { type, id, start, end } = bulkEditData;
    let cellsToUpdate = [];

    if (type === "row") {
      daysArray.forEach((day) => cellsToUpdate.push({ maNhanVien: id, day }));
    } else if (type === "column") {
      employees.forEach((emp) =>
        cellsToUpdate.push({ maNhanVien: emp.maNhanVien, day: id }),
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
        currentDate.getMonth() + 1,
      ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      const hasData = attendance[maNhanVien] && attendance[maNhanVien][day];
      if (hasData) return;

      promises.push(
        api.post("/ChamCong/upsert", {
          maNhanVien,
          ngayChamCong: formattedDate,
          ...dataToSave,
          OnlyIfEmpty: true,
        }),
      );
    });

    try {
      if (promises.length === 0) {
        alert("Không có ô trống nào cần điền trong vùng đã chọn.");
      } else {
        await Promise.all(promises);
        alert(`Đã điền thành công cho ${promises.length} ô trống.`);
      }
    } catch (error) {
      alert("Có lỗi xảy ra (Có thể do mạng hoặc quyền hạn).");
    } finally {
      setBulkEditData(null);
      clearSelections();
      fetchData(currentDate);
    }
  };

  // --- KHÓA / HỦY KHÓA CÔNG ---
  const handleLockAction = async (lockStatus) => {
    const actionText = lockStatus ? "KHÓA" : "HỦY KHÓA";
    if (
      !window.confirm(
        `Bạn có chắc muốn ${actionText} bảng công tháng ${
          currentDate.getMonth() + 1
        }/${currentDate.getFullYear()}?`,
      )
    )
      return;

    try {
      await api.post("/ChamCong/lock-action", {
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1,
        isLocked: lockStatus,
      });
      alert(`Đã ${actionText.toLowerCase()} bảng công thành công!`);
      fetchData(currentDate);
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        `Lỗi khi ${actionText.toLowerCase()} công.`;
      alert(msg);
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
            <h2>{`Tháng ${currentDate.getMonth() + 1}, ${currentDate.getFullYear()}`}</h2>
            <button onClick={() => changeMonth(1)}>
              <FaChevronRight />
            </button>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {isLocked && (
              <span
                style={{
                  color: "#e11d48",
                  fontWeight: "bold",
                  border: "1px solid #e11d48",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  backgroundColor: "#fff1f2",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "14px",
                }}
              >
                <FaLock size={12} /> ĐÃ KHÓA
              </span>
            )}

            {isAdmin && (
              <>
                {!isLocked ? (
                  <button
                    className="lock-btn"
                    style={{
                      backgroundColor: "#e11d48",
                      color: "white",
                      padding: "8px 16px",
                      borderRadius: "4px",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      cursor: "pointer",
                      fontWeight: "500",
                    }}
                    onClick={() => handleLockAction(true)}
                  >
                    <FaLock /> Khóa công
                  </button>
                ) : (
                  <button
                    className="unlock-btn"
                    style={{
                      backgroundColor: "#10b981",
                      color: "white",
                      padding: "8px 16px",
                      borderRadius: "4px",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      cursor: "pointer",
                      fontWeight: "500",
                    }}
                    onClick={() => handleLockAction(false)}
                  >
                    <FaUnlock /> Hủy khóa công
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div
          className="timekeeping-table-container"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {loading ? (
            <p style={{ padding: "20px" }}>Đang tải...</p>
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
                      style={{ cursor: canEdit ? "pointer" : "default" }}
                    >
                      {day}
                    </th>
                  ))}
                  <th className="summary-col">Tổng</th>
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
                        style={{ cursor: canEdit ? "pointer" : "default" }}
                      >
                        <div className="employee-info">
                          <span className="font-bold">{emp.hoTen}</span>
                          <br />
                          <span
                            style={{ color: "#f87171", opacity: 0.8 }}
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
                            onClick={() => handleCellClick(emp.maNhanVien, day)}
                            style={{
                              cursor: canEdit ? "pointer" : "not-allowed",
                            }}
                          >
                            <span>{style.text}</span>
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

      {editingCell && (
        <AttendanceModal
          cellData={editingCell}
          onSave={handleSave}
          onCancel={() => setEditingCell(null)}
          remainingLeave={summaries[editingCell.maNhanVien]?.remainingLeaveDays}
        />
      )}
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
