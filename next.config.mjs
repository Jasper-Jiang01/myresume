/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
// Vercel 构建时会自动注入 VERCEL=1（Vercel 官方约定的环境变量）。
// 借此区分两种部署形态：
// - GitHub Pages：纯静态导出，需要 output: "export" + basePath("/myresume")。
// - Vercel：动态部署，保留 API Route（如 /api/chat）能力，不做静态导出、不加 basePath。
const isVercel = process.env.VERCEL === "1";
const basePath = isProd && !isVercel ? "/myresume" : "";

// 仅 GitHub Pages 的生产构建走静态导出。本地 next dev / Vercel 必须保留
// API Route，否则 /api/chat 在开发时被当成 export 产物、对话接口不可用。
const useStaticExport = isProd && !isVercel;

const nextConfig = {
  ...(useStaticExport
    ? {
        output: "export",
        distDir: "dist",
        // 静态导出到 GitHub Pages 等托管商时，尾部斜杠让 /path 生成 /path/index.html，
        // 避免直接访问 /path 时出现 404。
        trailingSlash: true,
      }
    : {}),
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
