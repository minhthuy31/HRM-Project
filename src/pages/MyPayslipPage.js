import React, { useState, useEffect, useCallback } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import { api } from "../api";
import {
  FaChevronLeft,
  FaChevronRight,
  FaPrint,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import "../styles/MyPayslipPage.css";

// Helper function to format currency
const formatCurrency = (value) => {
  if (value === undefined || value === null) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const MyPayslipPage = () => {
  const { employeeId } = useParams();
  const { employee } = useOutletContext(); // Get employee info from parent context

  const [currentDate, setCurrentDate] = useState(new Date());
  const [payslipData, setPayslipData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (date) => {
      if (!employeeId) return;
      setLoading(true);
      setError(null);
      setPayslipData(null);
      try {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        // Use the same API endpoint logic as the admin view but filtered for this employee
        // Ideally, you should have an endpoint like /BangLuong/{id}?year=...&month=...
        // If not, we can use the main one and find the specific record.
        // Assuming your backend supports fetching individual payroll:
        // Or if you use the general one: const response = await api.get(`/BangLuong?year=${year}&month=${month}`);
        // Let's assume you have a specific endpoint or logic to get single employee payroll.
        // Based on previous context, I will use the general endpoint and filter (not ideal for huge data but works for now)
        // OR better, if you implemented GetPayrollByEmployeeId in backend.

        // Let's try fetching the general payroll list and filtering for the current user
        // (This matches the admin view logic exactly)
        const response = await api.get(
          `/BangLuong?year=${year}&month=${month}`
        );

        const myRecord = response.data.find((r) => r.maNhanVien === employeeId);

        if (myRecord) {
          setPayslipData(myRecord);
        } else {
          // If no record found in the list, it might mean no data calculated yet
          setPayslipData(null);
        }
      } catch (err) {
        console.error("Error loading payslip:", err);
        setError("Không thể tải dữ liệu bảng lương.");
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
    if (!payslipData) {
      return (
        <div className="no-data-text">
          <FaFileInvoiceDollar
            size={40}
            color="#ccc"
            style={{ marginBottom: 10 }}
          />
          <p>
            Chưa có dữ liệu lương cho tháng {currentDate.getMonth() + 1}/
            {currentDate.getFullYear()}.
          </p>
        </div>
      );
    }

    // Prepare data for rendering (aligning with Admin View)
    const {
      luongCoBan,
      tongPhuCap,
      tongNgayCong,
      tongGioOT,
      luongChinh,
      luongOT,
      khauTruBHXH,
      khauTruBHYT,
      khauTruBHTN,
      khoanTruKhac,
      tongThuNhap,
      thucLanh,
      nghiCoPhep,
      nghiKhongPhep,
      lamNuaNgay,
    } = payslipData;

    const totalInsurance =
      (khauTruBHXH || 0) + (khauTruBHYT || 0) + (khauTruBHTN || 0);

    return (
      <div className="payslip-container">
        <div className="payslip-header-section">
          <div className="company-info">
            <h2>PHIẾU LƯƠNG</h2>
            <p className="period">
              Tháng {currentDate.getMonth() + 1} năm {currentDate.getFullYear()}
            </p>
          </div>
          <div className="emp-info-grid">
            <div className="info-row">
              <span className="label">Họ tên:</span>
              <span className="val">{employee?.hoTen}</span>
            </div>
            <div className="info-row">
              <span className="label">Mã NV:</span>
              <span className="val">{employeeId}</span>
            </div>
            <div className="info-row">
              <span className="label">Phòng ban:</span>
              <span className="val">{employee?.tenPhongBan || "---"}</span>
            </div>
            <div className="info-row">
              <span className="label">Chức vụ:</span>
              <span className="val">{employee?.tenChucVu || "---"}</span>
            </div>
          </div>
        </div>

        <div className="payslip-body">
          {/* 1. THU NHẬP */}
          <div className="section-block">
            <h4 className="section-title text-green">I. THU NHẬP</h4>
            <div className="detail-row">
              <span>Lương Cơ Bản</span>
              <span className="amount">{formatCurrency(luongCoBan)}</span>
            </div>
            <div className="detail-row">
              <span>Lương Trợ Cấp (Phụ Cấp)</span>
              <span className="amount">{formatCurrency(tongPhuCap)}</span>
            </div>
            <div className="detail-row highlight-bg">
              <span>Lương Chính (Theo {tongNgayCong} ngày công)</span>
              <span className="amount bold">{formatCurrency(luongChinh)}</span>
            </div>
            <div className="detail-row">
              <span>Lương OT ({tongGioOT} giờ)</span>
              <span className="amount">{formatCurrency(luongOT)}</span>
            </div>
            <div className="detail-row total-row">
              <span>TỔNG THU NHẬP</span>
              <span className="amount text-green">
                {formatCurrency(tongThuNhap)}
              </span>
            </div>
          </div>

          {/* 2. KHẤU TRỪ */}
          <div className="section-block">
            <h4 className="section-title text-red">II. CÁC KHOẢN KHẤU TRỪ</h4>
            <div className="detail-row">
              <span>BHXH (8%)</span>
              <span className="amount">{formatCurrency(khauTruBHXH)}</span>
            </div>
            <div className="detail-row">
              <span>BHYT (1.5%)</span>
              <span className="amount">{formatCurrency(khauTruBHYT)}</span>
            </div>
            <div className="detail-row">
              <span>BHTN (1%)</span>
              <span className="amount">{formatCurrency(khauTruBHTN)}</span>
            </div>
            <div className="detail-row">
              <span>Khấu trừ khác</span>
              <span className="amount">{formatCurrency(khoanTruKhac)}</span>
            </div>
            <div className="detail-row total-row">
              <span>TỔNG KHẤU TRỪ</span>
              <span className="amount text-red">
                {formatCurrency(totalInsurance + (khoanTruKhac || 0))}
              </span>
            </div>
          </div>

          {/* 3. THÔNG TIN CÔNG (THAM KHẢO) */}
          <div className="section-block info-only">
            <h4 className="section-title text-blue">
              III. THÔNG TIN CHẤM CÔNG
            </h4>
            <div className="attendance-grid">
              <div className="att-item">
                <span className="lbl">Tổng Công</span>
                <span className="val">{tongNgayCong}</span>
              </div>
              <div className="att-item">
                <span className="lbl">Nghỉ Phép</span>
                <span className="val">{nghiCoPhep}</span>
              </div>
              <div className="att-item">
                <span className="lbl">Không Phép</span>
                <span className="val">{nghiKhongPhep}</span>
              </div>
              <div className="att-item">
                <span className="lbl">Nửa Ngày</span>
                <span className="val">{lamNuaNgay}</span>
              </div>
              <div className="att-item">
                <span className="lbl">Giờ OT</span>
                <span className="val">{tongGioOT}</span>
              </div>
            </div>
          </div>

          {/* 4. THỰC LĨNH */}
          <div className="net-salary-section">
            <div className="net-label">THỰC LĨNH (Net Salary)</div>
            <div className="net-amount">{formatCurrency(thucLanh)}</div>
          </div>
        </div>

        <div className="payslip-footer">
          <p className="note">
            * Mọi thắc mắc về lương vui lòng liên hệ phòng Kế toán trong vòng 3
            ngày kể từ ngày nhận phiếu.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="my-payslip-view">
      <div className="month-navigator-bar">
        <div className="month-navigator">
          <button onClick={() => changeMonth(-1)} disabled={loading}>
            <FaChevronLeft />
          </button>
          <h2>{`Tháng ${
            currentDate.getMonth() + 1
          }, ${currentDate.getFullYear()}`}</h2>
          <button onClick={() => changeMonth(1)} disabled={loading}>
            <FaChevronRight />
          </button>
        </div>
        <button
          className="print-btn"
          onClick={handlePrint}
          disabled={!payslipData}
        >
          <FaPrint /> In Phiếu
        </button>
      </div>

      {renderContent()}
    </div>
  );
};

export default MyPayslipPage;
