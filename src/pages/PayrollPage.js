import React, { useState, useEffect, useCallback, useRef } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { api } from "../api";
import {
  FaChevronLeft,
  FaChevronRight,
  FaFileExcel,
  FaSave,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import "../styles/PayrollPage.css";

const PayrollPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. TẢI DỮ LIỆU
  const fetchData = useCallback(async (date) => {
    setLoading(true);
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const response = await api.get(`/BangLuong?year=${year}&month=${month}`);

      const mappedData = response.data.map((item) => ({
        ...item,
        luongCoBan: item.luongCoBan || 0,
        tongPhuCap: item.tongPhuCap || 0,
        tongNgayCong: item.tongNgayCong || 0,
        tongGioOT: item.tongGioOT || 0,
        khoanTruKhac: item.khoanTruKhac || 0,
        // Dữ liệu chi tiết
        nghiCoPhep: item.nghiCoPhep || 0,
        nghiKhongPhep: item.nghiKhongPhep || 0,
        lamNuaNgay: item.lamNuaNgay || 0,
        khauTruBHXH: item.khauTruBHXH || 0,
        khauTruBHYT: item.khauTruBHYT || 0,
        khauTruBHTN: item.khauTruBHTN || 0,
      }));
      setPayrolls(mappedData);
    } catch (err) {
      alert("Lỗi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(currentDate);
  }, [currentDate, fetchData]);

  const changeMonth = (offset) =>
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1)
    );

  // 2. TÍNH TOÁN LẠI (CLIENT-SIDE)
  const recalculateRow = (record) => {
    const parse = (val) =>
      parseFloat(val?.toString().replace(/[^0-9.-]+/g, "")) || 0;
    const luongCoBan = parse(record.luongCoBan);
    const phuCap = parse(record.tongPhuCap);
    const khoanTruKhac = parse(record.khoanTruKhac);
    const ngayCong = parseFloat(record.tongNgayCong) || 0;
    const gioOT = parseFloat(record.tongGioOT) || 0;

    const luongChinh = (luongCoBan / 26) * ngayCong;
    const luongOT = (luongCoBan / 26 / 8) * 1.5 * gioOT;
    const bhxh = luongCoBan * 0.08;
    const bhyt = luongCoBan * 0.015;
    const bhtn = luongCoBan * 0.01;

    const tongThuNhap = luongChinh + luongOT + phuCap;
    const thucLanh = tongThuNhap - (bhxh + bhyt + bhtn) - khoanTruKhac;

    return {
      ...record,
      luongChinh: Math.round(luongChinh),
      luongOT: Math.round(luongOT),
      khauTruBHXH: Math.round(bhxh),
      khauTruBHYT: Math.round(bhyt),
      khauTruBHTN: Math.round(bhtn),
      tongThuNhap: Math.round(tongThuNhap),
      thucLanh: Math.round(thucLanh),
      khoanTruKhac: khoanTruKhac,
    };
  };

  const handleCurrencyInput = (maNhanVien, value) => {
    const numericValue = value.replace(/\D/g, "");
    setPayrolls((prev) =>
      prev.map((p) =>
        p.maNhanVien === maNhanVien
          ? recalculateRow({ ...p, khoanTruKhac: numericValue })
          : p
      )
    );
  };

  const formatMoney = (val) => new Intl.NumberFormat("vi-VN").format(val || 0);

  // 3. LƯU DỮ LIỆU
  const handleSavePayroll = async () => {
    if (!window.confirm("Xác nhận lưu bảng lương?")) return;
    try {
      const payload = payrolls.map((p) => ({
        ...p,
        khoanTruKhac:
          parseFloat(p.khoanTruKhac.toString().replace(/\D/g, "")) || 0,
      }));
      await api.post("/BangLuong/save", payload);
      alert("Lưu thành công!");
      fetchData(currentDate);
    } catch (err) {
      alert("Lỗi khi lưu.");
    }
  };

  const handleExportExcel = () => {
    const data = payrolls.map((p) => ({
      "Mã NV": p.maNhanVien,
      "Họ Tên": p.nhanVien?.hoTen,
      "Lương CB": p.luongCoBan,
      "Phụ Cấp": p.tongPhuCap,
      "Tổng Công": p.tongNgayCong,
      "Nghỉ Phép": p.nghiCoPhep,
      "Không Phép": p.nghiKhongPhep,
      BHXH: p.khauTruBHXH,
      BHYT: p.khauTruBHYT,
      BHTN: p.khauTruBHTN,
      "Thực Lĩnh": p.thucLanh,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BangLuong");
    XLSX.writeFile(wb, "BangLuong.xlsx");
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
            <h2>
              Tháng {currentDate.getMonth() + 1}/{currentDate.getFullYear()}
            </h2>
            <button onClick={() => changeMonth(1)}>
              <FaChevronRight />
            </button>
          </div>
          <div className="header-actions">
            <button className="export-excel-btn" onClick={handleExportExcel}>
              <FaFileExcel /> Xuất
            </button>
            <button className="save-payroll-btn" onClick={handleSavePayroll}>
              <FaSave /> Lưu
            </button>
          </div>
        </div>

        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="payroll-table-wrapper">
            <div className="payroll-table-scroll">
              <table className="payroll-table">
                <thead>
                  {/* GROUP HEADER */}
                  <tr>
                    <th rowSpan={2} className="sticky-col first-col">
                      Nhân viên
                    </th>
                    <th colSpan={3} className="group-header bg-gray">
                      Thu Nhập Cố Định
                    </th>
                    <th colSpan={5} className="group-header bg-blue-light">
                      Chi Tiết Chấm Công
                    </th>
                    <th colSpan={3} className="group-header bg-green-light">
                      Thu Nhập Biến Đổi
                    </th>
                    <th colSpan={4} className="group-header bg-red-light">
                      Khấu Trừ & Bảo Hiểm
                    </th>
                    <th rowSpan={2} className="sticky-col last-col">
                      Thực Lĩnh
                    </th>
                  </tr>
                  {/* DETAIL HEADER */}
                  <tr>
                    <th className="sub-th">Lương CB</th>
                    <th className="sub-th">Phụ Cấp</th>
                    <th className="sub-th">Tổng CĐ</th>
                    {/* Tách cột chấm công */}
                    <th className="sub-th highlight-blue">Tổng Công</th>
                    <th className="sub-th">Nghỉ Phép</th>
                    <th className="sub-th">Không Phép</th>
                    <th className="sub-th">Nửa Ngày</th>
                    <th className="sub-th highlight-purple">Giờ OT</th>
                    {/* Biến đổi */}
                    <th className="sub-th">Lương Chính</th>
                    <th className="sub-th">Lương OT</th>
                    <th className="sub-th highlight-green">Tổng TN</th>
                    {/* Tách cột bảo hiểm */}
                    <th className="sub-th">BHXH (8%)</th>
                    <th className="sub-th">BHYT (1.5%)</th>
                    <th className="sub-th">BHTN (1%)</th>
                    <th className="sub-th bg-yellow-light">Khác (Sửa)</th>
                  </tr>
                </thead>
                <tbody>
                  {payrolls.map((p) => (
                    <tr key={p.maNhanVien}>
                      <td className="sticky-col first-col">
                        <div className="employee-info">
                          <strong>{p.nhanVien?.hoTen}</strong>
                          <span>{p.maNhanVien}</span>
                        </div>
                      </td>
                      <td className="text-right">
                        {formatMoney(p.luongCoBan)}
                      </td>
                      <td className="text-right">
                        {formatMoney(p.tongPhuCap)}
                      </td>
                      <td className="text-right text-muted">
                        {formatMoney((p.luongCoBan || 0) + (p.tongPhuCap || 0))}
                      </td>

                      {/* Cột chấm công tách biệt */}
                      <td className="text-center font-bold text-blue bg-blue-fade">
                        {p.tongNgayCong}
                      </td>
                      <td className="text-center text-orange">
                        {p.nghiCoPhep}
                      </td>
                      <td className="text-center text-red font-bold">
                        {p.nghiKhongPhep}
                      </td>
                      <td className="text-center text-gray">{p.lamNuaNgay}</td>
                      <td className="text-center font-bold text-purple">
                        {p.tongGioOT}
                      </td>

                      <td className="text-right">
                        {formatMoney(p.luongChinh)}
                      </td>
                      <td className="text-right">{formatMoney(p.luongOT)}</td>
                      <td className="text-right font-bold text-green bg-green-fade">
                        {formatMoney(p.tongThuNhap)}
                      </td>

                      {/* Cột bảo hiểm tách biệt */}
                      <td className="text-right text-sm">
                        {formatMoney(p.khauTruBHXH)}
                      </td>
                      <td className="text-right text-sm">
                        {formatMoney(p.khauTruBHYT)}
                      </td>
                      <td className="text-right text-sm">
                        {formatMoney(p.khauTruBHTN)}
                      </td>
                      <td className="bg-yellow-fade">
                        <input
                          className="salary-input"
                          value={
                            p.khoanTruKhac ? formatMoney(p.khoanTruKhac) : ""
                          }
                          onChange={(e) =>
                            handleCurrencyInput(p.maNhanVien, e.target.value)
                          }
                          placeholder="0"
                        />
                      </td>
                      <td className="sticky-col last-col final-salary text-right">
                        {formatMoney(p.thucLanh)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PayrollPage;
