/**
 * 调用模型节点。
 * 第一轮带 tools（允许 open_project）；followup 不带 tools，只根据 tool 结果生成回复。
 */
import type OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { consumeChatStream, type ConsumedChatStream } from "../core/stream";
import { AGENT_TOOLS } from "../tools";

/** 第一轮：stream + tool_choice auto */
export async function callModel(
  openaiClient: OpenAI,
  model: string,
  messages: ChatCompletionMessageParam[],
  onContent: (text: string) => void
): Promise<ConsumedChatStream> {
  const firstStream = await openaiClient.chat.completions.create({
    model,
    messages,
    tools: AGENT_TOOLS,
    tool_choice: "auto",
    stream: true,
  });

  return consumeChatStream(firstStream, onContent);
}

/** 第二轮：把 tool 结果续进 messages，不再暴露工具 */
export async function callModelFollowup(
  openaiClient: OpenAI,
  model: string,
  messages: ChatCompletionMessageParam[],
  onContent: (text: string) => void
): Promise<ConsumedChatStream> {
  const followupStream = await openaiClient.chat.completions.create({
    model,
    messages,
    stream: true,
  });

  return consumeChatStream(followupStream, onContent);
}
