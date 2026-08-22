import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * 浏览器端 Supabase 客户端。
 * 环境变量缺失时返回 null，避免在未配置后端时拖垮整页（对话框仍可渲染 UI）。
 */
let client: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    client = null;
    return client;
  }

  client = createClient(url, anonKey);
  return client;
}
