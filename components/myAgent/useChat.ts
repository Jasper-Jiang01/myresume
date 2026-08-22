import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { withBasePath } from "@/lib/paths";
import { getSupabase } from "./supabaseClient";
import { decodeNavigateHeader } from "./tools";
import type { Message } from "./types";

const DEVICE_ID_KEY = "myAgent_device_id";
const NICKNAME_KEY = "myAgent_nickname";
const CONVERSATION_ID_KEY = "myAgent_conversation_id";

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
  isSubmittingNickname: boolean;
  error: string | null;
  nickname: string | null;
  hydrated: boolean;
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
  isPinned: boolean;
  setIsPinned: (val: boolean) => void;
  startNewConversation: () => void;
}

export function useChat(): UseChatReturn {
  const router = useRouter();
  const { messages: copy } = usePreferences();
  const errors = copy.chat.errors;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSubmittingNickname, setIsSubmittingNickname] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const deviceIdRef = useRef<string>("");

  useEffect(() => {
    deviceIdRef.current = getDeviceId();
    const storedNick = localStorage.getItem(NICKNAME_KEY);
    if (storedNick) setNickname(storedNick);
    setHydrated(true);
  }, []);

  const loadHistory = useCallback(async () => {
    if (typeof window === "undefined") return;
    const convId = localStorage.getItem(CONVERSATION_ID_KEY);
    const supabase = getSupabase();
    if (!convId || !supabase) return;

    const { data, error: dbError } = await supabase
      .from("messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (dbError) {
      setError(errors.history);
      return;
    }

    if (data) {
      setMessages(
        data.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          created_at: m.created_at,
        }))
      );
    }
  }, [errors.history]);

  useEffect(() => {
    if (nickname) loadHistory();
  }, [nickname, loadHistory]);

  const submitNickname = async (name: string) => {
    const trimmed = name.trim();
    if (trimmed.length < 1 || trimmed.length > 20) {
      throw new Error(errors.nicknameLength);
    }

    const deviceId = deviceIdRef.current;
    if (!deviceId) throw new Error(errors.device);

    const supabase = getSupabase();
    if (supabase) {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("nickname", trimmed)
        .maybeSingle();

      if (existing) {
        throw new Error(errors.nicknameTaken);
      }

      const { error: insertErr } = await supabase
        .from("profiles")
        .insert({ id: deviceId, nickname: trimmed });

      if (insertErr) {
        if (insertErr.code === "23505") {
          throw new Error(errors.nicknameTaken);
        }
        throw new Error(errors.profile);
      }
    }

    localStorage.setItem(NICKNAME_KEY, trimmed);
    setNickname(trimmed);
  };

  const startNewConversation = useCallback(() => {
    localStorage.removeItem(CONVERSATION_ID_KEY);
    setMessages([]);
    setError(null);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming || isSubmittingNickname) return;
    setError(null);

    if (!nickname) {
      setIsSubmittingNickname(true);
      try {
        await submitNickname(input);
        setInput("");
      } catch (err) {
        setError(err instanceof Error ? err.message : errors.profile);
      } finally {
        setIsSubmittingNickname(false);
      }
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };
    const assistantId = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setInput("");
    setIsStreaming(true);
    setIsExpanded(true);

    const deviceId = deviceIdRef.current;
    const supabase = getSupabase();
    let conversationId = localStorage.getItem(CONVERSATION_ID_KEY);

    try {
      if (supabase && !conversationId) {
        const { data: convData, error: convErr } = await supabase
          .from("conversations")
          .insert({ profile_id: deviceId })
          .select("id")
          .single();

        if (convErr || !convData) {
          throw new Error(errors.convTimeout);
        }
        conversationId = convData.id as string;
        localStorage.setItem(CONVERSATION_ID_KEY, conversationId);
      }

      if (supabase && conversationId) {
        const { error: saveErr } = await supabase.from("messages").insert({
          conversation_id: conversationId,
          role: "user",
          content: userMessage.content,
        });
        if (saveErr) {
          throw new Error(errors.save);
        }
      }

      const history = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-id": deviceId,
        },
        body: JSON.stringify({
          messages: history,
          conversationId,
          nickname,
        }),
      });

      const convFromHeader = response.headers.get("x-conversation-id");
      if (convFromHeader) {
        localStorage.setItem(CONVERSATION_ID_KEY, convFromHeader);
      }

      if (!response.ok) {
        const errBody = (await response.json().catch(() => ({}))) as {
          message?: string;
        };
        if (response.status === 429) {
          throw new Error(errors.rateLimit);
        }
        if (response.status === 401) {
          localStorage.removeItem(NICKNAME_KEY);
          setNickname(null);
        }
        throw new Error(errBody.message || errors.distracted);
      }

      if (!response.body) {
        throw new Error(errors.network);
      }

      const navigate = decodeNavigateHeader(
        response.headers.get("x-agent-navigate")
      );
      if (navigate) {
        if (navigate.internal) {
          router.push(navigate.href);
        } else {
          window.location.assign(withBasePath(navigate.href));
        }
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: assistantContent } : m
          )
        );
      }

      // Assistant 消息由 /api/chat 在流结束后写入，避免前后端重复落库。
    } catch (err) {
      setMessages((prev) =>
        prev.filter((m) => !(m.id === assistantId && !m.content))
      );
      setError(
        err instanceof Error ? err.message : errors.distracted
      );
    } finally {
      setIsStreaming(false);
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
    isSubmittingNickname,
    error,
    nickname,
    hydrated,
    isExpanded,
    setIsExpanded: handleSetExpanded,
    isPinned,
    setIsPinned: handleSetPinned,
    startNewConversation,
  };
}
