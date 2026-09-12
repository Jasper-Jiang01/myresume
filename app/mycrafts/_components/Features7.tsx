"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { pickText } from "@/lib/i18n/locale";
import { withBasePath } from "@/lib/paths";
import projects, { pageCopy, type ProjectPreview } from "../_content/projects";
import { ProjectCover } from "./ProjectCover";

/** 同一 SPA 会话内只播一次进场。从详情返回时若重放 opacity:0，会感觉卡住再淡入。 */
let featuresHasEntered = false;

export function Features7() {
  const { locale } = usePreferences();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [skipEnter] = useState(() => featuresHasEntered);

  const items = Object.entries(projects).flatMap(([slug, project]) =>
    project
      ? [
          {
            slug,
            title: project.title,
            category: project.category,
            body: pickText(locale, project.description),
            href: `/mycrafts/${slug}`,
            previewSrc: withBasePath(`/cssdoodle/${slug}/index.html`),
            previewConfig: project.preview,
          },
        ]
      : []
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      featuresHasEntered = true;
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section className="flex w-full min-h-[var(--rb-section-min-h,100vh)] items-start px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-24 lg:px-8 lg:pb-24">
      <Link
        href="/home"
        aria-label={pickText(locale, pageCopy.back)}
        className="fixed left-4 top-4 z-50 grid h-8 w-8 place-items-center rounded-full border border-cardBorder bg-[var(--card-glass)] text-primary no-underline backdrop-blur-sm transition-colors duration-200 hover:border-[var(--btn-bg)] hover:bg-[var(--btn-bg)] hover:text-[var(--btn-fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
      </Link>

      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-24 sm:gap-28">
        <div className="max-w-2xl">
          <h1
            style={
              locale === "en" ? { fontFamily: "var(--font-serif)" } : undefined
            }
            className="text-balance text-3xl font-bold leading-[1.05] tracking-tight text-primary sm:text-4xl lg:text-5xl"
          >
            {pickText(locale, pageCopy.heading)}
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
            {pickText(locale, pageCopy.description)}
          </p>
        </div>

        {items.map((item, i) => {
          const flipped = i % 2 === 1;
          return (
            <motion.div
              key={item.slug}
              initial={skipEnter || reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: reduceMotion ? 0 : 0.3 }}
              className="grid grid-cols-1 items-center gap-10 md:grid-cols-2"
            >
              <FeaturePreview
                href={item.href}
                title={item.title}
                category={item.category}
                previewSrc={item.previewSrc}
                previewConfig={item.previewConfig}
                flipped={flipped}
                onPrefetch={() => router.prefetch(item.href)}
              />

              <div
                className={`flex flex-col gap-3 ${flipped ? "md:order-1" : ""}`}
              >
                <h2 className="text-3xl font-medium leading-tight tracking-tight text-primary sm:text-4xl">
                  {item.title}
                </h2>
                <p className="text-sm leading-relaxed text-muted sm:text-base">
                  {item.body}
                </p>
                <Link
                  href={item.href}
                  onMouseEnter={() => router.prefetch(item.href)}
                  onFocus={() => router.prefetch(item.href)}
                  className="mt-2 inline-flex w-fit items-center gap-2 text-sm font-medium text-primary no-underline transition-colors duration-200 hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {pickText(locale, pageCopy.openLabel)}
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function FeaturePreview({
  href,
  title,
  category,
  previewSrc,
  previewConfig,
  flipped,
  onPrefetch,
}: {
  href: string;
  title: string;
  category: string;
  previewSrc: string;
  previewConfig: ProjectPreview;
  flipped: boolean;
  onPrefetch: () => void;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setEnabled(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setEnabled(true);
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Link
      ref={ref}
      href={href}
      onMouseEnter={onPrefetch}
      onFocus={onPrefetch}
      className={`group relative aspect-[4/3] overflow-hidden rounded-2xl border border-cardBorder bg-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${
        flipped ? "md:order-2" : ""
      }`}
    >
      <ProjectCover
        src={previewSrc}
        title={title}
        previewConfig={previewConfig}
        enabled={enabled}
      />
      <span className="absolute left-4 top-4 rounded-full bg-[var(--card-glass)] px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm">
        {category}
      </span>
    </Link>
  );
}

export default Features7;
