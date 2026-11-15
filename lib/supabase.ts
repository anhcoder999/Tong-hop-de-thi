import {createBrowserClient} from "@supabase/ssr";
export const BUCKET = "de-thi";
export const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL_MAIN!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_MAIN!);