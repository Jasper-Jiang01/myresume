"use client";

/**
 * 首屏空闲后再拉 ChatWidget chunk，避免对话面板和历史请求抢首页主线程。
 */
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const ChatWidget = dynamic(() => import("./ChatWidget"), {
  ssr: false,
  loading: () => null,
});

export function ChatWidgetLoader() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const skip = pathname.startsWith("/projectDetails");

  useEffect(() => {
    if (skip) {
      setReady(false);
      return;
    }

    let cancelled = false;
    const enable = () => {
      if (!cancelled) setReady(true);
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(enable, { timeout: 2500 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }

    const timer = window.setTimeout(enable, 1200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [skip]);

  if (skip || !ready) return null;
  return <ChatWidget />;
}
