"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * 路由段错误边界
 * App Router 约定：error.tsx 必须是客户端组件，用于捕获渲染过程中的运行时错误，
 * 避免整页白屏；reset() 会尝试重新渲染该路由段。
 */

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 上报到日志系统时可在此处接入；目前先打印到控制台便于排查
    console.error(error);
  }, [error]);

  return (
    <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:px-8 sm:py-16">
      <div className="flex flex-col items-center gap-4 text-center sm:gap-6">
        <span className="text-5xl font-bold text-primary sm:text-6xl">出错了</span>
        <h1 className="text-title font-medium text-primary">页面出现了一点问题</h1>
        <p className="max-w-sm text-body text-muted">
          抱歉，页面渲染时发生了意外错误，请重试或返回首页。
        </p>
        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={reset}
            className="rounded-chip bg-primary px-5 py-2 text-body text-white transition-opacity hover:opacity-80"
          >
            重试
          </button>
          <Link
            href="/home"
            className="rounded-chip border border-[#DDDDDD] px-5 py-2 text-body text-muted no-underline transition-colors hover:text-primary"
          >
            返回首页
          </Link>
        </div>
      </div>
    </main>
  );
}
