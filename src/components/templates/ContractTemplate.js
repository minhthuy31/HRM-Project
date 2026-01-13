import React from "react";
import { FaPrint, FaTimes, FaFileContract } from "react-icons/fa";
import "../../styles/ContractTemplate.css";

const ContractTemplate = ({ data, onClose }) => {
  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  // Helper format ngày tháng năm
  const formatDate = (d) => {
    if (!d) return "...../...../.......";
    const date = new Date(d);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Helper lấy ngày hiện tại (hoặc ngày ký)
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  // Helper format tiền
  const formatMoney = (val) =>
    val ? new Intl.NumberFormat("vi-VN").format(val) : "................";

  return (
    <div className="contract-preview-overlay">
      {/* --- TOOLBAR --- */}
      <div className="preview-toolbar">
        <div className="preview-title">
          <FaFileContract style={{ marginRight: "10px" }} />
          Hợp đồng số: {data.soHopDong}
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

      {/* --- KHUNG CUỘN --- */}
      <div className="preview-content-scroll">
        <div className="contract-paper">
          {/* 1. HEADER */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <div style={{ textAlign: "center", width: "45%" }}>
              <div style={{ fontWeight: "bold", textTransform: "uppercase" }}>
                CÔNG TY CÔNG NGHỆ XYZ
              </div>
              <div>Số: {data.soHopDong}</div>
            </div>
            <div style={{ textAlign: "center", width: "55%" }}>
              <div style={{ fontWeight: "bold", textTransform: "uppercase" }}>
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </div>
              <div
                style={{
                  fontWeight: "bold",
                  borderBottom: "1px solid black",
                  display: "inline-block",
                  paddingBottom: "3px",
                }}
              >
                Độc lập – Tự do – Hạnh phúc
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <h1
              style={{ fontSize: "18pt", fontWeight: "bold", margin: "10px 0" }}
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
            }}
          >
            <div>
              - Căn cứ Bộ luật Lao động số 45/2019/QH14 ngày 20/11/2019;
            </div>
            <div>- Căn cứ Bộ luật Dân sự số 91/2015/QH13 ngày 24/11/2015;</div>
            <div>- Căn cứ vào nhu cầu và khả năng của Các Bên.</div>
          </div>

          <div style={{ marginBottom: "15px" }}>
            Hôm nay, ngày {currentDay} tháng {currentMonth} năm {currentYear},
            tại Văn phòng Công ty XYZ, chúng tôi gồm có:
          </div>

          {/* 3. BÊN A (NSDLĐ) */}
          <div className="c-section">
            <div style={{ fontWeight: "bold" }}>
              Người sử dụng lao động (Bên A): CÔNG TY CÔNG NGHỆ XYZ
            </div>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "5px",
              }}
            >
              <tbody>
                <tr>
                  <td style={{ width: "130px" }}>Địa chỉ</td>
                  <td>: Tầng 72, Tòa nhà Landmark, TP.HCM</td>
                </tr>
                <tr>
                  <td>Mã số thuế</td>
                  <td>: 0101234567</td>
                </tr>
                <tr>
                  <td>Đại diện</td>
                  <td>
                    : <strong>Ông Nguyễn Văn Giám Đốc</strong> - Chức vụ: Giám
                    Đốc
                  </td>
                </tr>
                <tr>
                  <td>Điện thoại</td>
                  <td>: 028.1234.5678</td>
                </tr>
              </tbody>
            </table>
            <div style={{ fontStyle: "italic", marginTop: "5px" }}>
              (Sau đây gọi tắt là: “NSDLĐ” hoặc “Công ty”)
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

          {/* 4. BÊN B (NLĐ) - ĐÃ CẬP NHẬT SỐ ĐIỆN THOẠI */}
          <div className="c-section">
            <div style={{ fontWeight: "bold" }}>
              Người lao động (Bên B): Ông/Bà {data.hoTenNhanVien?.toUpperCase()}
            </div>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "5px",
              }}
            >
              <tbody>
                <tr>
                  <td style={{ width: "130px" }}>Ngày sinh</td>
                  <td>: {formatDate(data.ngaySinh)}</td>
                </tr>
                <tr>
                  <td>Số CCCD/CMND</td>
                  <td>
                    : <strong>{data.cccd || "...................."}</strong>
                  </td>
                </tr>
                <tr>
                  <td>Địa chỉ thường trú</td>
                  <td>: {data.diaChi || "...................."}</td>
                </tr>
                {/* --- HIỂN THỊ SỐ ĐIỆN THOẠI Ở ĐÂY --- */}
                <tr>
                  <td>Điện thoại</td>
                  <td>: {data.SoDienThoai || "...................."}</td>
                </tr>
                {/* ----------------------------------- */}
              </tbody>
            </table>
            <div style={{ fontStyle: "italic", marginTop: "5px" }}>
              (Sau đây gọi tắt là: “NLĐ”)
            </div>
          </div>

          <div style={{ margin: "15px 0" }}>
            Hai Bên thỏa thuận ký kết hợp đồng lao động và cam kết thực hiện
            đúng những điều khoản sau đây:
          </div>

          {/* 5. NỘI DUNG HỢP ĐỒNG */}

          {/* ĐIỀU 1 */}
          <div className="c-article" style={{ marginBottom: "15px" }}>
            <div style={{ fontWeight: "bold", textTransform: "uppercase" }}>
              Điều 1: Thời hạn và công việc hợp đồng
            </div>
            <div>
              <strong>1.1. Loại hợp đồng lao động:</strong> {data.loaiHopDong}.
            </div>
            <div>
              <strong>1.2. Thời hạn:</strong> Từ ngày{" "}
              {formatDate(data.ngayBatDau)}
              {data.ngayKetThuc
                ? ` đến hết ngày ${formatDate(data.ngayKetThuc)}`
                : " (Vô thời hạn)"}
              .
            </div>
            <div>
              <strong>1.3. Đơn vị làm việc:</strong> Phòng{" "}
              {data.tenPhongBan || "...................."}.
            </div>
            <div>
              <strong>1.4. Địa điểm làm việc:</strong> Tại trụ sở Công ty và các
              địa điểm theo yêu cầu công việc.
            </div>
            <div>
              <strong>1.5. Chức vụ/Chức danh:</strong>{" "}
              {data.tenChucVu || "Nhân viên"}.
            </div>
            <div>
              <strong>1.6. Nội dung công việc:</strong>
            </div>
            <div style={{ paddingLeft: "20px" }}>
              (i) Thực hiện công việc theo sự sắp xếp của lãnh đạo Công ty và
              trưởng bộ phận;
              <br />
              (ii) Hoàn thành tốt công việc được giao, chấp hành nội quy và quy
              trình an toàn lao động;
              <br />
              (iii) Người lao động đồng ý rằng Công ty có thể điều chuyển công
              tác phù hợp với năng lực trong phạm vi pháp luật cho phép.
            </div>
          </div>

          {/* ĐIỀU 2 */}
          <div className="c-article" style={{ marginBottom: "15px" }}>
            <div style={{ fontWeight: "bold", textTransform: "uppercase" }}>
              Điều 2: Chế độ làm việc
            </div>
            <div>
              <strong>2.1. Thời giờ làm việc:</strong> 8 tiếng/ngày. Sáng: 8h00
              – 12h00, Chiều: 13h30 – 17h30. Từ thứ 2 đến thứ 6 (hoặc theo lịch
              phân công).
            </div>
            <div>
              <strong>2.2. Thời gian linh hoạt:</strong> Tùy theo tính chất công
              việc, Công ty có thể áp dụng thời gian làm việc linh hoạt nhưng
              vẫn đảm bảo đủ số giờ quy định.
            </div>
            <div>
              <strong>2.3. Trang thiết bị:</strong> Được cấp phát máy tính và
              văn phòng phẩm cần thiết.
            </div>
            <div>
              <strong>2.4. Nghỉ lễ, Tết:</strong> Theo quy định của Bộ luật Lao
              động và quy chế Công ty.
            </div>
          </div>

          {/* ĐIỀU 3 */}
          <div className="c-article" style={{ marginBottom: "15px" }}>
            <div style={{ fontWeight: "bold", textTransform: "uppercase" }}>
              Điều 3: Quyền lợi và nghĩa vụ của Người lao động
            </div>
            <div style={{ fontWeight: "bold", marginTop: "5px" }}>
              3.1. Quyền lợi
            </div>
            <div style={{ paddingLeft: "20px" }}>
              (i){" "}
              <strong>
                Mức lương chính: {formatMoney(data.luongCoBan)} VNĐ/tháng
              </strong>
              .<br />
              (ii) Các khoản phụ cấp/thưởng: Theo quy chế tài chính của Công ty
              và hiệu quả công việc.
              <br />
              (iii) Chế độ Bảo hiểm (BHXH, BHYT, BHTN): Được đóng theo quy định
              của pháp luật hiện hành.
              <br />
              (iv) Được đào tạo nâng cao trình độ chuyên môn theo quy định Công
              ty.
            </div>

            <div style={{ fontWeight: "bold", marginTop: "5px" }}>
              3.2. Nghĩa vụ
            </div>
            <div style={{ paddingLeft: "20px" }}>
              (i) Hoàn thành công việc theo Hợp đồng. Tuân thủ sự điều hành của
              cấp quản lý.
              <br />
              (ii) Bảo mật thông tin kinh doanh, công nghệ của Công ty.
              <br />
              (iii) Bồi thường thiệt hại nếu làm hư hỏng, mất mát tài sản Công
              ty theo quy định.
              <br />
              (iv) Thông báo trước bằng văn bản theo đúng quy định pháp luật nếu
              đơn phương chấm dứt hợp đồng.
            </div>
          </div>

          {/* ĐIỀU 4 */}
          <div className="c-article" style={{ marginBottom: "15px" }}>
            <div style={{ fontWeight: "bold", textTransform: "uppercase" }}>
              Điều 4: Quyền hạn và nghĩa vụ của Người sử dụng lao động
            </div>
            <div style={{ paddingLeft: "20px" }}>
              <strong>4.1. Quyền hạn:</strong> Điều hành NLĐ, kiểm tra giám sát,
              áp dụng kỷ luật lao động theo Nội quy.
              <br />
              <strong>4.2. Nghĩa vụ:</strong> Thanh toán đầy đủ lương, đảm bảo
              điều kiện làm việc và các chế độ cho NLĐ theo cam kết.
            </div>
          </div>

          {/* ĐIỀU 5 */}
          <div className="c-article" style={{ marginBottom: "15px" }}>
            <div style={{ fontWeight: "bold", textTransform: "uppercase" }}>
              Điều 5: Điều khoản thi hành
            </div>
            <div>
              5.1. Hai Bên cam kết thực hiện nghiêm túc Hợp đồng này. Mọi thay
              đổi phải được sự đồng ý bằng văn bản của cả hai Bên.
            </div>
            <div>
              5.2. Các vấn đề chưa ghi trong Hợp đồng này sẽ áp dụng theo Nội
              quy lao động và quy định pháp luật.
            </div>
            <div>
              5.3. Hợp đồng này được lập thành 02 bản có giá trị pháp lý như
              nhau, mỗi bên giữ 01 bản và có hiệu lực từ ngày ký.
            </div>
          </div>

          {/* CHỮ KÝ */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "40px",
              paddingBottom: "50px",
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
              <div style={{ fontWeight: "bold" }}>{data.hoTenNhanVien}</div>
            </div>

            <div style={{ textAlign: "center", width: "45%" }}>
              <div style={{ fontWeight: "bold" }}>NGƯỜI SỬ DỤNG LAO ĐỘNG</div>
              <div style={{ fontStyle: "italic", fontSize: "0.9em" }}>
                (Ký, đóng dấu, ghi rõ họ tên)
              </div>
              <br />
              <br />
              <br />
              <br />
              <br />
              <div style={{ fontWeight: "bold" }}>Nguyễn Văn Giám Đốc</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractTemplate;
