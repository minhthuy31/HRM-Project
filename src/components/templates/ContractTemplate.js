import React from "react";
import { FaPrint, FaTimes, FaFileContract } from "react-icons/fa";
import "../../styles/ContractTemplate.css";

const ContractTemplate = ({ data, onClose }) => {
  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  // Helper format ngày tháng năm (dd/MM/yyyy)
  const formatDate = (d) => {
    if (!d) return "...../...../.......";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "...../...../.......";

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Helper lấy ngày hiện tại để điền vào phần đầu hợp đồng
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  // Helper format tiền tệ
  const formatMoney = (val) =>
    val ? new Intl.NumberFormat("vi-VN").format(val) : "................";

  return (
    <div className="contract-preview-overlay">
      {/* --- TOOLBAR --- */}
      <div className="preview-toolbar">
        <div className="preview-title">
          <FaFileContract style={{ marginRight: "10px" }} />
          Hợp đồng số: <strong>{data.soHopDong || data.SoHopDong}</strong>
        </div>
        <div className="toolbar-actions">
          <button className="btn-action btn-print" onClick={handlePrint}>
            <FaPrint /> In Hợp Đồng
          </button>
          <button className="btn-action btn-close" onClick={onClose}>
            <FaTimes /> Đóng
          </button>
        </div>
      </div>

      {/* --- NỘI DUNG HỢP ĐỒNG (KHUNG CUỘN) --- */}
      <div className="preview-content-scroll">
        <div className="contract-paper">
          {/* 1. HEADER QUỐC HIỆU & TIÊU ĐỀ */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <div style={{ textAlign: "center", width: "45%" }}>
              <div
                style={{
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  fontSize: "11pt",
                }}
              >
                CÔNG TY CÔNG NGHỆ XYZ
              </div>
              <div style={{ fontSize: "11pt" }}>
                Số: {data.soHopDong || data.SoHopDong}
              </div>
            </div>
            <div style={{ textAlign: "center", width: "55%" }}>
              <div
                style={{
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  fontSize: "11pt",
                }}
              >
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </div>
              <div
                style={{
                  fontWeight: "bold",
                  borderBottom: "1px solid black",
                  display: "inline-block",
                  paddingBottom: "3px",
                  fontSize: "11pt",
                }}
              >
                Độc lập – Tự do – Hạnh phúc
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <h1
              style={{ fontSize: "18pt", fontWeight: "bold", margin: "15px 0" }}
            >
              HỢP ĐỒNG LAO ĐỘNG
            </h1>
          </div>

          {/* 2. CĂN CỨ */}
          <div
            style={{
              fontStyle: "italic",
              marginBottom: "15px",
              paddingLeft: "20px",
              fontSize: "11pt",
            }}
          >
            <div>- Căn cứ Bộ luật Lao động nước CHXHCN Việt Nam;</div>
            <div>- Căn cứ vào nhu cầu và khả năng của Các Bên.</div>
          </div>

          <div style={{ marginBottom: "15px", fontSize: "11pt" }}>
            Hôm nay, ngày {currentDay} tháng {currentMonth} năm {currentYear},
            tại Văn phòng Công ty XYZ, chúng tôi gồm có:
          </div>

          {/* 3. BÊN A (NGƯỜI SỬ DỤNG LAO ĐỘNG) */}
          <div className="c-section">
            <div style={{ fontWeight: "bold", fontSize: "11pt" }}>
              BÊN A (Người sử dụng lao động): CÔNG TY CÔNG NGHỆ XYZ
            </div>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "5px",
                fontSize: "11pt",
              }}
            >
              <tbody>
                <tr>
                  <td style={{ width: "140px" }}>Đại diện</td>
                  <td>
                    : <strong>Ông NGUYỄN VĂN GIÁM ĐỐC</strong>
                  </td>
                </tr>
                <tr>
                  <td>Chức vụ</td>
                  <td>: Giám Đốc</td>
                </tr>
                <tr>
                  <td>Địa chỉ</td>
                  <td>: Tầng 10, Tòa nhà Landmark, TP. Hồ Chí Minh</td>
                </tr>
                <tr>
                  <td>Điện thoại</td>
                  <td>: 028.9999.8888</td>
                </tr>
              </tbody>
            </table>
            <div
              style={{
                fontStyle: "italic",
                marginTop: "5px",
                fontSize: "10pt",
              }}
            >
              (Sau đây gọi tắt là “Công ty”)
            </div>
          </div>

          <div
            style={{
              textAlign: "center",
              margin: "10px 0",
              fontWeight: "bold",
            }}
          >
            VÀ
          </div>

          {/* 4. BÊN B (NGƯỜI LAO ĐỘNG) - CẬP NHẬT FULL THÔNG TIN */}
          <div className="c-section">
            <div style={{ fontWeight: "bold", fontSize: "11pt" }}>
              BÊN B (Người lao động): Ông/Bà{" "}
              {(data.HoTenNhanVien || data.hoTenNhanVien || "").toUpperCase()}
            </div>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "5px",
                fontSize: "11pt",
              }}
            >
              <tbody>
                <tr>
                  <td style={{ width: "140px" }}>Ngày sinh</td>
                  {/* Lấy dữ liệu Ngày Sinh */}
                  <td>: {formatDate(data.NgaySinh || data.ngaySinh)}</td>
                </tr>
                <tr>
                  <td>Số CCCD/CMND</td>
                  {/* Lấy dữ liệu CCCD */}
                  <td>
                    :{" "}
                    <strong>
                      {data.CCCD || data.cccd || "...................."}
                    </strong>
                  </td>
                </tr>
                <tr>
                  <td>Địa chỉ thường trú</td>
                  {/* Lấy dữ liệu Địa chỉ */}
                  <td>
                    : {data.DiaChi || data.diaChi || "...................."}
                  </td>
                </tr>
                <tr>
                  <td>Điện thoại</td>
                  {/* Lấy dữ liệu SĐT */}
                  <td>
                    :{" "}
                    {data.SoDienThoai ||
                      data.soDienThoai ||
                      "...................."}
                  </td>
                </tr>
              </tbody>
            </table>
            <div
              style={{
                fontStyle: "italic",
                marginTop: "5px",
                fontSize: "10pt",
              }}
            >
              (Sau đây gọi tắt là “Người lao động”)
            </div>
          </div>

          <div style={{ margin: "15px 0", fontSize: "11pt" }}>
            Hai bên thỏa thuận ký kết hợp đồng lao động và cam kết thực hiện
            đúng những điều khoản sau đây:
          </div>

          {/* 5. NỘI DUNG CHI TIẾT */}

          {/* ĐIỀU 1 */}
          <div
            className="c-article"
            style={{ marginBottom: "15px", fontSize: "11pt" }}
          >
            <div style={{ fontWeight: "bold", textTransform: "uppercase" }}>
              Điều 1: Thời hạn và công việc
            </div>
            <div>
              <strong>1.1. Loại hợp đồng:</strong>{" "}
              {data.LoaiHopDong || data.loaiHopDong}.
            </div>
            <div>
              <strong>1.2. Thời hạn:</strong> Từ ngày{" "}
              {formatDate(data.NgayBatDau || data.ngayBatDau)}
              {data.NgayKetThuc || data.ngayKetThuc
                ? ` đến ngày ${formatDate(data.NgayKetThuc || data.ngayKetThuc)}`
                : " (Vô thời hạn)"}
              .
            </div>
            <div>
              <strong>1.3. Đơn vị công tác:</strong>{" "}
              {data.TenPhongBan || data.tenPhongBan || "...................."}.
            </div>
            <div>
              <strong>1.4. Chức vụ/Vị trí:</strong>{" "}
              {data.TenChucVu || data.tenChucVu || "Nhân viên"}.
            </div>
            <div>
              <strong>1.5. Công việc phải làm:</strong> Thực hiện các công việc
              theo bản mô tả công việc và phân công của quản lý trực tiếp.
            </div>
          </div>

          {/* ĐIỀU 2 */}
          <div
            className="c-article"
            style={{ marginBottom: "15px", fontSize: "11pt" }}
          >
            <div style={{ fontWeight: "bold", textTransform: "uppercase" }}>
              Điều 2: Chế độ làm việc
            </div>
            <div>
              - Thời gian làm việc: 8 giờ/ngày, từ thứ Hai đến thứ Sáu (và sáng
              thứ Bảy tùy tính chất công việc).
            </div>
            <div>- Được trang bị đầy đủ dụng cụ làm việc cần thiết.</div>
          </div>

          {/* ĐIỀU 3 */}
          <div
            className="c-article"
            style={{ marginBottom: "15px", fontSize: "11pt" }}
          >
            <div style={{ fontWeight: "bold", textTransform: "uppercase" }}>
              Điều 3: Nghĩa vụ và quyền lợi của người lao động
            </div>
            <div style={{ fontWeight: "bold", marginTop: "5px" }}>
              3.1. Quyền lợi:
            </div>
            <div style={{ paddingLeft: "20px" }}>
              - Mức lương chính:{" "}
              <strong>
                {formatMoney(data.LuongCoBan || data.luongCoBan)} VNĐ/tháng
              </strong>
              .
              <br />
              - Phụ cấp và thưởng: Theo quy chế của Công ty.
              <br />
              - Được đóng BHXH, BHYT, BHTN theo quy định của pháp luật.
              <br />- Được hưởng các chế độ nghỉ lễ, tết, phép năm, ốm đau theo
              quy định.
            </div>
            <div style={{ fontWeight: "bold", marginTop: "5px" }}>
              3.2. Nghĩa vụ:
            </div>
            <div style={{ paddingLeft: "20px" }}>
              - Hoàn thành công việc được giao, chấp hành nội quy lao động.
              <br />- Bồi thường vi phạm vật chất nếu làm hư hỏng trang thiết
              bị.
            </div>
          </div>

          {/* ĐIỀU 4 */}
          <div
            className="c-article"
            style={{ marginBottom: "15px", fontSize: "11pt" }}
          >
            <div style={{ fontWeight: "bold", textTransform: "uppercase" }}>
              Điều 4: Điều khoản thi hành
            </div>
            <div>
              - Hợp đồng này có hiệu lực kể từ ngày{" "}
              {formatDate(data.NgayBatDau || data.ngayBatDau)}.
            </div>
            <div>
              - Hợp đồng được lập thành 02 bản có giá trị pháp lý như nhau, mỗi
              bên giữ 01 bản.
            </div>
          </div>

          {/* CHỮ KÝ */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "40px",
              paddingBottom: "80px",
            }}
          >
            <div style={{ textAlign: "center", width: "45%" }}>
              <div style={{ fontWeight: "bold" }}>NGƯỜI LAO ĐỘNG</div>
              <div style={{ fontStyle: "italic", fontSize: "0.9em" }}>
                (Ký, ghi rõ họ tên)
              </div>
              <br />
              <br />
              <br />
              <br />
              <br />
              <div style={{ fontWeight: "bold", textTransform: "uppercase" }}>
                {data.HoTenNhanVien || data.hoTenNhanVien}
              </div>
            </div>

            <div style={{ textAlign: "center", width: "45%" }}>
              <div style={{ fontWeight: "bold" }}>ĐẠI DIỆN CÔNG TY</div>
              <div style={{ fontStyle: "italic", fontSize: "0.9em" }}>
                (Ký, đóng dấu, ghi rõ họ tên)
              </div>
              <br />
              <br />
              <br />
              <br />
              <br />
              <div style={{ fontWeight: "bold", textTransform: "uppercase" }}>
                Nguyễn Văn Giám Đốc
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractTemplate;
