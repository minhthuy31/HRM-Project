import React, { useState } from "react";

const BulkEditModal = ({ onSave, onCancel }) => {
  const [ngayCong, setNgayCong] = useState("");

  const handleSave = () => {
    if (ngayCong === "") {
      alert("Vui lòng chọn một trạng thái để áp dụng.");
      return;
    }
    onSave({
      ngayCong: parseFloat(ngayCong),
      // Ghi chú sẽ được xử lý riêng nếu cần
    });
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content attendance-modal"
        style={{ maxWidth: "400px" }}
      >
        <div className="modal-header">
          <h2>Áp dụng hàng loạt</h2>
          <button onClick={onCancel} className="modal-close-btn">
            &times;
          </button>
        </div>
        <div className="attendance-form">
          <div className="form-group">
            <label>Chọn giá trị để điền</label>
            <select
              value={ngayCong}
              onChange={(e) => setNgayCong(e.target.value)}
            >
              <option value="" disabled>
                -- Chọn trạng thái --
              </option>
              <option value={1.0}>1.0 - Đi làm đủ</option>
              <option value={-0.5}>-0.5 - Làm nửa ngày</option>
              <option value={0.5}>0.5 - Nghỉ có phép (Không kèm lý do)</option>
              <option value={0.0}>0.0 - Nghỉ không phép</option>
            </select>
          </div>
        </div>
        <div className="modal-actions">
          <button onClick={onCancel} className="cancel-btn">
            Hủy
          </button>
          <button onClick={handleSave} className="save-btn">
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkEditModal;
