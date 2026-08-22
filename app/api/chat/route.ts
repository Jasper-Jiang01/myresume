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
import OpenAI from "openai";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

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
    const deviceId = req.headers.get("x-device-id");
    if (!deviceId) {
      return NextResponse.json(
        { error: "auth_error", message: "请先登录" },
        { status: 401 }
      );
    }

    const body = (await req.json()) as {
      messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
      conversationId?: string;
      nickname?: string;
    };

    const { messages, nickname } = body;
    let { conversationId } = body;

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

    if (!conversationId) {
      const { data: conv, error: convErr } = await admin
        .from("conversations")
        .insert({ profile_id: deviceId })
        .select("id")
        .single();

      if (convErr || !conv) {
        return NextResponse.json(
          {
            error: "db_error",
            message: convErr?.message || "创建对话失败，请检查 conversations 表",
          },
          { status: 500 }
        );
      }
      conversationId = conv.id as string;
    }

    // 2. 调用 LLM 流式接口
    const stream = await getOpenAI().chat.completions.create({
      model: env("OPENAI_DEFAULT_MODEL") || env("LLM_MODEL") || "qwen3.7-plus",
      messages: [
        {
          role: "system",
          content:
            "你是蒋文喆个人网站上的 AI 助手。用简洁、友善的中文回答访客问题，可以介绍他的经历、项目与设计工程实践。不确定的信息不要编造。",
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

        // 3. 流结束后保存助手回复
        if (conversationId) {
          await admin.from("messages").insert({
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
