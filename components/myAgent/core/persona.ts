/**
 * 人设与系统提示。
 * 正文来自根目录 infomation.md，再按本轮语言拼上 locale / 工具使用规则。
 */
import { readFileSync } from "fs";
import { join } from "path";

let personaCache: string | null = null;

/** 读取 infomation.md；读失败时返回空字符串，避免阻断对话。 */
export function getPersona(): string {
  if (personaCache !== null) return personaCache;
  try {
    personaCache = readFileSync(
      join(process.cwd(), "components/myAgent/infomation.md"),
      "utf8"
    );
  } catch {
    personaCache = "";
  }
  return personaCache;
}

/** 请求体 locale：仅承认 "en"，其余一律中文。 */
export function parseLocale(raw: unknown): "zh" | "en" {
  return raw === "en" ? "en" : "zh";
}

/** 拼出本轮 system prompt：人设 + 语言规则 + 工具调用规则。 */
export function buildSystemPrompt(locale: "zh" | "en"): string {
  const persona = getPersona();
  const localeRule =
    locale === "en"
      ? "Language for this turn: English. Keep the same voice — short, first-person, opinionated. Do not translate the Chinese persona word-for-word."
      : "本轮语言：中文。";
  const toolRule =
    locale === "en"
      ? "Tools: when the visitor clearly wants to open or be taken to a page, call open_project. Do not print a JSON navigate payload in the reply. Do not call it when you are only introducing a project."
      : "工具落地：访客明确要打开、跳转、带去看某页时，调用 open_project；不要在回复文本里输出 {\"action\":\"navigate\"...}。只介绍项目时不要调用。";
  return [persona, localeRule, toolRule].filter(Boolean).join("\n\n");
}
