import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { api } from "../api";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../styles/PayrollPage.css";

const PayrollPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async (date) => {
    setLoading(true);
    setError("");
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      // Lấy đồng thời danh sách nhân viên và dữ liệu chấm công của tháng
      const [empRes, attendanceRes] = await Promise.all([
        api.get("/NhanVien"),
        api.get(`/ChamCong?year=${year}&month=${month}`),
      ]);

      const employees = empRes.data;
      const { summaries } = attendanceRes.data;

      // Kết hợp dữ liệu và tính toán lương
      const payrollData = employees.map((emp) => {
        const summary = summaries[emp.maNhanVien] || {
          tongCong: 0,
          nghiCoPhep: 0,
          lamNuaNgay: 0,
          nghiKhongPhep: 0,
        };

        // Công thức tính lương: (Tổng công * Lương cơ bản) / 26
        const calculatedSalary =
          (summary.tongCong * (emp.luongCoBan || 0)) / 26;

        return {
          ...emp,
          summary,
          calculatedSalary,
        };
      });

      setPayrolls(payrollData);
    } catch (err) {
      console.error("Lỗi tải dữ liệu bảng lương:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
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

  const handleSalaryChange = (maNhanVien, newLuongCoBan) => {
    setPayrolls((prevPayrolls) =>
      prevPayrolls.map((p) => {
        if (p.maNhanVien === maNhanVien) {
          const luongCoBan = parseFloat(newLuongCoBan) || 0;
          // Tự động tính toán lại lương thực nhận
          const calculatedSalary = (p.summary.tongCong * luongCoBan) / 26;
          return { ...p, luongCoBan, calculatedSalary };
        }
        return p;
      })
    );
  };

  // Hàm lưu bảng lương vào DB
  const handleSavePayroll = async () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    if (
      !window.confirm(
        `Bạn có chắc muốn chốt và lưu bảng lương cho tháng ${month}/${year}?`
      )
    ) {
      return;
    }

    // Chuẩn bị dữ liệu để gửi lên API
    const payload = payrolls.map((p) => ({
      maNhanVien: p.maNhanVien,
      thang: month,
      nam: year,
      luongCoBan: p.luongCoBan || 0,
      tongNgayCong: p.summary.tongCong,
      luongThucNhan: p.calculatedSalary,
    }));

    try {
      // Giả sử API để lưu là POST /api/BangLuong
      await api.post("/BangLuong/save", payload);
      alert(`Đã lưu thành công bảng lương tháng ${month}/${year}!`);
    } catch (err) {
      console.error("Lỗi lưu bảng lương:", err);
      alert("Đã xảy ra lỗi khi lưu bảng lương.");
    }
  };

  // Hàm định dạng tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="payroll-page-container">
        <h1>Quản lý Lương</h1>
        <div className="payroll-header">
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
          <button className="save-payroll-btn" onClick={handleSavePayroll}>
            Chốt Lương Tháng {currentDate.getMonth() + 1}
          </button>
        </div>

        {loading && <p>Đang tải dữ liệu...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && (
          <div className="payroll-table-container">
            <table className="payroll-table">
              <thead>
                <tr>
                  <th>Nhân viên</th>
                  <th>Tổng công</th>
                  <th>Nghỉ phép</th>
                  <th>Nửa ngày</th>
                  <th>Không phép</th>
                  <th>Lương cơ bản</th>
                  <th>Lương thực tế</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map((p) => (
                  <tr key={p.maNhanVien}>
                    <td>
                      <div className="employee-info">
                        <strong>{p.hoTen}</strong>
                        <span>{p.maNhanVien}</span>
                      </div>
                    </td>
                    <td>{p.summary.tongCong.toFixed(1)}</td>
                    <td>{p.summary.nghiCoPhep}</td>
                    <td>{p.summary.lamNuaNgay}</td>
                    <td>{p.summary.nghiKhongPhep}</td>
                    <td>
                      <input
                        type="number"
                        className="salary-input"
                        value={p.luongCoBan || ""}
                        onChange={(e) =>
                          handleSalaryChange(p.maNhanVien, e.target.value)
                        }
                        placeholder="Nhập lương..."
                      />
                    </td>
                    <td className="final-salary">
                      {formatCurrency(p.calculatedSalary)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PayrollPage;
