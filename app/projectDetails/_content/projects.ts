import type { LocalizedText } from "@/lib/i18n/locale";

/**
 * 项目详情页数据。
 * 以 slug 为键登记，列表页通过 detailsSlug 跳转到 /projectDetails/[slug]。
 * 新增项目：在此追加一条记录，并在 personalProject/_content/projects.ts 写上对应 detailsSlug。
 */

export type ProjectDetailsImage = {
  src: string;
  alt?: LocalizedText | string;
  caption?: LocalizedText | string;
  width?: number;
  height?: number;
};

export type ProjectDetailsMeta = {
  label: LocalizedText;
  value: LocalizedText;
};

export type ProjectDetails = {
  slug: string;
  title: LocalizedText;
  description?: LocalizedText;
  year?: string;
  category?: LocalizedText;
  backHref?: string;
  images: ProjectDetailsImage[];
  meta?: ProjectDetailsMeta[];
  /** 是否在详情页展示标题与描述，默认 true。案例图已含文案时可关掉。 */
  showIntro?: boolean;
};

export const detailsCopy = {
  back: { zh: "← 返回作品集", en: "← Back to portfolio" },
  galleryLabel: { zh: "项目图集", en: "Project gallery" },
  missing: { zh: "项目不存在", en: "Project not found" },
};

const DEFAULT_SLIDE = { width: 1920, height: 1080 } as const;

/**
 * 生成 public 目录下连续编号图片路径。
 * skip 用于跳过缺失编号，便于后续项目复用同一套约定（folder/1.jpg …）。
 */
export function numberedPublicImages({
  folder,
  from,
  to,
  skip = [],
  ext = "jpg",
  width = DEFAULT_SLIDE.width,
  height = DEFAULT_SLIDE.height,
  sizes = {},
}: {
  folder: string;
  from: number;
  to: number;
  skip?: number[];
  ext?: string;
  width?: number;
  height?: number;
  /** 个别编号的真实宽高，覆盖默认 width/height，避免超长图占位比例错、解码后跳布局 */
  sizes?: Record<number, { width: number; height: number }>;
}): ProjectDetailsImage[] {
  const skipped = new Set(skip);
  const dir = folder.startsWith("/") ? folder : `/${folder}`;
  const images: ProjectDetailsImage[] = [];
  for (let n = from; n <= to; n += 1) {
    if (skipped.has(n)) continue;
    const dim = sizes[n] ?? { width, height };
    images.push({ src: `${dir}/${n}.${ext}`, width: dim.width, height: dim.height });
  }
  return images;
}

export function projectDetailsPath(slug: string): string {
  return `/projectDetails/${slug}`;
}

export const DEFAULT_PROJECT_SLUG = "world-first";

const projects: Record<string, ProjectDetails | undefined> = {
  "world-first": {
    slug: "world-first",
    title: {
      zh: "World First · 跨境支付 App",
      en: "World First · Cross-border Payments App",
    },
    description: {
      zh: "为蚂蚁国际旗下 World First 打造的跨境支付与收款 App 界面，涵盖多币种账户总览、货币兑换、转账与活动运营位设计。",
      en: "App UI for World First under Ant International: multi-currency overview, FX, transfers, and campaign placements.",
    },
    category: {
      zh: "UI改版",
      en: "Ant International · FinTech · App UI",
    },
    showIntro: false,
    backHref: "/personalProject",
    images: numberedPublicImages({
      folder: "/worldfirst",
      from: 4,
      to: 40,
      skip: [29],
    }),
  },
  "power-trading": {
    slug: "power-trading",
    title: {
      zh: "Power Trading · 电力交易App",
      en: "Power Trading · Yunnan Electricity Market",
    },
    description: {
      zh: "一款为云南省电力市场主体打造的线上电力交易 APP，覆盖交易结算、电能分析、套餐购买与商家信用评级等核心业务场景。",
      en: "An electricity trading app for Yunnan market participants: settlement, energy analytics, plans, and merchant ratings.",
    },
    category: {
      zh: "电力交易 · App",
      en: "Electricity Trading · App UI",
    },
    showIntro: false,
    backHref: "/personalProject",
    images: numberedPublicImages({
      folder: "/laitaodian",
      from: 0,
      to: 24,
      sizes: {
        11: { width: 1920, height: 2106 },
        15: { width: 1920, height: 1089 },
        18: { width: 1920, height: 1362 },
      },
    }),
  },
  practice: {
    slug: "practice",
    title: {
      zh: "个人练习作品",
      en: "Personal studies",
    },
    description: {
      zh: "持续保持对视觉能力提升与设计手感打磨的个人练习合集，记录不同风格与主题下的探索。",
      en: "A running set of visual studies — keeping the eye and hand sharp across styles and themes.",
    },
    category: {
      zh: "个人练习",
      en: "Personal studies",
    },
    showIntro: false,
    backHref: "/personalProject",
    images: numberedPublicImages({
      folder: "/practice",
      from: 1,
      to: 8,
    }),
  },
  "energy-website": {
    slug: "energy-website",
    title: {
      zh: "智慧能源交易平台官网",
      en: "Smart Energy Trading Platform Website",
    },
    description: {
      zh: "这是为浙大网新集团电力事业部进行的SaaS电力交易产品的官网设计。",
      en: "Official website design for a SaaS electricity trading product for Insigma’s power division.",
    },
    category: {
      zh: "官网 · SaaS",
      en: "Website · SaaS",
    },
    showIntro: false,
    backHref: "/personalProject",
    images: numberedPublicImages({
      folder: "/Ewebsites",
      from: 1,
      to: 10,
      width: 1600,
      height: 2285,
      sizes: {
        1: { width: 1600, height: 2285 },
        2: { width: 1600, height: 3660 },
        3: { width: 1600, height: 4095 },
        4: { width: 1600, height: 2892 },
        5: { width: 1600, height: 3435 },
        6: { width: 1600, height: 1385 },
        7: { width: 1600, height: 4110 },
        8: { width: 1600, height: 900 },
        9: { width: 1600, height: 1652 },
        10: { width: 1600, height: 2315 },
      },
    }),
  },
};

export function getProjectDetails(slug: string): ProjectDetails | undefined {
  return projects[slug];
}

export function listProjectSlugs(): string[] {
  return Object.keys(projects);
}

export default projects;
