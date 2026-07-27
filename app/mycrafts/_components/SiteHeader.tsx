/**
 * 顶部导航
 * 左侧 Logo / 品牌名，右侧导航链接
 * 参考 caiguangxi.com 的 header
 */

import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6">
      {/* 左侧：品牌名 */}
      <Link
        href="/"
        className="text-body font-medium text-primary no-underline transition-opacity hover:opacity-60"
      >
        Jiang Wenze
      </Link>

      {/* 右侧：导航 */}
      <nav className="flex items-center gap-6">
        <Link
          href="/"
          className="text-body text-muted no-underline transition-colors hover:text-primary"
        >
          Work
        </Link>
        <Link
          href="/home"
          className="text-body text-muted no-underline transition-colors hover:text-primary"
        >
          Info
        </Link>
      </nav>
    </header>
  );
}
