/**
 * 核心图的 context（本轮怎么调模型）与 state（图里流动的数据）。
 * 鉴权、写入 user、拼好 messages 之后交给 graphs/coreAgentGraph。
 */
import type { BaseMessage } from "@langchain/core/messages";

/**
 * 本轮调用配置，对应 LangGraph context_schema。
 * 图内只读；模型由 initChatModel 按本轮 context 初始化，不把客户端放进 state。
 * temperature 可选：未传则不写入 create()，保持 API 默认。
 */
export type ContextSchema = {
  model: string;
  temperature?: number;
  locale: "zh" | "en";
  /** 未传或 false：显式关闭思维链（qwen3.7-plus 默认是开的） */
  enableThinking?: boolean;
};

/**
 * 图内数据，对应 LangGraph state_schema。
 * messages 是 LangChain BaseMessage（system + 本会话历史，含本轮 user）。
 */
export type CoreAgentState = {
  messages: BaseMessage[];
  conversationId: string;
};
