import fs from "node:fs";
import path from "node:path";
import { articleImages } from "./images";

/** 只在服务端页面读取。不要从客户端组件导入。 */
const ARTICLE_DIR = path.join(
  process.cwd(),
  "app/blogDetail/_article/designer-ai-coding"
);
const MARKDOWN_FILE = "设计师 AI Coding 入门概览.md";

export function prepareMarkdown(raw: string): string {
  return raw
    .replace(/^# [^\n]+\n+/, "")
    .replace(/^[ \t]*>[ \t]*$/gm, "");
}

export function loadMarkdownArticle(id: string): string {
  if (id !== "designer-ai-coding") {
    throw new Error(`No markdown file for article "${id}"`);
  }
  const raw = fs.readFileSync(path.join(ARTICLE_DIR, MARKDOWN_FILE), "utf8");
  const prepared = prepareMarkdown(raw);
  return prepared.replace(
    /(!\[[^\]]*\]\()(\.\/assets\/[^)]+)\)/g,
    (_match, prefix: string, rel: string) => {
      const file = rel.split("/").pop() ?? "";
      const image = articleImages[file];
      if (!image) throw new Error(`Missing article image: ${rel}`);
      return `${prefix}${image.src})`;
    }
  );
}
