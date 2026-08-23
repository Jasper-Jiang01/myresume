import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { withBasePath } from "@/lib/paths";
import { MAX_USER_CONTENT_CHARS } from "./limits";
import { readAgentStream } from "./stream";
import type { Message } from "./types";

const DEVICE_ID_KEY = "myAgent_device_id";
const NICKNAME_KEY = "myAgent_nickname";
const CONVERSATION_ID_KEY = "myAgent_conversation_id";

function isAbortError(err: unknown): boolean {
  return (
    (err instanceof DOMException || err instanceof Error) &&
    err.name === "AbortError"
  );
}

function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

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

  const startNewConversation = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    localStorage.removeItem(CONVERSATION_ID_KEY);
    setMessages([]);
    setError(null);
    setIsStreaming(false);
  }, []);

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

  const handleSetPinned = (val: boolean) => {
    setIsPinned(val);
    if (val) setIsExpanded(true);
  };

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
