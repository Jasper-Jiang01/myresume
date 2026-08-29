/**
 * 助手允许打开的站点页面清单。
 * id 是工具入参枚举，aliases 写进工具 description，帮助模型对齐用户说法。
 */
import type { ProjectLink } from "./types";

export const PROJECT_LINKS: readonly ProjectLink[] = [
  {
    id: "home",
    href: "/home",
    internal: true,
    title: { zh: "首页", en: "Home" },
    aliases: ["首页", "主页", "home", "info"],
  },
  {
    id: "portfolio",
    href: "/personalProject",
    internal: true,
    title: { zh: "个人作品集", en: "Personal portfolio" },
    aliases: [
      "个人作品集",
      "作品集",
      "portfolio",
      "World First",
      "跨境支付",
      "电力交易",
      "Power Trading",
    ],
  },
  {
    id: "mycrafts",
    href: "/mycrafts",
    internal: true,
    title: { zh: "动效实验站", en: "Motion lab" },
    aliases: ["动效实验站", "mycrafts", "cssdoodle", "动效"],
  },
  {
    id: "neon-glass",
    href: "/mycrafts/neon-glass-3d-cards-ui-lab",
    internal: true,
    title: { zh: "Neon Glass · 3D Cards", en: "Neon Glass · 3D Cards" },
    aliases: ["neon glass", "3d cards", "玻璃卡片"],
  },
  {
    id: "gsap-rotatey",
    href: "/mycrafts/gsap-rotatey-draggable",
    internal: true,
    title: { zh: "GSAP rotateY Draggable", en: "GSAP rotateY Draggable" },
    aliases: ["gsap", "rotatey", "draggable"],
  },
  {
    id: "parallax-card",
    href: "/mycrafts/pure-css-parallax-card-on-hover",
    internal: true,
    title: { zh: "Pure CSS Parallax Card", en: "Pure CSS Parallax Card" },
    aliases: ["parallax", "视差卡片", "纯 css 卡片"],
  },
  {
    id: "after-sign-off",
    href: "/mycrafts/after-sign-off",
    internal: true,
    title: { zh: "After Sign-Off", en: "After Sign-Off" },
    aliases: ["after sign-off", "after sign off"],
  },
  {
    id: "button-workshop",
    href: "/cssdoodle/button-state-buildera-visual-editor-for-designing-multi-state-button-flows/dist/index.html",
    internal: false,
    title: { zh: "CSS 灵动按钮工坊", en: "CSS button workshop" },
    aliases: ["按钮工坊", "button workshop", "css 按钮"],
  },
] as const;

/** 供 JSON schema enum 使用的页面 id 列表 */
export const PROJECT_LINK_IDS = PROJECT_LINKS.map((item) => item.id);
