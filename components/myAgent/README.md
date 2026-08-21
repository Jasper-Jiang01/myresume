# Alii.work AI 对话框逆向分析与实现方案

## 一、逆向分析结论

通过对 `https://alii.work/portfolio/` 的 DOM、网络接口与 JS Bundle 的逆向分析，其 AI 对话框的实现要点如下：

### 1.1 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 14 App Router + React 18 + Tailwind CSS |
| 动画 | CSS transition（cubic-bezier(0.16, 1, 0.3, 1)） |
| 后端 API | Next.js API Route `/api/chat` |
| 数据库 & Auth | Supabase（Auth + PostgreSQL） |
| LLM | OpenAI 兼容接口（推测为 GPT 系列） |
| 流式输出 | SSE / ReadableStream |

### 1.2 UI 结构

- **定位**：`fixed bottom-[48px] left-1/2` 底部居中悬浮窗，桌面端显示（`md:block`），移动端隐藏。
- **视觉**：玻璃拟态（`backdrop-blur-[24px]`、`bg-[hsl(var(--neutral-bg-card)/0.8)]`）、圆角 `16px`、阴影、细边框。
- **状态**：
  - 收起态：仅显示输入条（宽 480px，高 ~99px）。
  - 展开态：显示消息列表 + 输入条（宽 560px，高 ~390px）。
  - 常驻展开（Pin）：点击后无法收起。
- **昵称层**：首次使用需输入 1~20 字符昵称，基于设备 ID 记录（"账号基于访问设备记录"）。昵称唯一性由 Supabase 校验。
- **消息列表**：User 右对齐深色气泡，Assistant 左对齐浅色气泡。
- **快捷操作**：展开 / 收起、常驻展开、发送按钮、Enter 发送。

### 1.3 交互流程

```
点击 Chats 按钮
    │
    ▼
检查本地是否存在 device_id + nickname
    │
    ├─ 无 ──► 弹出昵称输入层 ──► 校验唯一性 ──► 写入 Supabase profiles
    │
    ▼
显示聊天面板（输入框可发送）
    │
    ▼
输入消息 ──► POST /api/chat（Header 带 device-id）
    │
    ▼
服务端校验 device-id ──► 调 LLM ──► 流式返回 token
    │
    ▼
前端逐字追加到 Assistant 气泡
    │
    ▼
流结束后保存 Assistant 消息到 Supabase messages
```

### 1.4 后端接口

- **探测到的端点**：`POST /api/chat`
  - 未登录返回 `401 {error: "auth_error", message: "请先登录"}`。
  - 说明该接口需要身份/设备标识校验。
- **其他端点**：`/api/auth`、`/api/messages` 等均返回 404，说明 CRUD 操作大概率通过 **Supabase Client** 直接在前端完成（配合 RLS 或服务端校验），只有需要调用 LLM 的敏感逻辑放在 `/api/chat`。

### 1.5 错误体系（从 i18n 字符串提取）

| 错误场景 | 提示文案 |
|----------|----------|
| 昵称重复 | "该昵称已被使用" |
| 昵称长度 | "昵称需要 1-20 个字符" |
| 登录失败 | "登录失败，请重试" |
| 创建资料失败 | "创建个人信息失败" |
| 会话过期 | "登录状态已失效，请刷新后重试" |
| 对话创建超时 | "创建对话超时，请检查 Supabase 连接后重试" |
| 消息保存超时 | "消息保存超时，请检查 Supabase 连接后重试" |
| 消息保存失败 | "消息保存失败，请重试" |
| 频率限制 | "今天聊得够多啦，明天再来吧 ☕" |
| 请求失败 | "Alii 走神了，晚点再来试试吧…" |
| 响应超时 | "Alii 想太久了，这次先重试一下吧…" |
| 网络中断 | "网络连接中断，请检查网络后重试" |
| 回复未保存 | "回复已显示，但未保存到历史记录，请复制后重试" |

### 1.6 数据库设计（推测与复现）

基于错误文案中的 "Supabase 连接"、"对话"、"历史记录" 等关键词，数据库应包含三张表：

```sql
-- 1. 用户资料（设备级）
create table profiles (
  id uuid primary key,           -- 与 device_id 一致
  nickname text not null unique,
  created_at timestamptz default now()
);

-- 2. 对话会话
create table conversations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now()
);

-- 3. 消息
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

-- 启用 RLS（如需要）
alter table profiles enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
```

> 本方案采用**服务端校验 device_id** 而非复杂的 Supabase Auth 匿名登录，更接近原始站点的 "基于访问设备记录" 描述。

---

## 二、部署方式：动态部署

本方案采用 **动态部署**（与 Alii.work 完全一致），即移除 `next.config.mjs` 中的 `output: "export"`，让 Next.js 以标准 Node.js 服务器模式运行。API Route 正常生效，支持流式输出。

### 为什么选择动态部署

| 对比项 | 静态导出（旧） | 动态部署（当前方案） |
|--------|----------------|----------------------|
| `output` 配置 | `"export"` — 构建时输出纯 HTML | 移除该行 — 运行时服务端渲染 |
| API Route | ❌ 不生效，构建时被忽略 | ✅ 正常运行，支持流式响应 |
| 部署目标 | GitHub Pages 等静态托管 | Vercel / Netlify / 自有 Node 服务器 |
| 流式输出（SSE） | ❌ 无法实现（无服务端） | ✅ 原生支持 |
| 前后端关系 | 前端 + 独立后端服务 | 前后端同仓库，统一部署 |

