/**
 * 调用模型节点。
 * 第一轮 bindTools；followup 不带 tools，只根据 tool 结果生成回复。
 * 底层仍是官方 Chat Completions（initChatModel + useResponsesApi: false）。
 */
import { initAgentChatModel } from "../core/createModel";
import {
  consumeLangChainStream,
  type ConsumedChatStream,
} from "../core/langchainStream";
import type { ContextSchema, CoreAgentState } from "../core/coreAgentState";
import { AGENT_TOOLS } from "../tools";

/** 第一轮：stream + tool_choice auto */
export async function callModel(
  state: CoreAgentState,
  context: ContextSchema,
  onContent: (text: string) => void
): Promise<ConsumedChatStream> {
  const model = await initAgentChatModel(context);
  const stream = await model
    .bindTools(AGENT_TOOLS, { tool_choice: "auto" })
    .stream(state.messages);
  return consumeLangChainStream(stream, onContent);
}

/** 第二轮：把 tool 结果续进 messages，不再暴露工具 */
export async function callModelFollowup(
  state: CoreAgentState,
  context: ContextSchema,
  onContent: (text: string) => void
): Promise<ConsumedChatStream> {
  const model = await initAgentChatModel(context);
  const stream = await model.stream(state.messages);
  return consumeLangChainStream(stream, onContent);
}
