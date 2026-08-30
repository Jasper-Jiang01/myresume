/**
 * 用 LangChain 的 initChatModel（Python: init_chat_model）初始化对话模型。
 * 惰性创建，避免模块加载阶段（含 GitHub Pages 静态导出的 collect-page-data）
 * 因缺失环境变量而中断构建；仅在动态部署（如 Vercel）实际调用时初始化。
 */
import { initChatModel } from "langchain/chat_models/universal";
import type { ContextSchema } from "./coreAgentState";

type AgentChatModel = Awaited<ReturnType<typeof initChatModel>>;

const modelCache = new Map<string, Promise<AgentChatModel>>();

/** 读取并 trim 环境变量；未设置时返回空字符串。 */
export function env(name: string): string {
  return (process.env[name] ?? "").trim();
}

/** 缺 OPENAI_API_KEY 时抛错；供进 SSE 前同步校验。 */
export function assertOpenAIKey(): string {
  const apiKey = env("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("缺少环境变量：OPENAI_API_KEY");
  }
  return apiKey;
}

function cacheKey(context: ContextSchema): string {
  return JSON.stringify({
    model: context.model,
    temperature: context.temperature ?? null,
    enableThinking: context.enableThinking === true,
    baseUrl: env("OPENAI_BASE_URL") || "https://api.openai.com/v1",
  });
}

/**
 * 按本轮 Context 初始化 ChatModel。
 * Chat Completions 是官方对话 HTTP 接口；LangChain ChatOpenAI 默认走这条。
 * qwen3.7-plus 不是 OpenAI 官方模型名，必须指定 modelProvider: "openai"。
 * DashScope 只支持 Completions，所以关掉 Responses API。
 */
export function initAgentChatModel(
  context: ContextSchema,
): Promise<AgentChatModel> {
  const key = cacheKey(context);
  const cached = modelCache.get(key);
  if (cached) return cached;

  const created = initChatModel(context.model, {
    modelProvider: "openai",
    apiKey: assertOpenAIKey(),
    configuration: {
      baseURL: env("OPENAI_BASE_URL") || "https://api.openai.com/v1",
    },
    streaming: true,
    useResponsesApi: false,
    modelKwargs: {
      enable_thinking: context.enableThinking === true,
    },
    ...(context.temperature !== undefined
      ? { temperature: context.temperature }
      : {}),
  });
  modelCache.set(key, created);
  return created;
}
