/**
 * 站内 Dock 导航项配置
 * 供 home / personalProject / mycrafts 等页面共用，
 * 保证站内导航图标与文案统一维护。
 */

import type { SiteDockNavItem } from "@/components/SiteDockNav";

export const siteNavItems: SiteDockNavItem[] = [
  {
    label: "首页",
    href: "/home",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 10v9h14v-9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "作品集",
    href: "/personalProject",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="7" width="18" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "手工小记",
    href: "/mycrafts",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14.5 3.5 20.5 9.5 8 22H2v-6L14.5 3.5Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];
