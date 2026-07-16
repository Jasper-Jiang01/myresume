import type { Config } from "tailwindcss";

/**
 * 尺寸对齐 Aragakey（https://jiangyijie27.github.io/aragakey/）：
 * - fontSize: 仅 text-xs(0.75rem) / text-base(1rem)
 * - 内容宽 ~864px；卡片 p-6、网格 gap-3
 */
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "#f7f7f7",
        card: "#f5f5f5",
        cardBorder: "#f0f0f0",
        tag: "#F0F0F0",
        primary: "#111111",
        secondary: "#2c2c2c",
        muted: "#737373",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Inter",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      fontSize: {
        // 固定字号，不做 sm:/md: 断点适配
        body: ["0.75rem", { lineHeight: "1rem" }],
        section: ["1rem", { lineHeight: "1.5rem" }],
        title: ["1.2rem", { lineHeight: "1.6rem" }], // 18.2px — 原 16px +2
      },
      maxWidth: {
        content: "54rem", // 864px — 与 Aragakey max-w-[864px] 一致
      },
      size: {
        avatar: "5rem", // 80px — 对齐 Aragakey w-20
        "avatar-sm": "7rem", // 112px — 对齐 Aragakey sm:w-28
        icon: "2rem", // 32px — 对齐 Aragakey w-8
        "icon-lg": "2rem",
        "dot-sm": "1rem", // 12px
        "dot-md": "0.875rem", // 14px
      },
      borderRadius: {
        card: "0.375rem", // 6px — Aragakey rounded-md
        chip: "0.375rem",
        icon: "0.5rem", // 8px — Aragakey rounded-lg
        "icon-lg": "0.5rem",
      },
      borderWidth: {
        card: "0.0425rem", // 0.75px
      },
    },
  },
  plugins: [],
};
export default config;
