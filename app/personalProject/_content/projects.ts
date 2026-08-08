/**
 * personalProject 页面的项目数据
 * 图片资源实际存放于 public/personalProject（Next.js 静态资源约定要求资源必须在 public 下才能被直接访问），
 * 此处集中管理文案与图片路径的映射，页面组件通过本文件读取数据渲染。
 */

export type PersonalProjectItem = {
  title: string;
  category: string;
  description: string;
  coverImage: string;
  defaultOpen?: boolean;
};

const projects: PersonalProjectItem[] = [
  {
    title: "World First · 跨境支付 App",
    category: "Ant International, FinTech, App UI",
    description:
      "为蚂蚁国际旗下 World First 打造的跨境支付与收款 App 界面，涵盖多币种账户总览、货币兑换、转账与活动运营位设计。",
    coverImage: "/personalProject/1.jpg",
    defaultOpen: true,
  },
  {
    title: "Power Trading · 云南省电力交易中心",
    category: "Enterprise SaaS, Trading, App UI",
    description:
      "一款为云南省电力市场主体打造的线上电力交易 APP，覆盖交易结算、电能分析、套餐购买与商家信用评级等核心业务场景。",
    coverImage: "/personalProject/2.jpg",
  },
  {
    title: "个人练习作品",
    category: "Visual Design, Practice",
    description:
      "持续保持对视觉能力提升与设计手感打磨的个人练习合集，记录不同风格与主题下的探索。",
    coverImage: "/personalProject/3.jpg",
  },
];

export default projects;
