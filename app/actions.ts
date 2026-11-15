"use server";
import {randomUUID} from "node:crypto";
import {adminUid, BUCKET, hubClient, hubCuaMon, hubCuaPath} from "@/lib/server";
import {MON_SLUG, type Loai, type Mon} from "@/lib/data";
const NAM_GIU_LINK = 31536000;
const ANH_DUOI = ["png", "jpg", "jpeg", "webp", "gif"];
export type LinkUpload = {ok: true; path: string; signedUrl: string} | {ok: false; error: string};
export type LinkAnh = {ok: true; path: string; token: string} | {ok: false; error: string};
export type KetQuaGhi = {ok: true; row: Record<string, unknown>} | {ok: false; error: string};
export type KetQua = {ok: boolean; error?: string};
export async function xinLinkUpload(mon: Mon, loai: Loai): Promise<LinkUpload> {
  const uid = await adminUid();
  if (!uid) return {ok: false, error: "Không có quyền quản trị."};
  const path = `${MON_SLUG[mon]}/${randomUUID()}.${loai}`;
  const {data, error} = await hubClient(hubCuaMon(mon)).storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) return {ok: false, error: error?.message ?? "Không tạo được link upload."};
  return {ok: true, path, signedUrl: data.signedUrl};
}
async function linkLuuTru(hub: ReturnType<typeof hubCuaMon>, path: string): Promise<string> {
  const {data} = await hubClient(hub).storage.from(BUCKET).createSignedUrl(path, NAM_GIU_LINK);
  return data?.signedUrl ?? "";
}
export async function ghiDe(input: {mon: Mon; ten: string; ngay: string; loai: Loai; path: string; kichThuoc: number; tenGoc: string}): Promise<KetQuaGhi> {
  const uid = await adminUid();
  if (!uid) return {ok: false, error: "Không có quyền quản trị."};
  const url = await linkLuuTru(hubCuaPath(input.path), input.path);
  const {data, error} = await hubClient("MAIN").from("de_thi").insert({mon: input.mon, ten: input.ten, ngay: input.ngay, url_file: url, loai: input.loai, duong_dan: input.path, user_id: uid, kich_thuoc: input.kichThuoc, ten_goc: input.tenGoc}).select("*").maybeSingle();
  if (error || !data) return {ok: false, error: error?.message ?? "Không ghi được đề."};
  return {ok: true, row: data as Record<string, unknown>};
}
export async function capNhatDe(id: string, input: {mon: Mon; ten: string; ngay: string; loai: Loai; path: string | null; kichThuoc: number | null; tenGoc: string | null}): Promise<KetQuaGhi> {
  const uid = await adminUid();
  if (!uid) return {ok: false, error: "Không có quyền quản trị."};
  const {data: cu} = await hubClient("MAIN").from("de_thi").select("duong_dan").eq("id", id).maybeSingle();
  const patch: Record<string, unknown> = {mon: input.mon, ten: input.ten, ngay: input.ngay};
  if (input.path) {
    patch.loai = input.loai;
    patch.duong_dan = input.path;
    patch.url_file = await linkLuuTru(hubCuaPath(input.path), input.path);
    patch.kich_thuoc = input.kichThuoc;
    patch.ten_goc = input.tenGoc;
  }
  const {data, error} = await hubClient("MAIN").from("de_thi").update(patch).eq("id", id).select("*").maybeSingle();
  if (error || !data) return {ok: false, error: error?.message ?? "Không sửa được đề."};
  if (input.path && cu?.duong_dan) await hubClient(hubCuaPath(String(cu.duong_dan))).storage.from(BUCKET).remove([String(cu.duong_dan)]);
  return {ok: true, row: data as Record<string, unknown>};
}
export async function xoaDeServer(id: string): Promise<KetQua> {
  const uid = await adminUid();
  if (!uid) return {ok: false, error: "Không có quyền quản trị."};
  const {data} = await hubClient("MAIN").from("de_thi").select("duong_dan").eq("id", id).maybeSingle();
  const {error} = await hubClient("MAIN").from("de_thi").delete().eq("id", id);
  if (error) return {ok: false, error: error.message};
  if (data?.duong_dan) await hubClient(hubCuaPath(String(data.duong_dan))).storage.from(BUCKET).remove([String(data.duong_dan)]);
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