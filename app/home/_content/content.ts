type Chip = {
  label: string;
  icon: string;
  iconSize?: number;
};

type LinkItem = {
  label: string;
  icon?: string;
  iconSize?: number;
  iconOpacity?: number;
  /** 整行水平偏移（px），负值向左 */
  offsetX?: number;
  href?: string;
  previewImage?: string;
  newTab?: boolean;
  internal?: boolean;
};

type HomeCopy = {
  profile: {
    name: string;
    title: string;
    avatar: string;
    chips: Chip[];
  };
  aboutMe: {
    title: string;
    paragraphs: string[];
    passionLabel: string;
    passions: string;
  };
  project: { title: string; items: LinkItem[] };
  tools: { title: string; items: LinkItem[] };
  skills: { title: string; rows: string[][] };
  experience: {
    title: string;
    items: {
      role: string;
      period: string;
      icon?: string;
      iconOpacity?: number;
    }[];
  };
};

export const home: { zh: HomeCopy; en: HomeCopy } = {
  zh: {
    profile: {
      name: "蒋文喆",
      title: "设计工程师 & 全栈开发者",
      avatar: "/images/avatar.png",
      chips: [
        {
          label: "19979025589",
          icon: "/assets/chip-wechat.svg",
          iconSize: 15,
        },
        { label: "现居上海; 2001-01-26", icon: "/assets/chip-home.svg" },
        { label: "jwz727501@gmail.com", icon: "/assets/chip-email.svg" },
      ],
    },
    aboutMe: {
      title: "关于我",
      paragraphs: [
        "我目前在美团大众点评境外事业部担任设计工程师(Product Design Engineer)；独立完成需求挖掘，设计，开发到上线的全流程。",
        "我相信技术能够赋能设计，设计又能够基于技术实现创新；因此我时时刻刻保持对技术能力的学习以及设计能力边界的探索。",
      ],
      passionLabel: "我一直热爱着：",
      passions: "体验设计，动效设计，人工智能，商业思维，产品思维和构成艺术",
    },
    project: {
      title: "作品",
      items: [
        {
          label: "作品集",
          icon: "/assets/meituanicon.png",
          iconSize: 18,
          iconOpacity: 0.8,
          href: "/personalProject",
          previewImage: "/assets/46.jpg",
          internal: true,
        },
        {
          label: "个人博客",
          icon: "/assets/blog.png",
          iconSize: 20,
          iconOpacity: 0.3,
          offsetX: -2,
        },
        {
          label: "Agent应用开发",
          icon: "/assets/MingcuteAiFill.png",
          iconSize: 16,
          iconOpacity: 0.3,
        },
      ],
    },
    tools: {
      title: "工具",
      items: [
        {
          label: "插件设计 - Figma& Mastergo",
          icon: "/assets/figma-component-filled.png",
          iconSize: 18,
          iconOpacity: 0.3,
        },
        {
          label: "动效实验站",
          icon: "/assets/IcBaselineConstruction.webp",
          iconSize: 18,
          iconOpacity: 0.3,
          href: "/mycrafts",
          previewImage: "/assets/preview-mycrafts.png",
          internal: true,
        },
        {
          label: "CSS灵动按钮工坊",
          icon: "/assets/IcBaselineIntegrationInstructions.webp",
          iconSize: 18,
          iconOpacity: 0.3,
          href: "/cssdoodle/button-state-buildera-visual-editor-for-designing-multi-state-button-flows/dist/index.html",
          previewImage: "/assets/preview-button-workshop.png",
          newTab: false,
        },
      ],
    },
    skills: {
      title: "技能",
      rows: [
        ["Typescript", "React", "Next.js"],
        ["Python", "Java", "Node.js"],
        ["UI/UX设计", "动效", "3D"],
      ],
    },
    experience: {
      title: "经历",
      items: [
        {
          role: "美团 - 大众点评境外事业部 - 设计工程师",
          period: "2025.10 - 至今",
          icon: "/assets/meituanicon.png",
          iconOpacity: 0.8,
        },
        {
          role: "蚂蚁集团 - WorldFirst - 体验设计师",
          period: "2024.07 - 2025.10",
          icon: "/assets/anticon.png",
          iconOpacity: 0.7,
        },
      ],
    },
  },
  en: {
    profile: {
      name: "蒋文喆",
      title: "Design Engineer & Full-stack Developer",
      avatar: "/images/avatar.png",
      chips: [
        {
          label: "19979025589",
          icon: "/assets/chip-wechat.svg",
          iconSize: 15,
        },
        { label: "Shanghai; 2001-01-26", icon: "/assets/chip-home.svg" },
        { label: "jwz727501@gmail.com", icon: "/assets/chip-email.svg" },
      ],
    },
    aboutMe: {
      title: "About",
      paragraphs: [
        "I'm a Product Design Engineer at Meituan's Dianping International team, owning the full loop from research and design through engineering and launch.",
        "I believe technology can empower design, and design can push technology into new places — so I keep stretching both my engineering skills and the edges of design.",
      ],
      passionLabel: "I care deeply about:",
      passions:
        "Experience design, motion, AI, business thinking, product thinking, and composition",
    },
    project: {
      title: "Work",
      items: [
        {
          label: "Portfolio",
          icon: "/assets/meituanicon.png",
          iconSize: 18,
          iconOpacity: 0.8,
          href: "/personalProject",
          previewImage: "/assets/46.jpg",
          internal: true,
        },
        {
          label: "Personal blog",
          icon: "/assets/blog.png",
          iconSize: 20,
          iconOpacity: 0.3,
          offsetX: -2,
        },
        {
          label: "Agent apps",
          icon: "/assets/MingcuteAiFill.png",
          iconSize: 16,
          iconOpacity: 0.3,
        },
      ],
    },
    tools: {
      title: "Tools",
      items: [
        {
          label: "Plugin design — Figma & MasterGo",
          icon: "/assets/figma-component-filled.png",
          iconSize: 18,
          iconOpacity: 0.3,
        },
        {
          label: "Motion lab",
          icon: "/assets/IcBaselineConstruction.webp",
          iconSize: 18,
          iconOpacity: 0.3,
          href: "/mycrafts",
          previewImage: "/assets/preview-mycrafts.png",
          internal: true,
        },
        {
          label: "CSS button workshop",
          icon: "/assets/IcBaselineIntegrationInstructions.webp",
          iconSize: 18,
          iconOpacity: 0.3,
          href: "/cssdoodle/button-state-buildera-visual-editor-for-designing-multi-state-button-flows/dist/index.html",
          previewImage: "/assets/preview-button-workshop.png",
          newTab: false,
        },
      ],
    },
    skills: {
      title: "Skills",
      rows: [
        ["Typescript", "React", "Next.js"],
        ["Python", "Java", "Node.js"],
        ["UI/UX design", "Motion", "3D"],
      ],
    },
    experience: {
      title: "Experience",
      items: [
        {
          role: "Meituan — Dianping International — Design Engineer",
          period: "2025 – Present",
          icon: "/assets/meituanicon.png",
          iconOpacity: 0.8,
        },
        {
          role: "Ant Group — WorldFirst — Experience Designer",
          period: "2025 – Present",
          icon: "/assets/anticon.png",
          iconOpacity: 0.7,
        },
      ],
    },
  },
};

export type HomeContent = (typeof home)["zh"];
