import {supabase} from "@/lib/supabase";
import {capNhatDe, ghiDe, xoaDeServer, xoaFile, xinLinkUpload} from "@/app/actions";
import {chuanMon, khongDau, type DeThi, type Loai, type Mon} from "@/lib/data";
export const MAX_BYTES = 20 * 1024 * 1024;
const MIME: Record<Loai, string> = {
  pdf: "application/pdf",
  docx: "application/pdf"
};
export function duoiFile(name: string): Loai | null {
  return name.toLowerCase().endsWith(".pdf") ? "pdf" : null;
}
function docRow(r: Record<string, unknown>): DeThi {
  return {
    id: String(r.id),
    mon: chuanMon(String(r.mon ?? "")),
    ten: String(r.ten),
    ngay: String(r.ngay),
    urlPdf: String(r.url_file),
    loai: "pdf",
    duongDan: (r.duong_dan as string | null) ?? null,
    kichThuoc: typeof r.kich_thuoc === "number" ? r.kich_thuoc : null,
    tenGoc: (r.ten_goc as string | null) ?? null,
    ghimAt: (r.ghim_at as string | null) ?? null,
    luotXem: typeof r.luot_xem === "number" ? r.luot_xem : 0,
    luotTai: typeof r.luot_tai === "number" ? r.luot_tai : 0
  };
}
function sapGhimTruoc(rows: DeThi[]): DeThi[] {
  return rows.sort((a, b) => (a.ghimAt && b.ghimAt ? a.ghimAt.localeCompare(b.ghimAt) : a.ghimAt ? -1 : b.ghimAt ? 1 : 0));
}
export async function layDanhSach(): Promise<DeThi[]> {
  const {data, error} = await supabase.from("de_thi").select("*").order("created_at", {ascending: false});
  if (error) throw new Error(error.message);
  return sapGhimTruoc((data ?? []).map((r) => docRow(r as Record<string, unknown>)));
}
export async function layDeTheoId(id: string): Promise<DeThi | null> {
  const {data, error} = await supabase.from("de_thi").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? docRow(data as Record<string, unknown>) : null;
}
export async function kiemTraTrung(mon: Mon, ten: string, boQuaId?: string): Promise<boolean> {
  const {data, error} = await supabase.from("de_thi").select("id,ten,mon");
  if (error) throw new Error(error.message);
  const chuan = khongDau(ten);
  return (data ?? []).some((r) => String(r.id) !== boQuaId && chuanMon(String(r.mon ?? "")) === mon && khongDau(String(r.ten)) === chuan);
}
async function chuanBiFile(file: File, onStage?: (s: string) => void): Promise<File> {
  try {
    onStage?.("Đang nén PDF, giữ chữ sắc nét...");
    const {nenPdf} = await import("./nenPdf");
    const blob = await nenPdf(file, onStage);
    return new File([blob], file.name, {type: "application/pdf"});
  } catch {
    return file;
  }
}
async function taiLen(file: File, mon: Mon, loai: Loai): Promise<string> {
  const link = await xinLinkUpload(mon, loai);
  if (!link.ok) throw new Error(link.error);
  const res = await fetch(link.signedUrl, {method: "PUT", body: file, headers: {"Content-Type": MIME[loai], "x-upsert": "false"}});
  if (!res.ok) throw new Error(`Tải file thất bại: ${res.status}`);
  return link.path;
}
function xacThuc(file: File): Loai {
  if (!duoiFile(file.name)) throw new Error("Chỉ nhận file PDF.");
  if (file.size > MAX_BYTES) throw new Error("File vượt quá 20MB.");
  if (file.size === 0) throw new Error("File rỗng, hãy chọn lại.");
  return "pdf";
}
export type NhapDe = {mon: Mon; ten: string; ngay: string};
export async function themDe(input: NhapDe, file: File, onStage?: (s: string) => void): Promise<DeThi> {
  const loai = xacThuc(file);
  const tep = await chuanBiFile(file, onStage);
  onStage?.("Đang tải file lên kho...");
  const path = await taiLen(tep, input.mon, loai);
  onStage?.("Đang ghi thông tin đề...");
  const kq = await ghiDe({mon: input.mon, ten: input.ten, ngay: input.ngay, loai, path, kichThuoc: tep.size, tenGoc: file.name});
  if (!kq.ok) {
    await xoaFile(path);
    throw new Error(kq.error);
  }
  return docRow(kq.row);
}
export async function suaDe(id: string, input: NhapDe, file: File | null, onStage?: (s: string) => void): Promise<DeThi> {
  let path: string | null = null;
  let kichThuoc: number | null = null;
  let tenGoc: string | null = null;
  if (file) {
    xacThuc(file);
    const tep = await chuanBiFile(file, onStage);
    onStage?.("Đang tải file mới...");
    path = await taiLen(tep, input.mon, "pdf");
    kichThuoc = tep.size;
    tenGoc = file.name;
  }
  onStage?.("Đang cập nhật thông tin...");
  const kq = await capNhatDe(id, {mon: input.mon, ten: input.ten, ngay: input.ngay, loai: "pdf", path, kichThuoc, tenGoc});
  if (!kq.ok) {
    if (path) await xoaFile(path);
    throw new Error(kq.error);
  }
  return docRow(kq.row);
}
export async function xoaDe(de: DeThi): Promise<void> {
  const kq = await xoaDeServer(de.id);
  if (!kq.ok) throw new Error(kq.error ?? "Không xóa được đề. Kiểm tra quyền quản trị.");
}