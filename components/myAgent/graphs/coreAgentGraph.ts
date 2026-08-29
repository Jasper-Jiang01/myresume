/**
 * 核心 Agent 图：接线节点，不直接 new OpenAI / 写 SQL。
 *
 * 边：callModel → 有 toolCalls 则 executeTools → callModelFollowup → persistAssistant
 *     否则直接 persistAssistant。token / navigate / done / error 以 SSE 推出。
 */
import { getOpenAI } from "../core/createModel";
import {
  encodeAgentStreamEvent,
  toAssistantToolMessage,
  type AgentStreamEvent,
} from "../core/stream";
import { callModel, callModelFollowup } from "../nodes/callModel";
import { executeTools } from "../nodes/executeTools";
import { persistAssistant } from "../nodes/persistAssistant";
import type { ContextSchema, CoreAgentState } from "../core/coreAgentState";

/** 跑完一轮图，返回可交给 Response 的 SSE ReadableStream */
export function runCoreAgentGraph(
  state: CoreAgentState,
  context: ContextSchema
): ReadableStream {
  // 与原先 route 在进流之前 getOpenAI() 一致：缺 key 时仍走 JSON 500，而不是 SSE error
  getOpenAI();

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      const send = (event: AgentStreamEvent) => {
        try {
          controller.enqueue(encoder.encode(encodeAgentStreamEvent(event)));
        } catch {
          /* client disconnected */
        }
      };

      let fullContent = "";
      try {
        const first = await callModel(state, context, (text) => {
          fullContent += text;
          send({ type: "token", text });
        });

        // 有 tool_calls：执行工具，必要时推 navigate，再跑一轮不带 tools 的 followup
        if (first.toolCalls.length) {
          const { toolMessages, navigate } = executeTools(first.toolCalls);
          if (navigate) {
            send({ type: "navigate", ...navigate });
          }

          await callModelFollowup(
            {
              ...state,
              messages: [
                ...state.messages,
                toAssistantToolMessage(first),
                ...toolMessages,
              ],
            },
            context,
            (text) => {
              fullContent += text;
              send({ type: "token", text });
            }
          );
        }

        send({ type: "done" });

        await persistAssistant(state, fullContent);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "AI 走神了，晚点再来试试吧…";
        send({ type: "error", message });
      } finally {
        controller.close();
      }
    },
  });
}
