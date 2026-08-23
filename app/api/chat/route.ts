/**
 * AI 对话框后端接口。
 *
 * 依赖环境变量（见 components/myAgent/README.md）：
 * - SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
 * - OPENAI_API_KEY / OPENAI_BASE_URL / OPENAI_DEFAULT_MODEL（兼容 LLM_MODEL）
 *
 * 注意：该路由仅在动态部署（Vercel）下生效。GitHub Pages 静态导出
 * （next.config.mjs 中 output: "export"）不会打包 API Route。
 */

import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type {
  ChatCompletionMessageParam,
  ChatCompletionToolMessageParam,
} from "openai/resources/chat/completions";
import {
  AGENT_STREAM_HEADERS,
  consumeChatStream,
  encodeAgentStreamEvent,
  toAssistantToolMessage,
  type AgentStreamEvent,
} from "@/components/myAgent/stream";
import {
  assertWithinIpLimit,
  ensureAnonymousProfile,
  insertConversationMessage,
  isUuid,
  loadLlmHistory,
  normalizeUserContent,
  resolveOwnedConversation,
} from "@/components/myAgent/chatPersistence";
import { getRequestIp, hashIpForRateLimit } from "@/components/myAgent/clientIp";
import { MAX_CHAT_BODY_BYTES } from "@/components/myAgent/limits";
import { getSupabaseAdmin } from "@/components/myAgent/supabaseAdmin";
import {
  AGENT_TOOLS,
  executeAgentTool,
  resolveAllowedNavigate,
  type AgentNavigateAction,
} from "@/components/myAgent/tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// 惰性初始化：避免在模块加载阶段（含 GitHub Pages 静态导出构建时的
// collect-page-data 步骤）因缺失环境变量而抛错中断构建。
// 该路由仅在配置了对应环境变量的动态部署（如 Vercel）下才会被实际调用。
let openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
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

function env(name: string): string {
  return (process.env[name] ?? "").trim();
}

let personaCache: string | null = null;
function getPersona(): string {
  if (personaCache !== null) return personaCache;
  try {
    personaCache = readFileSync(
      join(process.cwd(), "components/myAgent/infomation.md"),
      "utf8"
    );
  } catch {
    personaCache = "";
  }
  return personaCache;
}

function parseLocale(raw: unknown): "zh" | "en" {
  return raw === "en" ? "en" : "zh";
}

function buildSystemPrompt(locale: "zh" | "en"): string {
  const persona = getPersona();
  const localeRule =
    locale === "en"
      ? "Language for this turn: English. Keep the same voice — short, first-person, opinionated. Do not translate the Chinese persona word-for-word."
      : "本轮语言：中文。";
  const toolRule =
    locale === "en"
      ? "Tools: when the visitor clearly wants to open or be taken to a page, call open_project. Do not print a JSON navigate payload in the reply. Do not call it when you are only introducing a project."
      : "工具落地：访客明确要打开、跳转、带去看某页时，调用 open_project；不要在回复文本里输出 {\"action\":\"navigate\"...}。只介绍项目时不要调用。";
  return [persona, localeRule, toolRule].filter(Boolean).join("\n\n");
}

