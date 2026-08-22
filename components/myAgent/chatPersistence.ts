import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { SupabaseClient } from "@supabase/supabase-js";

export const MAX_USER_CONTENT_CHARS = 4000;
export const LLM_HISTORY_LIMIT = 20;
export const DAILY_USER_MESSAGE_LIMIT = 40;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function normalizeUserContent(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, MAX_USER_CONTENT_CHARS);
}

export type PersistenceFailure = {
  ok: false;
  status: number;
  error: string;
  message: string;
};

export async function resolveOwnedConversation(
  admin: SupabaseClient,
  deviceId: string,
  conversationId: string | undefined
): Promise<{ ok: true; id: string } | PersistenceFailure> {
  if (conversationId) {
    if (!isUuid(conversationId)) {
      return {
        ok: false,
        status: 400,
        error: "auth_error",
        message: "会话无效",
      };
    }

    const { data, error } = await admin
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("profile_id", deviceId)
      .maybeSingle();

    if (error) {
      return {
        ok: false,
        status: 500,
        error: "db_error",
        message: `读取对话失败：${error.message}`,
      };
    }

    if (!data) {
      return {
        ok: false,
        status: 403,
        error: "auth_error",
        message: "登录状态已失效，请刷新后重试",
      };
    }

    return { ok: true, id: data.id as string };
  }

  const { data, error } = await admin
    .from("conversations")
    .insert({ profile_id: deviceId })
    .select("id")
    .single();

  if (error || !data) {
    return {
      ok: false,
      status: 500,
      error: "db_error",
      message: error?.message || "创建对话失败，请检查 conversations 表",
    };
  }

  return { ok: true, id: data.id as string };
}

export async function insertConversationMessage(
  admin: SupabaseClient,
  conversationId: string,
  role: "user" | "assistant",
  content: string
): Promise<PersistenceFailure | { ok: true }> {
  const { error } = await admin.from("messages").insert({
    conversation_id: conversationId,
    role,
    content,
  });

  if (error) {
    return {
      ok: false,
      status: 500,
      error: "db_error",
      message: `消息保存失败：${error.message}`,
    };
  }

  return { ok: true };
}

export async function loadLlmHistory(
  admin: SupabaseClient,
  conversationId: string
): Promise<{ ok: true; messages: ChatCompletionMessageParam[] } | PersistenceFailure> {
  const { data, error } = await admin
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(LLM_HISTORY_LIMIT);

  if (error) {
    return {
      ok: false,
      status: 500,
      error: "db_error",
      message: `读取对话失败：${error.message}`,
    };
  }

  const messages: ChatCompletionMessageParam[] = (data ?? [])
    .reverse()
    .flatMap((row) => {
      if (
        (row.role !== "user" && row.role !== "assistant") ||
        typeof row.content !== "string" ||
        !row.content
      ) {
        return [];
      }
      return [{ role: row.role, content: row.content.slice(0, MAX_USER_CONTENT_CHARS) }];
    });

  return { ok: true, messages };
}

function startOfShanghaiDayIso(): string {
  const shanghaiOffsetMs = 8 * 60 * 60 * 1000;
  const shanghaiNow = Date.now() + shanghaiOffsetMs;
  const dayStartShanghai = Math.floor(shanghaiNow / 86_400_000) * 86_400_000;
  return new Date(dayStartShanghai - shanghaiOffsetMs).toISOString();
}

export async function assertWithinDailyLimit(
  admin: SupabaseClient,
  deviceId: string
): Promise<{ ok: true } | PersistenceFailure> {
  const { data: conversations, error: convErr } = await admin
    .from("conversations")
    .select("id")
    .eq("profile_id", deviceId);

  if (convErr) {
    return {
      ok: false,
      status: 500,
      error: "db_error",
      message: `读取对话失败：${convErr.message}`,
    };
  }

  const ids = (conversations ?? []).map((row) => row.id as string);
  if (!ids.length) return { ok: true };

  const { count, error } = await admin
    .from("messages")
    .select("id", { count: "exact", head: true })
    .in("conversation_id", ids)
    .eq("role", "user")
    .gte("created_at", startOfShanghaiDayIso());

  if (error) {
    return {
      ok: false,
      status: 500,
      error: "db_error",
      message: `读取对话失败：${error.message}`,
    };
  }

  if ((count ?? 0) >= DAILY_USER_MESSAGE_LIMIT) {
    return {
      ok: false,
      status: 429,
      error: "rate_limit",
      message: "今天聊得够多啦，明天再来吧 ☕",
    };
  }

  return { ok: true };
}
