/**
 * 项目信息
 */

import type { LocalizedText } from "@/lib/i18n/locale";

export type ProjectPreview = {
  /** iframe 内部模拟的基准视口宽度（px），决定 vw/vmin 等相对单位的计算基准 */
  baseWidth: number;
  /** iframe 内部模拟的基准视口高度（px） */
  baseHeight: number;
  /** 缩放后再额外整体放大的系数，用于把核心视觉区域放大到接近充满卡片 */
  zoom?: number;
  /** 内容在基准视口内的水平偏移（px），用于把核心视觉区域移到可视区域中央 */
  offsetX?: number;
  /** 内容在基准视口内的垂直偏移（px），用于跳过页头等无关区域 */
  offsetY?: number;
};

export type ProjectMeta = {
  title: string;
  category: string;
  description: LocalizedText;
  /** 列表页卡片封面的 iframe 预览参数，按项目实际内容尺寸单独调教 */
  preview: ProjectPreview;
};

// 显式声明索引签名返回值可能为 undefined：
// projects[slug] 的 slug 来自路由参数，并非所有 slug 都在此表中登记，
// 这样声明可让 TypeScript 在编译期强制调用方处理“项目不存在”的分支，
// 避免仅凭运行时 `if (!project)` 兜底而类型层面仍是非 undefined 带来的隐性不安全。
type ProjectMetaMap = {
  [slug: string]: ProjectMeta | undefined;
};

const projects: ProjectMetaMap = {
  "neon-glass-3d-cards-ui-lab": {
    title: "Neon Glass · 3D Cards",
    category: "UI Lab, 3D, CSS",
    description: {
      zh: "交互式 3D 卡片实验室：玻璃质感、棱镜切面、聚光灯卡组，支持键盘/拖拽导航。",
      en: "An interactive 3D card lab: glass, prism cuts, and a spotlight deck with keyboard and drag navigation.",
    },
    // 页面很长（导航 + hero + 多个 section），聚焦到卡片网格区域，向上偏移跳过顶部导航
    preview: { baseWidth: 1280, baseHeight: 760, zoom: 1.65, offsetY: -170 },
  },
  "gsap-rotatey-draggable": {
    title: "GSAP rotateY Draggable",
    category: "GSAP, 3D, Interaction",
    description: {
      zh: "通过水平拖拽代理控制 3D cards 的 rotateY 动画，带惯量、边界/自由旋转模式。",
      en: "Horizontal drag drives rotateY on 3D cards, with inertia and bounded or free-spin modes.",
    },
    // 内容整体居中，正常还原即可
    preview: { baseWidth: 760, baseHeight: 640, zoom: 1.35 },
  },
  "pure-css-parallax-card-on-hover": {
    title: "Pure CSS Parallax Card",
    category: "CSS, Parallax, Hover",
    description: {
      zh: "纯 CSS 实现的悬停视差卡片效果，无需 JavaScript。",
      en: "A hover-parallax card built with pure CSS — no JavaScript.",
    },
    // .scene 用 vmin 单位，缩小基准视口让卡片相对更大
    preview: { baseWidth: 480, baseHeight: 480, zoom: 1.5 },
  },
  "after-sign-off": {
    title: "After Sign-Off",
    category: "CSS, Animation",
    description: {
      zh: "纯 CSS 动效展示。",
      en: "A pure CSS motion study.",
    },
    // 固定像素尺寸的电视机造型，居中并留出边距避免裁切
    preview: { baseWidth: 640, baseHeight: 560, zoom: 1.3 },
  },
};

export default projects;
