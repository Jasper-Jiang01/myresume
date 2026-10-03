import type { LocalizedText } from "@/lib/i18n/locale";

export const pageCopy = {
  back: { zh: "返回首页", en: "Back to home" },
  backToList: { zh: "返回博客", en: "Back to blog" },
  heading: { zh: "博客", en: "Blog" },
  previous: { zh: "← 上一页", en: "← Previous" },
  next: { zh: "下一页 →", en: "Next →" },
  newer: { zh: "更新的文章", en: "Newer posts" },
  older: { zh: "更早的文章", en: "Older posts" },
  missing: { zh: "文章不存在", en: "Article not found" },
};

export const PAGE_SIZE = 5;

export type BlogCategoryId = "all" | "design" | "engineering";

export const categories: { id: BlogCategoryId; label: LocalizedText }[] = [
  { id: "all", label: { zh: "全部", en: "All Posts" } },
  { id: "design", label: { zh: "设计", en: "Design" } },
  { id: "engineering", label: { zh: "工程", en: "Engineering" } },
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
    id: "designer-ai-coding",
    title: {
      zh: "设计师 AI Coding 入门概览",
      en: "AI coding, a starting map for designers",
    },
    excerpt: {
      zh: "面向设计师的方向性介绍：AI Coding 现在能做到什么、该选什么工具，以及在职时怎样入坑。",
      en: "A directional overview for designers: what AI coding can do, which tools fit, and how to start while on the job.",
    },
    category: "engineering",
    date: { zh: "2026年10月", en: "Oct 2026" },
  },
  {
    id: "design-highlights",
    title: {
      zh: "如何设计出亮点，我总结了6个方法",
      en: "How to design a highlight: six methods I use",
    },
    excerpt: {
      zh: "设计亮点不是玄学。能感觉到用心，回味又是意料之外、情理之中。下面 6 条都是我用过的手法。",
      en: "A highlight is not mysticism. It feels considered, then surprising and inevitable. These six methods are ones I have actually used.",
    },
    category: "design",
    date: { zh: "2026年9月", en: "Sep 2026" },
  },
];

export function getPost(id: string): BlogPost | undefined {
  return posts.find((post) => post.id === id);
}

export function postPath(id: string): string {
  return `/blogDetail/${id}`;
}
