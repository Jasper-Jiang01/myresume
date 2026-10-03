import type { LocalizedText } from "@/lib/i18n/locale";
import { designHighlights } from "../_article/design-highlights";
import { designerAiCoding } from "../_article/designer-ai-coding/index";

export type ArticleParagraph = {
  type: "p";
  text: LocalizedText;
};

export type ArticleHeading = {
  type: "h2";
  text: LocalizedText;
};

export type ArticleImage = {
  type: "img";
  src: string;
  width: number;
  height: number;
  caption?: LocalizedText;
  alt: LocalizedText;
};

export type ArticleBlock = ArticleParagraph | ArticleHeading | ArticleImage;

export type BlogArticle = {
  id: string;
  description: LocalizedText;
  blocks: ArticleBlock[];
  /** 有值时按 Markdown 渲染，blocks 留空。 */
  markdown?: string;
};

export type MarkdownArticleMeta = {
  id: string;
  description: LocalizedText;
};

/** 结构化正文在 ../_article，一篇一个。 */
const articles: Record<string, BlogArticle> = {
  [designHighlights.id]: designHighlights,
};

/** Markdown 正文在构建时读取，这里只放列表和 metadata 需要的信息。 */
const markdownArticles: Record<string, MarkdownArticleMeta> = {
  [designerAiCoding.id]: designerAiCoding,
};

export function getArticle(id: string): BlogArticle | undefined {
  return articles[id];
}

export function getMarkdownArticle(id: string): MarkdownArticleMeta | undefined {
  return markdownArticles[id];
}

export function hasArticle(id: string): boolean {
  return Boolean(articles[id] || markdownArticles[id]);
}

export function listArticleSlugs(): string[] {
  return [...Object.keys(articles), ...Object.keys(markdownArticles)];
}
