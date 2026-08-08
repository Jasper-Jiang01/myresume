/** Public asset prefix for GitHub Pages (repo name as basePath). */
export const BASE_PATH =
  process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix a root-relative public path so it works under basePath. */
export function withBasePath(path: string): string {
  if (!path) return path;
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!BASE_PATH) return normalized;
  return `${BASE_PATH}${normalized}`;
}

/**
 * 校验站内路由（next/link）的 href 是否符合“未经 withBasePath 处理的原始路径”契约。
 *
 * 背景：next/link 在配置了 basePath 时会自动为 href 附加 basePath 前缀；
 * 若调用方误将已经 withBasePath() 处理过的路径（已带 BASE_PATH 前缀）传给 internal 链接，
 * 会导致 basePath 被重复拼接（如 "/repo/repo/mycrafts"）。
 * 这个 bug 仅在生产环境设置了 NEXT_PUBLIC_BASE_PATH（如 GitHub Pages 部署）时才会显现，
 * 本地开发因 BASE_PATH 为空字符串而无法复现，因此在此处显式做开发期校验尽早暴露。
 *
 * 仅在开发环境下生效（生产构建会被 tree-shake / 不产生实际开销）。
 */
export function assertInternalHref(href: string, context?: string): void {
  if (process.env.NODE_ENV === "production") return;
  const prefix = `[assertInternalHref]${context ? ` ${context}:` : ""}`;
  if (/^(https?:|data:|blob:)/i.test(href)) {
    console.warn(
      `${prefix} internal 链接 "${href}" 是绝对 URL，internal 路由应使用站内相对路径（如 "/mycrafts"）。`
    );
    return;
  }
  // BASE_PATH 为空时（本地默认开发环境）无法复现“重复拼接”问题本身，
  // 但仍按当前部署会用到的 basePath 显式声明前缀做一次前瞻性校验，
  // 避免该 bug 只能等到生产（GitHub Pages）部署后才被发现。
  if (BASE_PATH && (href === BASE_PATH || href.startsWith(`${BASE_PATH}/`))) {
    console.warn(
      `${prefix} internal 链接 "${href}" 似乎已经过 withBasePath() 处理（携带了 basePath "${BASE_PATH}" 前缀）。` +
        `internal 路由应传未经 withBasePath 处理的原始站内路径（如 "/mycrafts"），` +
        `否则生产环境下 next/link 会重复拼接 basePath。`
    );
  }
}
