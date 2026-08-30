/**
 * Agent 流式协议（前端可安全引用）。
 * 服务端编码 SSE；客户端解析 SSE，并把 navigate 限制在白名单内。
 * LangChain 流消费在 langchainStream.ts，避免把 langchain 打进客户端。
 */
import { resolveAllowedNavigate, type AgentNavigateAction } from "../tools";

/** 推给前端的 SSE 事件 */
export type AgentStreamEvent =
  | { type: "token"; text: string }
  | ({ type: "navigate" } & AgentNavigateAction)
  | { type: "error"; message: string }
  | { type: "done" };

/** SSE 响应头：禁止代理缓冲，保证 token 能边生成边下发 */
export const AGENT_STREAM_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
} as const;

/** 把事件编码成 `data: ...\\n\\n` SSE 帧 */
export function encodeAgentStreamEvent(event: AgentStreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

/** 从一块 SSE 文本里抽出 data: 行再交给 parseAgentStreamEvent */
function parseAgentStreamBlock(block: string): AgentStreamEvent | null {
  const dataLine = block
    .replace(/\r\n/g, "\n")
    .split("\n")
    .find((line) => line.startsWith("data:"));
  if (!dataLine) return null;

  const json = dataLine.slice(5).trim();
  if (!json || json === "[DONE]") return null;

  try {
    return parseAgentStreamEvent(JSON.parse(json));
  } catch {
    return null;
  }
}

/** 校验并解析一条 SSE JSON；navigate 必须落在站点白名单内 */
export function parseAgentStreamEvent(value: unknown): AgentStreamEvent | null {
  if (!value || typeof value !== "object") return null;
  const record = value as { type?: unknown };

  if (record.type === "token") {
    const text = (value as { text?: unknown }).text;
    return typeof text === "string" && text ? { type: "token", text } : null;
  }

  if (record.type === "navigate") {
    const navigate = resolveAllowedNavigate(
      (value as { href?: unknown }).href,
      (value as { internal?: unknown }).internal
    );
    return navigate ? { type: "navigate", ...navigate } : null;
  }

  if (record.type === "error") {
    const message = (value as { message?: unknown }).message;
    return typeof message === "string" && message
      ? { type: "error", message }
      : null;
  }

  if (record.type === "done") {
    return { type: "done" };
  }

  return null;
}

/** 客户端读取 /api/chat 的 SSE body，按事件回调 */
export async function readAgentStream(
  body: ReadableStream<Uint8Array>,
  onEvent: (event: AgentStreamEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const flushBlock = (block: string) => {
    const trimmed = block.trim();
    if (!trimmed) return;
    const event = parseAgentStreamBlock(trimmed);
    if (event) onEvent(event);
  };

  const cancel = () => {
    reader.cancel().catch(() => {
      /* already closed */
    });
  };

  if (signal?.aborted) {
    cancel();
    reader.releaseLock();
    return;
  }

  signal?.addEventListener("abort", cancel, { once: true });

  try {
    while (!signal?.aborted) {
      let chunk: ReadableStreamReadResult<Uint8Array>;
      try {
        chunk = await reader.read();
      } catch {
        break;
      }
      const { done, value } = chunk;
      if (done) break;
      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";
      for (const part of parts) flushBlock(part);
    }
    buffer += decoder.decode().replace(/\r\n/g, "\n");
    if (buffer.trim() && !signal?.aborted) flushBlock(buffer);
  } finally {
    signal?.removeEventListener("abort", cancel);
    try {
      reader.releaseLock();
    } catch {
      /* lock already released after cancel */
    }
  }
}
