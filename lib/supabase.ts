import {createClient} from "@supabase/supabase-js";
export const BUCKET = "de-thi";
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL_MAIN!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_MAIN!, {
  auth: {persistSession: true, autoRefreshToken: true, detectSessionInUrl: true}
});