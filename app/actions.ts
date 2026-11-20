"use server";
import {randomUUID} from "node:crypto";
import {adminUid, authClient, BUCKET, hubClient, hubCuaMon, hubCuaPath} from "@/lib/server";
import {xacThucTurnstile} from "@/lib/turnstile";
import {chuanMon, DS_MON, MON_SLUG, type Loai, type Mon} from "@/lib/data";
const NAM_GIU_LINK = 31536000;
const ANH_DUOI = ["png", "jpg", "jpeg", "webp", "gif"];
export type ThuMuc = "de" | "dap-an";
export type LinkUpload = {ok: true; path: string; signedUrl: string} | {ok: false; error: string};
export type LinkAnh = {ok: true; path: string; token: string} | {ok: false; error: string};
export type KetQuaGhi = {ok: true; row: Record<string, unknown>} | {ok: false; error: string};
export type KetQua = {ok: boolean; error?: string};
export type NguoiDung = {id: string; email: string; ho_ten: string | null; role: string; banned: boolean; created_at: string};
export type DapAnInput = {dapAnPath?: string | null; dapAnKichThuoc?: number | null; dapAnTenGoc?: string | null; xoaDapAn?: boolean};
export type DanhGiaTong = {tb: number; dem: number; cuaToi: number; tong: number};
export type BinhLuan = {id: string; ten_nguoi: string; noi_dung: string; created_at: string; duyet: boolean; cuaToi: boolean};
export type ThongKe = {tongDe: number; tongDapAn: number; tongXem: number; tongTai: number; thanhVien: number; choDuyet: number; bytes: number; ngay: {ngay: string; xem: number; tai: number}[]; mon: {mon: Mon; xem: number; tai: number; de: number}[]; top: {id: string; ten: string; mon: Mon; xem: number; tai: number}[]};
type HangSao = {sao: number; user_id: string};
type HangBinhLuan = {id: string; user_id: string; ten_nguoi: string; noi_dung: string; created_at: string; duyet: boolean};
export async function dangNhap(email: string, password: string, token: string): Promise<KetQua> {
  if (!(await xacThucTurnstile(token))) return {ok: false, error: "Xác thực Turnstile thất bại. Thử lại."};
  const {error} = await (await authClient()).auth.signInWithPassword({email, password});
  return error ? {ok: false, error: error.message} : {ok: true};
}
export async function dangKy(email: string, password: string, hoTen: string, token: string): Promise<KetQua> {
  if (!(await xacThucTurnstile(token))) return {ok: false, error: "Xác thực Turnstile thất bại. Thử lại."};
  const {error} = await (await authClient()).auth.signUp({email, password, options: {data: {ho_ten: hoTen}}});
  return error ? {ok: false, error: error.message} : {ok: true};
}
export async function xinLinkUpload(mon: Mon, loai: Loai, thuMuc: ThuMuc): Promise<LinkUpload> {
  const uid = await adminUid();
  if (!uid) return {ok: false, error: "Không có quyền quản trị."};
  const path = `${MON_SLUG[mon]}/${thuMuc === "dap-an" ? "dap-an/" : ""}${randomUUID()}.${loai}`;
  const {data, error} = await hubClient(hubCuaMon(mon)).storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) return {ok: false, error: error?.message ?? "Không tạo được link upload."};
  return {ok: true, path, signedUrl: data.signedUrl};
}
async function linkLuuTru(hub: ReturnType<typeof hubCuaMon>, path: string): Promise<string> {
  const {data} = await hubClient(hub).storage.from(BUCKET).createSignedUrl(path, NAM_GIU_LINK);
  return data?.signedUrl ?? "";
}
export async function ghiDe(input: {mon: Mon; ten: string; ngay: string; loai: Loai; path: string; kichThuoc: number; tenGoc: string} & DapAnInput): Promise<KetQuaGhi> {
  const uid = await adminUid();
  if (!uid) return {ok: false, error: "Không có quyền quản trị."};
  const url = await linkLuuTru(hubCuaPath(input.path), input.path);
  const urlDapAn = input.dapAnPath ? await linkLuuTru(hubCuaPath(input.dapAnPath), input.dapAnPath) : null;
  const {data, error} = await hubClient("MAIN").from("de_thi").insert({mon: input.mon, ten: input.ten, ngay: input.ngay, url_file: url, loai: input.loai, duong_dan: input.path, user_id: uid, kich_thuoc: input.kichThuoc, ten_goc: input.tenGoc, url_dap_an: urlDapAn, dap_an_duong_dan: input.dapAnPath ?? null, dap_an_kich_thuoc: input.dapAnKichThuoc ?? null, dap_an_ten_goc: input.dapAnTenGoc ?? null}).select("*").maybeSingle();
  if (error || !data) return {ok: false, error: error?.message ?? "Không ghi được đề."};
  return {ok: true, row: data as Record<string, unknown>};
}
export async function capNhatDe(id: string, input: {mon: Mon; ten: string; ngay: string; loai: Loai; path: string | null; kichThuoc: number | null; tenGoc: string | null} & DapAnInput): Promise<KetQuaGhi> {
  const uid = await adminUid();
  if (!uid) return {ok: false, error: "Không có quyền quản trị."};
  const {data: cu} = await hubClient("MAIN").from("de_thi").select("duong_dan,dap_an_duong_dan").eq("id", id).maybeSingle();
  const patch: Record<string, unknown> = {mon: input.mon, ten: input.ten, ngay: input.ngay};
  if (input.path) {
    patch.loai = input.loai;
    patch.duong_dan = input.path;
    patch.url_file = await linkLuuTru(hubCuaPath(input.path), input.path);
    patch.kich_thuoc = input.kichThuoc;
    patch.ten_goc = input.tenGoc;
  }
  if (input.xoaDapAn) {
    patch.url_dap_an = null;
    patch.dap_an_duong_dan = null;
    patch.dap_an_kich_thuoc = null;
    patch.dap_an_ten_goc = null;
  } else if (input.dapAnPath) {
    patch.url_dap_an = await linkLuuTru(hubCuaPath(input.dapAnPath), input.dapAnPath);
    patch.dap_an_duong_dan = input.dapAnPath;
    patch.dap_an_kich_thuoc = input.dapAnKichThuoc ?? null;
    patch.dap_an_ten_goc = input.dapAnTenGoc ?? null;
  }
  const {data, error} = await hubClient("MAIN").from("de_thi").update(patch).eq("id", id).select("*").maybeSingle();
  if (error || !data) return {ok: false, error: error?.message ?? "Không sửa được đề."};
  if (input.path && cu?.duong_dan) await hubClient(hubCuaPath(String(cu.duong_dan))).storage.from(BUCKET).remove([String(cu.duong_dan)]);
  if ((input.xoaDapAn || input.dapAnPath) && cu?.dap_an_duong_dan) await hubClient(hubCuaPath(String(cu.dap_an_duong_dan))).storage.from(BUCKET).remove([String(cu.dap_an_duong_dan)]);
  return {ok: true, row: data as Record<string, unknown>};
}
export async function xoaDeServer(id: string): Promise<KetQua> {
  const uid = await adminUid();
  if (!uid) return {ok: false, error: "Không có quyền quản trị."};
  const {data} = await hubClient("MAIN").from("de_thi").select("duong_dan,dap_an_duong_dan").eq("id", id).maybeSingle();
  const {error} = await hubClient("MAIN").from("de_thi").delete().eq("id", id);
  if (error) return {ok: false, error: error.message};
  if (data?.duong_dan) await hubClient(hubCuaPath(String(data.duong_dan))).storage.from(BUCKET).remove([String(data.duong_dan)]);
  if (data?.dap_an_duong_dan) await hubClient(hubCuaPath(String(data.dap_an_duong_dan))).storage.from(BUCKET).remove([String(data.dap_an_duong_dan)]);
  return {ok: true};
}
export async function xoaFile(path: string): Promise<void> {
  const uid = await adminUid();
  if (!uid) return;
  await hubClient(hubCuaPath(path)).storage.from(BUCKET).remove([path]);
}
export async function ghimDe(id: string): Promise<KetQua> {
  const uid = await adminUid();
  if (!uid) return {ok: false, error: "Không có quyền quản trị."};
  const {data: de} = await hubClient("MAIN").from("de_thi").select("mon,ghim_at").eq("id", id).maybeSingle();
  if (!de) return {ok: false, error: "Không tìm thấy đề."};
  if (de.ghim_at) return {ok: true};
  const {count} = await hubClient("MAIN").from("de_thi").select("id", {count: "exact", head: true}).eq("mon", de.mon).not("ghim_at", "is", null);
  if ((count ?? 0) >= 3) return {ok: false, error: `Môn ${de.mon} đã ghim đủ 3 đề, bỏ ghim bớt trước.`};
  const {error} = await hubClient("MAIN").from("de_thi").update({ghim_at: new Date().toISOString()}).eq("id", id);
  return error ? {ok: false, error: error.message} : {ok: true};
}
export async function boGhimDe(id: string): Promise<KetQua> {
  const uid = await adminUid();
  if (!uid) return {ok: false, error: "Không có quyền quản trị."};
  const {error} = await hubClient("MAIN").from("de_thi").update({ghim_at: null}).eq("id", id);
  return error ? {ok: false, error: error.message} : {ok: true};
}
export async function xinLinkAnhThongBao(duoi: string): Promise<LinkAnh> {
  const uid = await adminUid();
  if (!uid) return {ok: false, error: "Không có quyền quản trị."};
  if (!ANH_DUOI.includes(duoi)) return {ok: false, error: "Ảnh chỉ nhận png, jpg, webp, gif."};
  const path = `thong-bao/${randomUUID()}.${duoi}`;
  const {data, error} = await hubClient("MAIN").storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) return {ok: false, error: error?.message ?? "Không tạo được link upload ảnh."};
  return {ok: true, path, token: data.token};
}
export async function dangThongBao(input: {noiDung: string; path: string | null}): Promise<KetQua> {
  const uid = await adminUid();
  if (!uid) return {ok: false, error: "Không có quyền quản trị."};
  const noiDung = input.noiDung.trim();
  if (!noiDung && !input.path) return {ok: false, error: "Thông báo cần text hoặc ảnh."};
  if (noiDung.length > 2000) return {ok: false, error: "Text tối đa 2000 ký tự."};
  const urlAnh = input.path ? await linkLuuTru("MAIN", input.path) : "";
  const {error} = await hubClient("MAIN").from("thong_bao").insert({noi_dung: noiDung, url_anh: urlAnh, duong_dan: input.path});
  if (error) {
    if (input.path) await hubClient("MAIN").storage.from(BUCKET).remove([input.path]);
    return {ok: false, error: error.message};
  }
  return {ok: true};
}
export async function xoaThongBao(id: string): Promise<KetQua> {
  const uid = await adminUid();
  if (!uid) return {ok: false, error: "Không có quyền quản trị."};
  const {data} = await hubClient("MAIN").from("thong_bao").select("duong_dan").eq("id", id).maybeSingle();
  const {error} = await hubClient("MAIN").from("thong_bao").delete().eq("id", id);
  if (error) return {ok: false, error: error.message};
  if (data?.duong_dan) await hubClient("MAIN").storage.from(BUCKET).remove([String(data.duong_dan)]);
  return {ok: true};
}
export async function goiTai(id: string): Promise<void> {
  await hubClient("MAIN").rpc("tang_tai", {uid: id});
}
export async function layNguoiDung(): Promise<{ok: true; ds: NguoiDung[]} | {ok: false; error: string}> {
  const uid = await adminUid();
  if (!uid) return {ok: false, error: "Không có quyền quản trị."};
  const {data, error} = await hubClient("MAIN").from("profiles").select("id,email,ho_ten,role,banned,created_at").order("created_at", {ascending: false});
  if (error) return {ok: false, error: error.message};
  return {ok: true, ds: (data ?? []) as NguoiDung[]};
}
export async function banNguoiDung(id: string, banned: boolean): Promise<KetQua> {
  const uid = await adminUid();
  if (!uid) return {ok: false, error: "Không có quyền quản trị."};
  if (id === uid) return {ok: false, error: "Không thể tự ban chính mình."};
  const {error} = await hubClient("MAIN").from("profiles").update({banned}).eq("id", id);
  return error ? {ok: false, error: error.message} : {ok: true};
}
async function uidHienTai(): Promise<string | null> {
  const {data, error} = await (await authClient()).auth.getClaims();
  return error ? null : (data?.claims?.sub ?? null);
}
export async function layDanhGia(deId: string): Promise<DanhGiaTong> {
  const [cl, kq] = await Promise.all([(await authClient()).auth.getClaims(), hubClient("MAIN").from("danh_gia").select("sao,user_id").eq("de_id", deId)]);
  const uid = cl.error ? null : (cl.data?.claims?.sub ?? null);
  const ds = (kq.data ?? []) as HangSao[];
  const dem = ds.length;
  const tong = ds.reduce((s: number, r: HangSao) => s + Number(r.sao), 0);
  const tb = dem ? Math.round((tong / dem) * 10) / 10 : 0;
  const cuaToi = uid ? Number(ds.find((r: HangSao) => r.user_id === uid)?.sao ?? 0) : 0;
  return {tb, dem, cuaToi, tong};
}
export async function danhGia(deId: string, sao: number): Promise<KetQua> {
  if (sao < 1 || sao > 5) return {ok: false, error: "Số sao không hợp lệ."};
  const uid = await uidHienTai();
  if (!uid) return {ok: false, error: "Cần đăng nhập để đánh giá."};
  const {error} = await hubClient("MAIN").from("danh_gia").upsert({de_id: deId, user_id: uid, sao}, {onConflict: "de_id,user_id"});
  return error ? {ok: false, error: error.message} : {ok: true};
}
export async function layBinhLuan(deId: string): Promise<BinhLuan[]> {
  const [cl, kq] = await Promise.all([(await authClient()).auth.getClaims(), hubClient("MAIN").from("binh_luan").select("id,user_id,ten_nguoi,noi_dung,created_at,duyet").eq("de_id", deId).order("created_at", {ascending: false}).limit(60)]);
  const uid = cl.error ? null : (cl.data?.claims?.sub ?? null);
  const rows = (kq.data ?? []) as HangBinhLuan[];
  return rows.filter((r: HangBinhLuan) => r.duyet || (!!uid && r.user_id === uid)).map((r: HangBinhLuan) => ({id: String(r.id), ten_nguoi: String(r.ten_nguoi), noi_dung: String(r.noi_dung), created_at: String(r.created_at), duyet: !!r.duyet, cuaToi: !!uid && r.user_id === uid}));
}
export async function binhLuan(deId: string, noiDung: string): Promise<KetQua> {
  const txt = noiDung.trim();
  if (txt.length < 3) return {ok: false, error: "Nhận xét tối thiểu 3 ký tự."};
  if (txt.length > 600) return {ok: false, error: "Nhận xét tối đa 600 ký tự."};
  const uid = await uidHienTai();
  if (!uid) return {ok: false, error: "Cần đăng nhập để nhận xét."};
  const {data: hs} = await hubClient("MAIN").from("profiles").select("banned,ho_ten,email").eq("id", uid).maybeSingle();
  if (hs?.banned) return {ok: false, error: "Tài khoản bị khóa."};
  const ten = String(hs?.ho_ten ?? "").trim() || String(hs?.email ?? "Thành viên").split("@")[0];
  const {error} = await hubClient("MAIN").from("binh_luan").insert({de_id: deId, user_id: uid, ten_nguoi: ten, noi_dung: txt});
  return error ? {ok: false, error: error.message} : {ok: true};
}
export async function layBinhLuanChoDuyet(): Promise<{ok: true; ds: (BinhLuan & {de_ten: string})[]} | {ok: false; error: string}> {
  const uid = await adminUid();
  if (!uid) return {ok: false, error: "Không có quyền quản trị."};
  const {data, error} = await hubClient("MAIN").from("binh_luan").select("id,ten_nguoi,noi_dung,created_at,duyet,de_thi(ten)").eq("duyet", false).order("created_at", {ascending: true}).limit(100);
  if (error) return {ok: false, error: error.message};
  return {ok: true, ds: (data ?? []).map((r) => {
    const o = r as Record<string, unknown> & {de_thi?: {ten?: string} | null};
    return {id: String(o.id), ten_nguoi: String(o.ten_nguoi), noi_dung: String(o.noi_dung), created_at: String(o.created_at), duyet: false, cuaToi: false, de_ten: String(o.de_thi?.ten ?? "Đề đã xóa")};
  })};
}
export async function duyetBinhLuan(id: string): Promise<KetQua> {
  const uid = await adminUid();
  if (!uid) return {ok: false, error: "Không có quyền quản trị."};
  const {error} = await hubClient("MAIN").from("binh_luan").update({duyet: true}).eq("id", id);
  return error ? {ok: false, error: error.message} : {ok: true};
}
export async function xoaBinhLuan(id: string): Promise<KetQua> {
  const uid = await adminUid();
  if (!uid) return {ok: false, error: "Không có quyền quản trị."};
  const {error} = await hubClient("MAIN").from("binh_luan").delete().eq("id", id);
  return error ? {ok: false, error: error.message} : {ok: true};
}
export async function layThongKe(): Promise<{ok: true; tk: ThongKe} | {ok: false; error: string}> {
  const uid = await adminUid();
  if (!uid) return {ok: false, error: "Không có quyền quản trị."};
  const main = hubClient("MAIN");
  const tu = new Date(Date.now() - 13 * 86400000);
  tu.setHours(0, 0, 0, 0);
  const [de, nk, tv, bl] = await Promise.all([
    main.from("de_thi").select("id,ten,mon,luot_xem,luot_tai,kich_thuoc,dap_an_kich_thuoc,dap_an_duong_dan"),
    main.from("nhat_ky").select("kieu,created_at").gte("created_at", tu.toISOString()).limit(20000),
    main.from("profiles").select("id", {count: "exact", head: true}),
    main.from("binh_luan").select("id", {count: "exact", head: true}).eq("duyet", false)
  ]);
  const ds = de.data ?? [];
  const ngay: {ngay: string; xem: number; tai: number}[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(tu.getTime() + i * 86400000);
    ngay.push({ngay: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`, xem: 0, tai: 0});
  }
  for (const r of nk.data ?? []) {
    const d = new Date(String(r.created_at));
    const idx = Math.floor((new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - tu.getTime()) / 86400000);
    if (idx >= 0 && idx < 14) {
      if (r.kieu === "tai") ngay[idx].tai++;
      else ngay[idx].xem++;
    }
  }
  const monMap = new Map<Mon, {xem: number; tai: number; de: number}>();
  for (const m of DS_MON) monMap.set(m, {xem: 0, tai: 0, de: 0});
  let tongXem = 0;
  let tongTai = 0;
  let bytes = 0;
  let tongDapAn = 0;
  for (const r of ds) {
    const o = monMap.get(chuanMon(String(r.mon)))!;
    const x = Number(r.luot_xem ?? 0);
    const t = Number(r.luot_tai ?? 0);
    o.xem += x;
    o.tai += t;
    o.de++;
    tongXem += x;
    tongTai += t;
    bytes += Number(r.kich_thuoc ?? 0) + Number(r.dap_an_kich_thuoc ?? 0);
    if (r.dap_an_duong_dan) tongDapAn++;
  }
  const top = [...ds].sort((a, b) => Number(b.luot_xem ?? 0) - Number(a.luot_xem ?? 0)).slice(0, 5).map((r) => ({id: String(r.id), ten: String(r.ten), mon: chuanMon(String(r.mon)), xem: Number(r.luot_xem ?? 0), tai: Number(r.luot_tai ?? 0)}));
  return {ok: true, tk: {tongDe: ds.length, tongDapAn, tongXem, tongTai, thanhVien: tv.count ?? 0, choDuyet: bl.count ?? 0, bytes, ngay, mon: DS_MON.map((m) => ({mon: m, ...monMap.get(m)!})), top}};
}