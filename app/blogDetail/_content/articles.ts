import type { LocalizedText } from "@/lib/i18n/locale";
import { designHighlights } from "../_article/design-highlights";

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
};

/** 正文文件在 ../_article，一篇一个。 */
const articles: Record<string, BlogArticle> = {
  [designHighlights.id]: designHighlights,
};

export function getArticle(id: string): BlogArticle | undefined {
  return articles[id];
}

export function listArticleSlugs(): string[] {
  return Object.keys(articles);
}
