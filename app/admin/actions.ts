"use server";
import {randomUUID} from "node:crypto";
import {revalidatePath} from "next/cache";
import {getAuthClient, getSupabaseClient, isSubject} from "@/lib/supabase/factory";
export type UploadResult = {ok: true; id: string} | {ok: false; error: string};
const BUCKET = "de-thi";
const MAX_SIZE = 4 * 1024 * 1024;
export async function uploadDeThi(formData: FormData): Promise<UploadResult> {
  const auth = getAuthClient();
  const {data, error} = await auth.auth.getClaims();
  if (error || !data?.claims) return {ok: false, error: "Chưa đăng nhập"};
  if ((data.claims.app_metadata as {role?: string} | undefined)?.role !== "admin") return {ok: false, error: "Đéo có quyền admin"};
  const subject = formData.get("mon");
  const rawTitle = formData.get("tieuDe");
  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
  const year = Number(formData.get("nam"));
  const file = formData.get("file");
  if (!isSubject(subject)) return {ok: false, error: "Môn đéo hợp lệ"};
  if (title.length < 3 || title.length > 200) return {ok: false, error: "Tiêu đề phải 3-200 ký tự"};
  if (!Number.isInteger(year) || year < 2000 || year > new Date().getFullYear() + 1) return {ok: false, error: "Năm đéo hợp lệ"};
  if (!(file instanceof File) || file.size === 0 || file.size > MAX_SIZE) return {ok: false, error: "PDF trống hoặc vượt 4MB"};
  if (file.type !== "application/pdf" || (await file.slice(0, 5).text()) !== "%PDF-") return {ok: false, error: "File đéo phải PDF thật"};
  const {data: {session}} = await auth.auth.getSession();
  if (!session) return {ok: false, error: "Phiên hết hạn"};
  const storage = getSupabaseClient(subject, session.access_token);
  const path = `${subject}/${year}/${randomUUID()}.pdf`;
  const {error: uploadError} = await storage.storage.from(BUCKET).upload(path, file, {contentType: "application/pdf", cacheControl: "31536000", upsert: false});
  if (uploadError) return {ok: false, error: "Upload thất bại"};
  const {data: urlData} = storage.storage.from(BUCKET).getPublicUrl(path);
  const {data: row, error: insertError} = await auth.from("de_thi").insert({tieu_de: title, mon: subject, nam: year, url_pdf: urlData.publicUrl, storage_path: path}).select("id").single();
  if (insertError || !row) {
    await storage.storage.from(BUCKET).remove([path]);
    return {ok: false, error: "Lưu metadata thất bại"};
  }
  revalidatePath("/");
  revalidatePath("/admin");
  return {ok: true, id: String(row.id)};
}