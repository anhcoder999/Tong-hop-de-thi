export type Mon = "Toán" | "Văn" | "Anh" | "Sử" | "Địa" | "KTPL";
export type Tab = "Tất cả" | Mon;
export type Loai = "pdf" | "docx";
export interface DeThi {
  id: string;
  mon: Mon;
  ten: string;
  ngay: string;
  urlPdf: string;
  loai?: Loai;
}
export const DS_MON: Mon[] = ["Toán", "Văn", "Anh", "Sử", "Địa", "KTPL"];
export const DS_TAB: Tab[] = ["Tất cả", ...DS_MON];
const PDF_1 = "https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf";
const PDF_2 = "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";
const PDF_3 = "https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf";
export const DS_DE: DeThi[] = [
  { id: "toan-thpt-2026-lan-1", mon: "Toán", ten: "Đề thi thử tốt nghiệp THPT 2026 môn Toán - Lần 1", ngay: "2026-11-10", urlPdf: PDF_2, loai: "pdf" },
  { id: "toan-giua-ki-1-2026", mon: "Toán", ten: "Đề kiểm tra giữa kì 1 Toán 12 - Có đáp án chi tiết", ngay: "2026-10-28", urlPdf: PDF_1, loai: "pdf" },
  { id: "toan-docx-minh-hoa", mon: "Toán", ten: "Đề minh họa Toán - định dạng DOCX (bảng + font tiếng Việt)", ngay: "2026-11-13", urlPdf: "demo-docx:toan", loai: "docx" },
  { id: "van-thpt-2026-lan-1", mon: "Văn", ten: "Đề thi thử tốt nghiệp THPT 2026 môn Ngữ Văn - Lần 1", ngay: "2026-11-08", urlPdf: PDF_3, loai: "pdf" },
  { id: "van-nghi-luan-2026", mon: "Văn", ten: "Bộ đề luyện viết nghị luận xã hội - Tuyển chọn 2026", ngay: "2026-10-20", urlPdf: PDF_1, loai: "pdf" },
  { id: "van-docx-minh-hoa", mon: "Văn", ten: "Đề minh họa Ngữ Văn - định dạng DOCX (giữ layout Word)", ngay: "2026-11-13", urlPdf: "demo-docx:van", loai: "docx" },
  { id: "anh-thpt-2026-lan-1", mon: "Anh", ten: "Đề thi thử tốt nghiệp THPT 2026 môn Tiếng Anh - Lần 1", ngay: "2026-11-12", urlPdf: PDF_2, loai: "pdf" },
  { id: "anh-giua-ki-1-2026", mon: "Anh", ten: "Đề kiểm tra giữa kì 1 Tiếng Anh 12 - Kèm file nghe", ngay: "2026-10-25", urlPdf: PDF_1, loai: "pdf" },
  { id: "su-giua-ki-1-2026", mon: "Sử", ten: "Đề kiểm tra giữa kì 1 Lịch sử 12 - Bám sát chương trình mới", ngay: "2026-10-18", urlPdf: PDF_3, loai: "pdf" },
  { id: "dia-thpt-2026-lan-1", mon: "Địa", ten: "Đề thi thử tốt nghiệp THPT 2026 môn Địa lí - Lần 1", ngay: "2026-11-02", urlPdf: PDF_1, loai: "pdf" },
  { id: "ktpl-giua-ki-1-2026", mon: "KTPL", ten: "Đề kiểm tra giữa kì 1 Giáo dục Kinh tế và Pháp luật 12", ngay: "2026-10-30", urlPdf: PDF_2, loai: "pdf" },
  { id: "ktpl-thpt-2026-lan-1", mon: "KTPL", ten: "Đề thi thử tốt nghiệp THPT 2026 môn KTPL - Lần 1", ngay: "2026-11-05", urlPdf: PDF_1, loai: "pdf" },
];
export function timDeTheoId(id: string): DeThi | undefined {
  return DS_DE.find((d) => d.id === id);
}
export function formatNgay(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}