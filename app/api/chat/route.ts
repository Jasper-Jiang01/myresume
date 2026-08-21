/**
 * AI 对话框后端接口。
 *
 * 依赖环境变量（见 components/myAgent/README.md）：
 * - SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
 * - OPENAI_API_KEY / OPENAI_BASE_URL / LLM_MODEL
 *
 * 注意：该路由仅在动态部署（Vercel）下生效。GitHub Pages 静态导出
 * （next.config.mjs 中 output: "export"）不会打包 API Route。
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// 惰性初始化：避免在模块加载阶段（含 GitHub Pages 静态导出构建时的
// collect-page-data 步骤）因缺失环境变量而抛错中断构建。
// 该路由仅在配置了对应环境变量的动态部署（如 Vercel）下才会被实际调用。
let openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    });
  }
  return openai;
}

let supabaseAdmin: SupabaseClient | null = null;
function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("缺少 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 环境变量");
    }
    supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return supabaseAdmin;
}

export async function POST(req: NextRequest) {
  try {
    // 1. 设备身份校验
    const deviceId = req.headers.get("x-device-id");
    if (!deviceId) {
      return NextResponse.json(
        { error: "auth_error", message: "请先登录" },
        { status: 401 }
      );
    }

    const { data: profile, error: profileErr } = await getSupabaseAdmin()
      .from("profiles")
      .select("id")
      .eq("id", deviceId)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json(
        { error: "auth_error", message: "登录状态已失效，请刷新后重试" },
        { status: 401 }
      );
    }

    // 2. 解析请求体
    const body = (await req.json()) as {
      messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
      conversationId?: string;
    };

    const { messages, conversationId } = body;

    // 3. 保存用户消息（异步，不阻塞流）
    if (conversationId) {
      await getSupabaseAdmin().from("messages").insert({
        conversation_id: conversationId,
        role: "user",
        content: messages[messages.length - 1].content,
      });
    }

    // 4. 调用 LLM 流式接口
    const stream = await getOpenAI().chat.completions.create({
      model: process.env.LLM_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "你是用户的 AI 助手，基于已有知识简洁、专业地回答。",
        },
        ...messages,
      ],
      stream: true,
    });

    const encoder = new TextEncoder();
    let fullContent = "";

    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || "";
          fullContent += text;
          controller.enqueue(encoder.encode(text));
        }
        controller.close();

        // 5. 流结束后保存助手回复
        if (conversationId) {
          await getSupabaseAdmin().from("messages").insert({
            conversation_id: conversationId,
            role: "assistant",
            content: fullContent,
          });
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
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
