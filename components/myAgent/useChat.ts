import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabaseClient";
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
  error: string | null;
  nickname: string | null;
  showNicknameModal: boolean;
  submitNickname: (name: string) => Promise<void>;
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
  isPinned: boolean;
  setIsPinned: (val: boolean) => void;
  loadHistory: () => Promise<void>;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const deviceIdRef = useRef<string>("");

  // Initialize device id and nickname
  useEffect(() => {
    deviceIdRef.current = getDeviceId();
    const storedNick = localStorage.getItem(NICKNAME_KEY);
    if (storedNick) {
      setNickname(storedNick);
    } else {
      setShowNicknameModal(true);
    }
  }, []);

  // Load history when conversation id exists
  const loadHistory = useCallback(async () => {
    if (typeof window === "undefined") return;
    const convId = localStorage.getItem(CONVERSATION_ID_KEY);
    if (!convId) return;

    const { data, error: dbError } = await supabase
      .from("messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (dbError) {
      setError("加载历史记录失败");
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
  }, []);

  // Auto load history on mount if already has conversation
  useEffect(() => {
    if (nickname) {
      loadHistory();
    }
  }, [nickname, loadHistory]);

  const submitNickname = async (name: string) => {
    const deviceId = deviceIdRef.current;
    if (!deviceId) throw new Error("设备 ID 初始化失败");

    // Check uniqueness
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("nickname", name)
      .maybeSingle();

    if (existing) {
      throw new Error("该昵称已被使用");
    }

    const { error: insertErr } = await supabase
      .from("profiles")
      .insert({ id: deviceId, nickname: name });

    if (insertErr) {
      throw new Error("创建个人信息失败");
    }

    localStorage.setItem(NICKNAME_KEY, name);
    setNickname(name);
    setShowNicknameModal(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;
    setError(null);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);
    setIsExpanded(true);

    const deviceId = deviceIdRef.current;
    let conversationId = localStorage.getItem(CONVERSATION_ID_KEY);

    try {
      // Ensure conversation exists
      if (!conversationId) {
        const { data: convData, error: convErr } = await supabase
          .from("conversations")
          .insert({ profile_id: deviceId })
          .select("id")
          .single();

        if (convErr || !convData) {
          throw new Error("创建对话超时，请检查 Supabase 连接后重试");
        }
        conversationId = convData.id as string;
        localStorage.setItem(CONVERSATION_ID_KEY, conversationId);
      }

      // Save user message
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        role: "user",
        content: userMessage.content,
      });

      // Build plain messages for API
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
        body: JSON.stringify({ messages: history, conversationId }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.message || "Alii 走神了，晚点再来试试吧…");
      }

      if (!response.body) {
        throw new Error("网络连接中断，请检查网络后重试");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      const assistantId = crypto.randomUUID();

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

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

      // Save assistant message
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        role: "assistant",
        content: assistantContent,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Alii 走神了，晚点再来试试吧…");
    } finally {
      setIsStreaming(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    sendMessage,
    isStreaming,
    error,
    nickname,
    showNicknameModal,
    submitNickname,
    isExpanded,
    setIsExpanded,
    isPinned,
    setIsPinned,
    loadHistory,
  };
}
