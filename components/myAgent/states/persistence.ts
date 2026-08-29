/**
 * 对话持久化与 IP 限流。
 * 全部走 service_role；浏览器不直连 Data API。
 * 历史必须先校验 conversations.profile_id === device_id。
 */
import { randomBytes } from "crypto";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  IP_DAILY_LIMIT,
  IP_MINUTE_LIMIT,
  LLM_HISTORY_LIMIT,
  MAX_USER_CONTENT_CHARS,
  PROFILE_NICKNAME_MAX_ATTEMPTS,
} from "../core/config";

export {
  IP_DAILY_LIMIT,
  IP_MINUTE_LIMIT,
  LLM_HISTORY_LIMIT,
  MAX_USER_CONTENT_CHARS,
} from "../core/config";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const PROFILE_UNAVAILABLE = "暂时无法开始对话，请稍后重试";
const RATE_LIMIT_MESSAGE = "今天聊得够多啦，明天再来吧 ☕";

/** 进程内限流计数；库表不可用时作为兜底 */
const memoryHits = new Map<string, number[]>();

/** 校验标准 UUID（含 version 1–8） */
export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export type UserContentResult =
  | { ok: true; content: string }
  | { ok: false; reason: "empty" | "too_long" };

/** 去掉首尾空白，并拒绝空串 / 超长消息 */
export function normalizeUserContent(raw: unknown): UserContentResult {
  if (typeof raw !== "string") return { ok: false, reason: "empty" };
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, reason: "empty" };
  if (trimmed.length > MAX_USER_CONTENT_CHARS) {
    return { ok: false, reason: "too_long" };
  }
  return { ok: true, content: trimmed };
}

/** 持久化失败时的 HTTP 形态，供 route 原样返回 */
export type PersistenceFailure = {
  ok: false;
  status: number;
  error: string;
  message: string;
};

/** 随机匿名昵称，不采信客户端上报 */
export function generateNickname(): string {
  return `u_${randomBytes(8).toString("hex")}`;
}

/** 按 device_id 确保 profiles 行存在；昵称冲突则重试 */
export async function ensureAnonymousProfile(
  admin: SupabaseClient,
  deviceId: string
): Promise<{ ok: true } | PersistenceFailure> {
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
        ? "数据库表尚未创建。请在 Supabase SQL Editor 中执行 components/myAgent/schema.sql。"
        : PROFILE_UNAVAILABLE;
    return { ok: false, status: 500, error: "db_error", message: hint };
  }

  if (profile) return { ok: true };

  for (let attempt = 0; attempt < PROFILE_NICKNAME_MAX_ATTEMPTS; attempt += 1) {
    const { error: insertErr } = await admin.from("profiles").insert({
      id: deviceId,
      nickname: generateNickname(),
    });

    if (!insertErr) return { ok: true };

    if (insertErr.code === "23505") {
      const { data: raced } = await admin
        .from("profiles")
        .select("id")
        .eq("id", deviceId)
        .maybeSingle();
      if (raced) return { ok: true };
      continue;
    }

    return {
      ok: false,
      status: 500,
      error: "db_error",
      message: PROFILE_UNAVAILABLE,
    };
  }

  return {
    ok: false,
    status: 503,
    error: "db_error",
    message: PROFILE_UNAVAILABLE,
  };
}

/** 校验会话归属；未传 conversationId 时新建一轮 */
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

/** 写入一条 user / assistant 消息 */
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

/** 给前端的完整历史：先校验归属再按时间正序返回 */
export async function loadOwnedHistory(
  admin: SupabaseClient,
  deviceId: string,
  conversationId: string
): Promise<
  | {
      ok: true;
      messages: {
        id: string;
        role: "user" | "assistant";
        content: string;
        created_at: string;
      }[];
    }
  | PersistenceFailure
