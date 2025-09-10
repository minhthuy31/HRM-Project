import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

const AttendanceModal = ({ cellData, onSave, onCancel }) => {
  const [editData, setEditData] = useState({
    trangThai: "",
    gioVao: "",
    gioRa: "",
  });

  useEffect(() => {
    setEditData({
      trangThai: cellData.status || "",
      // Chuyển đổi định dạng HH:mm:ss sang HH:mm để input nhận
      gioVao: cellData.gioVao ? cellData.gioVao.substring(0, 5) : "",
      gioRa: cellData.gioRa ? cellData.gioRa.substring(0, 5) : "",
    });
  }, [cellData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(editData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content attendance-modal">
        <div className="modal-header">
          <h3>
            Chấm công ngày {cellData.day}/{cellData.month}
          </h3>
          <button onClick={onCancel} className="modal-close-btn">
            <FaTimes />
          </button>
        </div>
        <div className="attendance-form">
          <div className="form-group">
            <label>Trạng thái</label>
            <select
              name="trangThai"
              value={editData.trangThai}
              onChange={handleChange}
            >
              <option value="">-- Bỏ trống --</option>
              <option value="Đi làm">Đi làm</option>
              <option value="Nghỉ phép">Nghỉ phép</option>
              <option value="Vắng">Vắng</option>
            </select>
          </div>
          <div className="form-group">
            <label>Giờ vào</label>
            <input
              type="time"
              name="gioVao"
              value={editData.gioVao}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Giờ ra</label>
            <input
              type="time"
              name="gioRa"
              value={editData.gioRa}
              onChange={handleChange}
            />
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
    </div>
  );
};

export default AttendanceModal;
