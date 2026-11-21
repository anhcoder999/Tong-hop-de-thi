"use server";
import {cache} from "react";
import {randomUUID} from "node:crypto";
import {after} from "next/server";
import {headers} from "next/headers";
import {adminUid, authClient, BUCKET, hubClient, hubCuaMon, hubCuaPath} from "@/lib/server";
import {xacThucTurnstile} from "@/lib/turnstile";
import {kiemTraToxic} from "@/lib/locToxic";
import {chuanMon, DS_MON, MON_SLUG, type Loai, type Mon} from "@/lib/data";
const NAM_GIU_LINK = 604800;
const GIAY_CHO_BINH_LUAN = 20;
const IP_TOI_DA = 5;
const ANH_DUOI = ["png", "jpg", "jpeg", "webp", "gif"];
export type ThuMuc = "de" | "dap-an";
export type LinkUpload = {ok: true; path: string; signedUrl: string} | {ok: false; error: string};
export type LinkAnh = {ok: true; path: string; token: string} | {ok: false; error: string};
export type KetQuaGhi = {ok: true; row: Record<string, unknown>} | {ok: false; error: string};
export type KetQua = {ok: boolean; error?: string; canXacNhan?: boolean};
export type NguoiDung = {id: string; email: string; ho_ten: string | null; role: string; banned: boolean; created_at: string};
export type DapAnInput = {dapAnPath?: string | null; dapAnKichThuoc?: number | null; dapAnTenGoc?: string | null; xoaDapAn?: boolean};
export type DanhGiaTong = {tb: number; dem: number; cuaToi: number; tong: number};
export type BinhLuan = {id: string; ten_nguoi: string; noi_dung: string; created_at: string; duyet: boolean; cuaToi: boolean};
export type BinhLuanAdminRow = BinhLuan & {de_ten: string; email: string};
export type ThongKe = {tongDe: number; tongDapAn: number; tongXem: number; tongTai: number; thanhVien: number; choDuyet: number; bytes: number; ngay: {ngay: string; xem: number; tai: number}[]; mon: {mon: Mon; xem: number; tai: number; de: number}[]; top: {id: string; ten: string; mon: Mon; xem: number; tai: number}[]};
type HangSao = {sao: number; user_id: string};
type HangBinhLuan = {id: string; user_id: string; ten_nguoi: string; noi_dung: string; created_at: string; duyet: boolean};
const main = () => hubClient("MAIN");
const uidHienTai = cache(async (): Promise<string | null> => {
  const {data, error} = await (await authClient()).auth.getClaims();
  return error ? null : (data?.claims?.sub ?? null);
});
async function layIpVaQuocGia(): Promise<{ip: string; quocGia: string}> {
  const hs = await headers();
  const ip = (hs.get("x-forwarded-for") ?? "").split(",")[0].trim() || hs.get("x-real-ip") || "";
  return {ip, quocGia: (hs.get("x-vercel-ip-country") ?? "").toUpperCase()};
}
async function laMangMayChu(ip: string): Promise<boolean> {
  if (!ip) return false;
  try {
    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,hosting,proxy`, {cache: "no-store"});
    const d = (await res.json()) as {status?: string; hosting?: boolean; proxy?: boolean};
    if (d.status !== "success") return false;
    return !!d.hosting || !!d.proxy;
  } catch {
    return false;
  }
}
function dauNgayVN(): string {
  const now = new Date(Date.now() + 7 * 3600000);
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - 7 * 3600000).toISOString();
}
export async function dangNhap(email: string, password: string, token: string): Promise<KetQua> {
  if (!(await xacThucTurnstile(token))) return {ok: false, error: "Xác thực Turnstile thất bại. Thử lại."};
  const {error} = await (await authClient()).auth.signInWithPassword({email, password});
  return error ? {ok: false, error: error.message} : {ok: true};
}
export async function dangKy(email: string, password: string, hoTen: string, token: string): Promise<KetQua> {
  if (!(await xacThucTurnstile(token))) return {ok: false, error: "Xác thực Turnstile thất bại. Thử lại."};
  const {ip, quocGia} = await layIpVaQuocGia();
  if (quocGia && quocGia !== "VN") return {ok: false, error: "Kho đề hiện chỉ mở đăng ký cho mạng tại Việt Nam."};
  const [mayChu, demIp] = await Promise.all([
    laMangMayChu(ip),
    ip ? main().from("lu_ip_dang_ky").select("id", {count: "exact", head: true}).eq("ip", ip) : Promise.resolve({count: 0})
  ]);
  if (mayChu) return {ok: false, error: "Không chấp nhận đăng ký từ mạng máy chủ, VPN hoặc proxy."};
  if ((demIp.count ?? 0) >= IP_TOI_DA) return {ok: false, error: `IP này đã đăng ký ${demIp.count} tài khoản, tối đa ${IP_TOI_DA}.`};
  const {data, error} = await (await authClient()).auth.signUp({email, password, options: {data: {ho_ten: hoTen}}});
  if (error) return {ok: false, error: error.message};
  const uid = data.user?.id;
  if (uid && ip) after(() => main().from("lu_ip_dang_ky").insert({ip, user_id: uid}).then(() => undefined));
  return {ok: true, canXacNhan: !data.session};
}
export async function guiLaiMa(email: string): Promise<KetQua> {
  const {error} = await (await authClient()).auth.resend({type: "signup", email});
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
  const [url, urlDapAn] = await Promise.all([linkLuuTru(hubCuaPath(input.path), input.path), input.dapAnPath ? linkLuuTru(hubCuaPath(input.dapAnPath), input.dapAnPath) : Promise.resolve(null)]);
  const {data, error} = await main().from("de_thi").insert({mon: input.mon, ten: input.ten, ngay: input.ngay, url_file: url, loai: input.loai, duong_dan: input.path, user_id: uid, kich_thuoc: input.kichThuoc, ten_goc: input.tenGoc, url_dap_an: urlDapAn, dap_an_duong_dan: input.dapAnPath ?? null, dap_an_kich_thuoc: input.dapAnKichThuoc ?? null, dap_an_ten_goc: input.dapAnTenGoc ?? null}).select("*").maybeSingle();
  if (error || !data) return {ok: false, error: error?.message ?? "Không ghi được đề."};
  return {ok: true, row: data as Record<string, unknown>};
}
export async function capNhatDe(id: string, input: {mon: Mon; ten: string; ngay: string; loai: Loai; path: string | null; kichThuoc: number | null; tenGoc: string | null} & DapAnInput): Promise<KetQuaGhi> {
  const uid = await adminUid();
  if (!uid) return {ok: false, error: "Không có quyền quản trị."};
  const [cu, urlMoi, urlDaMoi] = await Promise.all([
    main().from("de_thi").select("duong_dan,dap_an_duong_dan").eq("id", id).maybeSingle(),
    input.path ? linkLuuTru(hubCuaPath(input.path), input.path) : Promise.resolve(null),
    input.dapAnPath ? linkLuuTru(hubCuaPath(input.dapAnPath), input.dapAnPath) : Promise.resolve(null)
  ]);
  const patch: Record<string, unknown> = {mon: input.mon, ten: input.ten, ngay: input.ngay};
  if (input.path) {
    patch.loai = input.loai;
    patch.duong_dan = input.path;
    patch.url_file = urlMoi;
    patch.kich_thuoc = input.kichThuoc;
    patch.ten_goc = input.tenGoc;
  }
  if (input.xoaDapAn) {
    patch.url_dap_an = null;
    patch.dap_an_duong_dan = null;
    patch.dap_an_kich_thuoc = null;
    patch.dap_an_ten_goc = null;
  } else if (input.dapAnPath) {
    patch.url_dap_an = urlDaMoi;
    patch.dap_an_duong_dan = input.dapAnPath;
    patch.dap_an_kich_thuoc = input.dapAnKichThuoc ?? null;
    patch.dap_an_ten_goc = input.dapAnTenGoc ?? null;
  }
  const {data, error} = await main().from("de_thi").update(patch).eq("id", id).select("*").maybeSingle();
  if (error || !data) return {ok: false, error: error?.message ?? "Không sửa được đề."};
  const cuDe = cu.data?.duong_dan ? String(cu.data.duong_dan) : null;
  const cuDa = cu.data?.dap_an_duong_dan ? String(cu.data.dap_an_duong_dan) : null;
  after(async () => {
    await Promise.all([
      input.path && cuDe ? hubClient(hubCuaPath(cuDe)).storage.from(BUCKET).remove([cuDe]) : Promise.resolve(),
      (input.xoaDapAn || input.dapAnPath) && cuDa ? hubClient(hubCuaPath(cuDa)).storage.from(BUCKET).remove([cuDa]) : Promise.resolve()
    ]);
  });
  return {ok: true, row: data as Record<string, unknown>};
}
export async function xoaDeServer(id: string): Promise<KetQua> {
  const uid = await adminUid();
  if (!uid) return {ok: false, error: "Không có quyền quản trị."};
  const {data} = await main().from("de_thi").select("duong_dan,dap_an_duong_dan").eq("id", id).maybeSingle();
  const {error} = await main().from("de_thi").delete().eq("id", id);
  if (error) return {ok: false, error: error.message};
  after(async () => {
    await Promise.all([
      data?.duong_dan ? hubClient(hubCuaPath(String(data.duong_dan))).storage.from(BUCKET).remove([String(data.duong_dan)]) : Promise.resolve(),
      data?.dap_an_duong_dan ? hubClient(hubCuaPath(String(data.dap_an_duong_dan))).storage.from(BUCKET).remove([String(data.dap_an_duong_dan)]) : Promise.resolve()
    ]);
  });
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
  const {data: de} = await main().from("de_thi").select("mon,ghim_at").eq("id", id).maybeSingle();
  if (!de) return {ok: false, error: "Không tìm thấy đề."};
  if (de.ghim_at) return {ok: true};
  const {count} = await main().from("de_thi").select("id", {count: "exact", head: true}).eq("mon", de.mon).not("ghim_at", "is", null);
  if ((count ?? 0) >= 3) return {ok: false, error: `Môn ${de.mon} đã ghim đủ 3 đề, bỏ ghim bớt trước.`};
  const {error} = await main().from("de_thi").update({ghim_at: new Date().toISOString()}).eq("id", id);
  return error ? {ok: false, error: error.message} : {ok: true};
}
export async function boGhimDe(id: string): Promise<KetQua> {
  const uid = await adminUid();
  if (!uid) return {ok: false, error: "Không có quyền quản trị."};
  const {error} = await main().from("de_thi").update({ghim_at: null}).eq("id", id);
  return error ? {ok: false, error: error.message} : {ok: true};
}
export async function xinLinkAnhThongBao(duoi: string): Promise<LinkAnh> {
  const uid = await adminUid();
  if (!uid) return {ok: false, error: "Không có quyền quản trị."};
  if (!ANH_DUOI.includes(duoi)) return {ok: false, error: "Ảnh chỉ nhận png, jpg, webp, gif."};
  const path = `thong-bao/${randomUUID()}.${duoi}`;
  const {data, error} = await main().storage.from(BUCKET).createSignedUploadUrl(path);
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
  const {error} = await main().from("thong_bao").insert({noi_dung: noiDung, url_anh: urlAnh, duong_dan: input.path});
  if (error) {
    if (input.path) after(() => main().storage.from(BUCKET).remove([input.path as string]).then(() => undefined));
    return {ok: false, error: error.message};
  }
  return {ok: true};
}
export async function xoaThongBao(id: string): Promise<KetQua> {
  const uid = await adminUid();
  if (!uid) return {ok: false, error: "Không có quyền quản trị."};
  const {data} = await main().from("thong_bao").select("duong_dan").eq("id", id).maybeSingle();
  const {error} = await main().from("thong_bao").delete().eq("id", id);
  if (error) return {ok: false, error: error.message};
  if (data?.duong_dan) after(() => main().storage.from(BUCKET).remove([String(data.duong_dan)]).then(() => undefined));
  return {ok: true};
}
export async function goiTai(id: string): Promise<KetQua> {
  const uid = await uidHienTai();
  if (!uid) return {ok: false, error: "Cần đăng nhập để tải."};
  after(() => main().rpc("tang_tai", {uid: id}).then(() => undefined));
  return {ok: true};
}
export async function layNguoiDung(): Promise<{ok: true; ds: NguoiDung[]} | {ok: false; error: string}> {
  const uid = await adminUid();
  if (!uid) return {ok: false, error: "Không có quyền quản trị."};
  const {data, error} = await main().from("profiles").select("id,email,ho_ten,role,banned,created_at").order("created_at", {ascending: false});
  if (error) return {ok: false, error: error.message};
  return {ok: true, ds: (data ?? []) as NguoiDung[]};
}
export async function banNguoiDung(id: string, banned: boolean): Promise<KetQua> {
  const uid = await adminUid();
  if (!uid) return {ok: false, error: "Không có quyền quản trị."};
  if (id === uid) return {ok: false, error: "Không thể tự ban chính mình."};
  const {error} = await main().from("profiles").update({banned}).eq("id", id);
  return error ? {ok: false, error: error.message} : {ok: true};
}
export async function layDanhGia(deId: string): Promise<DanhGiaTong> {
  const [uid, kq] = await Promise.all([uidHienTai(), main().from("danh_gia").select("sao,user_id").eq("de_id", deId)]);
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
  const {error} = await main().from("danh_gia").upsert({de_id: deId, user_id: uid, sao}, {onConflict: "de_id,user_id"});
  return error ? {ok: false, error: error.message} : {ok: true};
}
export async function layBinhLuan(deId: string): Promise<BinhLuan[]> {
  const [uid, kq] = await Promise.all([uidHienTai(), main().from("binh_luan").select("id,user_id,ten_nguoi,noi_dung,created_at,duyet").eq("de_id", deId).order("created_at", {ascending: false}).limit(60)]);
  const rows = (kq.data ?? []) as HangBinhLuan[];
  return rows.filter((r: HangBinhLuan) => r.duyet || (!!uid && r.user_id === uid)).map((r: HangBinhLuan) => ({id: String(r.id), ten_nguoi: String(r.ten_nguoi), noi_dung: String(r.noi_dung), created_at: String(r.created_at), duyet: !!r.duyet, cuaToi: !!uid && r.user_id === uid}));
}
export async function binhLuan(deId: string, noiDung: string): Promise<KetQua> {
  const txt = noiDung.trim();
  if (txt.length < 3) return {ok: false, error: "Nhận xét tối thiểu 3 ký tự."};
  if (txt.length > 600) return {ok: false, error: "Nhận xét tối đa 600 ký tự."};
  const uid = await uidHienTai();
  if (!uid) return {ok: false, error: "Cần đăng nhập để nhận xét."};
  const tuKho = kiemTraToxic(txt);
  if (tuKho) return {ok: false, error: `Nhận xét có từ ngữ không phù hợp ("${tuKho}"), cậu viết lại nhé.`};
  const [daCo, homNay, ganNhat, hs] = await Promise.all([
    main().from("binh_luan").select("id", {count: "exact", head: true}).eq("de_id", deId).eq("user_id", uid),
    main().from("binh_luan").select("id", {count: "exact", head: true}).eq("user_id", uid).gte("created_at", dauNgayVN()),
    main().from("binh_luan").select("created_at").eq("user_id", uid).order("created_at", {ascending: false}).limit(1).maybeSingle(),
    main().from("profiles").select("banned,ho_ten,email").eq("id", uid).maybeSingle()
  ]);
  if ((daCo.count ?? 0) > 0) return {ok: false, error: "Cậu đã nhận xét đề này rồi, mỗi đề chỉ một nhận xét thôi."};
  if ((homNay.count ?? 0) > 0) return {ok: false, error: "Hôm nay cậu đã nhận xét rồi, qua ngày mới viết tiếp nhé."};
  if (ganNhat.data && Date.now() - new Date(String(ganNhat.data.created_at)).getTime() < GIAY_CHO_BINH_LUAN * 1000) return {ok: false, error: `Cậu gửi nhanh quá, chờ ${GIAY_CHO_BINH_LUAN} giây rồi gửi lại nhé.`};
  if (hs.data?.banned) return {ok: false, error: "Tài khoản bị khóa."};
  const ten = String(hs.data?.ho_ten ?? "").trim() || String(hs.data?.email ?? "Thành viên").split("@")[0];
  const {error} = await main().from("binh_luan").insert({de_id: deId, user_id: uid, ten_nguoi: ten, noi_dung: txt, duyet: true});
  if (error) {
    if (error.code === "23505") return {ok: false, error: "Cậu đã nhận xét đề này rồi."};
    return {ok: false, error: error.message};
  }
  return {ok: true};
}
export async function layBinhLuanAdmin(): Promise<{ok: true; ds: BinhLuanAdminRow[]} | {ok: false; error: string}> {
  const uid = await adminUid();
  if (!uid) return {ok: false, error: "Không có quyền quản trị."};
  const {data, error} = await main().from("binh_luan").select("id,user_id,ten_nguoi,noi_dung,created_at,duyet,de_thi(ten)").order("created_at", {ascending: false}).limit(100);
  if (error) return {ok: false, error: error.message};
  const rows = (data ?? []) as (Record<string, unknown> & {user_id: string; de_thi?: {ten?: string} | null})[];
  const ids = [...new Set(rows.map((r) => String(r.user_id)))];
  const email = new Map<string, string>();
  if (ids.length) {
    const {data: hs} = await main().from("profiles").select("id,email").in("id", ids);
    for (const p of hs ?? []) email.set(String(p.id), String(p.email));
  }
  return {ok: true, ds: rows.map((o) => ({id: String(o.id), ten_nguoi: String(o.ten_nguoi), noi_dung: String(o.noi_dung), created_at: String(o.created_at), duyet: !!o.duyet, cuaToi: false, de_ten: String(o.de_thi?.ten ?? "Đề đã xóa"), email: email.get(String(o.user_id)) ?? ""}))};
}
export async function doiAnBinhLuan(id: string, hien: boolean): Promise<KetQua> {
  const uid = await adminUid();
  if (!uid) return {ok: false, error: "Không có quyền quản trị."};
  const {error} = await main().from("binh_luan").update({duyet: hien}).eq("id", id);
  return error ? {ok: false, error: error.message} : {ok: true};
}
export async function xoaBinhLuan(id: string): Promise<KetQua> {
  const uid = await adminUid();
  if (!uid) return {ok: false, error: "Không có quyền quản trị."};
  const {error} = await main().from("binh_luan").delete().eq("id", id);
  return error ? {ok: false, error: error.message} : {ok: true};
}
export async function layThongKe(): Promise<{ok: true; tk: ThongKe} | {ok: false; error: string}> {
  const uid = await adminUid();
  if (!uid) return {ok: false, error: "Không có quyền quản trị."};
  const tu = new Date(Date.now() - 13 * 86400000);
  tu.setHours(0, 0, 0, 0);
  const [de, nk, tv, bl] = await Promise.all([
    main().from("de_thi").select("id,ten,mon,luot_xem,luot_tai,kich_thuoc,dap_an_kich_thuoc,dap_an_duong_dan"),
    main().rpc("thong_ke_ngay", {tu: tu.toISOString()}),
    main().from("profiles").select("id", {count: "exact", head: true}),
    main().from("binh_luan").select("id", {count: "exact", head: true}).eq("duyet", false)
  ]);
  const ds = de.data ?? [];
  const theoNgay = new Map<string, {xem: number; tai: number}>();
  for (const r of (nk.data ?? []) as {ngay_date: string; xem: string; tai: string}[]) theoNgay.set(String(r.ngay_date).slice(0, 10), {xem: Number(r.xem), tai: Number(r.tai)});
  const ngay: {ngay: string; xem: number; tai: number}[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(tu.getTime() + i * 86400000);
    const o = theoNgay.get(d.toISOString().slice(0, 10)) ?? {xem: 0, tai: 0};
    ngay.push({ngay: `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`, xem: o.xem, tai: o.tai});
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