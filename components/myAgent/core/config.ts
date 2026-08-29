/**
 * Agent 限额与阈值。
 * 纯常量，供 HTTP 校验、持久化和前端输入框共用。
 */

/** 单条用户消息最大字符数 */
export const MAX_USER_CONTENT_CHARS = 2000;
/** POST /api/chat 请求体上限（字节） */
export const MAX_CHAT_BODY_BYTES = 16_384;
/** 送给 LLM 的历史消息条数上限 */
export const LLM_HISTORY_LIMIT = 20;
/** 同一 IP 每分钟请求上限 */
export const IP_MINUTE_LIMIT = 8;
/** 同一 IP 每个上海自然日请求上限 */
export const IP_DAILY_LIMIT = 40;
/** 匿名昵称写入冲突时的重试次数 */
export const PROFILE_NICKNAME_MAX_ATTEMPTS = 5;
/** 达到该长度才视为复杂问题，允许打开思维链；更短的默认关掉 */
export const THINKING_COMPLEX_MIN_CHARS = 160;

const COMPLEX_QUESTION_RE =
  /为什么|怎么实现|如何设计|对比分析|优缺点|权衡|架构|trade-?off|\bwhy\b|how (does|do|would|should|can)|compar(e|ison)|versus|\bvs\b|analy[sz]e|step by step|仔细想|深入讲/i;

/**
 * qwen3.7-plus 默认开思维链。简单问候 / 介绍类问题关掉；
 * 只有够长或明显在追问分析时才打开。
 */
export function shouldEnableThinking(userContent: string): boolean {
  const text = userContent.trim();
  if (text.length >= THINKING_COMPLEX_MIN_CHARS) return true;
  return COMPLEX_QUESTION_RE.test(text);
}
