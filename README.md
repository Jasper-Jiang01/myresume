# 蒋文喆个人站 · portFronted

基于 Figma「个人网站 / 网站1」实现的静态个人主页。

## 技术栈

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS

## 开发

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 目录

```
app/
├── page.tsx              # 根路由，重定向到 /home
├── home/                 # 主页路由
│   ├── page.tsx
│   ├── _content/
│   │   └── content.ts    # 主页所有文案内容（数据与组件分离）
│   └── _components/
│       ├── ProfileHeader.tsx
│       ├── AboutMe.tsx
│       ├── Project.tsx
│       ├── Tools.tsx
│       ├── Skills.tsx
│       ├── Experience.tsx
│       ├── SectionCard.tsx
│       ├── BulletItem.tsx
│       └── InfoChip.tsx
├── mycrafts/             # 作品页路由
│   ├── page.tsx
│   ├── _content/
│   │   └── projects.ts   # 作品项目数据配置
│   └── _components/
│       ├── ProjectCard.tsx
│       ├── ProjectCover.tsx
│       └── LazyIframe.tsx
components/
└── background/
    └── SiteBackground.tsx    # 全局共享组件
lib/
└── paths.ts              # withBasePath 工具函数
public/
├── assets/               # 图标资源
├── cssdoodle/            # CSSDoodle 纯 CSS 动效 demo
│   ├── neon-glass-3d-cards-ui-lab/
│   ├── gsap-rotatey-draggable/
│   ├── pure-css-parallax-card-on-hover/
│   └── after-sign-off/
└── images/               # 头像与图片资源
```

## 结构约定

- `_components/` — 路由专属组件（下划线 = 非路由段）
- `_content/` — 路由专属文案数据，与组件就近放置
- `components/` — 仅放全局共享组件（如 SiteBackground）
- `lib/` — 全局共用工具函数
