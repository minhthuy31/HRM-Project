import React, { useState } from "react";
import "../../styles/Modal.css";

const LeaveRequestModal = ({ onSave, onCancel }) => {
  const [ngayNghi, setNgayNghi] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [error, setError] = useState("");

  const predefinedReasons = [
    "Nghỉ ốm",
    "Nghỉ việc gia đình",
    "Nghỉ phép năm",
    "Khác (ghi rõ lý do)",
  ];

  const handleReasonChange = (e) => {
    setSelectedReason(e.target.value);
    if (e.target.value !== "Khác (ghi rõ lý do)") {
      setCustomReason("");
    }
  };

  const handleSubmit = () => {
    if (!ngayNghi) {
      setError("Vui lòng chọn ngày nghỉ.");
      return;
    }

    let finalReason = selectedReason;
    if (selectedReason === "Khác (ghi rõ lý do)") {
      if (!customReason.trim()) {
        setError("Vui lòng điền lý do cụ thể.");
        return;
      }
      finalReason = customReason.trim();
    }

    if (!finalReason) {
      setError("Vui lòng chọn hoặc nhập lý do nghỉ.");
      return;
    }

    setError("");

    onSave({
      ngayNghi,
      lyDo: finalReason,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Đăng ký nghỉ phép</h2>

        {error && <div className="modal-error">{error}</div>}

        <div className="form-group">
          <label htmlFor="leave-date">Chọn ngày nghỉ (*)</label>
          <input
            id="leave-date"
            type="date"
            value={ngayNghi}
            onChange={(e) => setNgayNghi(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="leave-reason">Lý do nghỉ (*)</label>
          <select
            id="leave-reason"
            value={selectedReason}
            onChange={handleReasonChange}
          >
            <option value="" disabled>
              -- Chọn lý do --
            </option>
            {predefinedReasons.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </div>

        {/* Chỉ hiển thị ô nhập liệu khi chọn "Khác" */}
        {selectedReason === "Khác (ghi rõ lý do)" && (
          <div className="form-group">
            <label htmlFor="custom-reason">Vui lòng ghi rõ lý do (*)</label>
            <textarea
              id="custom-reason"
              rows="3"
              placeholder="Nhập lý do cụ thể..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
            ></textarea>
          </div>
        )}

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onCancel}>
            Hủy
          </button>
          <button className="save-btn" onClick={handleSubmit}>
            Gửi đơn
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestModal;
