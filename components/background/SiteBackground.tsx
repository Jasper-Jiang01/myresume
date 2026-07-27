"use client";

import Image from "next/image";
import dynamic from "next/dynamic";

const ArtDots = dynamic(() => import("./ArtDots"), { ssr: false });

const HERO_BG_URL =
  "https://wxa.wxs.qq.com/wxad-design/yijie/heroBg.webp";

export function SiteBackground() {
  return (
    <>
      {/* 纸质纹理：absolute 覆盖整个 body，随内容高度伸展 */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] overflow-hidden opacity-40 grayscale mix-blend-multiply"
        aria-hidden
      >
        <Image
          src={HERO_BG_URL}
          alt=""
          fill
          className="scale-x-[2] object-cover"
          unoptimized
        />
      </div>

      {/* 点阵：fixed 撑满视口，滚动时位移点而容器不动 */}
      <ArtDots />
    </>
  );
}
