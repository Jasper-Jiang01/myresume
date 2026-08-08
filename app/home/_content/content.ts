export const profile = {
  name: "蒋文喆",
  title: "设计工程师 & 全栈开发者",
  avatar: "/assets/myavatar.png",
  chips: [
    {
      label: "19979025589",
      icon: "/assets/chip-wechat.svg",
      iconSize: 15, // 略大于其它 chip 图标（默认 14）
    },
    { label: "现居上海; 2001-01-26", icon: "/assets/chip-home.svg" },
    { label: "jwz727501@gmail.com", icon: "/assets/chip-email.svg" },
  ],
};

export const aboutMe = {
  title: "关于我",
  paragraphs: [
    "我目前在美团大众点评境外事业部担任设计工程师(Product Design Engineer)；独立完成需求挖掘，设计，开发到上线的全流程。",
    "我相信技术能够赋能设计，设计又能够基于技术实现创新；因此我时时刻刻保持对技术能力的学习以及设计能力边界的探索。",
  ],
  passionLabel: "我一直热爱着：",
  passions: "体验设计，动效设计，人工智能，商业思维，产品思维和构成艺术",
};

type ProjectItem = {
  label: string;
  icon?: string;
  href?: string;
  previewImage?: string;
  newTab?: boolean;
  /** 是否为站内路由（用 next/link 无刷新跳转），默认 false */
  internal?: boolean;
};

// 用显式类型标注（而非 `as` 断言）声明 items：
// `as` 是双向断言，仅在两个类型完全不相关时才会报错，无法捕获“漏传/错传字段”这类问题；
// 显式类型标注会做结构化类型检查（赋值兼容性检查），既能在编译期发现字面量与 ProjectItem 不符的问题，
// 又能让 items 的类型正确宽化为 ProjectItem[]，避免下游按可选属性访问时被字面量联合类型收窄报错。
const projectItems: ProjectItem[] = [
  { label: "个人作品集", icon: "/assets/meituanicon.png", href: "/personalProject", internal: true },
  { label: "美团项目2" , icon: "/assets/meituanicon.png"},
  { label: "Agent开发项目" },
  { label: "蚂蚁国际项目" },
];

export const project = {
  title: "作品",
  items: projectItems,
};

type ToolItem = {
  label: string;
  href?: string;
  previewImage?: string;
  newTab?: boolean;
  /** 是否为站内路由（用 next/link 无刷新跳转），默认 false */
  internal?: boolean;
};

const toolItems: ToolItem[] = [
  { label: "插件设计 - Figma& Mastergo" },
  { label: "动效实验站", href: "/mycrafts", previewImage: "/assets/preview-mycrafts.png", internal: true },
  {
    label: "CSS灵动按钮工坊",
    href: "/cssdoodle/button-state-buildera-visual-editor-for-designing-multi-state-button-flows/dist/index.html",
    previewImage: "/assets/preview-button-workshop.png",
    newTab: false,
  },
];

export const tools = {
  title: "工具",
  items: toolItems,
};

export const skills = {
  title: "技能",
  rows: [
    ["typescript", "react", "next.js"],
    ["python", "java", "node.js"],
    ["UI/UX设计", "动效", "3D"],
  ],
};

export const experience = {
  title: "经历",
  items: [
    {
      role: "美团 - 大众点评境外事业部 - 设计工程师",
      period: "2025 - 至今",
    },
    {
      role: "蚂蚁集团 - WorldFirst - 体验设计师",
      period: "2025 - 至今",
    },
  ],
};
