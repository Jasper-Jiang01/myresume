"use client";

import { useCallback, useEffect, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowLeft, ArrowUpRight, Check, Download, Mail, MessageCircle } from "lucide-react";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { pickText } from "@/lib/i18n/locale";
import { withBasePath } from "@/lib/paths";
import { projectDetailsPath } from "@/app/projectDetails/_content/projects";
import projects, { contact, pageCopy } from "../_content/projects";

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const rowClassName =
  "group grid grid-cols-[auto_1fr_auto] items-start gap-5 border-b border-cardBorder py-7 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary sm:gap-8 sm:py-9";

const actionButtonClassName =
  "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

const actionButtonOutlineClassName = `${actionButtonClassName} border-cardBorder text-primary hover:border-[var(--btn-bg)] hover:bg-[var(--btn-bg)] hover:text-[var(--btn-fg)]`;

const actionButtonSolidClassName = `${actionButtonClassName} border-transparent bg-[var(--btn-bg)] text-[var(--btn-fg)] hover:opacity-90`;

/** 同一 SPA 会话内只播一次进场。从详情返回时若重放 opacity:0，会感觉卡住再淡入。 */
let showcaseHasEntered = false;

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }
}

export function Showcase7() {
  const { locale } = usePreferences();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [skipEnter] = useState(() => showcaseHasEntered);
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState<"wechat" | "email" | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      showcaseHasEntered = true;
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const handleCopy = useCallback(async (key: "wechat" | "email", value: string) => {
    const ok = await copyText(value);
    if (!ok) return;
    setCopied(key);
    window.setTimeout(() => {
      setCopied((current) => (current === key ? null : current));
    }, 1800);
  }, []);

  const items = projects.map((project, index) => ({
    index: String(index + 1).padStart(2, "0"),
    title: pickText(locale, project.title),
    year: project.year ?? "",
    summary: pickText(locale, project.description),
    coverImage: project.coverImage,
    href: project.href,
    detailsHref: project.detailsSlug
      ? projectDetailsPath(project.detailsSlug)
      : undefined,
  }));

  const total = String(items.length).padStart(2, "0");
  const current = items[active] ?? items[0];

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
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1.4fr_0.9fr] lg:gap-16 xl:gap-20">
          <motion.div
            initial={skipEnter || reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: skipEnter || reduceMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:sticky lg:top-16"
          >
            <h1
              style={
                locale === "en" ? { fontFamily: "var(--font-serif)" } : undefined
              }
              className="text-balance text-3xl font-bold leading-[1.05] tracking-tight text-primary sm:text-4xl lg:text-5xl"
            >
              {pickText(locale, pageCopy.heading)}
            </h1>

            <div className="relative mt-10 aspect-video overflow-hidden rounded-2xl border border-cardBorder bg-card sm:mt-12">
              {items.map((study, index) => (
                <motion.div
                  key={study.coverImage}
                  initial={false}
                  animate={{
                    opacity: active === index ? 1 : 0,
                    scale: reduceMotion || active === index ? 1 : 1.06,
                  }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.55,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  aria-hidden={active !== index}
                  className="absolute inset-0"
                >
                  <Image
                    src={withBasePath(study.coverImage)}
                    alt={study.title}
                    fill
                    priority={index === 0}
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    draggable={false}
                    className="object-cover"
                  />
                </motion.div>
              ))}
              {current ? (
                <span className="absolute left-4 top-4 rounded-full bg-[var(--card-glass)] px-3 py-1 font-mono text-[11px] tracking-[0.12em] text-primary backdrop-blur-sm">
                  {current.index} / {total}
                </span>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2 sm:mt-8 sm:gap-3">
              <a
                href={withBasePath(contact.pdfHref)}
                download={contact.pdfFilename}
                className={actionButtonSolidClassName}
              >
                <Download className="h-4 w-4" aria-hidden />
                {pickText(locale, pageCopy.downloadPdf)}
              </a>
              <button
                type="button"
                onClick={() => handleCopy("wechat", contact.wechat)}
                className={actionButtonOutlineClassName}
                aria-label={
                  copied === "wechat"
                    ? pickText(locale, pageCopy.copied)
                    : pickText(locale, pageCopy.getWechat)
                }
              >
                {copied === "wechat" ? (
                  <Check className="h-4 w-4" aria-hidden />
                ) : (
                  <MessageCircle className="h-4 w-4" aria-hidden />
                )}
                {copied === "wechat"
                  ? pickText(locale, pageCopy.copied)
                  : pickText(locale, pageCopy.getWechat)}
              </button>
              <button
                type="button"
                onClick={() => handleCopy("email", contact.email)}
                className={actionButtonOutlineClassName}
                aria-label={
                  copied === "email"
                    ? pickText(locale, pageCopy.copied)
                    : pickText(locale, pageCopy.getEmail)
                }
              >
                {copied === "email" ? (
                  <Check className="h-4 w-4" aria-hidden />
                ) : (
                  <Mail className="h-4 w-4" aria-hidden />
                )}
                {copied === "email"
                  ? pickText(locale, pageCopy.copied)
                  : pickText(locale, pageCopy.getEmail)}
              </button>
              <span className="sr-only" aria-live="polite">
                {copied ? pickText(locale, pageCopy.copied) : ""}
              </span>
            </div>
          </motion.div>

          <motion.div
            variants={listVariants}
            initial={skipEnter || reduceMotion ? false : "hidden"}
            animate="visible"
            role="list"
            aria-label={pickText(locale, pageCopy.regionLabel)}
            className="border-t border-cardBorder"
          >
            {items.map((study, index) => {
              const body = (
                <>
                  <span
                    className={`pt-1.5 font-mono text-xs tracking-[0.12em] transition-colors duration-200 ${
                      active === index ? "text-primary" : "text-muted"
                    }`}
                  >
                    {study.index}
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold tracking-tight text-primary sm:text-xl lg:text-2xl">
                      {study.title}
                    </h2>
                    {study.year ? (
                      <p className="mt-2 text-sm text-muted">{study.year}</p>
                    ) : null}
                    <p className="mt-3 max-w-lg text-pretty text-sm leading-relaxed text-muted">
                      {study.summary}
                    </p>
                  </div>
                  <span className="mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-cardBorder text-primary transition-colors duration-200 group-hover:border-[var(--btn-bg)] group-hover:bg-[var(--btn-bg)] group-hover:text-[var(--btn-fg)]">
                    <motion.span
                      variants={{ hover: { x: 2, y: -2 } }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="grid place-items-center"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </motion.span>
                  </span>
                </>
              );

              const detailsHref = study.detailsHref;
              const interaction = {
                variants: rowVariants,
                initial: skipEnter || reduceMotion ? false : "hidden",
                animate: "visible" as const,
                whileHover: "hover" as const,
                onMouseEnter: () => {
                  setActive(index);
                  if (detailsHref) router.prefetch(detailsHref);
                },
                onFocus: () => {
                  setActive(index);
                  if (detailsHref) router.prefetch(detailsHref);
                },
              };

              const enterDetails = () => {
                if (detailsHref) router.push(detailsHref);
              };

              const onArticleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
                if (!detailsHref) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  enterDetails();
                }
              };

              return study.href ? (
                <motion.a
                  key={study.coverImage}
                  href={withBasePath(study.href)}
                  role="listitem"
                  className={`${rowClassName} cursor-pointer`}
                  {...interaction}
                >
                  {body}
                </motion.a>
              ) : (
                <motion.article
                  key={study.coverImage}
                  tabIndex={0}
                  role="listitem"
                  aria-label={detailsHref ? study.title : undefined}
                  className={`${rowClassName} ${detailsHref ? "cursor-pointer" : ""}`}
                  onClick={detailsHref ? enterDetails : undefined}
                  onKeyDown={detailsHref ? onArticleKeyDown : undefined}
                  {...interaction}
                >
                  {body}
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Showcase7;
