import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { api } from "../api";
import { FaChevronLeft, FaChevronRight, FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
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

      const [empRes, attendanceRes, savedPayrollRes] = await Promise.all([
        api.get("/NhanVien"),
        api.get(`/ChamCong?year=${year}&month=${month}`),
        api.get(`/BangLuong?year=${year}&month=${month}`),
      ]);

      const employees = empRes.data;
      const { summaries } = attendanceRes.data;
      const savedPayrolls = savedPayrollRes.data || [];

      // Tạo map để tra cứu nhanh hơn
      const savedPayrollMap = new Map();
      savedPayrolls.forEach((p) => savedPayrollMap.set(p.maNhanVien, p));

      const payrollData = employees.map((emp) => {
        const summary = summaries[emp.maNhanVien] || {
          tongCong: 0,
          nghiCoPhep: 0,
          lamNuaNgay: 0,
          nghiKhongPhep: 0,
        };

        const savedRecord = savedPayrollMap.get(emp.maNhanVien);

        const luongCoBan = savedRecord
          ? savedRecord.luongCoBan
          : emp.luongCoBan || 0;

        const calculatedSalary = (summary.tongCong * luongCoBan) / 26;

        return {
          ...emp,
          luongCoBan: luongCoBan,
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
          const calculatedSalary = (p.summary.tongCong * luongCoBan) / 26;
          return { ...p, luongCoBan, calculatedSalary };
        }
        return p;
      })
    );
  };

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

    setLoading(true);
    const payload = payrolls.map((p) => ({
      maNhanVien: p.maNhanVien,
      thang: month,
      nam: year,
      luongCoBan: p.luongCoBan || 0,
      tongNgayCong: p.summary.tongCong,
      luongThucNhan: p.calculatedSalary,
    }));

    try {
      await api.post("/BangLuong/save", payload);
      alert(`Đã lưu thành công bảng lương tháng ${month}/${year}!`);
      // Tải lại dữ liệu sau khi lưu
      fetchData(currentDate);
    } catch (err) {
      console.error("Lỗi lưu bảng lương:", err);
      alert("Đã xảy ra lỗi khi lưu bảng lương.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const dataToExport = payrolls.map((p) => ({
      "Mã Nhân Viên": p.maNhanVien,
      "Họ Tên": p.hoTen,
      "Chức Vụ": p.tenChucVu, // <-- ĐÃ THÊM
      "Tổng Công": p.summary.tongCong.toFixed(1),
      "Nghỉ Phép": p.summary.nghiCoPhep,
      "Nửa Ngày": p.summary.lamNuaNgay,
      "Không Phép": p.summary.nghiKhongPhep,
      "Lương Cơ Bản": p.luongCoBan,
      "Lương Thực Tế": p.calculatedSalary,
    }));

    // Căn chỉnh độ rộng cột
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const cols = [
      { wch: 15 }, // Mã Nhân Viên
      { wch: 25 }, // Họ Tên
      { wch: 20 }, // Chức Vụ (MỚI)
      { wch: 12 }, // Tổng Công
      { wch: 12 }, // Nghỉ Phép
      { wch: 12 }, // Nửa Ngày
      { wch: 12 }, // Không Phép
      { wch: 18 }, // Lương Cơ Bản
      { wch: 18 }, // Lương Thực Tế
    ];
    ws["!cols"] = cols;

    // Tạo workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      ws,
      `BangLuong_T${currentDate.getMonth() + 1}`
    );

    // Tạo file
    const fileName = `BangLuong_T${
      currentDate.getMonth() + 1
    }_${currentDate.getFullYear()}.xlsx`;
    XLSX.writeFile(wb, fileName);
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
          <div className="header-actions">
            <button
              className="export-excel-btn"
              onClick={handleExportExcel}
              disabled={loading || payrolls.length === 0}
            >
              <FaFileExcel /> Xuất Excel
            </button>
            <button
              className="save-payroll-btn"
              onClick={handleSavePayroll}
              disabled={loading}
            >
              Chốt Lương Tháng {currentDate.getMonth() + 1}
            </button>
          </div>
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
                  <th>Lương thực tế</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map((p) => (
                  <tr key={p.maNhanVien}>
                    <td>
                      <div className="employee-info">
                        <strong>{p.hoTen}</strong>
                        <span>{p.tenChucVu}</span>
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
