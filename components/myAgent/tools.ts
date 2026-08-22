import type { ChatCompletionTool } from "openai/resources/chat/completions";

export type ProjectLink = {
  id: string;
  href: string;
  /** true：走 Next 路由；false：整页跳转到静态资源 */
  internal: boolean;
  title: { zh: string; en: string };
  aliases: readonly string[];
};

/**
 * 站点上可被助手打开的页面。id 是工具入参枚举，aliases 写在 description 里帮助模型对齐。
 */
export const PROJECT_LINKS: readonly ProjectLink[] = [
  {
    id: "home",
    href: "/home",
    internal: true,
    title: { zh: "首页", en: "Home" },
    aliases: ["首页", "主页", "home", "info"],
  },
  {
    id: "portfolio",
    href: "/personalProject",
    internal: true,
    title: { zh: "个人作品集", en: "Personal portfolio" },
    aliases: [
      "个人作品集",
      "作品集",
      "portfolio",
      "World First",
      "跨境支付",
      "电力交易",
      "Power Trading",
    ],
  },
  {
    id: "mycrafts",
    href: "/mycrafts",
    internal: true,
    title: { zh: "动效实验站", en: "Motion lab" },
    aliases: ["动效实验站", "mycrafts", "cssdoodle", "动效"],
  },
  {
    id: "neon-glass",
    href: "/mycrafts/neon-glass-3d-cards-ui-lab",
    internal: true,
    title: { zh: "Neon Glass · 3D Cards", en: "Neon Glass · 3D Cards" },
    aliases: ["neon glass", "3d cards", "玻璃卡片"],
  },
  {
    id: "gsap-rotatey",
    href: "/mycrafts/gsap-rotatey-draggable",
    internal: true,
    title: { zh: "GSAP rotateY Draggable", en: "GSAP rotateY Draggable" },
    aliases: ["gsap", "rotatey", "draggable"],
  },
  {
    id: "parallax-card",
    href: "/mycrafts/pure-css-parallax-card-on-hover",
    internal: true,
    title: { zh: "Pure CSS Parallax Card", en: "Pure CSS Parallax Card" },
    aliases: ["parallax", "视差卡片", "纯 css 卡片"],
  },
  {
    id: "after-sign-off",
    href: "/mycrafts/after-sign-off",
    internal: true,
    title: { zh: "After Sign-Off", en: "After Sign-Off" },
    aliases: ["after sign-off", "after sign off"],
  },
  {
    id: "button-workshop",
    href: "/cssdoodle/button-state-buildera-visual-editor-for-designing-multi-state-button-flows/dist/index.html",
    internal: false,
    title: { zh: "CSS 灵动按钮工坊", en: "CSS button workshop" },
    aliases: ["按钮工坊", "button workshop", "css 按钮"],
  },
] as const;

export const PROJECT_LINK_IDS = PROJECT_LINKS.map((item) => item.id);

const OPEN_PROJECT_NAME = "open_project";

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

export const AGENT_TOOLS: ChatCompletionTool[] = [OPEN_PROJECT_TOOL];

export type OpenProjectResult =
  | {
      ok: true;
      id: string;
      href: string;
      internal: boolean;
      title: string;
    }
  | {
      ok: false;
      error: string;
      suggestions: string[];
    };

export type AgentNavigateAction = {
  href: string;
  internal: boolean;
};

export function resolveAllowedNavigate(
  href: unknown,
  internal: unknown
): AgentNavigateAction | null {
  if (typeof href !== "string" || typeof internal !== "boolean") return null;
  if (!href.startsWith("/") || href.startsWith("//")) return null;
  const found = PROJECT_LINKS.find(
    (item) => item.href === href && item.internal === internal
  );
  return found ? { href: found.href, internal: found.internal } : null;
}

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

export function encodeNavigateHeader(action: AgentNavigateAction): string {
  return encodeURIComponent(JSON.stringify(action));
}

export function decodeNavigateHeader(
  value: string | null,
): AgentNavigateAction | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as AgentNavigateAction;
    if (
      typeof parsed?.href === "string" &&
      parsed.href.startsWith("/") &&
      typeof parsed.internal === "boolean"
    ) {
      return parsed;
    }
  } catch {
    /* ignore malformed header */
  }
  return null;
}
