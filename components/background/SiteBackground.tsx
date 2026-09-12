"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useState } from "react";
import { isImmersivePath } from "@/lib/immersive";

const ArtDots = dynamic(() => import("./ArtDots"), {
  ssr: false,
  loading: () => null,
});

const HERO_BG_URL =
  "https://wxa.wxs.qq.com/wxad-design/yijie/heroBg.webp";

const PROJECT_DETAILS_BG = "#121318";
const WEBSITE_BG = "#050606";

export function SiteBackground() {
  const pathname = usePathname();
  const [bgFailed, setBgFailed] = useState(false);
  const immersive = isImmersivePath(pathname);
  const immersiveBg = pathname.startsWith("/website")
    ? WEBSITE_BG
    : PROJECT_DETAILS_BG;

  useLayoutEffect(() => {
    if (!immersive) return;
    const root = document.documentElement;
    const previous = root.style.backgroundColor;
    root.style.backgroundColor = immersiveBg;
    return () => {
      root.style.backgroundColor = previous;
    };
  }, [immersive, immersiveBg]);

  return (
    <>
      {immersive ? (
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{ backgroundColor: immersiveBg }}
          aria-hidden
        />
      ) : !bgFailed ? (
        <div
          className="pointer-events-none absolute inset-0 z-[1] overflow-hidden opacity-40 grayscale mix-blend-multiply transition-opacity duration-300 dark:opacity-20 dark:mix-blend-overlay"
          aria-hidden
        >
          <img
            src={HERO_BG_URL}
            alt=""
            decoding="async"
            fetchPriority="low"
            className="absolute inset-0 h-full w-full scale-x-[2] object-cover"
            onError={() => setBgFailed(true)}
          />
        </div>
      ) : null}
      {immersive ? null : <ArtDots />}
    </>
  );
}
