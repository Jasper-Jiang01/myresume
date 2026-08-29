/**
 * 调用模型节点。
 * 第一轮带 tools（允许 open_project）；followup 不带 tools，只根据 tool 结果生成回复。
 */
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { getOpenAI } from "../core/createModel";
import { consumeChatStream, type ConsumedChatStream } from "../core/stream";
import type { ContextSchema, CoreAgentState } from "../core/coreAgentState";
import { AGENT_TOOLS } from "../tools";

function completionBase(
  context: ContextSchema,
  messages: ChatCompletionMessageParam[]
) {
  return {
    model: context.model,
    messages,
    stream: true as const,
    // DashScope Node：顶层 enable_thinking；简单问题必须传 false，否则会走默认思维链
    enable_thinking: context.enableThinking === true,
    ...(context.temperature !== undefined
      ? { temperature: context.temperature }
      : {}),
  };
}

/** 第一轮：stream + tool_choice auto */
export async function callModel(
  state: CoreAgentState,
  context: ContextSchema,
  onContent: (text: string) => void
): Promise<ConsumedChatStream> {
  const firstStream = await getOpenAI().chat.completions.create({
    ...completionBase(context, state.messages),
    tools: AGENT_TOOLS,
    tool_choice: "auto",
  });

  return consumeChatStream(firstStream, onContent);
}

/** 第二轮：把 tool 结果续进 messages，不再暴露工具 */
export async function callModelFollowup(
  state: CoreAgentState,
  context: ContextSchema,
  onContent: (text: string) => void
): Promise<ConsumedChatStream> {
  const followupStream = await getOpenAI().chat.completions.create(
    completionBase(context, state.messages)
  );

  return consumeChatStream(followupStream, onContent);
}
