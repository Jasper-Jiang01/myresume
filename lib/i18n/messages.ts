import type { Locale } from "@/lib/preferences/types";

export const messages = {
  zh: {
    meta: {
      title: "蒋文喆 · 设计工程师 & 全栈开发者",
      description:
        "美团大众点评境外事业部设计工程师。体验设计、动效、AI 与全栈开发。",
    },
    nav: {
      work: "作品",
      info: "关于",
    },
    theme: {
      toDark: "切换到暗色模式",
      toLight: "切换到亮色模式",
    },
    language: {
      switch: "切换语言，当前：中文",
    },
    notFound: {
      title: "页面不存在",
      body: "你访问的页面可能已被删除、更名或暂时不可用。",
      back: "返回首页",
    },
    error: {
      kicker: "出错了",
      title: "页面出现了一点问题",
      body: "抱歉，页面渲染时发生了意外错误，请重试或返回首页。",
      retry: "重试",
      back: "返回首页",
    },
    projectMissing: "项目不存在",
    backToCrafts: "返回作品列表",
    backToWork: "← 返回作品",
    imagePlaceholder: "图片占位",
    coverPlaceholder: "封面图占位",
    chat: {
      region: "和文喆聊天",
      expand: "展开",
      collapse: "收起",
      pin: "常驻展开",
      newChat: "开始新对话",
      send: "发送",
      inputLabel: "输入你想对文喆说的话",
      thinking: "文喆正在思考中",
      savingNickname: "正在记录昵称…",
      replying: "正在回复…",
      chatting: "嗨，我是文喆的数字分身～想聊作品、动效还是别的？",
      askNickname: "取个昵称再开始吧",
      nicknameHint: "1~20个字符, 账号基于访问设备记录哦…",
      askAnything: "Ask me anything…",
      errors: {
        history: "加载历史记录失败",
        nicknameLength: "昵称需要 1-20 个字符",
        device: "设备 ID 初始化失败",
        nicknameTaken: "暂时无法开始对话，请稍后重试",
        profile: "暂时无法开始对话，请稍后重试",
        tooLong: "单条消息不能超过 2000 字",
        convTimeout: "创建对话超时，请检查 Supabase 连接后重试",
        save: "消息保存失败，请重试",
        rateLimit: "今天聊得够多啦，明天再来吧 ☕",
        distracted: "文喆走神了，晚点再来试试吧…",
        network: "网络连接中断，请检查网络后重试",
      },
    },
  },
  en: {
    meta: {
      title: "Jiang Wenzhe · Design Engineer & Full-stack Developer",
      description:
        "Design engineer at Meituan Dianping International. Experience design, motion, AI, and full-stack development.",
    },
    nav: {
      work: "Work",
      info: "Info",
    },
    theme: {
      toDark: "Switch to dark mode",
      toLight: "Switch to light mode",
    },
    language: {
      switch: "Switch language, current: English",
    },
    notFound: {
      title: "Page not found",
      body: "The page you requested may have been removed, renamed, or is temporarily unavailable.",
      back: "Back to home",
    },
    error: {
      kicker: "Something went wrong",
      title: "This page hit a snag",
      body: "Sorry, an unexpected error occurred while rendering. Please retry or go back home.",
      retry: "Retry",
      back: "Back to home",
    },
    projectMissing: "Project not found",
    backToCrafts: "Back to projects",
    backToWork: "← Back to work",
    imagePlaceholder: "Image placeholder",
    coverPlaceholder: "Cover placeholder",
    chat: {
      region: "Chat with Wenzhe",
      expand: "Expand",
      collapse: "Collapse",
      pin: "Keep open",
      newChat: "Start a new conversation",
      send: "Send",
      inputLabel: "Type a message to Wenzhe",
      thinking: "Wenzhe is thinking",
      savingNickname: "Saving nickname…",
      replying: "Replying…",
      chatting: "Hey — I'm Wenzhe's digital twin. Work, motion, or something else?",
      askNickname: "Pick a nickname to start",
      nicknameHint: "1–20 characters. Tied to this device…",
      askAnything: "Ask me anything…",
      errors: {
        history: "Failed to load chat history",
        nicknameLength: "Nickname must be 1–20 characters",
        device: "Failed to initialize device ID",
        nicknameTaken: "Could not start the chat. Please try again shortly.",
        profile: "Could not start the chat. Please try again shortly.",
        tooLong: "Each message can be at most 2000 characters",
        convTimeout:
          "Timed out creating the conversation. Check Supabase and retry.",
        save: "Failed to save the message. Please retry.",
        rateLimit: "That's enough for today — come back tomorrow ☕",
        distracted: "Wenzhe zoned out. Try again in a bit…",
        network: "Network dropped. Check your connection and retry.",
      },
    },
  },
} as const;

export type Messages = (typeof messages)[Locale];

export function getMessages(locale: Locale): Messages {
  return messages[locale];
}
