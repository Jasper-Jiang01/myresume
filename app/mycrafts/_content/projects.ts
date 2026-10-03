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
  /**
   * 封面加载后，把该元素顶部滚到视口高度的这个比例处。
   * 只影响列表封面，不改变实验页本身的滚动位置。
   */
  focus?: { selector: string; topRatio: number };
};

export type ProjectMeta = {
  title: string;
  category: string;
  description: LocalizedText;
  /** 列表页卡片封面的 iframe 预览参数，按项目实际内容尺寸单独调教 */
  preview: ProjectPreview;
};

export const pageCopy = {
  back: { zh: "返回首页", en: "Back to home" },
  heading: { zh: "动效实验站", en: "Motion lab" },
  description: {
    zh: "纯 CSS 与 GSAP 动效实验：玻璃、视差、3D 与交互动画。",
    en: "CSS and GSAP motion studies: glass, parallax, 3D, and interaction.",
  },
  regionLabel: { zh: "动效实验", en: "Motion studies" },
  prevLabel: { zh: "上一个实验", en: "Previous study" },
  nextLabel: { zh: "下一个实验", en: "Next study" },
  openLabel: { zh: "打开实验", en: "Open study" },
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
    // 公开页从形状网格开始。封面是 4:3，基准视口同比例才能铺满，不再上移露出底色。
    preview: { baseWidth: 1280, baseHeight: 960, zoom: 1 },
  },
  "gsap-rotatey-draggable": {
    title: "GSAP rotateY Draggable",
    category: "GSAP, 3D, Interaction",
    description: {
      zh: "通过水平拖拽代理控制 3D cards 的 rotateY 动画，带惯量、边界/自由旋转模式。",
      en: "Horizontal drag drives rotateY on 3D cards, with inertia and bounded or free-spin modes.",
    },
    // 卡片和说明一起居中。4:3 视口刚好包住整块 demo，不再切掉底部控件。
    preview: { baseWidth: 800, baseHeight: 600, zoom: 1 },
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
    // 宽度超过 640 才是完整电视机。4:3 视口留出浮动边距，屏幕、旋钮和频道条都在封面里。
    preview: { baseWidth: 960, baseHeight: 720, zoom: 1 },
  },
  strings: {
    title: "Strings",
    category: "Canvas, Physics, Interaction",
    description: {
      zh: "用源码字符织成的布料模拟：拖拽、拨动，看文字帘幕在重力里晃动。",
      en: "A cloth sim woven from source-code glyphs — drag and pluck the curtain as gravity takes over.",
    },
    // 画布本身就是 4:3，按 1 倍放进封面，布料四边不再被裁掉。
    preview: { baseWidth: 720, baseHeight: 540, zoom: 1 },
  },
  "gsap-wind-blown-text": {
    title: "GSAP Wind-Blown Text",
    category: "GSAP, Scroll, Typography",
    description: {
      zh: "用 data 属性驱动的 GSAP ScrollTrigger 文字：字母随滚动被风吹散或聚拢。",
      en: "Data-attribute GSAP ScrollTrigger type: letters scatter or gather as you scroll, as if caught in wind.",
    },
    // 首屏只有一行提示。封面对准下一屏的大标题，停在 50% 触发线之上，字母还没被吹散。
    preview: {
      baseWidth: 1280,
      baseHeight: 960,
      zoom: 1,
      focus: { selector: "h1.fly-text", topRatio: 0.54 },
    },
  },
  "24-modal-effectsroll-flip-bounce": {
    title: "24 Modal Effects",
    category: "CSS, Modal, Motion",
    description: {
      zh: "24 种模态框入场：卷轴展开、翻转、弹跳与对角线滑入，全部用 CSS transform 完成。",
      en: "Twenty-four modal entrances — roll, flip, bounce, and diagonal slides — built with CSS transforms.",
    },
    // 按钮组在视口中部换行居中。4:3 封面能看到整组按钮。
    preview: { baseWidth: 1280, baseHeight: 960, zoom: 1 },
  },
};

export default projects;
