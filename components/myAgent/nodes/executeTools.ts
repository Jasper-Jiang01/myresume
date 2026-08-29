/**
 * 工具节点：按名称执行 LLM 给出的 tool_calls。
 * 若工具带跳转，结果必须再过一遍站点白名单才允许发给前端。
 */
import type { ChatCompletionToolMessageParam } from "openai/resources/chat/completions";
import type { AssembledToolCall } from "../core/stream";
import {
  executeAgentTool,
  resolveAllowedNavigate,
  type AgentNavigateAction,
} from "../tools";

/** 执行全部 tool_calls，返回 tool messages 和可选的 navigate */
export function executeTools(toolCalls: AssembledToolCall[]): {
  toolMessages: ChatCompletionToolMessageParam[];
  navigate: AgentNavigateAction | undefined;
} {
  let navigate: AgentNavigateAction | undefined;
  const toolMessages: ChatCompletionToolMessageParam[] = toolCalls.map(
    (call) => {
      let args: unknown = {};
      try {
        args = JSON.parse(call.function.arguments || "{}");
      } catch {
        args = {};
      }
      const executed = executeAgentTool(call.function.name, args);
      if (executed.navigate) {
        navigate = resolveAllowedNavigate(
          executed.navigate.href,
          executed.navigate.internal
        ) ?? undefined;
      }
      return {
        role: "tool" as const,
        tool_call_id: call.id,
        content: JSON.stringify(executed.result),
      };
    }
  );

  return { toolMessages, navigate };
}
