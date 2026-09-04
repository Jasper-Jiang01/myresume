"use client";

/**
 * 组件名称：ProjectDetailsView
 * 组件描述：可复用的项目详情页。顶部返回 + 标题/元信息，下方按数据渲染图集。
 *          图集尺寸、文案、返回路径均由 ProjectDetails 数据驱动，后续项目只需登记数据。
 * 组件属性：
 *  - project: ProjectDetails，当前项目的标题、描述、图片与元信息
 *  - backHref?: string，覆盖数据里的返回路径
 *  - className?: string，追加在最外层容器
 *  - headerExtra?: ReactNode，标题区下方插槽（时间线、职责等）
 *  - footer?: ReactNode，图集下方插槽
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { pickText } from "@/lib/i18n/locale";
import { withBasePath } from "@/lib/paths";
import {
  detailsCopy,
  type ProjectDetails,
  type ProjectDetailsImage,
} from "../_content/projects";

type ProjectDetailsViewProps = {
  project: ProjectDetails;
  backHref?: string;
  className?: string;
  headerExtra?: ReactNode;
  footer?: ReactNode;
};

function imageAlt(
  locale: "zh" | "en",
  projectTitle: string,
  image: ProjectDetailsImage,
  index: number
): string {
  if (image.alt) return pickText(locale, image.alt);
  return `${projectTitle} ${String(index + 1).padStart(2, "0")}`;
}

/**
 * 离开视口较远时卸掉 <img>，避免 30+ 张原图同时解码占内存。
 * 返回作品集时只需回收附近几张，而不是整页图集。
 */
function GalleryFigure({
  image,
  index,
  alt,
  caption,
}: {
  image: ProjectDetailsImage;
  index: number;
  alt: string;
  caption?: string;
}) {
  const width = image.width ?? 1920;
  const height = image.height ?? 1080;
  const eager = index < 2;
  const boxRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(eager);

  useEffect(() => {
    if (eager) return;
    const node = boxRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setActive(entry.isIntersecting);
      },
      { rootMargin: "400px 0px", threshold: 0 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [eager]);

  return (
    <figure className="overflow-hidden rounded-2xl border border-cardBorder bg-card">
      <div
        ref={boxRef}
        className="relative w-full"
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        {active ? (
          <Image
            src={withBasePath(image.src)}
            alt={alt}
            fill
            priority={eager}
            sizes="(min-width: 1400px) 1400px, 100vw"
            className="object-cover"
          />
        ) : null}
      </div>
      {caption ? (
        <figcaption className="px-4 py-3 text-sm text-muted">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

export function ProjectDetailsView({
  project,
  backHref,
  className = "",
  headerExtra,
  footer,
}: ProjectDetailsViewProps) {
  const { locale } = usePreferences();
  const reduceMotion = useReducedMotion();
  const title = pickText(locale, project.title);
  const showIntro = project.showIntro !== false;
  const description =
    showIntro && project.description
      ? pickText(locale, project.description)
      : "";
  const category = project.category ? pickText(locale, project.category) : "";
  const resolvedBackHref = backHref ?? project.backHref ?? "/personalProject";
  const hasIntro =
    (showIntro && (title || description)) ||
    Boolean(project.year) ||
    Boolean(project.meta && project.meta.length > 0) ||
    Boolean(headerExtra);

  return (
    <main className={`dark relative z-10 min-h-screen bg-page text-primary ${className}`}>
      <header className="sticky top-0 z-40 flex items-center justify-between bg-[var(--card-glass)] px-4 py-4 backdrop-blur-sm sm:px-8 sm:py-6">
        <Link
          href={resolvedBackHref}
          className="text-body font-medium text-muted no-underline transition-colors hover:text-primary"
        >
          {pickText(locale, detailsCopy.back)}
        </Link>
        {category ? (
          <span className="max-w-[55%] truncate text-right text-sm text-muted">
            {category}
          </span>
        ) : null}
      </header>

      <div className="mx-auto w-full max-w-[1400px] px-4 pb-28 sm:px-6 sm:pb-32 lg:px-8">
        {!showIntro ? <h1 className="sr-only">{title}</h1> : null}
        {hasIntro ? (
          <motion.section
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mb-10 sm:mb-14"
          >
            {project.year ? (
              <p className="font-mono text-xs tracking-[0.12em] text-muted">
                {project.year}
              </p>
            ) : null}
            {showIntro ? (
              <>
                <h1
                  style={
                    locale === "en"
                      ? { fontFamily: "var(--font-serif)" }
                      : undefined
                  }
                  className={`text-balance text-3xl font-bold leading-[1.1] tracking-tight text-primary sm:text-4xl lg:text-5xl ${
                    project.year ? "mt-3" : ""
                  }`}
                >
                  {title}
                </h1>
                {description ? (
                  <p className="mt-4 max-w-3xl text-pretty text-body leading-relaxed text-muted">
                    {description}
                  </p>
                ) : null}
              </>
            ) : null}
            {project.meta && project.meta.length > 0 ? (
              <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
                {project.meta.map((item) => (
                  <div key={pickText(locale, item.label)}>
                    <dt className="text-xs tracking-[0.08em] text-muted">
                      {pickText(locale, item.label)}
                    </dt>
                    <dd className="mt-1 text-sm text-primary">
                      {pickText(locale, item.value)}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {headerExtra}
          </motion.section>
        ) : null}

        <section
          aria-label={pickText(locale, detailsCopy.galleryLabel)}
          className="flex flex-col gap-3 sm:gap-4"
        >
          {project.images.map((image, index) => (
            <GalleryFigure
              key={image.src}
              image={image}
              index={index}
              alt={imageAlt(locale, title, image, index)}
              caption={
                image.caption ? pickText(locale, image.caption) : undefined
              }
            />
          ))}
        </section>
        {footer}
      </div>
    </main>
  );
}

export function ProjectDetailsMissing({
  backHref = "/personalProject",
}: {
  backHref?: string;
}) {
  const { locale } = usePreferences();
  return (
    <main className="dark relative z-10 flex min-h-screen flex-col items-center justify-center gap-4 bg-page text-primary">
      <p className="text-body text-muted">
        {pickText(locale, detailsCopy.missing)}
      </p>
      <Link
        href={backHref}
        className="text-body font-medium text-primary underline underline-offset-4"
      >
        {pickText(locale, detailsCopy.back)}
      </Link>
    </main>
  );
}

export default ProjectDetailsView;
