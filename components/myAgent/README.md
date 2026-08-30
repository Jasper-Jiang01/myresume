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
- **身份**：服务端为设备生成随机昵称，不使用首条消息内容；冲突返回统一模糊错误，避免昵称枚举。
- **消息列表**：User 右对齐深色气泡，Assistant 左对齐浅色气泡。
- **快捷操作**：展开 / 收起、常驻展开、发送按钮、Enter 发送。

### 1.3 交互流程

```
点击 Chats 按钮
    │
    ▼
检查本地是否存在 device_id
    │
    ▼
显示聊天面板（输入框可发送；服务端按需创建随机昵称 profile）
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

-- 启用 RLS，并禁止 anon / authenticated 经 Data API 读写。
-- 完整加固脚本见 schema.sql（限流表 + 收回权限 + 去掉开放策略）。
alter table profiles enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
revoke all on table profiles from anon, authenticated, public;
revoke all on table conversations from anon, authenticated, public;
revoke all on table messages from anon, authenticated, public;
```

> 没有 Supabase Auth 时，RLS **不能**安全地按客户端自报的 `device_id` 过滤行（伪造 header 即可读全表）。正确做法是：Data API 对聊天表零权限，历史记录只通过 `/api/chat/history` 用 service_role 校验 `conversations.profile_id` 后返回。

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
├── README.md
├── schema.sql
├── infomation.md / KNOWLEDGE.md
├── ChatWidget.tsx            ← 前端 UI 入口
├── useChat.ts                ← 客户端会话 Hook
├── core/                     ← 模型初始化、配置、Context/State、SSE、Supabase、人设
├── states/                   ← 展示类型 + 持久化 / 限流
├── graphs/                   ← LangGraph 接线
├── nodes/                    ← callModel / executeTools / persistAssistant
└── tools/                    ← open_project 等工具

app/api/chat/route.ts         ← HTTP 入口：校验后调用 graph
app/api/chat/history/route.ts ← 历史记录（服务端校验会话归属后返回）
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
# Supabase（仅服务端；缺任一变量时 API 会显式报错，不再静默跳过）
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# LLM（支持 OpenAI 或任意兼容端点）
OPENAI_API_KEY=your-openai-key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_DEFAULT_MODEL=qwen3.7-plus
```

- 聊天读写全部走 `/api/chat` 与 `/api/chat/history`，浏览器 **不** 初始化 Supabase，因此 **不需要** `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`。这两项若只配在 Vercel Runtime 而未参与 `next build`，也不会再让消息列表静默不渲染。
- `SUPABASE_SERVICE_ROLE_KEY` 仅在服务端使用，用于绕过 RLS 写入消息。
- 部署到 Vercel 时，在项目 Settings → Environment Variables 中配置这些变量（Production / Preview 都要配，然后重新部署）。

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
| `states/types.ts` | `Message`、`Profile`、`Conversation` 的 TypeScript 类型定义 |
| `core/supabaseAdmin.ts` | 服务端 Supabase 客户端；环境变量缺失时抛错 |
| `graphs/coreAgentGraph.ts` | LLM → 工具 → followup → 落库 的接线 |
| `nodes/` | `callModel` / `executeTools` / `persistAssistant` |
| `core/createModel.ts` | `initChatModel` 初始化 |
| `core/coreAgentState.ts` | `ContextSchema` + `CoreAgentState` |
| `useChat.ts` | 核心 Hook：device_id 管理、消息列表、流式接收、错误处理 |
| `ChatWidget.tsx` | 玻璃拟态 UI：消息气泡、输入框、展开/收起/常驻按钮 |
| `app/api/chat/route.ts` | Next.js API Route：校验 device_id → 调 graph → 流式返回 |
| `app/api/chat/history/route.ts` | 按 device_id 校验会话归属后返回历史消息 |

---

## 八、关键实现细节

### 8.1 设备级身份（device_id）

- 首次打开时 `crypto.randomUUID()` 生成 device_id，存入 `localStorage`。
- 服务端按 device_id 创建 profile，昵称为随机串，不采信客户端上报的昵称或首条消息。
- 后续请求通过 `x-device-id` Header 传递，仅用于会话归属，不作为限流身份。
- 优点：无需邮箱/密码，访客零 friction；缺点：换设备/清缓存后身份丢失。

### 8.2 流式输出（SSE 简化版）

- 服务端使用 OpenAI SDK 的 `stream: true` 模式。
- 将每个 token 直接写入 `ReadableStream`，客户端通过 `getReader()` + `TextDecoder()` 逐块读取。
- 动态部署下，API Route 运行在 Node.js / Edge Runtime，原生支持 `ReadableStream`，无需额外的跨域配置。

### 8.3 消息持久化时序

1. 用户点击发送 → 前端立刻把 User / 空 Assistant 气泡写入本地 state（乐观展示，不依赖 Supabase）。
2. 前端调用 `/api/chat`；服务端创建会话、写入 User 消息、流式返回 token。
3. 服务端在流结束后将 Assistant 完整回复写入 `messages` 表。
4. 刷新后前端请求 `/api/chat/history`，由服务端校验 `conversations.profile_id` 后返回历史。

### 8.4 频率限制（Rate Limit）

- `/api/chat` 按请求 IP 限流（分钟 8 次 / 上海时区每日 40 次），不信任 `x-device-id`。
- 超出阈值返回 `429`，前端提示 "今天聊得够多啦，明天再来吧 ☕"。
- 计数写入 `chat_rate_limits`（见 `schema.sql`）；表未创建时退回进程内计数。

---

## 九、与旧 LangGraph 方案的关系

本方案采用动态部署后，前后端同在一个 Next.js 项目中，部署到 Vercel 即可。如果后续需要更复杂的 Agent 能力（工具调用、知识库检索、多轮状态机），可以将 `/api/chat` 的逻辑替换为调用独立的 LangGraph Agent Server，前端 UI 无需改动。
