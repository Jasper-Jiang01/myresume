/**
 * 核心图的输入状态。
 * 鉴权、写入 user、拼好 llmMessages 之后交给 graphs/coreAgentGraph。
 */
import type OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { SupabaseClient } from "@supabase/supabase-js";

export type CoreAgentState = {
  openaiClient: OpenAI;
  model: string;
  /** 已含 system + 本会话历史（含本轮 user） */
  llmMessages: ChatCompletionMessageParam[];
  conversationId: string;
  /** service_role 客户端，仅用于流结束后写入 assistant */
  admin: SupabaseClient;
};
