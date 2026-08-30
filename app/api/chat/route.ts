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

import { NextRequest, NextResponse } from "next/server";
import {
  HumanMessage,
  SystemMessage,
  isHumanMessage,
} from "@langchain/core/messages";
import { getRequestIp, hashIpForRateLimit } from "@/components/myAgent/core/clientIp";
import {
  MAX_CHAT_BODY_BYTES,
  shouldEnableThinking,
} from "@/components/myAgent/core/config";
import { env } from "@/components/myAgent/core/createModel";
import { buildSystemPrompt, parseLocale } from "@/components/myAgent/core/persona";
import { AGENT_STREAM_HEADERS } from "@/components/myAgent/core/stream";
import { getSupabaseAdmin } from "@/components/myAgent/core/supabaseAdmin";
import { runCoreAgentGraph } from "@/components/myAgent/graphs/coreAgentGraph";
import {
  assertWithinIpLimit,
  ensureAnonymousProfile,
  insertConversationMessage,
  isUuid,
  loadLlmHistory,
  normalizeUserContent,
  resolveOwnedConversation,
} from "@/components/myAgent/states/persistence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
    const storedMessages = [...history.messages];
    const lastStored = storedMessages[storedMessages.length - 1];
    const lastText =
      typeof lastStored?.content === "string" ? lastStored.content : "";
    if (!lastStored || !isHumanMessage(lastStored) || lastText !== userContent) {
      storedMessages.push(new HumanMessage(userContent));
    }
    const llmMessages = [
      new SystemMessage(buildSystemPrompt(locale)),
      ...storedMessages,
    ];

    const readable = await runCoreAgentGraph(
      { messages: llmMessages, conversationId },
      {
        model:
          env("OPENAI_DEFAULT_MODEL") || env("LLM_MODEL") || "qwen3.7-plus",
        locale,
        enableThinking: shouldEnableThinking(userContent),
      }
    );

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
