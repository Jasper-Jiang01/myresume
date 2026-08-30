/**
 * 服务端消费 LangChain ChatModel.stream()。
 * 不要被客户端 import：stream.ts 才是给前端用的 SSE 解析。
 */
import {
  AIMessage,
  type AIMessageChunk,
  type ToolCall,
} from "@langchain/core/messages";

export type ConsumedChatStream = {
  content: string;
  toolCalls: ToolCall[];
};

/** 只取可展示正文，忽略 reasoning 块 */
function textFromChunk(chunk: AIMessageChunk): string {
  const content = chunk.content;
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((part) => {
      if (typeof part === "string") return part;
      if (!part || typeof part !== "object") return "";
      const rec = part as { type?: unknown; text?: unknown };
      if (rec.type && rec.type !== "text") return "";
      return typeof rec.text === "string" ? rec.text : "";
    })
    .join("");
}

function toToolCall(assembled: {
  id: string;
  name: string;
  arguments: string;
}): ToolCall | null {
  if (!assembled.id || !assembled.name) return null;
  let args: Record<string, unknown> = {};
  try {
    const parsed = JSON.parse(assembled.arguments || "{}") as unknown;
    if (parsed && typeof parsed === "object") {
      args = parsed as Record<string, unknown>;
    }
  } catch {
    args = {};
  }
  return {
    id: assembled.id,
    name: assembled.name,
    args,
    type: "tool_call",
  };
}

/** 拼接文本，并按 index 组装成 LangChain ToolCall */
export async function consumeLangChainStream(
  stream: AsyncIterable<AIMessageChunk>,
  onContent?: (text: string) => void
): Promise<ConsumedChatStream> {
  let content = "";
  const assembling: { id: string; name: string; arguments: string }[] = [];

  for await (const chunk of stream) {
    const text = textFromChunk(chunk);
    if (text) {
      content += text;
      onContent?.(text);
    }

    const parts = chunk.tool_call_chunks;
    if (!parts?.length) continue;

    for (const part of parts) {
      const index = part.index ?? 0;
      const current = assembling[index];
      if (!current) {
        assembling[index] = {
          id: part.id ?? "",
          name: part.name ?? "",
          arguments: part.args ?? "",
        };
        continue;
      }
      if (part.id) current.id = part.id;
      if (part.name) current.name += part.name;
      if (part.args) current.arguments += part.args;
    }
  }

  return {
    content,
    toolCalls: assembling.flatMap((item) => {
      const call = item ? toToolCall(item) : null;
      return call ? [call] : [];
    }),
  };
}

/** 第一轮带 tool_calls 的 assistant，供 followup 续写 */
export function toAIMessage(consumed: ConsumedChatStream): AIMessage {
  return new AIMessage({
    content: consumed.content,
    tool_calls: consumed.toolCalls,
  });
}
