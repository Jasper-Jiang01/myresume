import type { Metadata } from "next";
import {
  getArticle,
  getMarkdownArticle,
  listArticleSlugs,
} from "../_content/articles";
import { loadMarkdownArticle } from "../_article/designer-ai-coding/load";
import { getPost } from "../_content/posts";
import {
  BlogArticleMissing,
  BlogArticleView,
} from "../_components/BlogArticle";

export function generateStaticParams() {
  return listArticleSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const post = getPost(params.slug);
  const description =
    getArticle(params.slug)?.description ??
    getMarkdownArticle(params.slug)?.description;
  if (!post || !description) return { title: "文章不存在" };
  return {
    title: `${post.title.zh} · 蒋文喆`,
    description: description.zh,
  };
}

export default function BlogArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const post = getPost(params.slug);
  const blockArticle = getArticle(params.slug);
  if (post && blockArticle) {
    return (
      <main className="relative z-10 min-h-screen">
        <BlogArticleView post={post} article={blockArticle} />
      </main>
    );
  }

  const markdownMeta = getMarkdownArticle(params.slug);
  if (post && markdownMeta) {
    return (
      <main className="relative z-10 min-h-screen">
        <BlogArticleView
          post={post}
          article={{
            id: markdownMeta.id,
            description: markdownMeta.description,
            blocks: [],
            markdown: loadMarkdownArticle(markdownMeta.id),
          }}
        />
      </main>
    );
  }

  return <BlogArticleMissing />;
}
