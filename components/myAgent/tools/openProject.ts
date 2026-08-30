/**
 * Agent 工具：open_project。
 * 访客明确要求打开某个站点页面时调用；只介绍、不要求跳转时不要调用。
 */
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { PROJECT_LINK_IDS, PROJECT_LINKS } from "./projectLinks";
import type { OpenProjectResult } from "./types";

/** 与 LangChain tool.name 对齐 */
export const OPEN_PROJECT_NAME = "open_project";

const openProjectDescription =
  "当访客明确要求打开、跳转、带去看某个站点项目或页面时调用。不要在只是询问介绍时调用。" +
  "可选 id：" +
  PROJECT_LINKS.map(
    (item) =>
      `${item.id}=${item.title.zh}/${item.title.en}（${item.aliases.join("、")}）`
  ).join("；") +
  "。没有对应页面时不要调用。";

const OpenProjectInput = z.object({
  id: z
    .enum(PROJECT_LINK_IDS as [string, ...string[]])
    .describe("要打开的页面 id"),
});

/** 发给模型的 LangChain tool；执行仍走 executeOpenProject */
export const OPEN_PROJECT_TOOL = tool(
  (input) => executeOpenProject(input),
  {
    name: OPEN_PROJECT_NAME,
    description: openProjectDescription,
    schema: OpenProjectInput,
  }
);

/** 从模型参数里取出 id；兼容参数已是 JSON 字符串的情况 */
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

/** 解析 id 并映射到白名单页面；未知 id 返回 suggestions */
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
