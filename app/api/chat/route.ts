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
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  AGENT_STREAM_HEADERS,
  consumeChatStream,
  encodeAgentStreamEvent,
  toAssistantToolMessage,
  type AgentStreamEvent,
} from "@/components/myAgent/stream";
import {
  assertWithinDailyLimit,
  insertConversationMessage,
  isUuid,
  loadLlmHistory,
  normalizeUserContent,
  resolveOwnedConversation,
} from "@/components/myAgent/chatPersistence";
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

let knowledgeCache: string | null = null;
function getKnowledge(): string {
  if (knowledgeCache !== null) return knowledgeCache;
  try {
    knowledgeCache = readFileSync(
      join(process.cwd(), "components/myAgent/KNOWLEDGE.md"),
      "utf8"
    );
  } catch {
    knowledgeCache = "";
  }
  return knowledgeCache;
}

function parseLocale(raw: unknown): "zh" | "en" {
  return raw === "en" ? "en" : "zh";
}

function buildSystemPrompt(locale: "zh" | "en"): string {
  const knowledge = getKnowledge();
  const instructions =
    locale === "en"
      ? [
          "You are the assistant on Jiang Wenzhe's personal site. Speak in a concise, friendly, female voice, like a colleague who knows his work.",
          "Reply in English. Only use the knowledge table below for his experience, skills, and projects; if it is not there, say you are not sure. Do not invent facts.",
          "You can point visitors to Home, /personalProject, and /mycrafts.",
          "When the visitor clearly asks to open, jump to, or be taken to a project or page, call open_project. Do not just drop a link. Do not call it when only introducing a project.",
        ]
      : [
          "你是蒋文喆个人网站上的小助手，女性口吻，简洁友善，像熟悉他作品的同事。",
          "用中文回答访客。只依据下方知识表介绍他的经历、技能和项目；知识表没有的信息就说不确定，不要编造。",
          "可以引导访客去看首页、/personalProject 作品集、/mycrafts 动效实验站。",
          "当访客明确要求打开、跳转、带去看某个项目或页面时，调用 open_project 工具，不要只丢链接让对方自己点。介绍项目时不要调用该工具。",
        ];
  return [...instructions, knowledge ? `\n---\n${knowledge}` : ""].join("\n");
}

let supabaseAdmin: SupabaseClient | null = null;
function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    // URL 与前端是同一个项目地址，允许回退 NEXT_PUBLIC_SUPABASE_URL。
    const url = env("SUPABASE_URL") || env("NEXT_PUBLIC_SUPABASE_URL");
    const serviceRoleKey = env("SUPABASE_SERVICE_ROLE_KEY");
    const missing: string[] = [];
    if (!url) missing.push("SUPABASE_URL（或 NEXT_PUBLIC_SUPABASE_URL）");
    if (!serviceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
    if (missing.length) {
      throw new Error(`缺少环境变量：${missing.join("、")}`);
    }
    supabaseAdmin = createClient(url, serviceRoleKey);
  }
  return supabaseAdmin;
}

export async function POST(req: NextRequest) {
  try {
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
      nickname?: string;
      locale?: unknown;
    };

    const userContent = normalizeUserContent(body.content);
    if (!userContent) {
      return NextResponse.json(
        { error: "invalid_request", message: "请输入要发送的内容" },
        { status: 400 }
      );
    }

    const locale = parseLocale(body.locale);

    const requestedConversationId =
      typeof body.conversationId === "string" ? body.conversationId.trim() : "";
    const nickname = body.nickname;

    const admin = getSupabaseAdmin();

    // 1. 确保 profiles 中有该设备记录（昵称可能只存在于浏览器 localStorage）
    const { data: profile, error: profileErr } = await admin
      .from("profiles")
      .select("id")
      .eq("id", deviceId)
      .maybeSingle();

    if (profileErr) {
      const hint =
        profileErr.code === "PGRST205" ||
        profileErr.message?.includes("schema cache") ||
        profileErr.message?.includes("does not exist")
          ? "数据库表尚未创建。请在 Supabase SQL Editor 中执行 components/myAgent/README.md 里的建表语句。"
          : `读取用户资料失败：${profileErr.message}`;
      return NextResponse.json(
        { error: "db_error", message: hint },
        { status: 500 }
      );
    }

    if (!profile) {
      const trimmed = nickname?.trim() ?? "";
      if (trimmed.length < 1 || trimmed.length > 20) {
        return NextResponse.json(
          { error: "auth_error", message: "登录状态已失效，请刷新后重试" },
          { status: 401 }
        );
      }

      const { error: insertErr } = await admin.from("profiles").insert({
        id: deviceId,
        nickname: trimmed,
      });

      if (insertErr) {
        if (insertErr.code === "23505") {
          return NextResponse.json(
            { error: "auth_error", message: "该昵称已被使用" },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { error: "db_error", message: `创建个人信息失败：${insertErr.message}` },
          { status: 500 }
        );
      }
    }

    const rate = await assertWithinDailyLimit(admin, deviceId);
    if (!rate.ok) {
      return NextResponse.json(
        { error: rate.error, message: rate.message },
        { status: rate.status }
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
