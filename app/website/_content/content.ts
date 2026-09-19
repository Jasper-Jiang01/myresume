import type { LocalizedText } from "@/lib/i18n/locale";
import personalProjects, {
  contact as personalContact,
} from "@/app/personalProject/_content/projects";

/**
 * website 页面的文案与案例数据（不含静态图）。
 * 画廊封面见 ./heroCovers.ts，About 肖像见 ./portrait.ts。
 */

export const websiteContact = {
  email: personalContact.email,
  wechat: personalContact.wechat,
  pdfHref: personalContact.pdfHref,
  pdfFilename: personalContact.pdfFilename,
};

export const websiteCopy = {
  openingLabel: {
    zh: "独立设计师 · 上海",
    en: "INDEPENDENT DESIGNER · SHANGHAI",
  },
  openingIndex: {
    zh: "蒋文喆 — 作品集 2026",
    en: "JIANG WENZHE — PORTFOLIO 2026",
  },
  back: { zh: "返回列表版", en: "Back to list" },
  navWork: { zh: "Work", en: "Work" },
  navAbout: { zh: "About", en: "About" },
  navCapabilities: { zh: "Capabilities", en: "Capabilities" },
  talk: { zh: "Let’s talk", en: "Let’s talk" },
  brandName: { zh: "蒋文喆", en: "蒋文喆" },

  heroKicker: { zh: "PORTFOLIO · DESIGN ENGINEER", en: "PORTFOLIO · DESIGN ENGINEER" },
  heroTitleLead: { zh: "Design products that", en: "Design products that" },
  heroTitleLine: { zh: "people remember", en: "people remember" },
  heroSubtitle: {
    zh: "设计 × 工程 × 动效 — 把复杂业务做成清晰、可上线的数字体验。",
    en: "Design × Engineering × Motion — turning complex products into clear, shippable experiences.",
  },
  heroCta: { zh: "Explore selected work", en: "Explore selected work" },
  heroGalleryLabel: { zh: "精选视觉作品", en: "Selected visual work" },
  heroCoverAlt: { zh: "作品封面", en: "Selected project" },
  navAria: { zh: "主导航", en: "Main navigation" },
  heroPills: [
    {
      title: { zh: "Product Design", en: "Product Design" },
      body: {
        zh: "从模糊需求到清晰方向。",
        en: "From ambiguity to a clear product direction.",
      },
    },
    {
      title: { zh: "Design Engineering", en: "Design Engineering" },
      body: {
        zh: "设计能落地，代码能上线。",
        en: "Interfaces that ship — design and code in one loop.",
      },
    },
    {
      title: { zh: "Motion & Systems", en: "Motion & Systems" },
      body: {
        zh: "让界面有节奏，让语言可复用。",
        en: "Motion and visual systems built to scale.",
      },
    },
  ] satisfies { title: LocalizedText; body: LocalizedText }[],

  aboutEyebrow: { zh: "WHY CHOOSE ME", en: "WHY CHOOSE ME" },
  aboutTitleLead: { zh: "Meet the mind", en: "Meet the mind" },
  aboutTitleLine: { zh: "Behind the work", en: "Behind the work" },
  aboutEmail: { zh: "邮箱", en: "EMAIL" },
  aboutWechat: { zh: "微信", en: "WECHAT" },
  aboutCopied: { zh: "已复制", en: "Copied" },
  aboutCaption: {
    zh: "SHANGHAI, CN · MEITUAN INTERNATIONAL",
    en: "SHANGHAI, CN · MEITUAN INTERNATIONAL",
  },
  aboutLead: {
    zh: "我把产品思考、视觉手感和工程实现放在一起，做出清晰、可上线、也经得起用的数字体验。",
    en: "I bring together product thinking, visual craft, and engineering to create clear digital experiences that actually ship.",
  },
  aboutLocationLabel: { zh: "BASED IN SHANGHAI", en: "BASED IN SHANGHAI" },
  aboutLocationValue: {
    zh: "MEITUAN INTERNATIONAL · PREVIOUSLY ANT",
    en: "MEITUAN INTERNATIONAL · PREVIOUSLY ANT",
  },
  aboutMetric: { zh: "0—1", en: "0—1" },
  aboutMetricLabel: { zh: "END-TO-END DESIGN ENGINEER", en: "END-TO-END DESIGN ENGINEER" },
  aboutMetricItems: [
    { zh: "美团境外事业部", en: "Meituan International" },
    { zh: "蚂蚁 · World First", en: "Ant · World First" },
    { zh: "设计到上线", en: "Design through launch" },
  ] satisfies LocalizedText[],
  aboutWorkTogether: { zh: "LET’S WORK TOGETHER", en: "LET’S WORK TOGETHER" },
  aboutFactKicker: { zh: "RECENT · 01/02", en: "RECENT · 01/02" },
  aboutFactTitle: { zh: "美团", en: "MEITUAN" },
  aboutFactBody: {
    zh: "境外事业部\n设计工程师",
    en: "DIANPING INTERNATIONAL\nDESIGN ENGINEER",
  },

  workKicker: { zh: "02 / SELECTED WORK", en: "02 / SELECTED WORK" },
  workYears: { zh: "2024—2026", en: "2024—2026" },
  workLabel: { zh: "CASE STUDIES", en: "CASE STUDIES" },
  workTitleLead: { zh: "Selected", en: "Selected" },
  workTitleLine: { zh: "stories", en: "stories" },
  workDiscuss: { zh: "Discuss a project", en: "Discuss a project" },

  capKicker: { zh: "03 / CAPABILITIES", en: "03 / CAPABILITIES" },
  capHow: { zh: "HOW I CREATE VALUE", en: "HOW I CREATE VALUE" },
  capTitleLead: { zh: "FROM DIRECTION", en: "FROM DIRECTION" },
  capTitleLine: { zh: "TO DELIVERY.", en: "TO DELIVERY." },
  capIntroZh: { zh: "不仅定义设计，也把它写进代码、送上线。", en: "不仅定义设计，也把它写进代码、送上线。" },
  capIntroEn: {
    zh: "I define the direction, build the system,\nand stay until it ships.",
    en: "I define the direction, build the system,\nand stay until it ships.",
  },
  capabilities: [
    {
      no: "01",
      title: { zh: "全流程产品设计", en: "全流程产品设计" },
      en: { zh: "End-to-end Design", en: "End-to-end Design" },
      body: {
        zh: "从调研、产品定义到交互、视觉与最终落地，建立完整而清晰的体验秩序。",
        en: "From research and product definition to interaction, visual, and launch.",
      },
    },
    {
      no: "02",
      title: { zh: "设计工程落地", en: "设计工程落地" },
      en: { zh: "Design Engineering", en: "Design Engineering" },
      body: {
        zh: "通过前端技术栈实现设计稿的还原，减少跨角色损耗。",
        en: "Turn design into shipped UI with React / Next.js — less handoff, more fidelity.",
      },
    },
    {
      no: "03",
      title: { zh: "交互与动效", en: "交互与动效" },
      en: { zh: "Motion & Interaction", en: "Motion & Interaction" },
      body: {
        zh: "让界面有节奏、有反馈，复杂流程也能走得顺。",
        en: "Interfaces that feel responsive, timed, and easy to move through.",
      },
    },
    {
      no: "04",
      title: { zh: "0—1 产品设计", en: "0—1 产品设计" },
      en: { zh: "Zero to One", en: "Zero to One" },
      body: {
        zh: "从概念、MVP 到正式上线，持续验证并交付真实价值。",
        en: "From concept and MVP to launch — keep proving value as it ships.",
      },
    },
  ],
  process: ["RESEARCH", "ANALYZE", "DEFINE", "DESIGN", "BUILD", "SHIP"],

  contactKicker: { zh: "04 / CONTACT", en: "04 / CONTACT" },
  contactMeta: { zh: "SHANGHAI · GMT+8", en: "SHANGHAI · GMT+8" },
  contactAvail: {
    zh: "AVAILABLE FOR FULL-TIME · PROJECTS · CONSULTING",
    en: "AVAILABLE FOR FULL-TIME · PROJECTS · CONSULTING",
  },
  contactTitleLead: { zh: "LET’S MAKE", en: "LET’S MAKE" },
  contactTitleLine: { zh: "SOMETHING MATTER.", en: "SOMETHING MATTER." },
  contactBody: {
    zh: "如果你在找一个能把设计做完、也能把东西做上线的人，欢迎写信或加微信。",
    en: "If you need someone who can both design and ship, write or add me on WeChat.",
  },
  contactPdf: { zh: "PDF", en: "PDF" },
  copyright: { zh: "© 2026 蒋文喆", en: "© 2026 JIANG WENZHE" },
};

