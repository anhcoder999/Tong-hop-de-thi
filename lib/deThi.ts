import {supabase} from "@/lib/supabase";
import {capNhatDe, ghiDe, xoaDeServer, xoaFile, xinLinkUpload, type ThuMuc} from "@/app/actions";
import {chuanMon, khongDau, type DeThi, type Loai, type Mon} from "@/lib/data";
export const MAX_BYTES = 20 * 1024 * 1024;
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
    luotTai: typeof r.luot_tai === "number" ? r.luot_tai : 0,
    urlDapAn: (r.url_dap_an as string | null) ?? null,
    dapAnDuongDan: (r.dap_an_duong_dan as string | null) ?? null,
    dapAnKichThuoc: typeof r.dap_an_kich_thuoc === "number" ? r.dap_an_kich_thuoc : null,
    dapAnTenGoc: (r.dap_an_ten_goc as string | null) ?? null
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
async function chuanBiFile(file: File, onStage?: (s: string) => void, nhan?: string): Promise<File> {
  try {
    onStage?.(`Đang nén ${nhan ?? "PDF"}, giữ chữ sắc nét...`);
    const {nenPdf} = await import("./nenPdf");
    const blob = await nenPdf(file, onStage);
    return new File([blob], file.name, {type: "application/pdf"});
  } catch {
    return file;
  }
}
async function taiLen(file: File, mon: Mon, thuMuc: ThuMuc): Promise<string> {
  const link = await xinLinkUpload(mon, "pdf", thuMuc);
  if (!link.ok) throw new Error(link.error);
  const res = await fetch(link.signedUrl, {method: "PUT", body: file, headers: {"Content-Type": "application/pdf", "x-upsert": "false"}});
  if (!res.ok) throw new Error(`Tải file thất bại: ${res.status}`);
  return link.path;
}
function xacThuc(file: File, nhan: string): void {
  if (!duoiFile(file.name)) throw new Error(`${nhan} chỉ nhận file PDF.`);
  if (file.size > MAX_BYTES) throw new Error(`${nhan} vượt quá 20MB.`);
  if (file.size === 0) throw new Error(`${nhan} rỗng, hãy chọn lại.`);
}
export type NhapDe = {mon: Mon; ten: string; ngay: string};
export async function themDe(input: NhapDe, file: File, onStage?: (s: string) => void, dapAn?: File | null): Promise<DeThi> {
  xacThuc(file, "Đề");
  const tepDe = await chuanBiFile(file, onStage, "đề");
  let tepDa: File | null = null;
  if (dapAn) {
    xacThuc(dapAn, "Đáp án");
    tepDa = await chuanBiFile(dapAn, onStage, "đáp án");
  }
  onStage?.("Đang tải đề lên kho...");
  const path = await taiLen(tepDe, input.mon, "de");
  let pathDa: string | null = null;
  if (tepDa) {
    onStage?.("Đang tải đáp án lên kho...");
    pathDa = await taiLen(tepDa, input.mon, "dap-an");
  }
  onStage?.("Đang ghi thông tin đề...");
  const kq = await ghiDe({mon: input.mon, ten: input.ten, ngay: input.ngay, loai: "pdf", path, kichThuoc: tepDe.size, tenGoc: file.name, dapAnPath: pathDa, dapAnKichThuoc: tepDa ? tepDa.size : null, dapAnTenGoc: dapAn ? dapAn.name : null});
  if (!kq.ok) {
    await xoaFile(path);
    if (pathDa) await xoaFile(pathDa);
    throw new Error(kq.error);
  }
  return docRow(kq.row);
}
export async function suaDe(id: string, input: NhapDe, file: File | null, onStage?: (s: string) => void, dapAn?: File | null, xoaDapAn?: boolean): Promise<DeThi> {
  let path: string | null = null;
  let kichThuoc: number | null = null;
  let tenGoc: string | null = null;
  let pathDa: string | null = null;
  let kichThuocDa: number | null = null;
  let tenGocDa: string | null = null;
  if (file) {
    xacThuc(file, "Đề");
    const tep = await chuanBiFile(file, onStage, "đề");
    onStage?.("Đang tải đề mới...");
    path = await taiLen(tep, input.mon, "de");
    kichThuoc = tep.size;
    tenGoc = file.name;
  }
  if (dapAn) {
    xacThuc(dapAn, "Đáp án");
    const tep = await chuanBiFile(dapAn, onStage, "đáp án");
    onStage?.("Đang tải đáp án mới...");
    pathDa = await taiLen(tep, input.mon, "dap-an");
    kichThuocDa = tep.size;
    tenGocDa = dapAn.name;
  }
  onStage?.("Đang cập nhật thông tin...");
  const kq = await capNhatDe(id, {mon: input.mon, ten: input.ten, ngay: input.ngay, loai: "pdf", path, kichThuoc, tenGoc, dapAnPath: pathDa, dapAnKichThuoc: kichThuocDa, dapAnTenGoc: tenGocDa, xoaDapAn: !!xoaDapAn && !pathDa});
  if (!kq.ok) {
    if (path) await xoaFile(path);
    if (pathDa) await xoaFile(pathDa);
    throw new Error(kq.error);
  }
  return docRow(kq.row);
}
export async function xoaDe(de: DeThi): Promise<void> {
  const kq = await xoaDeServer(de.id);
  if (!kq.ok) throw new Error(kq.error ?? "Không xóa được đề. Kiểm tra quyền quản trị.");
}