"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { pickText } from "@/lib/i18n/locale";
import { websiteCopy } from "../_content/content";
import { heroCovers } from "../_content/heroCovers";

const ColorBends = dynamic(
  () => import("./ColorBends").then((mod) => mod.ColorBends),
  { ssr: false, loading: () => null },
);

export function HeroScene() {
  const { locale } = usePreferences();
  const reduced = useReducedMotion();
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = galleryRef.current;
    if (!root) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>("figure"));
    let frame = 0;
    let last = performance.now();
    let offset = 0;
    const render = (now: number) => {
      const width = root.clientWidth;
      const cardWidth = cards[0]?.offsetWidth || 220;
      const spacing = cardWidth * 0.64 + 10;
      const total = spacing * cards.length;
      offset += (now - last) * (reduced ? 0.012 : 0.035);
      last = now;
      cards.forEach((card, i) => {
        const raw = i * spacing - offset + total / 2;
        const baseX = ((raw % total + total) % total) - total / 2;
        const n = Math.min(Math.abs(baseX) / (width * 0.55), 1.32);
        const x = baseX * (1 + 0.28 * n);
        const y = 62;
        const scale = 0.61 + n * 0.36;
        const rotateY = (-baseX / width) * 46;
        const rotateZ = (-baseX / width) * 5.5;
        const z = -145 + n * 165;
        card.style.transform = `translate3d(${x}px,${y}px,${z}px) scale(${scale}) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
        card.style.zIndex = String(Math.round(60 + n * 45));
        card.style.opacity = String(Math.max(0.28, 1 - Math.max(0, n - 1) * 1.3));
      });
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [reduced]);

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    setPointer({
      x: event.clientX / window.innerWidth - 0.5,
      y: event.clientY / window.innerHeight - 0.5,
    });
  };

  return (
    <div
      className="heroStage galleryHero"
      onPointerMove={move}
      style={
        {
          "--hero-x": `${pointer.x * 26}px`,
          "--hero-y": `${pointer.y * 18}px`,
        } as CSSProperties
      }
    >
      <div className="colorBendsFrame">
        <ColorBends
          rotation={275}
          speed={0.75}
          colors={["#0027ff", "#ff0000", "#6787ff"]}
          transparent
          autoRotate={0.3}
          scale={2}
          frequency={1}
          warpStrength={1}
          mouseInfluence={2.3}
          parallax={1.4}
          noise={0.15}
          iterations={1}
          intensity={1.5}
          bandWidth={4.5}
        />
      </div>
      <div className="heroHeadline">
        <p>{pickText(locale, websiteCopy.heroKicker)}</p>
        <h1 className="editorialTitle">
          <span className="editorialLeadLine">{pickText(locale, websiteCopy.heroTitleLead)}</span>
          <span className="editorialLine">{pickText(locale, websiteCopy.heroTitleLine)}</span>
        </h1>
        <h2>{pickText(locale, websiteCopy.heroSubtitle)}</h2>
        <a href="#work">
          {pickText(locale, websiteCopy.heroCta)} <b>→</b>
        </a>
      </div>
      <div className="galleryGlow" />
      <div
        className="heroGallery"
        ref={galleryRef}
        aria-label={pickText(locale, websiteCopy.heroGalleryLabel)}
      >
        <div className="galleryTrack">
          {heroCovers.map((cover, index) => (
            <figure key={`${cover.src}-${index}`}>
              <Image
                src={cover}
                alt={`${pickText(locale, websiteCopy.heroCoverAlt)} ${index + 1}`}
                fill
                sizes="(min-width: 1024px) 15vw, 36vw"
                priority={index < 4}
              />
            </figure>
          ))}
        </div>
      </div>
      <div className="heroBenefits">
        {websiteCopy.heroPills.map((pill) => (
          <div key={pill.title.en}>
            <b>{pickText(locale, pill.title)}</b>
            <span>{pickText(locale, pill.body)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
