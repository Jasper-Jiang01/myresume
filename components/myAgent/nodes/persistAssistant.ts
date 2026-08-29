/**
 * 落库节点：流结束后把完整 assistant 文本写入 messages。
 * conversationId 或正文为空时跳过（与原 route 行为一致）。
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { insertConversationMessage } from "../states/persistence";

/** 有会话且有正文时写入 assistant；返回值与原先一样被忽略 */
export async function persistAssistant(
  admin: SupabaseClient,
  conversationId: string,
  fullContent: string
): Promise<void> {
  if (conversationId && fullContent) {
    await insertConversationMessage(
      admin,
      conversationId,
      "assistant",
      fullContent
    );
  }
}
