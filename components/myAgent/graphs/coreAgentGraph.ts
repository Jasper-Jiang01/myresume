/**
 * 核心 Agent 图：接线节点，不直接 new OpenAI / 写 SQL。
 *
 * 边：callModel → 有 toolCalls 则 executeTools → callModelFollowup → persistAssistant
 *     否则直接 persistAssistant。token / navigate / done / error 以 SSE 推出。
 */
import {
  encodeAgentStreamEvent,
  toAssistantToolMessage,
  type AgentStreamEvent,
} from "../core/stream";
import { callModel, callModelFollowup } from "../nodes/callModel";
import { executeTools } from "../nodes/executeTools";
import { persistAssistant } from "../nodes/persistAssistant";
import type { CoreAgentState } from "../states/coreAgentState";

/** 跑完一轮图，返回可交给 Response 的 SSE ReadableStream */
export function runCoreAgentGraph(state: CoreAgentState): ReadableStream {
  const { openaiClient, model, llmMessages, conversationId, admin } = state;
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
        const first = await callModel(
          openaiClient,
          model,
          llmMessages,
          (text) => {
            fullContent += text;
            send({ type: "token", text });
          }
        );

        // 有 tool_calls：执行工具，必要时推 navigate，再跑一轮不带 tools 的 followup
        if (first.toolCalls.length) {
          const { toolMessages, navigate } = executeTools(first.toolCalls);
          if (navigate) {
            send({ type: "navigate", ...navigate });
          }

          await callModelFollowup(
            openaiClient,
            model,
            [
              ...llmMessages,
              toAssistantToolMessage(first),
              ...toolMessages,
            ],
            (text) => {
              fullContent += text;
              send({ type: "token", text });
            }
          );
        }

        send({ type: "done" });

        await persistAssistant(admin, conversationId, fullContent);
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