### 需要修改的配置

在 `next.config.mjs` 中移除 `output: "export"`：

```js
// next.config.mjs — 修改前
const nextConfig = {
  output: "export",       // ← 删除此行
  distDir: "dist",
  trailingSlash: true,
  // ...
};

// next.config.mjs — 修改后
const nextConfig = {
  distDir: "dist",
  trailingSlash: true,
  // ...
};
```

> ⚠️ 移除 `output: "export"` 后，项目不能再部署到 GitHub Pages 等纯静态托管。推荐部署到 **Vercel**（零配置支持 Next.js 动态路由 + Edge Functions）。

---

## 三、目录结构

```
components/myAgent/
├── README.md                 ← 本文档
├── types.ts                  ← 共享类型
├── supabaseClient.ts         ← Supabase 浏览器客户端
├── useChat.ts                ← 聊天状态管理 Hook
└── ChatWidget.tsx            ← 前端 UI 组件（入口）

app/api/chat/route.ts         ← Next.js API Route（已落地，动态部署下生效）
```

> `next.config.mjs` 已按 `process.env.VERCEL` 区分两种构建形态：
> GitHub Pages 走 `output: "export"` 纯静态导出（`/api/chat` 不参与产物，
> 前端 ChatWidget 若在该环境下访问会 404）；Vercel 走标准动态构建，
> `/api/chat` 以 Serverless Function 形式运行。

---

## 四、安装依赖

```bash
npm install openai @supabase/supabase-js
# 或
npm install ai @ai-sdk/openai @supabase/supabase-js
```

> 本方案中的 `api-chat-route.ts` 使用原生 `openai` 包进行流式调用，客户端不依赖 `ai` 包，保持依赖最小化。
> 部署到 Vercel 后，API Route 自动获得 Edge Runtime 支持，流式输出延迟更低。

---

## 五、环境变量

在项目根目录创建 `.env.local`：

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# LLM（支持 OpenAI 或任意兼容端点）
OPENAI_API_KEY=your-openai-key
OPENAI_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
```

- `SUPABASE_SERVICE_ROLE_KEY` 仅在服务端 API Route 中使用，用于绕过 RLS 写入消息。
- `SUPABASE_ANON_KEY` 与 `SUPABASE_URL` 需加 `NEXT_PUBLIC_` 前缀供前端 `supabaseClient.ts` 使用。
- 部署到 Vercel 时，在项目 Settings → Environment Variables 中配置这些变量。

---

## 六、接入方式

在需要显示聊天组件的页面（如 `app/home/page.tsx`）中引入：

```tsx
import ChatWidget from "@/components/myAgent/ChatWidget";

export default function HomePage() {
  return (
    <main>
      {/* 其他内容 */}
      <ChatWidget />
    </main>
  );
}
```

`ChatWidget` 内部已标记 `"use client"`，可直接在 Server Component 中引用。

---

## 七、各文件职责速查

| 文件 | 职责 |
|------|------|
| `types.ts` | `Message`、`Profile`、`Conversation` 的 TypeScript 类型定义 |
| `supabaseClient.ts` | 创建浏览器端 Supabase 实例，用于读取历史消息、创建对话 |
| `useChat.ts` | 核心 Hook：device_id 管理、昵称校验、消息列表、流式接收、错误处理 |
| `ChatWidget.tsx` | 玻璃拟态 UI：昵称浮层、消息气泡、输入框、展开/收起/常驻按钮 |
| `app/api/chat/route.ts` | Next.js API Route：校验 device_id → 调 LLM → 流式返回 → 落库 |

---

## 八、关键实现细节

### 8.1 设备级身份（device_id）

- 首次打开时 `crypto.randomUUID()` 生成 device_id，存入 `localStorage`。
- 昵称与 device_id 绑定写入 `profiles` 表。
- 后续请求通过 `x-device-id` Header 传递，服务端校验是否存在对应 profile。
- 优点：无需邮箱/密码，访客零 friction；缺点：换设备/清缓存后身份丢失。

### 8.2 流式输出（SSE 简化版）

- 服务端使用 OpenAI SDK 的 `stream: true` 模式。
- 将每个 token 直接写入 `ReadableStream`，客户端通过 `getReader()` + `TextDecoder()` 逐块读取。
- 动态部署下，API Route 运行在 Node.js / Edge Runtime，原生支持 `ReadableStream`，无需额外的跨域配置。

### 8.3 消息持久化时序

1. 用户点击发送 → 前端立即将 User 消息插入 `messages` 表（乐观更新）。
2. 前端调用 `/api/chat`。
3. 服务端在流结束后将 Assistant 完整回复写入 `messages` 表。
4. 如果用户刷新页面，前端从 Supabase 重新拉取该 `conversation_id` 下的历史消息。

### 8.4 频率限制（Rate Limit）

- 可在 `/api/chat` 中基于 `device_id` 或 IP 做简单计数（Redis / Upstash / Vercel KV）。
- 超出阈值返回 `429`，前端提示 "今天聊得够多啦，明天再来吧 ☕"。
- 本方案的参考代码中暂未内置限流，可根据需要自行添加。

---

## 九、与旧 LangGraph 方案的关系

本方案采用动态部署后，前后端同在一个 Next.js 项目中，部署到 Vercel 即可。如果后续需要更复杂的 Agent 能力（工具调用、知识库检索、多轮状态机），可以将 `/api/chat` 的逻辑替换为调用独立的 LangGraph Agent Server，前端 UI 无需改动。
