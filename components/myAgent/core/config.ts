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
