import "server-only";
import {createClient, type SupabaseClient} from "@supabase/supabase-js";
import {createServerClient} from "@supabase/ssr";
import {cookies} from "next/headers";
import {BUCKET} from "./supabase";
import {MON_SLUG, type Mon} from "./data";
export type Hub = "MAIN" | "LHS" | "SDG" | "TCK";
const SLUG_HUB: Record<string, Hub> = {toan:"MAIN",van:"MAIN",anh:"MAIN","vat-li":"LHS","hoa-hoc":"LHS","sinh-hoc":"LHS",su:"SDG",dia:"SDG",ktpl:"SDG","tin-hoc":"TCK","cong-nghe":"TCK",khac:"TCK"};
export const hubCuaPath = (path: string): Hub => SLUG_HUB[path.split("/")[0]] ?? "MAIN";
export const hubCuaMon = (mon: Mon): Hub => hubCuaPath(MON_SLUG[mon]);
const env = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Thiếu env: ${name}`);
  return value;
};
const CONFIG: Record<Hub, () => {url: string; key: string}> = {
  MAIN: () => ({url: env("NEXT_PUBLIC_SUPABASE_URL_MAIN"), key: env("SUPABASE_SECRET_KEY_MAIN")}),
  LHS: () => ({url: env("SUPABASE_URL_LHS"), key: env("SUPABASE_SECRET_KEY_LHS")}),
  SDG: () => ({url: env("SUPABASE_URL_SDG"), key: env("SUPABASE_SECRET_KEY_SDG")}),
  TCK: () => ({url: env("SUPABASE_URL_TCK"), key: env("SUPABASE_SECRET_KEY_TCK")})
};
const cache = new Map<Hub, SupabaseClient>();
export function hubClient(hub: Hub): SupabaseClient {
  const hit = cache.get(hub);
  if (hit) return hit;
  const {url, key} = CONFIG[hub]();
  const client = createClient(url, key, {auth: {persistSession: false, autoRefreshToken: false}});
  cache.set(hub, client);
  return client;
}
export async function authClient() {
  const store = await cookies();
  return createServerClient(env("NEXT_PUBLIC_SUPABASE_URL_MAIN"), env("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_MAIN"), {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const {name, value, options} of list) store.set(name, value, options);
        } catch {}
      }
    }
  });
}
export async function adminUid(): Promise<string | null> {
  const {data, error} = await (await authClient()).auth.getClaims();
  const uid = data?.claims?.sub;
  if (error || !uid) return null;
  const {data: hoSo} = await hubClient("MAIN").from("profiles").select("role,banned").eq("id", uid).maybeSingle();
  return hoSo?.role === "admin" && !hoSo?.banned ? uid : null;
}
export {BUCKET};