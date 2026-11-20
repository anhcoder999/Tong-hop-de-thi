"use server";
import {adminUid, authClient, hubClient} from "@/lib/server";
import {chuanMon} from "@/lib/data";
import {DIEM_DUNG_SAI, KY_HIEU_DS, KY_HIEU_MCQ, SO_LAN_THOAT_TOI_DA, lamTron, soSanhNgan, type CauHoiCongKhai, type CauHoiDayDu, type DeThiOnline, type DeThiTomTat, type KetQuaBai, type KetQuaCau, type LichSuThi, type LoaiCau, type LuaChon, type TraLoi} from "@/lib/thiThu";
export type KetQua = {ok: boolean; error?: string};
export type PhongThi = {ok: true; baiThiId: string; ten: string; mon: string; thoiGianPhut: number; hanNop: string; soLanThoat: number; traLoi: TraLoi; cau: CauHoiCongKhai[]} | {ok: false; error: string};
const main = () => hubClient("MAIN");
async function uid(): Promise<string | null> {
  const {data, error} = await (await authClient()).auth.getClaims();
  return error ? null : (data?.claims?.sub ?? null);
}
function deRow(r: Record<string, unknown>, soCau: number): DeThiOnline {
  return {id: String(r.id), mon: chuanMon(String(r.mon ?? "")), ten: String(r.ten), mo_ta: String(r.mo_ta ?? ""), thoi_gian_phut: Number(r.thoi_gian_phut ?? 50), cong_khai: !!r.cong_khai, created_at: String(r.created_at), so_cau: soCau};
}
function cauRow(r: Record<string, unknown>): CauHoiDayDu {
  return {
    id: String(r.id),
    thu_tu: Number(r.thu_tu ?? 1),
    loai: String(r.loai) as LoaiCau,
    noi_dung: String(r.noi_dung ?? ""),
    diem: Number(r.diem ?? 1),
    lua_chon: (Array.isArray(r.lua_chon) ? r.lua_chon : []) as LuaChon[],
    dap_an_mcq: String(r.dap_an_mcq ?? ""),
    dap_an_ds: (r.dap_an_ds && typeof r.dap_an_ds === "object" ? r.dap_an_ds : {}) as Record<string, boolean>,
    dap_an_ngan: String(r.dap_an_ngan ?? ""),
    giai_thich: String(r.giai_thich ?? "")
  };
}
function cauCongKhai(c: CauHoiDayDu): CauHoiCongKhai {
  return {id: c.id, thu_tu: c.thu_tu, loai: c.loai, noi_dung: c.noi_dung, diem: c.diem, lua_chon: c.lua_chon};
}
function chamCau(c: CauHoiDayDu, tl: TraLoi): {diem_dat: number; dung: boolean; so_y_dung: number} {
  const chon = tl[c.id];
  if (c.loai === "trac_nghiem") {
    const dung = typeof chon === "string" && chon === c.dap_an_mcq;
    return {diem_dat: dung ? c.diem : 0, dung, so_y_dung: dung ? 1 : 0};
  }
  if (c.loai === "dung_sai") {
    const obj = chon && typeof chon === "object" ? chon : {};
    let soY = 0;
    for (const k of KY_HIEU_DS) if (typeof obj[k] === "boolean" && obj[k] === !!c.dap_an_ds[k]) soY++;
    return {diem_dat: lamTron(c.diem * (DIEM_DUNG_SAI[soY] ?? 0)), dung: soY === 4, so_y_dung: soY};
  }
  const dung = typeof chon === "string" && soSanhNgan(chon, c.dap_an_ngan);
  return {diem_dat: dung ? c.diem : 0, dung, so_y_dung: dung ? 1 : 0};
}
async function layCauTheoDe(deId: string): Promise<CauHoiDayDu[]> {
  const {data} = await main().from("cau_hoi_online").select("*").eq("de_id", deId).order("thu_tu", {ascending: true}).order("created_at", {ascending: true});
  return (data ?? []).map((r) => cauRow(r as Record<string, unknown>));
}
function ketQuaTu(bai: Record<string, unknown>, de: Record<string, unknown>, ds: CauHoiDayDu[]): KetQuaBai {
  const tl = (bai.tra_loi && typeof bai.tra_loi === "object" ? bai.tra_loi : {}) as TraLoi;
  const viPham = String(bai.trang_thai) === "vi_pham";
  const cau: KetQuaCau[] = ds.map((c) => {
    const k = chamCau(c, tl);
    return {...c, tra_loi: tl[c.id] ?? null, diem_dat: k.diem_dat, dung: k.dung, so_y_dung: k.so_y_dung};
  });
  return {
    baiThiId: String(bai.id),
    deId: String(bai.de_id),
    ten: String(de.ten ?? "Đề thi"),
    mon: String(de.mon ?? ""),
    diem: viPham ? 0 : Number(bai.diem ?? 0),
    tongDiem: Number(bai.tong_diem ?? lamTron(ds.reduce((s, c) => s + c.diem, 0))),
    soCauDung: Number(bai.so_cau_dung ?? 0),
    soCau: ds.length,
    soLanThoat: Number(bai.so_lan_thoat ?? 0),
    viPham,
    nopLuc: (bai.nop_luc as string | null) ?? null,
    phutLam: Number(bai.phut_lam ?? 0),
    cau
  };
}
export async function taoDeOnline(input: {mon: string; ten: string; mo_ta: string; thoi_gian_phut: number}): Promise<{ok: true; id: string} | {ok: false; error: string}> {
  const u = await adminUid();
  if (!u) return {ok: false, error: "Không có quyền quản trị."};
  const ten = input.ten.trim();
  if (ten.length < 3) return {ok: false, error: "Tên đề tối thiểu 3 ký tự."};
  const phut = Math.round(input.thoi_gian_phut);
  if (!(phut >= 5 && phut <= 180)) return {ok: false, error: "Thời gian từ 5 đến 180 phút."};
  const {data, error} = await main().from("de_thi_online").insert({mon: chuanMon(input.mon), ten, mo_ta: input.mo_ta.trim(), thoi_gian_phut: phut, created_by: u}).select("id").maybeSingle();
  if (error || !data) return {ok: false, error: error?.message ?? "Không tạo được đề."};
  return {ok: true, id: String(data.id)};
}
export async function capNhatDeOnline(id: string, input: {mon: string; ten: string; mo_ta: string; thoi_gian_phut: number}): Promise<KetQua> {
  const u = await adminUid();
  if (!u) return {ok: false, error: "Không có quyền quản trị."};
  const ten = input.ten.trim();
  if (ten.length < 3) return {ok: false, error: "Tên đề tối thiểu 3 ký tự."};
  const phut = Math.round(input.thoi_gian_phut);
  if (!(phut >= 5 && phut <= 180)) return {ok: false, error: "Thời gian từ 5 đến 180 phút."};
  const {error} = await main().from("de_thi_online").update({mon: chuanMon(input.mon), ten, mo_ta: input.mo_ta.trim(), thoi_gian_phut: phut}).eq("id", id);
  return error ? {ok: false, error: error.message} : {ok: true};
}
export async function xoaDeOnline(id: string): Promise<KetQua> {
  const u = await adminUid();
  if (!u) return {ok: false, error: "Không có quyền quản trị."};
  const {error} = await main().from("de_thi_online").delete().eq("id", id);
  return error ? {ok: false, error: error.message} : {ok: true};
}
export async function congKhaiDeOnline(id: string, giaTri: boolean): Promise<KetQua> {
  const u = await adminUid();
  if (!u) return {ok: false, error: "Không có quyền quản trị."};
  if (giaTri) {
    const {count} = await main().from("cau_hoi_online").select("id", {count: "exact", head: true}).eq("de_id", id);
    if (!count) return {ok: false, error: "Đề chưa có câu hỏi nào, chưa thể công khai."};
  }
  const {error} = await main().from("de_thi_online").update({cong_khai: giaTri}).eq("id", id);
  return error ? {ok: false, error: error.message} : {ok: true};
}
export async function layDeOnlineAdmin(): Promise<{ok: true; ds: DeThiOnline[]} | {ok: false; error: string}> {
  const u = await adminUid();
  if (!u) return {ok: false, error: "Không có quyền quản trị."};
  const [de, cau] = await Promise.all([main().from("de_thi_online").select("*").order("created_at", {ascending: false}), main().from("cau_hoi_online").select("de_id")]);
  if (de.error) return {ok: false, error: de.error.message};
  const dem = new Map<string, number>();
  for (const r of cau.data ?? []) dem.set(String(r.de_id), (dem.get(String(r.de_id)) ?? 0) + 1);
  return {ok: true, ds: (de.data ?? []).map((r) => deRow(r as Record<string, unknown>, dem.get(String(r.id)) ?? 0))};
}
export async function layCauHoiAdmin(deId: string): Promise<{ok: true; ds: CauHoiDayDu[]} | {ok: false; error: string}> {
  const u = await adminUid();
  if (!u) return {ok: false, error: "Không có quyền quản trị."};
  return {ok: true, ds: await layCauTheoDe(deId)};
}
export async function luuCauHoi(input: {id?: string; de_id: string; thu_tu: number; loai: LoaiCau; noi_dung: string; diem: number; lua_chon: LuaChon[]; dap_an_mcq: string; dap_an_ds: Record<string, boolean>; dap_an_ngan: string; giai_thich: string}): Promise<KetQua> {
  const u = await adminUid();
  if (!u) return {ok: false, error: "Không có quyền quản trị."};
  if (!input.noi_dung.trim()) return {ok: false, error: "Nội dung câu hỏi đang trống."};
  if (!(input.diem > 0 && input.diem <= 10)) return {ok: false, error: "Điểm mỗi câu từ 0.25 đến 10."};
  const ban: Record<string, unknown> = {de_id: input.de_id, thu_tu: Math.max(1, Math.round(input.thu_tu)), loai: input.loai, noi_dung: input.noi_dung.trim(), diem: input.diem, giai_thich: input.giai_thich.trim(), lua_chon: [], dap_an_mcq: "", dap_an_ds: {}, dap_an_ngan: ""};
  if (input.loai === "trac_nghiem") {
    const lc = KY_HIEU_MCQ.map((k) => ({ky_hieu: k, noi_dung: (input.lua_chon.find((x) => x.ky_hieu === k)?.noi_dung ?? "").trim()}));
    if (lc.some((x) => !x.noi_dung)) return {ok: false, error: "Nhập đủ nội dung 4 phương án A, B, C, D."};
    if (!KY_HIEU_MCQ.includes(input.dap_an_mcq)) return {ok: false, error: "Chọn phương án đúng."};
    ban.lua_chon = lc;
    ban.dap_an_mcq = input.dap_an_mcq;
  } else if (input.loai === "dung_sai") {
    const lc = KY_HIEU_DS.map((k) => ({ky_hieu: k, noi_dung: (input.lua_chon.find((x) => x.ky_hieu === k)?.noi_dung ?? "").trim()}));
    if (lc.some((x) => !x.noi_dung)) return {ok: false, error: "Nhập đủ nội dung 4 phát biểu a, b, c, d."};
    if (KY_HIEU_DS.some((k) => typeof input.dap_an_ds[k] !== "boolean")) return {ok: false, error: "Chọn Đúng/Sai cho cả 4 phát biểu."};
    ban.lua_chon = lc;
    ban.dap_an_ds = Object.fromEntries(KY_HIEU_DS.map((k) => [k, !!input.dap_an_ds[k]]));
  } else {
    if (!input.dap_an_ngan.trim()) return {ok: false, error: "Nhập đáp án đúng cho câu trả lời ngắn."};
    ban.dap_an_ngan = input.dap_an_ngan.trim();
  }
  const q = input.id ? main().from("cau_hoi_online").update(ban).eq("id", input.id) : main().from("cau_hoi_online").insert(ban);
  const {error} = await q;
  return error ? {ok: false, error: error.message} : {ok: true};
}
export async function xoaCauHoi(id: string): Promise<KetQua> {
  const u = await adminUid();
  if (!u) return {ok: false, error: "Không có quyền quản trị."};
  const {error} = await main().from("cau_hoi_online").delete().eq("id", id);
  return error ? {ok: false, error: error.message} : {ok: true};
}
export async function layTrangThiThu(): Promise<{ok: true; ds: DeThiTomTat[]; lichSu: LichSuThi[]} | {ok: false; error: string}> {
  const u = await uid();
  if (!u) return {ok: false, error: "Cần đăng nhập để vào phòng thi."};
  const [de, cau, bai] = await Promise.all([
    main().from("de_thi_online").select("*").eq("cong_khai", true).order("created_at", {ascending: false}),
    main().from("cau_hoi_online").select("de_id"),
    main().from("bai_thi_online").select("id,de_id,diem,tong_diem,so_cau_dung,trang_thai,nop_luc,phut_lam,created_at").eq("user_id", u).order("created_at", {ascending: false}).limit(30)
  ]);
  if (de.error) return {ok: false, error: de.error.message};
  const dem = new Map<string, number>();
  for (const r of cau.data ?? []) dem.set(String(r.de_id), (dem.get(String(r.de_id)) ?? 0) + 1);
  const dsDe = (de.data ?? []).map((r) => deRow(r as Record<string, unknown>, dem.get(String(r.id)) ?? 0));
  const tenDe = new Map(dsDe.map((d) => [d.id, d]));
  const soLan = new Map<string, number>();
  const caoNhat = new Map<string, number>();
  for (const b of bai.data ?? []) {
    const id = String(b.de_id);
    soLan.set(id, (soLan.get(id) ?? 0) + 1);
    if (String(b.trang_thai) === "da_nop") caoNhat.set(id, Math.max(caoNhat.get(id) ?? 0, Number(b.diem ?? 0)));
  }
  const lichSu: LichSuThi[] = (bai.data ?? []).map((b) => {
    const d = tenDe.get(String(b.de_id));
    return {id: String(b.id), de_id: String(b.de_id), ten: d?.ten ?? "Đề đã ẩn", mon: d?.mon ?? "Khác", diem: Number(b.diem ?? 0), tong_diem: Number(b.tong_diem ?? 0), so_cau_dung: Number(b.so_cau_dung ?? 0), trang_thai: String(b.trang_thai), nop_luc: (b.nop_luc as string | null) ?? null, phut_lam: Number(b.phut_lam ?? 0), created_at: String(b.created_at)};
  });
  return {ok: true, ds: dsDe.filter((d) => d.so_cau > 0).map((d) => ({...d, so_lan_thi: soLan.get(d.id) ?? 0, diem_cao_nhat: caoNhat.has(d.id) ? (caoNhat.get(d.id) as number) : null})), lichSu};
}
export async function batDauThi(deId: string): Promise<PhongThi> {
  const u = await uid();
  if (!u) return {ok: false, error: "Cần đăng nhập để thi."};
  const {data: hoSo} = await main().from("profiles").select("banned").eq("id", u).maybeSingle();
  if (hoSo?.banned) return {ok: false, error: "Tài khoản bị khóa, không thể thi."};
  const {data: de} = await main().from("de_thi_online").select("*").eq("id", deId).eq("cong_khai", true).maybeSingle();
  if (!de) return {ok: false, error: "Đề không tồn tại hoặc chưa công khai."};
  const dsCau = await layCauTheoDe(deId);
  if (!dsCau.length) return {ok: false, error: "Đề chưa có câu hỏi."};
  const {data: dang} = await main().from("bai_thi_online").select("*").eq("de_id", deId).eq("user_id", u).eq("trang_thai", "dang_lam").maybeSingle();
  let bai = dang as Record<string, unknown> | null;
  if (!bai) {
    const {data: moi, error} = await main().from("bai_thi_online").insert({de_id: deId, user_id: u, thoi_gian_phut: Number(de.thoi_gian_phut), tong_diem: lamTron(dsCau.reduce((s, c) => s + c.diem, 0))}).select("*").maybeSingle();
    if (error || !moi) return {ok: false, error: error?.message ?? "Không mở được phòng thi."};
    bai = moi as Record<string, unknown>;
  }
  const batDau = new Date(String(bai.bat_dau)).getTime();
  const phut = Number(bai.thoi_gian_phut);
  return {ok: true, baiThiId: String(bai.id), ten: String(de.ten), mon: String(de.mon), thoiGianPhut: phut, hanNop: new Date(batDau + phut * 60000).toISOString(), soLanThoat: Number(bai.so_lan_thoat ?? 0), traLoi: (bai.tra_loi && typeof bai.tra_loi === "object" ? bai.tra_loi : {}) as TraLoi, cau: dsCau.map(cauCongKhai)};
}
export async function luuNhap(baiThiId: string, traLoi: TraLoi): Promise<KetQua> {
  const u = await uid();
  if (!u) return {ok: false, error: "Chưa đăng nhập."};
  const {data: bai} = await main().from("bai_thi_online").select("id,user_id,trang_thai,bat_dau,thoi_gian_phut").eq("id", baiThiId).maybeSingle();
  if (!bai || String(bai.user_id) !== u) return {ok: false, error: "Không tìm thấy bài thi."};
  if (String(bai.trang_thai) !== "dang_lam") return {ok: false, error: "Bài đã kết thúc."};
  const han = new Date(String(bai.bat_dau)).getTime() + Number(bai.thoi_gian_phut) * 60000;
  if (Date.now() > han + 120000) return {ok: false, error: "het_gio"};
  const {error} = await main().from("bai_thi_online").update({tra_loi: traLoi}).eq("id", baiThiId);
  return error ? {ok: false, error: error.message} : {ok: true};
}
export async function ghiNhanThoat(baiThiId: string): Promise<{ok: boolean; soLan: number; biHuy: boolean; error?: string}> {
  const u = await uid();
  if (!u) return {ok: false, soLan: 0, biHuy: false, error: "Chưa đăng nhập."};
  const {data: bai} = await main().from("bai_thi_online").select("id,user_id,trang_thai,so_lan_thoat,bat_dau").eq("id", baiThiId).maybeSingle();
  if (!bai || String(bai.user_id) !== u) return {ok: false, soLan: 0, biHuy: false, error: "Không tìm thấy bài thi."};
  if (String(bai.trang_thai) !== "dang_lam") return {ok: false, soLan: Number(bai.so_lan_thoat ?? 0), biHuy: String(bai.trang_thai) === "vi_pham"};
  const soLan = Number(bai.so_lan_thoat ?? 0) + 1;
  const biHuy = soLan > SO_LAN_THOAT_TOI_DA;
  const phutLam = lamTron((Date.now() - new Date(String(bai.bat_dau)).getTime()) / 60000);
  const {error} = await main().from("bai_thi_online").update(biHuy ? {so_lan_thoat: soLan, trang_thai: "vi_pham", diem: 0, nop_luc: new Date().toISOString(), phut_lam: phutLam} : {so_lan_thoat: soLan}).eq("id", baiThiId);
  if (error) return {ok: false, soLan, biHuy: false, error: error.message};
  return {ok: true, soLan, biHuy};
}
export async function nopBai(baiThiId: string, traLoi: TraLoi): Promise<{ok: true; ketQua: KetQuaBai} | {ok: false; error: string}> {
  const u = await uid();
  if (!u) return {ok: false, error: "Chưa đăng nhập."};
  const {data: bai} = await main().from("bai_thi_online").select("*").eq("id", baiThiId).maybeSingle();
  if (!bai || String(bai.user_id) !== u) return {ok: false, error: "Không tìm thấy bài thi."};
  const {data: de} = await main().from("de_thi_online").select("id,ten,mon").eq("id", String(bai.de_id)).maybeSingle();
  const dsCau = await layCauTheoDe(String(bai.de_id));
  if (String(bai.trang_thai) !== "dang_lam") return {ok: true, ketQua: ketQuaTu(bai as Record<string, unknown>, (de ?? {}) as Record<string, unknown>, dsCau)};
  const tongDiem = lamTron(dsCau.reduce((s, c) => s + c.diem, 0));
  let diem = 0;
  let soCauDung = 0;
  for (const c of dsCau) {
    const k = chamCau(c, traLoi);
    diem += k.diem_dat;
    if (k.dung) soCauDung++;
  }
  const phutLam = lamTron((Date.now() - new Date(String(bai.bat_dau)).getTime()) / 60000);
  const ban = {tra_loi: traLoi, diem: lamTron(diem), tong_diem: tongDiem, so_cau_dung: soCauDung, nop_luc: new Date().toISOString(), phut_lam: phutLam, trang_thai: "da_nop"};
  const {data: moi, error} = await main().from("bai_thi_online").update(ban).eq("id", baiThiId).select("*").maybeSingle();
  if (error || !moi) return {ok: false, error: error?.message ?? "Không nộp được bài."};
  return {ok: true, ketQua: ketQuaTu(moi as Record<string, unknown>, (de ?? {}) as Record<string, unknown>, dsCau)};
}
export async function layKetQua(baiThiId: string): Promise<{ok: true; ketQua: KetQuaBai} | {ok: false; error: string}> {
  const u = await uid();
  if (!u) return {ok: false, error: "Chưa đăng nhập."};
  const {data: bai} = await main().from("bai_thi_online").select("*").eq("id", baiThiId).maybeSingle();
  if (!bai || String(bai.user_id) !== u) return {ok: false, error: "Không tìm thấy bài thi."};
  if (String(bai.trang_thai) === "dang_lam") return {ok: false, error: "Bài đang làm, chưa có kết quả."};
  const {data: de} = await main().from("de_thi_online").select("id,ten,mon").eq("id", String(bai.de_id)).maybeSingle();
  const dsCau = await layCauTheoDe(String(bai.de_id));
  return {ok: true, ketQua: ketQuaTu(bai as Record<string, unknown>, (de ?? {}) as Record<string, unknown>, dsCau)};
}