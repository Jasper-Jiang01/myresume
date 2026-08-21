"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useChat } from "./useChat";

// ─── Inline SVG Icons ───
const SendIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const PinIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="17" x2="12" y2="22" />
    <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z" />
  </svg>
);

export default function ChatWidget() {
  const {
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
  } = useChat();

  const [nicknameInput, setNicknameInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleNicknameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicknameInput.trim()) return;
    try {
      await submitNickname(nicknameInput.trim());
    } catch (err) {
      alert(err instanceof Error ? err.message : "提交昵称失败");
    }
  };

  return (
    <section
      aria-label="AI 对话"
      className="fixed bottom-12 left-1/2 z-50 hidden -translate-x-1/2 md:block"
    >
      <motion.div
        layout
        className="relative flex flex-col justify-end overflow-hidden rounded-2xl border border-gray-200/60 bg-white/80 font-sans shadow-[0_4px_36px_12px_rgba(0,0,0,0.08)] backdrop-blur-[24px] backdrop-saturate-150"
        animate={{
          width: isExpanded ? 560 : 480,
          transition: { duration: 0.36, ease: [0.16, 1, 0.3, 1] },
        }}
      >
        {/* ── Message List ── */}
        <motion.div
          animate={{
            height: isExpanded ? 320 : 0,
            opacity: isExpanded ? 1 : 0,
          }}
          transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
          className="min-h-0 overflow-hidden"
        >
          <div className="flex h-full flex-col gap-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <p className="select-none text-center text-sm text-gray-400">
                开始一段新对话吧
              </p>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gray-900 text-white"
                      : "bg-white/60 text-gray-900 shadow-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isStreaming && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl bg-white/60 px-3.5 py-2 text-sm text-gray-500 shadow-sm">
                  <span className="inline-block animate-pulse">正在思考…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </motion.div>

        {/* ── Input Area ── */}
        <div className="relative flex w-full shrink-0 flex-col gap-2 rounded-[15px] border-t border-gray-200/60 bg-white/60 px-3 py-3">
          {/* Controls */}
          <div className="absolute right-3 top-3 flex items-center gap-1">
            <button
              onClick={() => setIsPinned(!isPinned)}
              className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              title={isPinned ? "取消常驻" : "常驻展开"}
            >
              <PinIcon />
            </button>
            <button
              onClick={() => {
                if (!isPinned) setIsExpanded(!isExpanded);
              }}
              disabled={isPinned}
              className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
              title={isExpanded ? "收起" : "展开"}
            >
              {isExpanded ? <ChevronDownIcon /> : <ChevronUpIcon />}
            </button>
          </div>

          {/* Nickname Modal */}
          <AnimatePresence>
            {showNicknameModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-[15px] bg-white/90 backdrop-blur-sm"
              >
                <p className="mb-2 text-sm font-medium text-gray-700">
                  取个昵称再开始吧
                </p>
                <form
                  onSubmit={handleNicknameSubmit}
                  className="flex w-3/4 gap-2"
                >
                  <input
                    value={nicknameInput}
                    onChange={(e) => setNicknameInput(e.target.value)}
                    placeholder="1~20 个字符"
                    maxLength={20}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none transition-colors focus:border-gray-500"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm text-white transition-colors hover:bg-gray-800"
                  >
                    开始
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-600"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Row */}
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={
                nickname ? "输入你想说的话…" : "请先设置昵称"
              }
              disabled={!nickname || isStreaming}
              rows={1}
              className="max-h-24 flex-1 resize-none rounded-xl border border-gray-300 bg-white/80 px-3 py-2 text-sm outline-none transition-colors focus:border-gray-500 disabled:bg-gray-100"
            />
            <button
              onClick={sendMessage}
              disabled={!nickname || !input.trim() || isStreaming}
              className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white transition-opacity hover:bg-gray-800 disabled:opacity-40"
              aria-label="发送"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
