/**
 * 工具节点：按名称执行 LLM 给出的 tool_calls。
 * 若工具带跳转，结果必须再过一遍站点白名单才允许发给前端。
 */
import { ToolMessage, type ToolCall } from "@langchain/core/messages";
import {
  executeAgentTool,
  resolveAllowedNavigate,
  type AgentNavigateAction,
} from "../tools";

/** 执行全部 tool_calls，返回 ToolMessage 和可选的 navigate */
export function executeTools(toolCalls: ToolCall[]): {
  toolMessages: ToolMessage[];
  navigate: AgentNavigateAction | undefined;
} {
  let navigate: AgentNavigateAction | undefined;
  const toolMessages = toolCalls.map((call) => {
    const executed = executeAgentTool(call.name, call.args);
    if (executed.navigate) {
      navigate =
        resolveAllowedNavigate(
          executed.navigate.href,
          executed.navigate.internal
        ) ?? undefined;
    }
    return new ToolMessage({
      tool_call_id: call.id ?? "",
      name: call.name,
      content: JSON.stringify(executed.result),
    });
  });

  return { toolMessages, navigate };
}
