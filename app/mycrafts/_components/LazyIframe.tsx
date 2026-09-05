/**
 * 按需挂载 iframe：enabled 为 false 时卸掉文档，避免横向列表同时跑多个完整 demo。
 */

"use client";

import { useEffect, useState } from "react";
import { CSSDOODLE_IFRAME_SANDBOX } from "@/lib/iframeSandbox";

type LazyIframeProps = {
  src: string;
  title: string;
  width: number;
  height: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  /** 为 false 时卸掉 iframe，只保留占位，避免横向列表同时跑多个完整 demo */
  enabled?: boolean;
};

export function LazyIframe({
  src,
  title,
  width,
  height,
  scale,
  offsetX,
  offsetY,
  enabled = true,
}: LazyIframeProps) {
  const [visible, setVisible] = useState(enabled);

  useEffect(() => {
    setVisible(enabled);
  }, [enabled]);

  return (
    <div className="relative h-full w-full">
      {visible ? (
        <iframe
          src={src}
          title={title}
          className="pointer-events-none absolute left-1/2 top-1/2 origin-center border-0 transition-transform duration-500 ease-out"
          style={{
            width,
            height,
            transform: `translate(-50%, -50%) scale(${scale}) translate(${offsetX}px, ${offsetY}px)`,
          }}
          sandbox={CSSDOODLE_IFRAME_SANDBOX}
          loading="lazy"
          tabIndex={-1}
        />
      ) : (
        // 占位：与容器相同的渐变背景，避免布局抖动
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#e5e5e5] to-[#d0d0d0]" />
      )}
    </div>
  );
}