export type WebsiteCase = {
  slug: string;
  index: string;
  name: LocalizedText;
  label: LocalizedText;
  coverImage: string;
  type: LocalizedText;
  role: LocalizedText;
  result: LocalizedText;
};

const caseMeta: Record<
  string,
  Omit<WebsiteCase, "slug" | "index" | "coverImage">
> = {
  "world-first": {
    name: { zh: "World First", en: "World First" },
    label: { zh: "跨境支付 App", en: "Cross-border Payments App" },
    type: { zh: "蚂蚁国际", en: "Ant International" },
    role: { zh: "体验设计", en: "Experience Design" },
    result: { zh: "App UI", en: "App UI" },
  },
  "power-trading": {
    name: { zh: "Power Trading", en: "Power Trading" },
    label: { zh: "电力交易 App", en: "Electricity Trading App" },
    type: { zh: "云南电力市场", en: "Yunnan Market" },
    role: { zh: "产品设计", en: "Product Design" },
    result: { zh: "交易结算", en: "Settlement" },
  },
  practice: {
    name: { zh: "个人练习", en: "Personal studies" },
    label: { zh: "视觉探索", en: "Visual exploration" },
    type: { zh: "个人练习", en: "Personal studies" },
    role: { zh: "视觉 · 动效", en: "Visual · Motion" },
    result: { zh: "SELECTED WORK", en: "SELECTED WORK" },
  },
  "energy-website": {
    name: { zh: "智慧能源交易平台", en: "Smart Energy Trading" },
    label: { zh: "官网设计", en: "Corporate Website Design" },
    type: { zh: "官网 · SaaS", en: "Website · SaaS" },
    role: { zh: "视觉 / 体验", en: "Visual / UX" },
    result: { zh: "浙大网新", en: "Insigma" },
  },
};

export const websiteCases: WebsiteCase[] = personalProjects
  .filter((project) => project.detailsSlug)
  .map((project, index) => {
    const slug = project.detailsSlug as string;
    const meta = caseMeta[slug];
    return {
      slug,
      index: String(index + 1).padStart(2, "0"),
      coverImage: project.coverImage,
      name: meta?.name ?? project.title,
      label: meta?.label ?? project.title,
      type: meta?.type ?? { zh: "", en: "" },
      role: meta?.role ?? { zh: "", en: "" },
      result: meta?.result ?? { zh: "", en: "" },
    };
  });
