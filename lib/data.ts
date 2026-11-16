export type Mon = "Toán" | "Văn" | "Anh" | "Lí" | "Hóa" | "Sinh" | "Sử" | "Địa" | "KTPL" | "Tin" | "CN" | "Khác";
export type NhomMon = "bat-buoc" | "tu-nhien" | "xa-hoi" | "ung-dung" | "khac";
export type Loc = "Tất cả" | NhomMon | Mon;
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
  ghimAt?: string | null;
  luotXem?: number;
  luotTai?: number;
}
export const NHOM_MON: {id: NhomMon; ten: string; mon: Mon[]}[] = [
  {id: "bat-buoc", ten: "Bắt buộc", mon: ["Toán", "Văn", "Anh"]},
  {id: "tu-nhien", ten: "Tự nhiên", mon: ["Lí", "Hóa", "Sinh"]},
  {id: "xa-hoi", ten: "Xã hội", mon: ["Sử", "Địa", "KTPL"]},
  {id: "ung-dung", ten: "Ứng dụng", mon: ["Tin", "CN"]},
  {id: "khac", ten: "Mở rộng", mon: ["Khác"]}
];
export const DS_MON: Mon[] = NHOM_MON.flatMap((n) => n.mon);
export const MON_DAY_DU: Record<Mon, string> = {
  "Toán": "Toán học",
  "Văn": "Ngữ văn",
  "Anh": "Tiếng Anh",
  "Lí": "Vật lí",
  "Hóa": "Hóa học",
  "Sinh": "Sinh học",
  "Sử": "Lịch sử",
  "Địa": "Địa lí",
  "KTPL": "Giáo dục Kinh tế và Pháp luật",
  "Tin": "Tin học",
  "CN": "Công nghệ",
  "Khác": "Môn khác"
};
export const MON_SLUG: Record<Mon, string> = {
  "Toán": "toan",
  "Văn": "van",
  "Anh": "anh",
  "Lí": "vat-li",
  "Hóa": "hoa-hoc",
  "Sinh": "sinh-hoc",
  "Sử": "su",
  "Địa": "dia",
  "KTPL": "ktpl",
  "Tin": "tin-hoc",
  "CN": "cong-nghe",
  "Khác": "khac"
};
export const khongDau = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim();
const BI_DANH: Record<string, Mon> = {
  "toan hoc": "Toán",
  "ngu van": "Văn",
  "tieng anh": "Anh",
  "ngoai ngu": "Anh",
  "vat li": "Lí",
  "vat ly": "Lí",
  "ly": "Lí",
  "hoa hoc": "Hóa",
  "sinh hoc": "Sinh",
  "lich su": "Sử",
  "dia li": "Địa",
  "dia ly": "Địa",
  "giao duc kinh te va phap luat": "KTPL",
  "gdcd": "KTPL",
  "tin hoc": "Tin",
  "cong nghe": "CN",
  "mon khac": "Khác"
};
export function chuanMon(raw: string): Mon {
  const k = khongDau(raw);
  const hit = DS_MON.find((m) => khongDau(m) === k);
  return hit ?? BI_DANH[k] ?? "Khác";
}
export const laNhom = (v: Loc): v is NhomMon => NHOM_MON.some((n) => n.id === v);
export function monTrongLoc(loc: Loc): Mon[] {
  if (loc === "Tất cả") return DS_MON;
  if (laNhom(loc)) return NHOM_MON.find((n) => n.id === loc)?.mon ?? DS_MON;
  return [loc];
}
export function tenNhom(mon: Mon): string {
  return NHOM_MON.find((n) => n.mon.includes(mon))?.ten ?? "Mở rộng";
}
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