export async function POST(req: NextRequest) {
  try {
    const bodyBytes = Number(req.headers.get("content-length") ?? 0);
    if (bodyBytes > MAX_CHAT_BODY_BYTES) {
      return NextResponse.json(
        { error: "invalid_request", message: "单条消息不能超过 2000 字" },
        { status: 413 }
      );
    }

    const admin = getSupabaseAdmin();
    const ipLimit = await assertWithinIpLimit(
      admin,
      hashIpForRateLimit(getRequestIp(req))
    );
    if (!ipLimit.ok) {
      return NextResponse.json(
        { error: ipLimit.error, message: ipLimit.message },
        { status: ipLimit.status }
      );
    }

    const deviceId = req.headers.get("x-device-id")?.trim() ?? "";
    if (!deviceId || !isUuid(deviceId)) {
      return NextResponse.json(
        { error: "auth_error", message: "请先登录" },
        { status: 401 }
      );
    }

    const body = (await req.json()) as {
      content?: unknown;
      conversationId?: unknown;
      locale?: unknown;
    };

    const parsed = normalizeUserContent(body.content);
    if (!parsed.ok) {
      return NextResponse.json(
        {
          error: "invalid_request",
          message:
            parsed.reason === "too_long"
              ? "单条消息不能超过 2000 字"
              : "请输入要发送的内容",
        },
        { status: 400 }
      );
    }
    const userContent = parsed.content;

    const locale = parseLocale(body.locale);

    const requestedConversationId =
      typeof body.conversationId === "string" ? body.conversationId.trim() : "";

    const profile = await ensureAnonymousProfile(admin, deviceId);
    if (!profile.ok) {
      return NextResponse.json(
        { error: profile.error, message: profile.message },
        { status: profile.status }
      );
    }

    const conversation = await resolveOwnedConversation(
      admin,
      deviceId,
      requestedConversationId || undefined
    );
    if (!conversation.ok) {
      return NextResponse.json(
        { error: conversation.error, message: conversation.message },
        { status: conversation.status }
      );
    }
    const conversationId = conversation.id;

    const savedUser = await insertConversationMessage(
      admin,
      conversationId,
      "user",
      userContent
    );
    if (!savedUser.ok) {
      return NextResponse.json(
        { error: savedUser.error, message: savedUser.message },
        { status: savedUser.status }
      );
    }

    const history = await loadLlmHistory(admin, conversationId);
    if (!history.ok) {
      return NextResponse.json(
        { error: history.error, message: history.message },
        { status: history.status }
      );
    }

    // 2. 调用 LLM：上下文只来自该会话在库中的消息，不采信前端 history
    const openaiClient = getOpenAI();
    const model = env("OPENAI_DEFAULT_MODEL") || env("LLM_MODEL") || "qwen3.7-plus";
    const storedMessages = [...history.messages];
    const lastStored = storedMessages[storedMessages.length - 1];
    if (lastStored?.role !== "user" || lastStored.content !== userContent) {
      storedMessages.push({ role: "user", content: userContent });
    }
    const llmMessages: ChatCompletionMessageParam[] = [
      { role: "system", content: buildSystemPrompt(locale) },
      ...storedMessages,
    ];

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const send = (event: AgentStreamEvent) => {
          try {
            controller.enqueue(encoder.encode(encodeAgentStreamEvent(event)));
          } catch {
            /* client disconnected */
          }
        };

        let fullContent = "";
        try {
          const firstStream = await openaiClient.chat.completions.create({
            model,
            messages: llmMessages,
            tools: AGENT_TOOLS,
            tool_choice: "auto",
            stream: true,
          });

          const first = await consumeChatStream(firstStream, (text) => {
            fullContent += text;
            send({ type: "token", text });
          });

          if (first.toolCalls.length) {
            let navigate: AgentNavigateAction | undefined;
            const toolMessages: ChatCompletionToolMessageParam[] =
              first.toolCalls.map((call) => {
                let args: unknown = {};
                try {
                  args = JSON.parse(call.function.arguments || "{}");
                } catch {
                  args = {};
                }
                const executed = executeAgentTool(call.function.name, args);
                if (executed.navigate) {
                  navigate = resolveAllowedNavigate(
                    executed.navigate.href,
                    executed.navigate.internal
                  ) ?? undefined;
                }
                return {
                  role: "tool" as const,
                  tool_call_id: call.id,
                  content: JSON.stringify(executed.result),
                };
              });

            if (navigate) {
              send({ type: "navigate", ...navigate });
            }

            const followupStream = await openaiClient.chat.completions.create({
              model,
              messages: [
                ...llmMessages,
                toAssistantToolMessage(first),
                ...toolMessages,
              ],
              stream: true,
            });

            await consumeChatStream(followupStream, (text) => {
              fullContent += text;
              send({ type: "token", text });
            });
          }

          send({ type: "done" });

          if (conversationId && fullContent) {
            await insertConversationMessage(
              admin,
              conversationId,
              "assistant",
              fullContent
            );
          }
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "AI 走神了，晚点再来试试吧…";
          send({ type: "error", message });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        ...AGENT_STREAM_HEADERS,
        ...(conversationId ? { "x-conversation-id": conversationId } : {}),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI 走神了，晚点再来试试吧…";
    return NextResponse.json(
      { error: "request_failed", message },
      { status: 500 }
    );
  }
}
