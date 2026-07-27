import Link from "next/link";

/**
 * 页面不存在
 * TODO：待优化视觉样式
 */

export default function NotFound() {
  return (
    <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:px-8 sm:py-16">
      <div className="flex flex-col items-center gap-4 text-center sm:gap-6">
        <span className="text-5xl font-bold text-primary sm:text-6xl">404</span>
        <h1 className="text-title font-medium text-primary">
          页面不存在
        </h1>
        <p className="max-w-sm text-body text-muted">
          你访问的页面可能已被删除、更名或暂时不可用。
        </p>
        <Link
          href="/home"
          className="mt-2 rounded-chip bg-primary px-5 py-2 text-body text-white transition-opacity hover:opacity-80"
        >
          返回首页
        </Link>
      </div>
    </main>
  );
}
