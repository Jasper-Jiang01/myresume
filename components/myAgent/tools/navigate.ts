/**
 * 跳转辅助：校验目标是否在白名单内，以及把跳转指令编进 / 从响应头解出。
 */
import { PROJECT_LINKS } from "./projectLinks";
import type { AgentNavigateAction } from "./types";

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
