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
