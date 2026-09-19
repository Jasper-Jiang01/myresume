"use client";

import { useLayoutEffect } from "react";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { pickText } from "@/lib/i18n/locale";
import { websiteCopy } from "../_content/content";

type GsapModule = typeof import("gsap");
type ScrollTriggerModule = typeof import("gsap/ScrollTrigger");

export function MotionDirector() {
  const { locale } = usePreferences();

  useLayoutEffect(() => {
    let disposed = false;
    let destroy = () => {};

    const setupMotion = async () => {
      const [gsapModule, scrollTriggerModule] = await Promise.all([
        import("gsap") as Promise<GsapModule>,
        import("gsap/ScrollTrigger") as Promise<ScrollTriggerModule>,
      ]);

      if (disposed) return;

      const gsap = gsapModule.gsap;
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger;
      const root = document.documentElement;
      const body = document.body;
      const previousOverflow = body.style.overflow;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      gsap.registerPlugin(ScrollTrigger);

      if (reducedMotion) {
        gsap.set("[data-opening-curtain]", { display: "none" });
        root.classList.add("motion-reduced");
        destroy = () => root.classList.remove("motion-reduced");
        return;
      }

      root.classList.add("motion-enabled");
      body.style.overflow = "hidden";

      const context = gsap.context(() => {
        const titleEase = "power4.out";
        const revealEase = "power4.inOut";

        gsap.set(".nav", { y: -110, autoAlpha: 0 });
        gsap.set(".colorBendsFrame", { scale: 1.18, filter: "blur(18px)", autoAlpha: 0.35 });
        gsap.set(".heroHeadline > p, .heroHeadline > h2, .heroHeadline > a", { y: 28, autoAlpha: 0 });
        gsap.set(".heroHeadline .editorialTitle > span", {
          yPercent: 115,
          scaleX: 0.72,
          clipPath: "inset(0 100% 0 0)",
          transformOrigin: "left bottom",
          autoAlpha: 0,
        });
        gsap.set(".heroGallery", {
          scale: 0.86,
          clipPath: "inset(49% 6% 49% 6% round 28px)",
          autoAlpha: 0,
        });
        gsap.set(".heroBenefits > div", { y: 36, autoAlpha: 0 });

        const opening = gsap.timeline({
          defaults: { ease: titleEase },
          onComplete: () => {
            body.style.overflow = previousOverflow;
            gsap.set("[data-opening-curtain]", { display: "none" });
            ScrollTrigger.refresh();
          },
        });

        opening
          .to("[data-opening-label]", { y: 0, autoAlpha: 1, duration: 0.72 }, 0.12)
          .to("[data-opening-index]", { y: 0, autoAlpha: 1, letterSpacing: "0.28em", duration: 0.9 }, 0.16)
          .to("[data-opening-rule]", { scaleX: 1, duration: 0.9, ease: revealEase }, 0.32)
          .to(".openingCurtain__panel--top", { scaleY: 0, transformOrigin: "top", duration: 1.42, ease: revealEase }, 0.88)
          .to(".openingCurtain__panel--bottom", { scaleY: 0, transformOrigin: "bottom", duration: 1.42, ease: revealEase }, 0.88)
          .to("[data-opening-meta]", { autoAlpha: 0, y: -16, duration: 0.45 }, 0.92)
          .to("[data-opening-curtain]", { autoAlpha: 0, duration: 0.3 }, 2.14)
          .to(".colorBendsFrame", { scale: 1, filter: "blur(0px)", autoAlpha: 0.82, duration: 2.05, ease: revealEase }, 0.92)
          .to(".nav", { y: 0, autoAlpha: 1, duration: 1.05 }, 1.22)
          .to(".heroHeadline > p", { y: 0, autoAlpha: 1, duration: 0.85 }, 1.34)
          .to(".heroHeadline .editorialTitle > span", {
            yPercent: 0,
            scaleX: 1,
            clipPath: "inset(0 0% 0 0)",
            autoAlpha: 1,
            duration: 1.42,
            stagger: 0.14,
            ease: revealEase,
          }, 1.46)
          .to(".heroHeadline > h2", { y: 0, autoAlpha: 1, duration: 0.95 }, 2.02)
          .to(".heroHeadline > a", { y: 0, autoAlpha: 1, duration: 0.9 }, 2.12)
          .to(".heroGallery", {
            scale: 1,
            clipPath: "inset(0% 0% 0% 0% round 0px)",
            autoAlpha: 1,
            duration: 1.65,
            ease: revealEase,
          }, 1.88)
          .to(".heroBenefits > div", { y: 0, autoAlpha: 1, duration: 1, stagger: 0.1 }, 2.42);

        const sectionTitles = gsap.utils.toArray<HTMLElement>(
          "#about .editorialTitle, #work .editorialTitle, #capabilities .editorialTitle, #contact .editorialTitle",
        );

        sectionTitles.forEach((title) => {
          const lines = Array.from(title.children) as HTMLElement[];
          const trigger = title.closest("section, footer") ?? title;

          gsap.fromTo(
            lines,
            {
              yPercent: 118,
              scaleX: 0.74,
              clipPath: "inset(0 100% 0 0)",
              transformOrigin: "left bottom",
              autoAlpha: 0,
              willChange: "transform, clip-path, opacity",
            },
            {
              yPercent: 0,
              scaleX: 1,
              clipPath: "inset(0 0% 0 0)",
              autoAlpha: 1,
              duration: 1.55,
              stagger: 0.16,
              ease: revealEase,
              clearProps: "willChange",
              scrollTrigger: {
                trigger,
                start: "top 78%",
                once: true,
              },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>(".sectionTop").forEach((bar) => {
          const trigger = bar.closest("section, footer") ?? bar;
          gsap.fromTo(
            bar,
            { y: 24, scaleX: 0.76, transformOrigin: "left center", autoAlpha: 0 },
            {
              y: 0,
              scaleX: 1,
              autoAlpha: 1,
              duration: 1.2,
              ease: titleEase,
              scrollTrigger: { trigger, start: "top 84%", once: true },
            },
          );
        });

        const aboutTimeline = gsap.timeline({
          scrollTrigger: { trigger: "#about", start: "top 70%", once: true },
        });
        aboutTimeline
          .fromTo(".aboutEyebrow", { x: -36, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1, ease: titleEase })
          .fromTo(".aboutSocial", { x: 42, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1, ease: titleEase }, "<")
          .fromTo(
            ".aboutPortrait",
            { clipPath: "inset(0 0 100% 0 round 16px)", y: 85 },
            { clipPath: "inset(0 0 0% 0 round 16px)", y: 0, duration: 1.62, ease: revealEase },
            0.28,
          )
          .fromTo(".aboutLead", { y: 76, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.2, ease: titleEase }, 0.48)
          .fromTo(".aboutLocation", { y: 52, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, ease: titleEase }, 0.68)
          .fromTo(
            ".aboutCards > article",
            { y: 90, scale: 0.94, autoAlpha: 0 },
            { y: 0, scale: 1, autoAlpha: 1, duration: 1.25, stagger: 0.16, ease: titleEase },
            0.78,
          );

        gsap.fromTo(
          ".aboutPortrait .portraitPhoto",
          { yPercent: -5, scale: 1.14 },
          {
            yPercent: 5,
            scale: 1.08,
            ease: "none",
            scrollTrigger: { trigger: ".aboutPortrait", start: "top bottom", end: "bottom top", scrub: 1.35 },
          },
        );

        gsap.utils.toArray<HTMLElement>(".project").forEach((project, index) => {
          const visual = project.querySelector<HTMLElement>(".projectGlow");
          const cover = project.querySelector<HTMLElement>(".projectCover");
          const info = project.querySelector<HTMLElement>(".projectInfo");
          const projectTimeline = gsap.timeline({
            delay: (index % 2) * 0.16,
            scrollTrigger: { trigger: project, start: "top 88%", once: true },
          });

          projectTimeline.fromTo(
            project,
            { y: 128, rotateX: 7, scale: 0.965, autoAlpha: 0, transformOrigin: "center bottom" },
            { y: 0, rotateX: 0, scale: 1, autoAlpha: 1, duration: 1.4, ease: titleEase },
          );

          if (visual) {
            projectTimeline.fromTo(
              visual,
              { clipPath: "inset(100% 0 0 0 round 18px)" },
              { clipPath: "inset(0% 0 0 0 round 18px)", duration: 1.5, ease: revealEase },
              0.05,
            );
          }

          if (cover) {
            projectTimeline.fromTo(cover, { scale: 1.18 }, { scale: 1.08, duration: 1.8, ease: revealEase }, 0.04);
            gsap.fromTo(
              cover,
              { yPercent: -4 },
              {
                yPercent: 4,
                ease: "none",
                scrollTrigger: { trigger: project, start: "top bottom", end: "bottom top", scrub: 1.4 },
              },
            );
          }

          if (info) {
            projectTimeline.fromTo(
              Array.from(info.children),
              { y: 36, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.08, ease: titleEase },
              0.72,
            );
          }
        });

        gsap.fromTo(
          ".workKicker, .seeWork",
          { y: 42, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 1.05,
            stagger: 0.12,
            ease: titleEase,
            scrollTrigger: { trigger: "#work", start: "top 72%", once: true },
          },
        );

        gsap.fromTo(
          ".capIntro > p",
          { y: 72, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 1.2,
            ease: titleEase,
            scrollTrigger: { trigger: ".capIntro", start: "top 78%", once: true },
          },
        );

        gsap.fromTo(
          ".capGrid > article",
          { y: 120, scaleY: 0.88, autoAlpha: 0, transformOrigin: "center bottom" },
          {
            y: 0,
            scaleY: 1,
            autoAlpha: 1,
            duration: 1.25,
            stagger: 0.15,
            ease: titleEase,
            scrollTrigger: { trigger: ".capGrid", start: "top 86%", once: true },
          },
        );

        gsap.fromTo(
          ".capGrid .capIcon",
          { rotate: -18, scale: 0.72, autoAlpha: 0 },
          {
            rotate: 0,
            scale: 1,
            autoAlpha: 1,
            duration: 1.1,
            stagger: 0.15,
            ease: titleEase,
            scrollTrigger: { trigger: ".capGrid", start: "top 82%", once: true },
          },
        );

        gsap.fromTo(
          ".process > *",
          { x: -22, autoAlpha: 0 },
          {
            x: 0,
            autoAlpha: 1,
            duration: 0.8,
            stagger: 0.07,
            ease: titleEase,
            scrollTrigger: { trigger: ".process", start: "top 92%", once: true },
          },
        );

        const contactTimeline = gsap.timeline({
          scrollTrigger: { trigger: "#contact", start: "top 72%", once: true },
        });
        contactTimeline
          .fromTo(".availability", { x: -46, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1.1, ease: titleEase })
          .fromTo(".mail", { y: 68, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.2, ease: titleEase }, 0.72)
          .fromTo(
            ".contactBottom > *",
            { y: 52, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 1, stagger: 0.12, ease: titleEase },
            0.96,
          );

        gsap.fromTo(
          ".contactGalaxy",
          { scale: 1.16, rotate: -2 },
          {
            scale: 1,
            rotate: 0,
            ease: "none",
            scrollTrigger: { trigger: "#contact", start: "top bottom", end: "bottom bottom", scrub: 1.6 },
          },
        );
      }, document.body);

      destroy = () => {
        context.revert();
        body.style.overflow = previousOverflow;
        root.classList.remove("motion-enabled");
      };
    };

    void setupMotion();

    return () => {
      disposed = true;
      destroy();
    };
  }, []);

  return (
    <div className="openingCurtain" data-opening-curtain aria-hidden="true">
      <div className="openingCurtain__panel openingCurtain__panel--top" />
      <div className="openingCurtain__panel openingCurtain__panel--bottom" />
      <div className="openingCurtain__meta" data-opening-meta>
        <div className="openingCurtain__label" data-opening-label>
          {pickText(locale, websiteCopy.openingLabel)}
        </div>
        <div className="openingCurtain__rule" data-opening-rule />
        <div className="openingCurtain__index" data-opening-index>
          {pickText(locale, websiteCopy.openingIndex)}
        </div>
      </div>
    </div>
  );
}
