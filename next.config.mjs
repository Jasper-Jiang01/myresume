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
// cssdoodle 演示页会拉 Google Fonts、unpkg/esm.sh 上的 GSAP。
const contentSecurityPolicy = cspValue({
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    "https://unpkg.com",
    "https://esm.sh",
    "https://cdn.esm.sh",
  ],
  "style-src": [
    "'self'",
    "'unsafe-inline'",
    "https://fonts.googleapis.com",
    "https://public.codepenassets.com",
  ],
  "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
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
