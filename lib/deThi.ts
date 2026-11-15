import {supabase} from "@/lib/supabase";
import {capNhatDe, ghiDe, xoaDeServer, xoaFile, xinLinkUpload} from "@/app/actions";
import {chuanMon, khongDau, type DeThi, type Loai, type Mon} from "@/lib/data";
export const MAX_BYTES = 20 * 1024 * 1024;
const MIME: Record<Loai, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
};
export function duoiFile(name: string): Loai | null {
  const n = name.toLowerCase();
  if (n.endsWith(".pdf")) return "pdf";
  if (n.endsWith(".docx")) return "docx";
  return null;
}
function docRow(r: Record<string, unknown>): DeThi {
  return {
    id: String(r.id),
    mon: chuanMon(String(r.mon ?? "")),
    ten: String(r.ten),
    ngay: String(r.ngay),
    urlPdf: String(r.url_file),
    loai: r.loai === "docx" ? "docx" : "pdf",
    duongDan: (r.duong_dan as string | null) ?? null,
    kichThuoc: typeof r.kich_thuoc === "number" ? r.kich_thuoc : null,
    tenGoc: (r.ten_goc as string | null) ?? null,
    ghimAt: (r.ghim_at as string | null) ?? null
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
async function taiLen(file: File, mon: Mon, loai: Loai): Promise<string> {
  const link = await xinLinkUpload(mon, loai);
  if (!link.ok) throw new Error(link.error);
  const res = await fetch(link.signedUrl, {method: "PUT", body: file, headers: {"Content-Type": MIME[loai], "x-upsert": "false"}});
  if (!res.ok) throw new Error(`Tải file thất bại: ${res.status}`);
  return link.path;
}
function xacThuc(file: File): Loai {
  const loai = duoiFile(file.name);
  if (!loai) throw new Error("Chỉ nhận file PDF hoặc DOCX.");
  if (file.size > MAX_BYTES) throw new Error("File vượt quá 20MB.");
  if (file.size === 0) throw new Error("File rỗng, hãy chọn lại.");
  return loai;
}
export type NhapDe = {mon: Mon; ten: string; ngay: string};
export async function themDe(input: NhapDe, file: File, onStage?: (s: string) => void): Promise<DeThi> {
  const loai = xacThuc(file);
  onStage?.("Đang tải file lên kho...");
  const path = await taiLen(file, input.mon, loai);
  onStage?.("Đang ghi thông tin đề...");
  const kq = await ghiDe({mon: input.mon, ten: input.ten, ngay: input.ngay, loai, path, kichThuoc: file.size, tenGoc: file.name});
  if (!kq.ok) {
    await xoaFile(path);
    throw new Error(kq.error);
  }
  return docRow(kq.row);
}
export async function suaDe(id: string, input: NhapDe, file: File | null, onStage?: (s: string) => void): Promise<DeThi> {
  let loai: Loai = "pdf";
  let path: string | null = null;
  let kichThuoc: number | null = null;
  let tenGoc: string | null = null;
  if (file) {
    loai = xacThuc(file);
    onStage?.("Đang tải file mới...");
    path = await taiLen(file, input.mon, loai);
    kichThuoc = file.size;
    tenGoc = file.name;
  }
  onStage?.("Đang cập nhật thông tin...");
  const kq = await capNhatDe(id, {mon: input.mon, ten: input.ten, ngay: input.ngay, loai, path, kichThuoc, tenGoc});
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