import type { LocalizedText } from "@/lib/i18n/locale";

export const pageCopy = {
  back: { zh: "返回首页", en: "Back to home" },
  heading: { zh: "博客", en: "Blog" },
  previous: { zh: "← 上一页", en: "← Previous" },
  next: { zh: "下一页 →", en: "Next →" },
  newer: { zh: "更新的文章", en: "Newer posts" },
  older: { zh: "更早的文章", en: "Older posts" },
};

export const PAGE_SIZE = 5;

export type BlogCategoryId = "all" | "design" | "engineering" | "motion";

export const categories: { id: BlogCategoryId; label: LocalizedText }[] = [
  { id: "all", label: { zh: "全部", en: "All Posts" } },
  { id: "design", label: { zh: "设计", en: "Design" } },
  { id: "engineering", label: { zh: "工程", en: "Engineering" } },
  { id: "motion", label: { zh: "动效", en: "Motion" } },
];

export type BlogPost = {
  id: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  category: Exclude<BlogCategoryId, "all">;
  date: LocalizedText;
};

export const posts: BlogPost[] = [
  {
    id: "ship-the-loop",
    title: {
      zh: "设计到上线是同一条回路",
      en: "Design and shipping are the same loop",
    },
    excerpt: {
      zh: "在美团境外，我把调研、交互和实现放在一轮里做。少一次交接，界面才更接近设计时的判断。",
      en: "At Dianping International I keep research, interface, and implementation in one pass. Fewer handoffs means the shipped UI still holds the original judgment.",
    },
    category: "design",
    date: { zh: "2026年9月", en: "Sep 2026" },
  },
  {
    id: "world-first-accounts",
    title: {
      zh: "多币种账户总览为什么难做",
      en: "Why multi-currency overviews are hard",
    },
    excerpt: {
      zh: "World First 的账户页要同时讲清余额、汇率和下一步动作。信息一多，用户就不知道先看哪。",
      en: "World First’s account screen has to explain balances, FX, and the next action at once. Too much information and people don’t know where to look first.",
    },
    category: "design",
    date: { zh: "2026年7月", en: "Jul 2026" },
  },
  {
    id: "motion-once",
    title: {
      zh: "进场动画只播一次",
      en: "Play the enter motion once",
    },
    excerpt: {
      zh: "从详情返回列表时如果再 fade-in，会像卡住。同一会话里，进场只给第一次。",
      en: "Fading the list in again after a detail page feels like a stall. In one session, the enter motion plays only the first time.",
    },
    category: "motion",
    date: { zh: "2026年6月", en: "Jun 2026" },
  },
  {
    id: "css-parallax",
    title: {
      zh: "能用 CSS 就先不用 JS",
      en: "Prefer CSS before JavaScript",
    },
    excerpt: {
      zh: "视差卡片用纯 CSS 就能做完。少一层运行时，预览和静态导出也更稳。",
      en: "A parallax card can be finished in CSS. Less runtime means previews and static export stay more predictable.",
    },
    category: "motion",
    date: { zh: "2026年5月", en: "May 2026" },
  },
  {
    id: "design-engineering",
    title: {
      zh: "设计工程师写的代码，是为了保真",
      en: "Design-engineer code exists to keep fidelity",
    },
    excerpt: {
      zh: "React / Next.js 不是把设计「还原」一遍，而是让间距、动效和状态成为可上线的系统。",
      en: "React and Next.js are not a second pass at the mock. They turn spacing, motion, and state into something that can ship.",
    },
    category: "engineering",
    date: { zh: "2026年4月", en: "Apr 2026" },
  },
  {
    id: "zero-to-one",
    title: {
      zh: "0—1 先证明价值",
      en: "Prove value before the system",
    },
    excerpt: {
      zh: "电力交易这种重业务，先把结算和套餐走通，再铺完整视觉系统。顺序反了，两边都慢。",
      en: "On a dense product like electricity trading, settle the core flows first, then grow the visual system. Reverse that and both sides stall.",
    },
    category: "design",
    date: { zh: "2026年3月", en: "Mar 2026" },
  },
  {
    id: "agent-surface",
    title: {
      zh: "把 Agent 做成产品表面",
      en: "Treat an agent as a product surface",
    },
    excerpt: {
      zh: "对话不是装饰。速率限制、历史和失败提示，决定它像不像一个能用的产品。",
      en: "Chat is not decoration. Rate limits, history, and failure copy decide whether it feels like a product.",
    },
    category: "engineering",
    date: { zh: "2026年2月", en: "Feb 2026" },
  },
  {
    id: "year-notes",
    title: {
      zh: "从蚂蚁到美团：一年的手感",
      en: "From Ant to Meituan: a year’s hand",
    },
    excerpt: {
      zh: "跨境支付之后做境外本地生活，场景变了，但「做完、上线、经得起用」没变。",
      en: "After cross-border payments came local life overseas. The domain changed; finishing, shipping, and holding up in use did not.",
    },
    category: "engineering",
    date: { zh: "2026年1月", en: "Jan 2026" },
  },
];
