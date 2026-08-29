/**
 * 服务端 Supabase 客户端（service_role）。
 * 只给 API Route / 持久化层使用，禁止进入浏览器 bundle。
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** 与 createModel.env 相同语义，保持本文件无跨 core 依赖 */
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
