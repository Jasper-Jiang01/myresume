/**
 * Agent 工具：open_project。
 * 访客明确要求打开某个站点页面时调用；只介绍、不要求跳转时不要调用。
 */
import type { ChatCompletionTool } from "openai/resources/chat/completions";
import { PROJECT_LINK_IDS, PROJECT_LINKS } from "./projectLinks";
import type { OpenProjectResult } from "./types";

export const OPEN_PROJECT_NAME = "open_project";

export const OPEN_PROJECT_TOOL: ChatCompletionTool = {
  type: "function",
  function: {
    name: OPEN_PROJECT_NAME,
    description:
      "当访客明确要求打开、跳转、带去看某个站点项目或页面时调用。不要在只是询问介绍时调用。" +
      "可选 id：" +
      PROJECT_LINKS.map(
        (item) =>
          `${item.id}=${item.title.zh}/${item.title.en}（${item.aliases.join("、")}）`,
      ).join("；") +
      "。没有对应页面时不要调用。",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        id: {
          type: "string",
          enum: [...PROJECT_LINK_IDS],
          description: "要打开的页面 id",
        },
      },
      required: ["id"],
    },
  },
};

function parseOpenProjectId(args: unknown): string | null {
  if (typeof args === "string") {
    try {
      return parseOpenProjectId(JSON.parse(args));
    } catch {
      return args.trim() || null;
    }
  }
  if (!args || typeof args !== "object") return null;
  const id = (args as { id?: unknown }).id;
  return typeof id === "string" && id.trim() ? id.trim() : null;
}

export function executeOpenProject(args: unknown): OpenProjectResult {
  const id = parseOpenProjectId(args);
  const found = id ? PROJECT_LINKS.find((item) => item.id === id) : undefined;

  if (!found) {
    return {
      ok: false,
      error: "未知的项目 id，只能打开站点已登记的页面。",
      suggestions: [...PROJECT_LINK_IDS],
    };
  }

  return {
    ok: true,
    id: found.id,
    href: found.href,
    internal: found.internal,
    title: found.title.zh,
  };
}
