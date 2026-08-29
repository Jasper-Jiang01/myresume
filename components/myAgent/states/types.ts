/**
 * 对话领域类型：与 profiles / conversations / messages 表对应。
 * 前端消息列表和历史接口共用 Message。
 */

export type Role = "user" | "assistant" | "system";

/** 展示用消息；system 不会出现在气泡列表里 */
export interface Message {
  id: string;
  role: Exclude<Role, "system">;
  content: string;
  created_at?: string;
}

/** 设备级匿名资料，id 与 device_id 一致 */
export interface Profile {
  id: string;
  nickname: string;
  created_at: string;
}

/** 一轮会话，归属于某个 profile */
export interface Conversation {
  id: string;
  profile_id: string;
  created_at: string;
}
