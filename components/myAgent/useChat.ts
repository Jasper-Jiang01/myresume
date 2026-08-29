/**
 * 客户端会话 Hook。
 * 管 device_id、乐观消息、拉历史、读 SSE、展开/钉住。
 * 不写 Supabase；user / assistant 均由 /api/chat 落库。
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { withBasePath } from "@/lib/paths";
import { MAX_USER_CONTENT_CHARS } from "./core/config";
import { readAgentStream } from "./core/stream";
import type { Message } from "./states/types";

/** localStorage：匿名设备身份，对应服务端 profiles.id */
const DEVICE_ID_KEY = "myAgent_device_id";
/** 旧版昵称缓存，401 时清除 */
const NICKNAME_KEY = "myAgent_nickname";
/** 当前会话 id，对应 conversations.id */
const CONVERSATION_ID_KEY = "myAgent_conversation_id";

/** 用户主动取消 fetch 时不当成发送失败 */
function isAbortError(err: unknown): boolean {
  return (
    (err instanceof DOMException || err instanceof Error) &&
    err.name === "AbortError"
  );
}

/** 首次访问生成 UUID，之后一直用 localStorage 里的 device_id */
function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

/** 对话框对外状态：消息、输入、流式、展开/钉住 */
export interface UseChatReturn {
  messages: Message[];
  input: string;
  setInput: (val: string) => void;
  sendMessage: () => Promise<void>;
  isStreaming: boolean;
  error: string | null;
  hydrated: boolean;
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
  isPinned: boolean;
  setIsPinned: (val: boolean) => void;
  startNewConversation: () => void;
}

/** 客户端会话入口；挂载时 hydrate device_id 并尝试拉历史 */
export function useChat(): UseChatReturn {
  const router = useRouter();
  const { messages: copy, locale } = usePreferences();
  const errors = copy.chat.errors;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const deviceIdRef = useRef<string>("");
  const abortRef = useRef<AbortController | null>(null);
  const latestRef = useRef({
    input,
    isStreaming,
    locale,
    errors,
  });
  latestRef.current = {
    input,
    isStreaming,
    locale,
    errors,
  };

  useEffect(() => {
    deviceIdRef.current = getDeviceId();
    setHydrated(true);
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  /** 用本地 conversationId + device_id 拉服务端历史；403 则丢掉脏会话 id */
  const loadHistory = useCallback(async () => {
    if (typeof window === "undefined") return;
    const convId = localStorage.getItem(CONVERSATION_ID_KEY);
    const deviceId = deviceIdRef.current;
    if (!convId || !deviceId) return;

    try {
      const response = await fetch(
        `/api/chat/history?conversationId=${encodeURIComponent(convId)}`,
        { headers: { "x-device-id": deviceId } }
      );

      if (response.status === 404) return;

      if (!response.ok) {
        if (response.status === 403) {
          localStorage.removeItem(CONVERSATION_ID_KEY);
        }
        setError(errors.history);
        return;
      }

      const body = (await response.json().catch(() => ({}))) as {
        messages?: Message[];
      };
      if (body.messages) {
        setMessages(
          body.messages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            created_at: m.created_at,
          }))
        );
      }
    } catch {
      setError(errors.history);
    }
  }, [errors.history]);

  useEffect(() => {
    if (hydrated) void loadHistory();
  }, [hydrated, loadHistory]);

  /** 中止进行中的流，清本地会话 id 和消息列表 */
  const startNewConversation = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    localStorage.removeItem(CONVERSATION_ID_KEY);
    setMessages([]);
    setError(null);
    setIsStreaming(false);
  }, []);

  /** 乐观插入气泡，POST /api/chat，按 SSE 追加 token / 执行 navigate */
  const sendMessage = async () => {
    const {
      input: raw,
      isStreaming: streaming,
      locale: activeLocale,
      errors: activeErrors,
    } = latestRef.current;
    const text = raw.trim();
    if (!text || streaming) return;

    if (text.length > MAX_USER_CONTENT_CHARS) {
      setError(activeErrors.tooLong);
      return;
    }

    setError(null);
    setInput("");

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    const assistantId = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setIsStreaming(true);
    setIsExpanded(true);

    const deviceId = deviceIdRef.current;
    const conversationId = localStorage.getItem(CONVERSATION_ID_KEY);
    let userPersisted = false;
    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;
    let raf = 0;
    let assistantContent = "";

    const flushAssistant = () => {
      raf = 0;
      const snapshot = assistantContent;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: snapshot } : m
        )
      );
    };

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-id": deviceId,
        },
        signal: abort.signal,
        body: JSON.stringify({
          content: userMessage.content,
          conversationId: conversationId || undefined,
          locale: activeLocale,
        }),
      });

      const convFromHeader = response.headers.get("x-conversation-id");
      if (convFromHeader && !abort.signal.aborted) {
        localStorage.setItem(CONVERSATION_ID_KEY, convFromHeader);
      }

      if (!response.ok) {
        const errBody = (await response.json().catch(() => ({}))) as {
          message?: string;
        };
        if (response.status === 429) {
          throw new Error(activeErrors.rateLimit);
        }
        if (response.status === 413 || response.status === 400) {
          if (errBody.message) throw new Error(errBody.message);
        }
        if (response.status === 401) {
          localStorage.removeItem(NICKNAME_KEY);
        }
        if (response.status === 403) {
          localStorage.removeItem(CONVERSATION_ID_KEY);
        }
        throw new Error(errBody.message || activeErrors.distracted);
      }

      userPersisted = true;

      if (!response.body) {
        throw new Error(activeErrors.network);
      }

      await readAgentStream(
        response.body,
        (event) => {
          if (event.type === "token") {
            assistantContent += event.text;
            if (!raf) raf = requestAnimationFrame(flushAssistant);
            return;
          }
          if (event.type === "navigate") {
            if (event.internal) {
              router.push(event.href);
            } else {
              window.location.assign(withBasePath(event.href));
            }
            return;
          }
          if (event.type === "error") {
            throw new Error(event.message || activeErrors.distracted);
          }
        },
        abort.signal
      );

      if (raf) cancelAnimationFrame(raf);
      if (assistantContent) flushAssistant();

      // user / assistant 均由 /api/chat 写入，前端只做乐观展示。
    } catch (err) {
      if (raf) cancelAnimationFrame(raf);
      if (isAbortError(err) || abort.signal.aborted) {
        return;
      }
      if (assistantContent) flushAssistant();
      setMessages((prev) =>
        prev.filter((m) => {
          if (m.id === assistantId && !m.content) return false;
          if (!userPersisted && m.id === userMessage.id) return false;
          return true;
        })
      );
      setError(
        err instanceof Error ? err.message : activeErrors.distracted
      );
    } finally {
      if (abortRef.current === abort) {
        abortRef.current = null;
        setIsStreaming(false);
      }
    }
  };

  /** 钉住时强制展开；钉住期间不允许收起 */
  const handleSetPinned = (val: boolean) => {
    setIsPinned(val);
    if (val) setIsExpanded(true);
  };

  /** 已钉住时忽略收起请求 */
  const handleSetExpanded = (val: boolean) => {
    if (isPinned && !val) return;
    setIsExpanded(val);
  };

  return {
    messages,
    input,
    setInput,
    sendMessage,
    isStreaming,
    error,
    hydrated,
    isExpanded,
    setIsExpanded: handleSetExpanded,
    isPinned,
    setIsPinned: handleSetPinned,
    startNewConversation,
  };
}
