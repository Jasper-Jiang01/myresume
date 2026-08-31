/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
// Vercel 构建时会自动注入 VERCEL=1。阿里云 ECS / 轻量用 DEPLOY_TARGET=node。
// 未设置时，生产构建仍走 GitHub Pages 静态导出（output: "export" + /myresume）。
const isVercel = process.env.VERCEL === "1";
const isNodeHost = process.env.DEPLOY_TARGET === "node";
const useStaticExport = isProd && !isVercel && !isNodeHost;
const basePath = useStaticExport ? "/myresume" : "";

function cspValue(sources) {
  return Object.entries(sources)
    .map(([directive, value]) =>
      value.length ? `${directive} ${value.join(" ")}` : directive
    )
    .join("; ");
}

// Next.js App Router 会注入内联脚本/样式（偏好引导、hydration），无法在不引入
// nonce middleware 的前提下去掉 'unsafe-inline'。webpack 客户端运行时会用
// new Function() 探测全局对象，生产/开发都需要 'unsafe-eval'，否则会 EvalError。
// cssdoodle 演示页的 GSAP / 样式已放到 /cssdoodle/_shared，不再依赖境外 CDN。
const contentSecurityPolicy = cspValue({
  "default-src": ["'self'"],
  "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  "style-src": ["'self'", "'unsafe-inline'"],
  "font-src": ["'self'", "data:"],
  "img-src": ["'self'", "data:", "blob:", "https:"],
  "connect-src": ["'self'", ...(isProd ? [] : ["ws:", "wss:"])],
  "frame-src": ["'self'"],
  "frame-ancestors": ["'self'"],
  "worker-src": ["'self'", "blob:"],
  "manifest-src": ["'self'"],
  "media-src": ["'self'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  ...(isProd ? { "upgrade-insecure-requests": [] } : {}),
});

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  // SAMEORIGIN：允许本站 iframe 嵌入 cssdoodle 演示，同时挡住跨站点击劫持。
  // 与 CSP frame-ancestors 'self' 叠加，覆盖不认 CSP 的旧浏览器。
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

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
  // headers() 在 output: "export" 下会被 Next.js 拒绝。GitHub Pages 静态托管
  // 本身也不支持自定义响应头；这组头只在 next dev / next start / Vercel 生效。
  ...(!useStaticExport
    ? {
        experimental: {
          outputFileTracingIncludes: {
            "/api/chat": ["./components/myAgent/infomation.md"],
          },
          serverComponentsExternalPackages: [
            "langchain",
            "@langchain/openai",
            "@langchain/core",
          ],
        },
        async headers() {
          return [
            {
              source: "/:path*",
              headers: securityHeaders,
            },
          ];
        },
      }
    : {}),
};

export default nextConfig;
