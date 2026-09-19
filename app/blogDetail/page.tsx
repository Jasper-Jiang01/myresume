import type { Metadata } from "next";
import { Blog3 } from "./_components/Blog3";

/**
 * /blogDetail 个人博客列表
 * 文案在 ./_content/posts.ts，侧栏筛选与翻页在 Blog3。
 */
export const metadata: Metadata = {
  title: "蒋文喆 · 博客",
  description: "设计、工程与动效笔记。从做到上线的过程记录。",
};

export default function BlogDetailPage() {
  return (
    <main className="relative z-10 min-h-screen">
      <Blog3 />
    </main>
  );
}
