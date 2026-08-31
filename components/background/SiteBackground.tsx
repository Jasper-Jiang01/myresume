"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const ArtDots = dynamic(() => import("./ArtDots"), {
  ssr: false,
  loading: () => null,
});

const HERO_BG_URL =
  "https://wxa.wxs.qq.com/wxad-design/yijie/heroBg.webp";

export function SiteBackground() {
  const [bgFailed, setBgFailed] = useState(false);

  return (
    <>
      {!bgFailed && (
        <div
          className="pointer-events-none absolute inset-0 z-[1] overflow-hidden opacity-40 grayscale mix-blend-multiply transition-opacity duration-300 dark:opacity-20 dark:mix-blend-overlay"
          aria-hidden
        >
          <img
            src={HERO_BG_URL}
            alt=""
            className="absolute inset-0 h-full w-full scale-x-[2] object-cover"
            onError={() => setBgFailed(true)}
          />
        </div>
      )}
      <ArtDots />
    </>
  );
}
