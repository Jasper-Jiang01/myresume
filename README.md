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

- `app/` — 布局与主页
- `components/` — 对齐 Figma 五类：`AboutMe` / `Project` / `Tools` / `Skills` / `Experience`
- `components/shared/` — 共用壳层（SectionCard / BulletItem / InfoChip）
- `lib/content.ts` — 硬编码文案
- `public/images/` — 头像与图标资源
