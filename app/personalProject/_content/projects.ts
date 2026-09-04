import type { LocalizedText } from "@/lib/i18n/locale";

/**
 * personalProject 页面的项目数据
 * 图片资源实际存放于 public/personalProject（Next.js 静态资源约定要求资源必须在 public 下才能被直接访问），
 * 此处集中管理文案与图片路径的映射，页面组件通过本文件读取数据渲染。
 */

export type PersonalProjectItem = {
  title: LocalizedText;
  description: LocalizedText;
  coverImage: string;
  year?: string;
  href?: string;
  /** 站内详情页 slug，对应 /projectDetails/[slug]；有值时列表项保持 article + tabIndex=0，交互进入详情 */
  detailsSlug?: string;
  defaultOpen?: boolean;
};

export const pageCopy = {
  back: { zh: "返回首页", en: "Back to home" },
  heading: { zh: "作品集", en: "Portfolio" },
  regionLabel: { zh: "精选项目", en: "Selected projects" },
  prevLabel: { zh: "上一个项目", en: "Previous project" },
  nextLabel: { zh: "下一个项目", en: "Next project" },
  downloadPdf: { zh: "下载 PDF", en: "Download PDF" },
  getWechat: { zh: "获取微信", en: "Get WeChat" },
  getEmail: { zh: "获取邮箱", en: "Get email" },
  copied: { zh: "已复制", en: "Copied" },
};

export const contact = {
  wechat: "19979025589",
  email: "jwz727501@gmail.com",
  pdfHref: "/personalProject/portfolio.pdf",
  pdfFilename: "蒋文喆-作品集.pdf",
};

const projects: PersonalProjectItem[] = [
  {
    title: {
      zh: "World First · 跨境支付 App",
      en: "World First · Cross-border Payments App",
    },
    description: {
      zh: "为蚂蚁国际旗下 World First 打造的跨境支付与收款 App 界面，涵盖多币种账户总览、货币兑换、转账与活动运营位设计。",
      en: "App UI for World First under Ant International: multi-currency overview, FX, transfers, and campaign placements.",
    },
    coverImage: "/personalProject/1.jpg",
    detailsSlug: "world-first",
    defaultOpen: true,
  },
  {
    title: {
      zh: "Power Trading · 电力交易App",
      en: "Power Trading · Yunnan Electricity Market",
    },
    description: {
      zh: "一款为云南省电力市场主体打造的线上电力交易 APP，覆盖交易结算、电能分析、套餐购买与商家信用评级等核心业务场景。",
      en: "An electricity trading app for Yunnan market participants: settlement, energy analytics, plans, and merchant ratings.",
    },
    coverImage: "/personalProject/2.jpg",
    detailsSlug: "power-trading",
  },
  {
    title: {
      zh: "个人练习作品",
      en: "Personal studies",
    },
    description: {
      zh: "持续保持对视觉能力提升与设计手感打磨的个人练习合集，记录不同风格与主题下的探索。",
      en: "A running set of visual studies — keeping the eye and hand sharp across styles and themes.",
    },
    coverImage: "/personalProject/3.jpg",
  },
];

export default projects;
