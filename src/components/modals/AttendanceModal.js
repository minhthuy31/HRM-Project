import React, { useState, useEffect } from "react";

const AttendanceModal = ({ cellData, onSave, onCancel }) => {
  // THAY ĐỔI: Giá trị mặc định là chuỗi rỗng thay vì 1.0
  const [ngayCong, setNgayCong] = useState("");
  const [ghiChu, setGhiChu] = useState("");

  useEffect(() => {
    // THAY ĐỔI: Nếu không có dữ liệu, state sẽ là chuỗi rỗng
    setNgayCong(cellData.ngayCong !== undefined ? cellData.ngayCong : "");
    setGhiChu(cellData.ghiChu || "");
  }, [cellData]);

  const handleSave = () => {
    // THAY ĐỔI: Thêm kiểm tra để đảm bảo người dùng đã chọn một giá trị
    if (ngayCong === "") {
      alert("Vui lòng chọn một trạng thái ngày công.");
      return;
    }

    onSave({
      ...cellData,
      ngayCong: parseFloat(ngayCong),
      ghiChu: ngayCong == 0.5 ? ghiChu : "",
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content attendance-modal">
        <div className="modal-header">
          <h2>Chỉnh sửa chấm công</h2>
          <button onClick={onCancel} className="modal-close-btn">
            &times;
          </button>
        </div>
        <div className="attendance-form">
          <div className="form-group">
            <label>Ngày công</label>
            <select
              value={ngayCong}
              onChange={(e) => setNgayCong(e.target.value)}
            >
              {/* THAY ĐỔI: Thêm lựa chọn mặc định, bị vô hiệu hóa */}
              <option value="" disabled>
                -- Chọn trạng thái --
              </option>
              <option value={1.0}>1.0 - Đi làm đủ</option>
              <option value={-0.5}>0.5 - Làm nửa ngày</option>
              <option value={0.5}>0.5 - Nghỉ có phép</option>
              <option value={0.0}>0.0 - Nghỉ không phép</option>
            </select>
          </div>

          {ngayCong == 0.5 && (
            <div className="form-group">
              <label>Lý do</label>
              <textarea
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
                rows="3"
                placeholder="Nhập lý do nghỉ..."
              />
            </div>
          )}
        </div>
        <div className="modal-actions">
          <button onClick={onCancel} className="cancel-btn">
            Hủy
          </button>
          <button onClick={handleSave} className="save-btn">
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceModal;
