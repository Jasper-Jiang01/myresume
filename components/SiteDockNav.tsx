"use client";

/**
 * 组件名称：SiteDockNav
 * 组件描述：基于 Dock 组件封装的站内导航栏，固定悬浮在页面底部居中。
 *          直接将导航项的 href 透传给 Dock，由 Dock 内部渲染为 next/link 的 <a>，
 *          从而获得预加载、中键/Cmd+点击新标签页打开、右键菜单等浏览器原生导航能力，
 *          供站内各页面（home / personalProject / mycrafts 等）复用。
 *          默认展示图标，鼠标 hover 时展示文案。
 * 组件属性：
 *  - items: { label: string; href: string; icon: ReactNode }[]，导航项列表
 */

import type { ReactNode } from "react";
import Dock from "@/components/Dock";

export type SiteDockNavItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

export type SiteDockNavProps = {
  items: SiteDockNavItem[];
};

export function SiteDockNav({ items }: SiteDockNavProps) {
  const dockItems = items.map((item) => ({
    icon: item.icon,
    label: item.label,
    href: item.href,
  }));

  return (
    <div className="fixed inset-x-0 bottom-4 z-[99] flex justify-center">
      <div className="relative h-[68px] w-full max-w-[420px]">
        <Dock items={dockItems} panelHeight={68} baseItemSize={50} magnification={80} />
      </div>
    </div>
  );
}

export default SiteDockNav;
