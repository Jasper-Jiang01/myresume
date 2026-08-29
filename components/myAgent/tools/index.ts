/**
 * Agent 工具入口：注册 LLM 可调用的工具列表，并按名称分发执行。
 * 新增工具时在本文件的 AGENT_TOOLS 与 executeAgentTool 中挂上即可。
 */
import type { ChatCompletionTool } from "openai/resources/chat/completions";
import { executeOpenProject, OPEN_PROJECT_NAME, OPEN_PROJECT_TOOL } from "./openProject";
import type { AgentNavigateAction } from "./types";

export type {
  AgentNavigateAction,
  OpenProjectResult,
  ProjectLink,
} from "./types";
export { PROJECT_LINK_IDS, PROJECT_LINKS } from "./projectLinks";
export {
  executeOpenProject,
  OPEN_PROJECT_NAME,
  OPEN_PROJECT_TOOL,
} from "./openProject";
export {
  decodeNavigateHeader,
  encodeNavigateHeader,
  resolveAllowedNavigate,
} from "./navigate";

/** 当前暴露给模型的工具列表；新增工具时在此注册 */
export const AGENT_TOOLS: ChatCompletionTool[] = [OPEN_PROJECT_TOOL];

/** 按工具名分发；未知名称返回错误 JSON，不抛异常 */
export function executeAgentTool(
  name: string,
  args: unknown,
): { result: unknown; navigate?: AgentNavigateAction } {
  if (name === OPEN_PROJECT_NAME) {
    const result = executeOpenProject(args);
    return {
      result,
      navigate: result.ok
        ? { href: result.href, internal: result.internal }
        : undefined,
    };
  }

  return {
    result: { ok: false, error: `未知工具：${name}` },
  };
}
