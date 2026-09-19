"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { pickText } from "@/lib/i18n/locale";
import {
  PAGE_SIZE,
  categories,
  pageCopy,
  posts,
  type BlogCategoryId,
} from "../_content/posts";

/** 同一 SPA 会话内只播一次标题进场。从首页返回时若重放 opacity:0，会感觉卡住再淡入。 */
let blogHasEntered = false;

export function Blog3() {
  const { locale } = usePreferences();
  const reduceMotion = useReducedMotion();
  const [skipEnter] = useState(() => blogHasEntered);
  const [activeCategory, setActiveCategory] = useState<BlogCategoryId>("all");
  const [page, setPage] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      blogHasEntered = true;
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const filteredArticles =
    activeCategory === "all"
      ? posts
      : posts.filter((article) => article.category === activeCategory);

  const pageCount = Math.max(1, Math.ceil(filteredArticles.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pagedArticles = filteredArticles.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE
  );

  const goToPage = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const selectCategory = (category: BlogCategoryId) => {
    setActiveCategory(category);
    goToPage(0);
  };

  const enter = skipEnter || reduceMotion ? false : { opacity: 0, y: 20 };
  const itemEnter = reduceMotion ? false : { opacity: 0, y: 15 };

  return (
    <section
      className="w-full px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-24 lg:px-8 lg:pb-24"
      aria-label={pickText(locale, pageCopy.heading)}
    >
      <Link
        href="/home"
        aria-label={pickText(locale, pageCopy.back)}
        className="fixed left-4 top-4 z-50 grid h-8 w-8 place-items-center rounded-full border border-cardBorder bg-[var(--card-glass)] text-primary no-underline backdrop-blur-sm transition-colors duration-200 hover:border-[var(--btn-bg)] hover:bg-[var(--btn-bg)] hover:text-[var(--btn-fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
      </Link>

      <div className="mx-auto w-full max-w-[1400px]">
        <motion.h1
          initial={enter}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: skipEnter || reduceMotion ? 0 : 0.5 }}
          style={locale === "en" ? { fontFamily: "var(--font-serif)" } : undefined}
          className="mb-12 text-balance text-3xl font-bold leading-[1.05] tracking-tight text-primary sm:mb-16 sm:text-4xl lg:text-5xl"
        >
          {pickText(locale, pageCopy.heading)}
        </motion.h1>

        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          <motion.aside
            initial={skipEnter || reduceMotion ? false : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: skipEnter || reduceMotion ? 0 : 0.5,
              delay: skipEnter || reduceMotion ? 0 : 0.1,
            }}
            className="flex-shrink-0 lg:w-40"
          >
            <nav
              aria-label={pickText(locale, pageCopy.heading)}
              className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-4 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0"
            >
              {categories.map((category) => {
                const selected = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => selectCategory(category.id)}
                    aria-current={selected ? "page" : undefined}
                    className={`whitespace-nowrap rounded-full px-3 py-1.5 text-left text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:rounded-none lg:px-0 lg:py-1 ${
                      selected
                        ? "bg-[var(--btn-bg)] text-[var(--btn-fg)] lg:bg-transparent lg:text-primary"
                        : "text-muted hover:text-primary"
                    }`}
                  >
                    {pickText(locale, category.label)}
                  </button>
                );
              })}
            </nav>
          </motion.aside>

          <div className="min-w-0 flex-1">
            <div
              key={`${activeCategory}-${safePage}`}
              className="flex flex-col gap-4"
            >
              {pagedArticles.map((article, idx) => {
                const categoryLabel = categories.find(
                  (category) => category.id === article.category
                )?.label;

                return (
                  <motion.article
                    key={article.id}
                    initial={itemEnter}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.4,
                      delay: reduceMotion ? 0 : 0.15 + idx * 0.05,
                    }}
                    className="rounded-xl border border-cardBorder bg-card p-5 transition-colors sm:p-6"
                  >
                    <h2 className="mb-2 text-lg font-medium text-primary sm:text-xl">
                      {pickText(locale, article.title)}
                    </h2>
                    <p className="mb-4 line-clamp-2 text-sm text-muted sm:text-base">
                      {pickText(locale, article.excerpt)}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted sm:text-sm">
                      <span>
                        {categoryLabel ? pickText(locale, categoryLabel) : ""}
                      </span>
                      <span aria-hidden>·</span>
                      <span>{pickText(locale, article.date)}</span>
                    </div>
                  </motion.article>
                );
              })}
            </div>

            <motion.div
              initial={skipEnter || reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: skipEnter || reduceMotion ? 0 : 0.5,
                delay: skipEnter || reduceMotion ? 0 : 0.4,
              }}
              className="mt-8 grid grid-cols-2 gap-4 sm:mt-10"
            >
              <button
                type="button"
                onClick={() => goToPage(Math.max(0, safePage - 1))}
                disabled={safePage === 0}
                className="group flex items-center gap-3 rounded-xl border border-cardBorder bg-card p-4 transition-colors hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40 sm:p-5"
              >
                <div className="flex flex-col items-start">
                  <span className="text-xs text-muted">
                    {pickText(locale, pageCopy.previous)}
                  </span>
                  <span className="text-sm font-medium text-primary">
                    {pickText(locale, pageCopy.newer)}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => goToPage(Math.min(pageCount - 1, safePage + 1))}
                disabled={safePage >= pageCount - 1}
                className="group flex items-center justify-end gap-3 rounded-xl border border-cardBorder bg-card p-4 transition-colors hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40 sm:p-5"
              >
                <div className="flex flex-col items-end">
                  <span className="text-xs text-muted">
                    {pickText(locale, pageCopy.next)}
                  </span>
                  <span className="text-sm font-medium text-primary">
                    {pickText(locale, pageCopy.older)}
                  </span>
                </div>
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Blog3;
