# 蒋文喆个人站 · portFronted

基于 Figma「个人网站 / 网站1」实现的静态个人主页，包含首页简历、个人项目作品集、手工小记（CSS/GSAP 动效实验集）三大板块，静态导出后部署至 GitHub Pages。

## 技术栈

- Next.js 14 (App Router，`output: "export"` 纯静态导出)
- TypeScript
- Tailwind CSS
- GSAP / motion / @react-spring/web（动效）

## 开发

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 构建与部署

```bash
npm run build   # next build（静态导出到 dist/）+ 清理 cssdoodle 源码目录
npm run start   # 预览生产构建（需先 build）
npm run lint    # ESLint 检查
```

- `next.config.mjs`：`output: "export"` 静态导出，生产环境下自动附加 `basePath`/`assetPrefix` 为 `/myresume`（GitHub Pages 仓库名），`trailingSlash: true` 避免子路径 404。
- `.github/workflows/deploy.yml`：推送到 `main` 分支后自动构建并发布到 GitHub Pages。
- 站内链接使用 `lib/paths.ts` 提供的 `withBasePath()` 处理静态资源路径、`assertInternalHref()` 在开发环境校验 `next/link` 的 `href` 未被重复拼接 `basePath`。

## 目录

```
app/
├── page.tsx              # 根路由，重定向到 /home
├── layout.tsx            # 全局布局：字体、SiteBackground、metadata
├── globals.css           # 全局样式
├── error.tsx / not-found.tsx
├── home/                 # 首页（简历）路由
│   ├── page.tsx
│   ├── _content/
│   │   └── content.ts    # 首页所有文案内容（数据与组件分离）
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
├── personalProject/      # 个人项目作品集路由
│   ├── page.tsx
│   ├── _content/
│   │   └── projects.ts   # 项目文案与封面图数据
│   ├── _components/
│   │   └── ProjectCard.tsx
│   └── _hooks/
│       └── useScrollReveal.ts
└── mycrafts/             # 手工小记：CSS/GSAP 动效实验集路由
    ├── page.tsx          # 列表页
    ├── loading.tsx
    ├── [slug]/
    │   └── page.tsx      # 详情页，iframe 全屏展示单个 demo
    ├── _content/
    │   └── projects.ts   # 作品项目数据配置（含 slug、预览配置）
    ├── _components/
    │   ├── SiteHeader.tsx
    │   ├── SiteFooter.tsx
    │   ├── ProjectCard.tsx
    │   ├── ProjectCover.tsx
    │   └── LazyIframe.tsx
    └── _project/cssdoodle/   # 各 demo 的可读源码 + README（构建时经保护脚本处理后输出到 public/cssdoodle/）
        ├── after-sign-off/
        ├── gsap-rotatey-draggable/
        ├── neon-glass-3d-cards-ui-lab/
        └── pure-css-parallax-card-on-hover/
components/
├── Dock.tsx / Dock.css       # 底部悬浮 Dock 交互组件（图标态 + hover 展开文案）
├── SiteDockNav.tsx           # 基于 Dock 封装的站内导航栏，供 home/personalProject/mycrafts 复用
├── HoverPreviewCard.tsx      # 卡片 hover 预览组件
└── background/
    ├── SiteBackground.tsx    # 全局共享背景组件
    └── ArtDots.tsx
lib/
├── paths.ts              # withBasePath / assertInternalHref 工具函数
└── siteNav.tsx            # 站内 Dock 导航项配置（图标 + 文案 + href 统一维护）
scripts/
└── protect-cssdoodle.js  # 将 cssdoodle demo 的 `.src/` 源码压缩混淆并注入防护脚本，输出到同级展示文件
public/
├── assets/               # 图标与预览图资源
├── images/               # 头像与图片资源
├── personalProject/      # 个人项目封面图
└── cssdoodle/            # 手工小记 demo 的可访问静态产物（iframe 加载来源）
    ├── _shared/protect.js
    ├── neon-glass-3d-cards-ui-lab/
    ├── gsap-rotatey-draggable/
    ├── pure-css-parallax-card-on-hover/
    ├── after-sign-off/
    └── button-state-buildera-visual-editor-for-designing-multi-state-button-flows/
```

## 结构约定

- `_components/` — 路由专属组件（下划线前缀 = 非路由段）
- `_content/` — 路由专属文案/数据配置，与组件就近放置
- `_hooks/` — 路由专属 Hook
- `components/` — 仅放全局共享组件（如 Dock、SiteDockNav、SiteBackground）
- `lib/` — 全局共用工具函数与配置（路径处理、站内导航项）
- `mycrafts` 的每个 demo 在 `app/mycrafts/_project/cssdoodle/<demo>/` 下维护可读源码（`src/` 与 `README.md`），通过 `scripts/protect-cssdoodle.js` 压缩混淆后输出到 `public/cssdoodle/<demo>/`，由 `[slug]/page.tsx` 以 `iframe` 方式加载展示
