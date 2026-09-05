"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { pickText } from "@/lib/i18n/locale";
import { withBasePath } from "@/lib/paths";
import projects, { pageCopy } from "../_content/projects";
import { ProjectCover } from "./ProjectCover";

const MotionLink = motion(Link);

const headerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const trackVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const navButtonClassName =
  "grid h-11 w-11 place-items-center rounded-full border border-cardBorder text-primary transition-colors duration-200 enabled:cursor-pointer enabled:hover:border-[var(--btn-bg)] enabled:hover:bg-[var(--btn-bg)] enabled:hover:text-[var(--btn-fg)] disabled:opacity-35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

/** 同一 SPA 会话内只播一次进场。从详情返回时若重放 opacity:0，会感觉卡住再淡入。 */
let showcaseHasEntered = false;

export function Showcase8() {
  const { locale } = usePreferences();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [skipEnter] = useState(() => showcaseHasEntered);
  const trackRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const items = Object.entries(projects).flatMap(([slug, project]) =>
    project
      ? [
          {
            slug,
            title: project.title,
            category: project.category,
            summary: pickText(locale, project.description),
            href: `/mycrafts/${slug}`,
            previewSrc: withBasePath(`/cssdoodle/${slug}/index.html`),
            previewConfig: project.preview,
          },
        ]
      : []
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      showcaseHasEntered = true;
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const readScroll = useCallback(() => {
    const node = trackRef.current;
    if (!node) return;
    const max = node.scrollWidth - node.clientWidth;
    const left = node.scrollLeft;
    setProgress(max > 0 ? Math.min(1, Math.max(0, left / max)) : 0);
    setCanPrev(left > 8);
    setCanNext(left < max - 8);
    const cards = Array.from(node.children) as HTMLElement[];
    if (!cards.length) return;
    const start = cards[0].offsetLeft;
    let nearest = 0;
    let smallest = Infinity;
    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - start - left);
      if (distance < smallest) {
        smallest = distance;
        nearest = index;
      }
    });
    if (max - left < 8) nearest = cards.length - 1;
    setActive(nearest);
  }, []);

  const handleScroll = () => {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(readScroll);
  };

  useEffect(() => {
    frameRef.current = requestAnimationFrame(readScroll);
    window.addEventListener("resize", readScroll);
    return () => {
      window.removeEventListener("resize", readScroll);
      cancelAnimationFrame(frameRef.current);
    };
  }, [readScroll]);

  const step = (direction: number) => {
    const node = trackRef.current;
    if (!node) return;
    const cards = Array.from(node.children) as HTMLElement[];
    if (!cards.length) return;
    const start = cards[0].offsetLeft;
    const left = node.scrollLeft;
    const offsets = cards.map((card) => card.offsetLeft - start);
    let target: number | undefined;
    if (direction < 0) {
      for (let i = offsets.length - 1; i >= 0; i--) {
        if (offsets[i] < left - 8) {
          target = offsets[i];
          break;
        }
      }
      if (target === undefined) target = 0;
    } else {
      for (let i = 0; i < offsets.length; i++) {
        if (offsets[i] > left + 8) {
          target = offsets[i];
          break;
        }
      }
      if (target === undefined) target = node.scrollWidth - node.clientWidth;
    }
    node.scrollTo({
      left: target,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  const enterMotion = skipEnter || reduceMotion ? false : "hidden";

  return (
    <section className="w-full px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-24 lg:px-8 lg:pb-24">
      <Link
        href="/home"
        aria-label={pickText(locale, pageCopy.back)}
        className="fixed left-4 top-4 z-50 grid h-8 w-8 place-items-center rounded-full border border-cardBorder bg-[var(--card-glass)] text-primary no-underline backdrop-blur-sm transition-colors duration-200 hover:border-[var(--btn-bg)] hover:bg-[var(--btn-bg)] hover:text-[var(--btn-fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
      </Link>

      <div className="mx-auto w-full max-w-[1400px]">
        <motion.div
          variants={headerVariants}
          initial={enterMotion}
          animate="visible"
          className="mb-10 flex flex-col gap-8 sm:mb-12 lg:flex-row lg:items-end lg:justify-between"
        >
          <motion.div variants={fadeUp} className="max-w-2xl">
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
          </motion.div>

          <motion.div variants={fadeUp} className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => step(-1)}
              disabled={!canPrev}
              aria-label={pickText(locale, pageCopy.prevLabel)}
              className={navButtonClassName}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              disabled={!canNext}
              aria-label={pickText(locale, pageCopy.nextLabel)}
              className={navButtonClassName}
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        </motion.div>

        <div className="-mx-4 sm:-mx-6 lg:-mx-8">
          <motion.div
            ref={trackRef}
            onScroll={handleScroll}
            role="region"
            aria-label={pickText(locale, pageCopy.regionLabel)}
            tabIndex={0}
            variants={trackVariants}
            initial={enterMotion}
            animate="visible"
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain px-4 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:gap-6 sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden"
          >
            {items.map((project, index) => (
              <MotionLink
                key={project.slug}
                href={project.href}
                variants={cardVariants}
                whileHover="hover"
                onMouseEnter={() => router.prefetch(project.href)}
                onFocus={() => router.prefetch(project.href)}
                className="group w-[78vw] max-w-[420px] shrink-0 cursor-pointer snap-start scroll-ml-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:w-[400px] sm:scroll-ml-6 lg:w-[440px] lg:scroll-ml-8"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-cardBorder bg-card">
                  <ProjectCover
                    src={project.previewSrc}
                    title={project.title}
                    previewConfig={project.previewConfig}
                    enabled={Math.abs(index - active) <= 1}
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-[var(--card-glass)] px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm">
                    {project.category}
                  </span>
                </div>
                <div className="mt-5 flex items-start justify-between gap-4 px-1">
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-semibold tracking-tight text-primary sm:text-2xl">
                      {project.title}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">
                      {project.summary}
                    </p>
                  </div>
                  <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-cardBorder text-primary transition-colors duration-200 group-hover:border-[var(--btn-bg)] group-hover:bg-[var(--btn-bg)] group-hover:text-[var(--btn-fg)]">
                    <motion.span
                      variants={{ hover: { x: 2, y: -2 } }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="grid place-items-center"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </motion.span>
                  </span>
                </div>
              </MotionLink>
            ))}
          </motion.div>
        </div>

        <div className="mt-8 flex items-center gap-6">
          <div className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-cardBorder">
            <div
              className="absolute inset-0 origin-left rounded-full bg-primary"
              style={{ transform: `scaleX(${progress})` }}
            />
          </div>
          <p className="font-mono text-xs tracking-[0.12em]">
            <span className="text-primary">
              {String(active + 1).padStart(2, "0")}
            </span>
            <span className="text-muted">
              {" "}
              / {String(items.length).padStart(2, "0")}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Showcase8;
