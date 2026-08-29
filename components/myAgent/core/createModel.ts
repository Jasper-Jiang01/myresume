/**
 * OpenAI 兼容客户端工厂。
 * 惰性创建，避免模块加载阶段（含 GitHub Pages 静态导出的 collect-page-data）
 * 因缺失环境变量而中断构建；仅在动态部署（如 Vercel）实际调用时初始化。
 */
import OpenAI from "openai";

let openai: OpenAI | null = null;

/** 返回单例 Chat Completions 客户端。缺 OPENAI_API_KEY 时抛错。 */
export function getOpenAI(): OpenAI {
  if (!openai) {
    const apiKey = env("OPENAI_API_KEY");
    if (!apiKey) {
      throw new Error("缺少环境变量：OPENAI_API_KEY");
    }
    openai = new OpenAI({
      apiKey,
      baseURL: env("OPENAI_BASE_URL") || "https://api.openai.com/v1",
    });
  }
  return openai;
}

/** 读取并 trim 环境变量；未设置时返回空字符串。 */
export function env(name: string): string {
  return (process.env[name] ?? "").trim();
}
