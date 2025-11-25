import React, { useState, useEffect } from "react";
import "../../styles/Modal.css";

// Thêm prop `remainingLeaveDays`
const LeaveRequestModal = ({ onSave, onCancel, remainingLeaveDays }) => {
  const today = new Date().toISOString().split("T")[0];
  const [ngayBatDau, setNgayBatDau] = useState(today);
  const [ngayKetThuc, setNgayKetThuc] = useState(today);
  const [soNgayNghi, setSoNgayNghi] = useState(1);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");

  const predefinedReasons = [
    "Nghỉ ốm",
    "Nghỉ việc gia đình",
    "Nghỉ phép năm",
    "Khác (ghi rõ lý do)",
  ];

  // Tính toán số ngày nghỉ mỗi khi ngày bắt đầu/kết thúc thay đổi
  useEffect(() => {
    try {
      const start = new Date(ngayBatDau);
      const end = new Date(ngayKetThuc);

      if (end < start) {
        setError("Ngày kết thúc không thể trước ngày bắt đầu.");
        setSoNgayNghi(0);
        return;
      }

      // Tính số ngày (bao gồm cả ngày bắt đầu và kết thúc)
      const timeDiff = end.getTime() - start.getTime();
      const dayDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24)) + 1;

      setSoNgayNghi(dayDiff);
      setError(""); // Xóa lỗi nếu ngày hợp lệ
    } catch (e) {
      setSoNgayNghi(0); // Lỗi nếu ngày không hợp lệ
    }
  }, [ngayBatDau, ngayKetThuc]);

  const handleReasonChange = (e) => {
    setSelectedReason(e.target.value);
    if (e.target.value !== "Khác (ghi rõ lý do)") {
      setCustomReason(""); // Sửa lỗi: Cần gọi setCustomReason
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = () => {
    if (!ngayBatDau || !ngayKetThuc) {
      setError("Vui lòng chọn ngày bắt đầu và kết thúc.");
      return;
    }
    if (soNgayNghi <= 0) {
      setError("Ngày kết thúc không thể trước ngày bắt đầu.");
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

    // Kiểm tra số ngày phép còn lại (chỉ khi chọn "Nghỉ phép năm")
    if (selectedReason === "Nghỉ phép năm") {
      if (remainingLeaveDays === undefined) {
        setError("Không thể lấy được số ngày phép. Vui lòng thử lại.");
        return;
      }
      if (soNgayNghi > remainingLeaveDays) {
        setError(
          `Bạn chỉ còn ${remainingLeaveDays} ngày phép. Không thể xin nghỉ ${soNgayNghi} ngày.`
        );
        return;
      }
    }

    setError("");

    // Gửi object chứa tất cả dữ liệu về cho component cha (EmployeeHomePage)
    onSave({
      ngayBatDau,
      ngayKetThuc,
      lyDo: finalReason,
      soNgayNghi,
      file: selectedFile,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Đăng ký nghỉ phép</h2>

        {error && <div className="modal-error">{error}</div>}

        {/* Hiển thị số ngày phép còn lại */}
        <div
          className="leave-balance-info"
          style={{
            marginBottom: "15px",
            color: "#17a2b8",
            fontWeight: "bold",
          }}
        >
          Số ngày phép năm còn lại:
          <strong>
            {remainingLeaveDays !== undefined
              ? ` ${remainingLeaveDays} ngày`
              : "Đang tải..."}
          </strong>
        </div>

        {/* Form chọn ngày */}
        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="leave-start-date">Từ ngày (*)</label>
            <input
              id="leave-start-date"
              type="date"
              value={ngayBatDau}
              onChange={(e) => setNgayBatDau(e.target.value)}
              min={today} // Không cho chọn ngày quá khứ
            />
          </div>
          <div className="form-group">
            <label htmlFor="leave-end-date">Đến ngày (*)</label>
            <input
              id="leave-end-date"
              type="date"
              value={ngayKetThuc}
              onChange={(e) => setNgayKetThuc(e.target.value)}
              min={ngayBatDau} // Không cho chọn ngày trước ngày bắt đầu
            />
          </div>
        </div>

        {/* Hiển thị số ngày đã tính */}
        <div className="form-group">
          <label>Tổng số ngày nghỉ:</label>
          <input
            type="text"
            value={`${soNgayNghi} ngày`}
            disabled // Tự động tính, không cho sửa
            style={{ backgroundColor: "#f4f4f4", fontWeight: "bold" }}
          />
        </div>

        {/* Chọn lý do */}
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

        {/* Lý do tùy chỉnh */}
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

        {/* Tệp đính kèm */}
        <div className="form-group">
          <label htmlFor="leave-attachment">Tệp đính kèm (nếu có)</label>
          <input
            id="leave-attachment"
            type="file"
            onChange={handleFileChange}
          />
        </div>

        {/* Nút bấm */}
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
