export type Role = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: Exclude<Role, "system">;
  content: string;
  created_at?: string;
}

export interface Profile {
  id: string;
  nickname: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  profile_id: string;
  created_at: string;
}
