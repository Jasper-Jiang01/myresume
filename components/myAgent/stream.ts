import type {
  ChatCompletionChunk,
  ChatCompletionMessageParam,
} from "openai/resources/chat/completions";
import { resolveAllowedNavigate, type AgentNavigateAction } from "./tools";

export type AgentStreamEvent =
  | { type: "token"; text: string }
  | ({ type: "navigate" } & AgentNavigateAction)
  | { type: "error"; message: string }
  | { type: "done" };

export type AssembledToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

export type ConsumedChatStream = {
  content: string;
  toolCalls: AssembledToolCall[];
};

export const AGENT_STREAM_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
} as const;

export function encodeAgentStreamEvent(event: AgentStreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

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

export function toAssistantToolMessage(
  consumed: ConsumedChatStream
): ChatCompletionMessageParam {
  return {
    role: "assistant",
    content: consumed.content || null,
    tool_calls: consumed.toolCalls,
  };
}
