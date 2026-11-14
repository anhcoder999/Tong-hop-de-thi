// Kiểu dữ liệu môn học và đề thi dùng chung toàn dự án
export type Mon = "Toán" | "Văn" | "Anh" | "Sử" | "Địa" | "KTPL";
export type Tab = "Tất cả" | Mon;
export interface DeThi {
  id: string;
  mon: Mon;
  ten: string;
  ngay: string;
  urlPdf: string;
}
export const DS_MON: Mon[] = ["Toán", "Văn", "Anh", "Sử", "Địa", "KTPL"];
export const DS_TAB: Tab[] = ["Tất cả", ...DS_MON];
// PDF mẫu công khai, không chặn iframe, dùng demo; thay bằng link đề thật khi có
const PDF_1 = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
const PDF_2 = "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";
const PDF_3 = "https://pdfobject.com/pdf/sample.pdf";
// 10 đề mẫu: 4 môn khối D (Toán, Văn, Anh, KTPL) mỗi môn 2 đề, Sử và Địa mỗi môn 1 đề
export const DS_DE: DeThi[] = [
  { id: "toan-thpt-2026-lan-1", mon: "Toán", ten: "Đề thi thử tốt nghiệp THPT 2026 môn Toán - Lần 1", ngay: "2026-11-10", urlPdf: PDF_2 },
  { id: "toan-giua-ki-1-2026", mon: "Toán", ten: "Đề kiểm tra giữa kì 1 Toán 12 - Có đáp án chi tiết", ngay: "2026-10-28", urlPdf: PDF_1 },
  { id: "van-thpt-2026-lan-1", mon: "Văn", ten: "Đề thi thử tốt nghiệp THPT 2026 môn Ngữ Văn - Lần 1", ngay: "2026-11-08", urlPdf: PDF_3 },
  { id: "van-nghi-luan-2026", mon: "Văn", ten: "Bộ đề luyện viết nghị luận xã hội - Tuyển chọn 2026", ngay: "2026-10-20", urlPdf: PDF_1 },
  { id: "anh-thpt-2026-lan-1", mon: "Anh", ten: "Đề thi thử tốt nghiệp THPT 2026 môn Tiếng Anh - Lần 1", ngay: "2026-11-12", urlPdf: PDF_2 },
  { id: "anh-giua-ki-1-2026", mon: "Anh", ten: "Đề kiểm tra giữa kì 1 Tiếng Anh 12 - Kèm file nghe", ngay: "2026-10-25", urlPdf: PDF_1 },
  { id: "su-giua-ki-1-2026", mon: "Sử", ten: "Đề kiểm tra giữa kì 1 Lịch sử 12 - Bám sát chương trình mới", ngay: "2026-10-18", urlPdf: PDF_3 },
  { id: "dia-thpt-2026-lan-1", mon: "Địa", ten: "Đề thi thử tốt nghiệp THPT 2026 môn Địa lí - Lần 1", ngay: "2026-11-02", urlPdf: PDF_1 },
  { id: "ktpl-giua-ki-1-2026", mon: "KTPL", ten: "Đề kiểm tra giữa kì 1 Giáo dục Kinh tế và Pháp luật 12", ngay: "2026-10-30", urlPdf: PDF_2 },
  { id: "ktpl-thpt-2026-lan-1", mon: "KTPL", ten: "Đề thi thử tốt nghiệp THPT 2026 môn KTPL - Lần 1", ngay: "2026-11-05", urlPdf: PDF_1 },
];
// Tìm đề theo id cho trang /de/[id]
export function timDeTheoId(id: string): DeThi | undefined {
  return DS_DE.find((d) => d.id === id);
}
// Format ngày tự tay từ chuỗi ISO, tránh lệch múi giờ và lỗi hydration giữa server/client
export function formatNgay(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}