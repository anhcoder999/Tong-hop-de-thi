import {getAuthClient} from "./supabase/factory";
export interface DeThi {
  id: string;
  tieu_de: string;
  mon: string;
  nam: number;
  url_pdf: string;
  storage_path: string;
}
export async function getAllDeThi(): Promise<DeThi[]> {
  const auth = getAuthClient();
  const {data, error} = await auth.from("de_thi").select("*").order("nam", {ascending: false});
  if (error) {
    console.error("Lỗi lấy đề thi:", error);
    return [];
  }
  return data || [];
}
export async function getDeThiById(id: string): Promise<DeThi | null> {
  const auth = getAuthClient();
  const {data, error} = await auth.from("de_thi").select("*").eq("id", id).single();
  if (error) {
    console.error("Lỗi lấy đề thi:", error);
    return null;
  }
  return data;
}
export async function getDeThiByMon(mon: string): Promise<DeThi[]> {
  const auth = getAuthClient();
  const {data, error} = await auth.from("de_thi").select("*").eq("mon", mon).order("nam", {ascending: false});
  if (error) {
    console.error("Lỗi lấy đề thi:", error);
    return [];
  }
  return data || [];
}