> {
  const owned = await resolveOwnedConversation(admin, deviceId, conversationId);
  if (!owned.ok) return owned;

  const { data, error } = await admin
    .from("messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", owned.id)
    .order("created_at", { ascending: true });

  if (error) {
    return {
      ok: false,
      status: 500,
      error: "db_error",
      message: `读取对话失败：${error.message}`,
    };
  }

  const messages = (data ?? []).flatMap((row) => {
    if (
      (row.role !== "user" && row.role !== "assistant") ||
      typeof row.content !== "string" ||
      typeof row.id !== "string"
    ) {
      return [];
    }
    return [
      {
        id: row.id,
        role: row.role,
        content: row.content,
        created_at:
          typeof row.created_at === "string"
            ? row.created_at
            : new Date().toISOString(),
      },
    ];
  });

  return { ok: true, messages };
}

/** 给 LLM 的上下文：最近 N 条，不采信前端传来的 history */
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
      return [
        {
          role: row.role,
          content: row.content.slice(0, MAX_USER_CONTENT_CHARS),
        },
      ];
    });

  return { ok: true, messages };
}

/** 上海时区当天 00:00 的 ISO 时间，用于日限额窗口 */
function startOfShanghaiDayIso(): string {
  const shanghaiOffsetMs = 8 * 60 * 60 * 1000;
  const shanghaiNow = Date.now() + shanghaiOffsetMs;
  const dayStartShanghai = Math.floor(shanghaiNow / 86_400_000) * 86_400_000;
  return new Date(dayStartShanghai - shanghaiOffsetMs).toISOString();
}

/** UTC 当前分钟起点，用于分钟限额窗口 */
function startOfUtcMinuteIso(): string {
  const now = Date.now();
  return new Date(now - (now % 60_000)).toISOString();
}

/** 进程内滑动窗口；超限返回 false */
function assertMemoryWindow(
  ipHash: string,
  windowMs: number,
  limit: number
): boolean {
  const now = Date.now();
  const key = `${ipHash}:${windowMs}`;
  const recent = (memoryHits.get(key) ?? []).filter((ts) => now - ts < windowMs);
  if (recent.length >= limit) {
    memoryHits.set(key, recent);
    return false;
  }
  recent.push(now);
  memoryHits.set(key, recent);
  return true;
}

/** 调用 bump_chat_rate_limit；表不存在时返回 unavailable，退回内存计数 */
async function bumpPersistedWindow(
  admin: SupabaseClient,
  ipHash: string,
  windowStart: string,
  limit: number
): Promise<{ ok: true } | PersistenceFailure | "unavailable"> {
  const { data, error } = await admin.rpc("bump_chat_rate_limit", {
    p_ip_hash: ipHash,
    p_window_start: windowStart,
  });

  if (error) return "unavailable";

  if (typeof data === "number" && data > limit) {
    return {
      ok: false,
      status: 429,
      error: "rate_limit",
      message: RATE_LIMIT_MESSAGE,
    };
  }

  return { ok: true };
}

/** 按 IP 哈希做分钟 / 日限额；先内存再落库 */
export async function assertWithinIpLimit(
  admin: SupabaseClient,
  ipHash: string
): Promise<{ ok: true } | PersistenceFailure> {
  if (
    !assertMemoryWindow(ipHash, 60_000, IP_MINUTE_LIMIT) ||
    !assertMemoryWindow(ipHash, 86_400_000, IP_DAILY_LIMIT)
  ) {
    return {
      ok: false,
      status: 429,
      error: "rate_limit",
      message: RATE_LIMIT_MESSAGE,
    };
  }

  const minute = await bumpPersistedWindow(
    admin,
    ipHash,
    startOfUtcMinuteIso(),
    IP_MINUTE_LIMIT
  );
  if (minute !== "unavailable" && !minute.ok) return minute;

  const day = await bumpPersistedWindow(
    admin,
    ipHash,
    startOfShanghaiDayIso(),
    IP_DAILY_LIMIT
  );
  if (day !== "unavailable" && !day.ok) return day;

  return { ok: true };
}
