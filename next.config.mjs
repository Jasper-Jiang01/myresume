/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const basePath = isProd ? "/myresume" : "";

const nextConfig = {
  output: "export",
  distDir: "dist",
  // 静态导出到 GitHub Pages 等托管商时，尾部斜杠让 /path 生成 /path/index.html，
  // 避免直接访问 /path 时出现 404。
  trailingSlash: true,
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
