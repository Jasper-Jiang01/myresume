"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { pickText } from "@/lib/i18n/locale";
import { withBasePath } from "@/lib/paths";
import {
  categories,
  pageCopy,
  type BlogPost,
} from "../_content/posts";
import type { BlogArticle } from "../_content/articles";
import { MarkdownBody } from "./MarkdownBody";

export function BlogArticleView({
  post,
  article,
}: {
  post: BlogPost;
  article: BlogArticle;
}) {
  const { locale } = usePreferences();
  const reduceMotion = useReducedMotion();
  const categoryLabel = categories.find(
    (category) => category.id === post.category
  )?.label;
  const enter = reduceMotion ? false : { opacity: 0, y: 16 };

  return (
    <article
      className={
        article.markdown
          ? "w-full pb-20 pl-14 pr-4 pt-28 sm:pb-24 sm:pl-16 sm:pr-6 sm:pt-24 lg:pr-8"
          : "w-full px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-24 lg:px-8"
      }
      aria-labelledby="blog-article-title"
    >
      <Link
        href="/blogDetail"
        aria-label={pickText(locale, pageCopy.backToList)}
        className="fixed left-4 top-4 z-50 grid h-8 w-8 place-items-center rounded-full border border-cardBorder bg-[var(--card-glass)] text-primary no-underline backdrop-blur-sm transition-colors duration-200 hover:border-[var(--btn-bg)] hover:bg-[var(--btn-bg)] hover:text-[var(--btn-fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
      </Link>

      <div
        className={
          article.markdown
            ? "mx-auto w-full max-w-6xl"
            : "mx-auto w-full max-w-3xl"
        }
      >
        <motion.header
          initial={enter}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.45 }}
        >
          <p className="mb-4 flex items-center gap-2 text-sm text-muted">
            <span>
              {categoryLabel ? pickText(locale, categoryLabel) : ""}
            </span>
            <span aria-hidden>·</span>
            <span>{pickText(locale, post.date)}</span>
          </p>
          <h1
            id="blog-article-title"
            style={
              locale === "en" ? { fontFamily: "var(--font-serif)" } : undefined
            }
            className="text-balance text-3xl font-bold leading-[1.15] tracking-tight text-primary sm:text-4xl lg:text-[2.75rem]"
          >
            {pickText(locale, post.title)}
          </h1>
        </motion.header>

        <motion.div
          initial={enter}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduceMotion ? 0 : 0.45,
            delay: reduceMotion ? 0 : 0.08,
          }}
          className={
            article.markdown
              ? "mt-10 sm:mt-12"
              : "mt-10 flex flex-col gap-5 sm:mt-12 sm:gap-6"
          }
        >
          {article.markdown ? (
            <MarkdownBody source={article.markdown} />
          ) : (
            article.blocks.map((block, index) => {
            if (block.type === "h2") {
              return (
                <h2
                  key={index}
                  className="mt-4 text-xl font-semibold tracking-tight text-primary sm:text-2xl"
                >
                  {pickText(locale, block.text)}
                </h2>
              );
            }

            if (block.type === "img") {
              const caption = block.caption
                ? pickText(locale, block.caption)
                : "";
              return (
                <figure
                  key={index}
                  className="overflow-hidden rounded-xl border border-cardBorder bg-card"
                >
                  {/* GIF 走原生 img，避免 next/image 抽帧。 */}
                  <img
                    src={withBasePath(block.src)}
                    alt={pickText(locale, block.alt)}
                    width={block.width}
                    height={block.height}
                    className="mx-auto h-auto w-full max-w-full object-contain"
                  />
                  {caption ? (
                    <figcaption className="px-4 py-3 text-center text-sm text-muted">
                      {caption}
                    </figcaption>
                  ) : null}
                </figure>
              );
            }

            return (
              <p
                key={index}
                className="text-pretty text-base leading-[1.85] text-secondary sm:text-[1.05rem]"
              >
                {pickText(locale, block.text)}
              </p>
            );
          })
          )}
        </motion.div>
      </div>
    </article>
  );
}

export function BlogArticleMissing() {
  const { locale } = usePreferences();
  return (
    <main className="relative z-10 flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <p className="text-body text-muted">
          {pickText(locale, pageCopy.missing)}
        </p>
        <Link
          href="/blogDetail"
          className="mt-4 inline-block text-sm text-primary underline-offset-4 hover:underline"
        >
          {pickText(locale, pageCopy.backToList)}
        </Link>
      </div>
    </main>
  );
}
