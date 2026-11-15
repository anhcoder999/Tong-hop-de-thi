import "server-only";
import {createClient, type SupabaseClient} from "@supabase/supabase-js";
import {createServerClient} from "@supabase/ssr";
import {cookies} from "next/headers";
export const SUBJECTS = ["toan","van","anh","li","hoa","sinh","su","dia","ktpl","tin","cong-nghe","khac"] as const;
export type Subject = (typeof SUBJECTS)[number];
type Hub = "MAIN" | "LHS" | "SDG" | "TCK";
const HUB_OF: Record<Subject, Hub> = {toan:"MAIN",van:"MAIN",anh:"MAIN",li:"LHS",hoa:"LHS",sinh:"LHS",su:"SDG",dia:"SDG",ktpl:"SDG",tin:"TCK","cong-nghe":"TCK",khac:"TCK"};
const env = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
};
const CONFIG: Record<Hub, () => {url: string; key: string}> = {
  MAIN: () => ({url: env("NEXT_PUBLIC_SUPABASE_URL_MAIN"), key: env("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_MAIN")}),
  LHS: () => ({url: env("SUPABASE_URL_LHS"), key: env("SUPABASE_PUBLISHABLE_KEY_LHS")}),
  SDG: () => ({url: env("SUPABASE_URL_SDG"), key: env("SUPABASE_PUBLISHABLE_KEY_SDG")}),
  TCK: () => ({url: env("SUPABASE_URL_TCK"), key: env("SUPABASE_PUBLISHABLE_KEY_TCK")})
};
const cache = new Map<Hub, SupabaseClient>();
export const isSubject = (value: unknown): value is Subject => typeof value === "string" && (SUBJECTS as readonly string[]).includes(value);
export function getSupabaseClient(subject: Subject, accessToken?: string): SupabaseClient {
  const hub = HUB_OF[subject];
  const {url, key} = CONFIG[hub]();
  if (hub === "MAIN" && accessToken) return createClient(url, key, {global: {headers: {Authorization: `Bearer ${accessToken}`}}, auth: {persistSession: false, autoRefreshToken: false}});
  const cached = cache.get(hub);
  if (cached) return cached;
  const client = createClient(url, key, {auth: {persistSession: false, autoRefreshToken: false}});
  cache.set(hub, client);
  return client;
}
export function getAuthClient() {
  const store = cookies();
  const {url, key} = CONFIG.MAIN();
  return createServerClient(url, key, {
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