import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function env(name: string): string {
  return (process.env[name] ?? "").trim();
}

let supabaseAdmin: SupabaseClient | null = null;

/** 仅服务端使用。缺 URL / service_role 时立刻抛错，禁止静默降级成 null。 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    const url = env("SUPABASE_URL") || env("NEXT_PUBLIC_SUPABASE_URL");
    const serviceRoleKey = env("SUPABASE_SERVICE_ROLE_KEY");
    const missing: string[] = [];
    if (!url) missing.push("SUPABASE_URL（或 NEXT_PUBLIC_SUPABASE_URL）");
    if (!serviceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
    if (missing.length) {
      throw new Error(`缺少环境变量：${missing.join("、")}`);
    }
    supabaseAdmin = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return supabaseAdmin;
}
