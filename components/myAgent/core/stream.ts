/**
 * Agent 流式协议。
 * 服务端：编码 SSE、消费 OpenAI chunk、组装 tool_calls。
 * 客户端：解析 SSE，并把 navigate 事件限制在白名单内。
 */
import type {
  ChatCompletionChunk,
  ChatCompletionMessageParam,
} from "openai/resources/chat/completions";
import { resolveAllowedNavigate, type AgentNavigateAction } from "../tools";

/** 推给前端的 SSE 事件 */
export type AgentStreamEvent =
  | { type: "token"; text: string }
  | ({ type: "navigate" } & AgentNavigateAction)
  | { type: "error"; message: string }
  | { type: "done" };

/** 从流式 delta 拼好的一次 function tool call */
export type AssembledToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

/** 一轮 Chat Completions 流结束后的文本 + tool_calls */
export type ConsumedChatStream = {
  content: string;
  toolCalls: AssembledToolCall[];
};

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

/** 服务端消费 OpenAI 流：拼接文本，并按 index 组装 tool_calls */
export async function consumeChatStream(
  stream: AsyncIterable<ChatCompletionChunk>,
  onContent?: (text: string) => void
): Promise<ConsumedChatStream> {
  let content = "";
  const toolCalls: AssembledToolCall[] = [];

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta;
    const text = typeof delta?.content === "string" ? delta.content : "";
    if (text) {
      content += text;
      onContent?.(text);
    }

    const parts = delta?.tool_calls;
    if (!parts?.length) continue;

    for (const part of parts) {
      const index = part.index;
      const current = toolCalls[index];
      if (!current) {
        toolCalls[index] = {
          id: part.id ?? "",
          type: "function",
          function: {
            name: part.function?.name ?? "",
            arguments: part.function?.arguments ?? "",
          },
        };
        continue;
      }
      if (part.id) current.id = part.id;
      if (part.function?.name) current.function.name += part.function.name;
      if (part.function?.arguments) {
        current.function.arguments += part.function.arguments;
      }
    }
  }

  return {
    content,
    toolCalls: toolCalls.filter(
      (call): call is AssembledToolCall =>
        Boolean(call?.id && call.function.name)
    ),
  };
}

/** 把已消费的流转成带 tool_calls 的 assistant 消息，供第二轮 followup 使用 */
export function toAssistantToolMessage(
  consumed: ConsumedChatStream
): ChatCompletionMessageParam {
  return {
    role: "assistant",
    content: consumed.content || null,
    tool_calls: consumed.toolCalls,
  };
}
