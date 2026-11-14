import { BUCKET, supabase } from "@/lib/supabase";
import { chuanMon, khongDau, MON_SLUG, type DeThi, type Loai, type Mon } from "@/lib/data";
export const MAX_BYTES = 20 * 1024 * 1024;
const MIME: Record<Loai, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};
export function duoiFile(name: string): Loai | null {
  const n = name.toLowerCase();
  if (n.endsWith(".pdf")) return "pdf";
  if (n.endsWith(".docx")) return "docx";
  return null;
}
function idNgauNhien(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
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
  };
}
export async function layDanhSach(): Promise<DeThi[]> {
  const { data, error } = await supabase.from("de_thi").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => docRow(r as Record<string, unknown>));
}
export async function layDeTheoId(id: string): Promise<DeThi | null> {
  const { data, error } = await supabase.from("de_thi").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? docRow(data as Record<string, unknown>) : null;
}
export async function kiemTraTrung(mon: Mon, ten: string, boQuaId?: string): Promise<boolean> {
  const { data, error } = await supabase.from("de_thi").select("id,ten,mon");
  if (error) throw new Error(error.message);
  const chuan = khongDau(ten);
  return (data ?? []).some((r) => String(r.id) !== boQuaId && chuanMon(String(r.mon ?? "")) === mon && khongDau(String(r.ten)) === chuan);
}
async function taiLen(file: File, mon: Mon, loai: Loai) {
  const duongDan = `${MON_SLUG[mon]}/${idNgauNhien()}.${loai}`;
  const { error } = await supabase.storage.from(BUCKET).upload(duongDan, file, {
    contentType: MIME[loai],
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(`Tải file thất bại: ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(duongDan);
  return { duongDan, url: data.publicUrl };
}
function xacThuc(file: File): Loai {
  const loai = duoiFile(file.name);
  if (!loai) throw new Error("Chỉ nhận file PDF hoặc DOCX.");
  if (file.size > MAX_BYTES) throw new Error("File vượt quá 20MB.");
  if (file.size === 0) throw new Error("File rỗng, hãy chọn lại.");
  return loai;
}
export type NhapDe = { mon: Mon; ten: string; ngay: string };
export async function themDe(input: NhapDe, file: File, onStage?: (s: string) => void): Promise<DeThi> {
  const loai = xacThuc(file);
  onStage?.("Đang tải file lên kho...");
  const up = await taiLen(file, input.mon, loai);
  onStage?.("Đang ghi thông tin đề...");
  const { data: auth } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("de_thi")
    .insert({
      mon: input.mon,
      ten: input.ten,
      ngay: input.ngay,
      url_file: up.url,
      loai,
      duong_dan: up.duongDan,
      user_id: auth.user?.id ?? null,
      kich_thuoc: file.size,
      ten_goc: file.name,
    })
    .select("*")
    .maybeSingle();
  if (error || !data) {
    await supabase.storage.from(BUCKET).remove([up.duongDan]);
    throw new Error(error?.message ?? "Không ghi được đề. Kiểm tra quyền quản trị.");
  }
  return docRow(data as Record<string, unknown>);
}
export async function suaDe(id: string, input: NhapDe, file: File | null, onStage?: (s: string) => void): Promise<DeThi> {
  const cu = await layDeTheoId(id);
  if (!cu) throw new Error("Không tìm thấy đề cần sửa.");
  let url = cu.urlPdf;
  let duongDan = cu.duongDan;
  let loai = cu.loai;
  let kichThuoc = cu.kichThuoc;
  let tenGoc = cu.tenGoc;
  let moi: string | null = null;
  if (file) {
    loai = xacThuc(file);
    onStage?.("Đang tải file mới...");
    const up = await taiLen(file, input.mon, loai);
    url = up.url;
    duongDan = up.duongDan;
    moi = up.duongDan;
    kichThuoc = file.size;
    tenGoc = file.name;
  }
  onStage?.("Đang cập nhật thông tin...");
  const { data, error } = await supabase
    .from("de_thi")
    .update({ mon: input.mon, ten: input.ten, ngay: input.ngay, url_file: url, loai, duong_dan: duongDan, kich_thuoc: kichThuoc, ten_goc: tenGoc })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error || !data) {
    if (moi) await supabase.storage.from(BUCKET).remove([moi]);
    throw new Error(error?.message ?? "Không sửa được đề. Kiểm tra quyền quản trị.");
  }
  if (moi && cu.duongDan) await supabase.storage.from(BUCKET).remove([cu.duongDan]);
  return docRow(data as Record<string, unknown>);
}
export async function xoaDe(de: DeThi): Promise<void> {
  const { data, error } = await supabase.from("de_thi").delete().eq("id", de.id).select("id").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Không xóa được đề. Kiểm tra quyền quản trị.");
  if (de.duongDan) {
    const { error: e } = await supabase.storage.from(BUCKET).remove([de.duongDan]);
    if (e) throw new Error(`Đã xóa đề nhưng file còn sót trong kho: ${e.message}`);
  }
}