export type Mon =
  | "Toán"
  | "Vật lí"
  | "Hoá học"
  | "Sinh học"
  | "Văn"
  | "Sử"
  | "Địa"
  | "Anh"
  | "KTPL"
  | "Công nghệ"
  | "Tin học"
  | "Khác";
export type Tab = "Tất cả" | Mon;
export type Loai = "pdf" | "docx";
export interface DeThi {
  id: string;
  mon: Mon;
  ten: string;
  ngay: string;
  urlPdf: string;
  loai: Loai;
  duongDan: string | null;
  kichThuoc: number | null;
  tenGoc: string | null;
}
export const DS_MON: Mon[] = [
  "Toán",
  "Vật lí",
  "Hoá học",
  "Sinh học",
  "Văn",
  "Sử",
  "Địa",
  "Anh",
  "KTPL",
  "Công nghệ",
  "Tin học",
  "Khác",
];
export const DS_TAB: Tab[] = ["Tất cả", ...DS_MON];
export const MON_SLUG: Record<Mon, string> = {
  "Toán": "toan",
  "Vật lí": "vat-li",
  "Hoá học": "hoa-hoc",
  "Sinh học": "sinh-hoc",
  "Văn": "van",
  "Sử": "su",
  "Địa": "dia",
  "Anh": "anh",
  "KTPL": "ktpl",
  "Công nghệ": "cong-nghe",
  "Tin học": "tin-hoc",
  "Khác": "khac",
};
export const khongDau = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim();
export function formatNgay(iso: string): string {
  const p = iso.slice(0, 10).split("-");
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : iso;
}
export function formatDungLuong(bytes: number | null): string {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
export function homNay(): string {
  const d = new Date();
  const h = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${h(d.getMonth() + 1)}-${h(d.getDate())}`;
}