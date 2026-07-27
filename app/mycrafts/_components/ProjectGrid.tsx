/**
 * 作品网格容器
 * 响应式网格布局：移动端单列 → 平板两列 → 桌面三列
 */

import type { ReactNode } from "react";

type ProjectGridProps = {
  children: ReactNode;
};

export function ProjectGrid({ children }: ProjectGridProps) {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
      {children}
    </div>
  );
}
