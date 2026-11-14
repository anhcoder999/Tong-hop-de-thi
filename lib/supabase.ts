import { createClient } from "@supabase/supabase-js";
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://grizacqspnflbyqhgcgv.supabase.co";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_MEuV7r63Vqy5-YByKNJL_Q_wrKXsHIe";
export const BUCKET = "de-thi";
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});