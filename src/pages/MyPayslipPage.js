import React, { useState, useEffect, useCallback } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import { api } from "../api";
import { FaChevronLeft, FaChevronRight, FaPrint } from "react-icons/fa";
import "../styles/MyPayslipPage.css";

// Hàm format tiền tệ
const formatCurrency = (value) => {
  if (typeof value !== "number") {
    value = 0;
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

// Hàm chuyển đổi DayOfWeek
const getDayOfWeekVietnamese = (dayOfWeek) => {
  const days = {
    Sunday: "Chủ Nhật",
    Monday: "Thứ Hai",
    Tuesday: "Thứ Ba",
    Wednesday: "Thứ Tư",
    Thursday: "Thứ Năm",
    Friday: "Thứ Sáu",
    Saturday: "Thứ Bảy",
  };
  return days[dayOfWeek] || dayOfWeek;
};

const MyPayslipPage = () => {
  const { employeeId } = useParams();
  const { employee } = useOutletContext(); // Lấy thông tin nhân viên từ layout cha

  const [currentDate, setCurrentDate] = useState(new Date());
  const [payslipDetail, setPayslipDetail] = useState(null); // State mới
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (date) => {
      if (!employeeId) return;
      setLoading(true);
      setError(null);
      setPayslipDetail(null);
      try {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        // Gọi API mới
        const response = await api.get(
          `/BangLuong/${employeeId}?year=${year}&month=${month}`
        );
        setPayslipDetail(response.data);
      } catch (err) {
        console.error("Lỗi tải bảng lương:", err);
        setError(
          err.response?.data?.message || "Không thể tải dữ liệu bảng lương."
        );
      } finally {
        setLoading(false);
      }
    },
    [employeeId]
  );

  useEffect(() => {
    fetchData(currentDate);
  }, [currentDate, fetchData]);

  const changeMonth = (offset) => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1)
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const renderContent = () => {
    if (loading) {
      return <div className="loading-text">Đang tải bảng lương...</div>;
    }
    if (error) {
      return <div className="error-text">{error}</div>;
    }
    if (!payslipDetail || !payslipDetail.payslip) {
      return (
        <div className="no-data-text">
          Không có dữ liệu lương cho tháng này.
        </div>
      );
    }

    const { payslip, details } = payslipDetail;

    return (
      <div className="payslip-content">
        <div className="payslip-header">
          <h3>
            BẢNG LƯƠNG THÁNG {payslip.thang}/{payslip.nam}
          </h3>
        </div>

        <div className="payslip-info">
          <p>
            <strong>Nhân viên:</strong> {employee?.hoTen}
          </p>
          <p>
            <strong>Mã NV:</strong> {employee?.maNhanVien}
          </p>
          <p>
            <strong>Chức vụ:</strong> {employee?.tenChucVu}
          </p>
          <p>
            <strong>Phòng ban:</strong> {employee?.tenPhongBan}
          </p>
        </div>

        {/* PHẦN TÓM TẮT LƯƠNG (ĐƠN GIẢN) */}
        <div className="payslip-simple-summary">
          <div className="summary-item">
            <span>Lương Cơ Bản</span>
            <span className="value">{formatCurrency(payslip.luongCoBan)}</span>
          </div>
          <div className="summary-item">
            <span>Tổng Ngày Công</span>
            <span className="value">{payslip.tongNgayCong.toFixed(1)}</span>
          </div>
          <div className="summary-item total">
            <span>Lương Thực Nhận</span>
            <span className="value total-value">
              {formatCurrency(payslip.luongThucNhan)}
            </span>
          </div>
        </div>

        {/* PHẦN CHI TIẾT NGÀY CÔNG */}
        <div className="payslip-details-list">
          <h4>Chi Tiết Chấm Công</h4>
          <table className="details-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Thứ</th>
                <th>Công</th>
                <th>Ghi Chú / Lý Do</th>
              </tr>
            </thead>
            <tbody>
              {details && details.length > 0 ? (
                details.map((rec) => (
                  <tr
                    key={rec.day}
                    className={`day-record day-record-${rec.ngayCong}`}
                  >
                    <td>
                      {rec.day}/{payslip.thang}
                    </td>
                    <td>{getDayOfWeekVietnamese(rec.dayOfWeek)}</td>
                    <td>{rec.ngayCong.toFixed(1)}</td>
                    <td className="record-note">{rec.ghiChu || "---"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">Chưa có dữ liệu chấm công chi tiết.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="my-payslip-view">
      {/* Bộ điều hướng tháng */}
      <div className="month-navigator-bar">
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
        <button className="print-btn" onClick={handlePrint}>
          <FaPrint /> In phiếu lương
        </button>
      </div>

      {/* Nội dung bảng lương */}
      {renderContent()}
    </div>
  );
};

export default MyPayslipPage;
