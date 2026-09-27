import type { Metadata } from "next";
import { getArticle, listArticleSlugs } from "../_content/articles";
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
  const article = getArticle(params.slug);
  if (!post || !article) return { title: "文章不存在" };
  return {
    title: `${post.title.zh} · 蒋文喆`,
    description: article.description.zh,
  };
}

export default function BlogArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const post = getPost(params.slug);
  const article = getArticle(params.slug);
  if (!post || !article) return <BlogArticleMissing />;
  return (
    <main className="relative z-10 min-h-screen">
      <BlogArticleView post={post} article={article} />
    </main>
  );
}
