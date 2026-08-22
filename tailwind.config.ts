import type { Config } from "tailwindcss";

/**
 * Web 适配 token：
 * - 字号/布局：skills/web-fontsize-adaptation.md
 * - 字体栈：skills/web-font-family.md（系统 UI，西文→中文）
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "var(--bg)",
        card: "var(--card)",
        cardBorder: "var(--card-border)",
        tag: "var(--tag)",
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted: "var(--text-muted)",
        surface: "var(--surface)",
        press: "var(--press)",
        stroke: "var(--stroke)",
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Ubuntu",
          '"Helvetica Neue"',
          "Helvetica",
          "Arial",
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei UI"',
          '"Microsoft YaHei"',
          '"Source Han Sans CN"',
          "sans-serif",
        ],
      },
      fontSize: {
        // 语义字号：默认固定；仅关键文案可用 sm: 升一档
        body: ["0.75rem", { lineHeight: "1rem" }], // 12px — 正文 / meta
        title: ["1rem", { lineHeight: "1.5rem" }], // 16px — 区块标题
        display: ["1.25rem", { lineHeight: "1.75rem" }], // 20px — 姓名等强调
      },
      maxWidth: {
        content: "864px",
      },
      size: {
        avatar: "7.5rem", // 120px
        "avatar-sm": "7.5rem", // 120px
        icon: "2rem", // 32px
        "icon-lg": "2rem",
        "dot-sm": "1rem", // 16px
        "dot-md": "0.875rem", // 14px
      },
      borderRadius: {
        card: "0.375rem", // 6px
        chip: "0.375rem",
        icon: "0.5rem", // 8px
        "icon-lg": "0.5rem",
      },
      borderWidth: {
        card: "0.75px",
      },
      transitionTimingFunction: {
        // 模拟原站 WebGL 插值惯性的阻尼缓动：先快后缓，比 ease-out 更有"跟手感"
        "expo-out": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
