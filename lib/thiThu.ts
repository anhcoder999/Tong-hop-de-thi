import {khongDau, type Mon} from "@/lib/data";
export type LoaiCau = "trac_nghiem" | "dung_sai" | "tra_loi_ngan";
export type LuaChon = {ky_hieu: string; noi_dung: string};
export type TraLoiGiaTri = string | Record<string, boolean>;
export type TraLoi = Record<string, TraLoiGiaTri>;
export type CauHoiCongKhai = {id: string; thu_tu: number; loai: LoaiCau; noi_dung: string; diem: number; lua_chon: LuaChon[]};
export type CauHoiDayDu = CauHoiCongKhai & {dap_an_mcq: string; dap_an_ds: Record<string, boolean>; dap_an_ngan: string; giai_thich: string};
export type DeThiOnline = {id: string; mon: Mon; ten: string; mo_ta: string; thoi_gian_phut: number; cong_khai: boolean; created_at: string; so_cau: number};
export type DeThiTomTat = DeThiOnline & {so_lan_thi: number; diem_cao_nhat: number | null};
export type LichSuThi = {id: string; de_id: string; ten: string; mon: string; diem: number; tong_diem: number; so_cau_dung: number; trang_thai: string; nop_luc: string | null; phut_lam: number; created_at: string};
export type KetQuaCau = CauHoiDayDu & {tra_loi: TraLoiGiaTri | null; diem_dat: number; dung: boolean; so_y_dung: number};
export type KetQuaBai = {baiThiId: string; deId: string; ten: string; mon: string; diem: number; tongDiem: number; soCauDung: number; soCau: number; soLanThoat: number; viPham: boolean; nopLuc: string | null; phutLam: number; cau: KetQuaCau[]};
export const DIEM_DUNG_SAI = [0, 0.1, 0.25, 0.5, 1];
export const SO_LAN_THOAT_TOI_DA = 3;
export const KY_HIEU_MCQ = ["A", "B", "C", "D"];
export const KY_HIEU_DS = ["a", "b", "c", "d"];
export function nhanLoai(loai: LoaiCau): string {
  return loai === "trac_nghiem" ? "Trắc nghiệm" : loai === "dung_sai" ? "Đúng / Sai" : "Trả lời ngắn";
}
export function chuanHoaSo(raw: string): string {
  return raw.trim().replace(/\s+/g, "").replace(/,/g, ".").replace(/^\+/, "");
}
export function soSanhNgan(raw: string, khoa: string): boolean {
  const a = chuanHoaSo(raw);
  if (!a) return false;
  return khoa.split("|").some((k) => {
    const b = chuanHoaSo(k);
    if (!b) return false;
    const sa = Number(a);
    const sb = Number(b);
    if (Number.isFinite(sa) && Number.isFinite(sb)) return Math.abs(sa - sb) <= 1e-6 * Math.max(1, Math.abs(sb));
    return khongDau(a) === khongDau(b);
  });
}
export function lamTron(n: number): number {
  return Math.round(n * 100) / 100;
}
export function dinhDangDongHo(giay: number): string {
  const g = Math.max(0, Math.floor(giay));
  const p = Math.floor(g / 60);
  const s = g % 60;
  return `${String(p).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}