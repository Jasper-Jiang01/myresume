"use client";

import React, { useEffect, useRef, useState } from "react";
import { useChat } from "./useChat";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

function ExpandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.75 20C10.75 20.4142 10.4142 20.75 10 20.75H4.5C3.80964 20.75 3.25 20.1904 3.25 19.5V14C3.25 13.5858 3.58579 13.25 4 13.25L4.07223 13.2534C4.45256 13.2898 4.75 13.6102 4.75 14V18.1893L9.21967 13.7197C9.51256 13.4268 9.98743 13.4268 10.2803 13.7197C10.5732 14.0126 10.5732 14.4874 10.2803 14.7803L5.81066 19.25H10C10.4142 19.25 10.75 19.5858 10.75 20ZM13.25 3.99995C13.25 3.5858 13.5858 3.24995 14 3.24995H19.4999C20.1904 3.24995 20.75 3.8096 20.75 4.50005V10C20.75 10.4142 20.4142 10.75 20 10.75L19.9277 10.7466C19.5475 10.7102 19.25 10.3898 19.25 10V5.81066L14.7803 10.2803C14.4874 10.5732 14.0126 10.5732 13.7197 10.2803C13.4268 9.98744 13.4268 9.51257 13.7197 9.21967L18.1893 4.74995H14C13.5858 4.74995 13.25 4.41425 13.25 3.99995Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CollapseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.75 10C20.75 10.4142 20.4143 10.75 20 10.75L14.5001 10.75C13.8097 10.75 13.25 10.1903 13.25 9.4999L13.25 3.99996C13.25 3.58573 13.5858 3.24996 14 3.24996L14.0723 3.25339C14.4526 3.28972 14.75 3.6101 14.75 3.99995L14.75 8.18929L19.2197 3.71962C19.5126 3.42673 19.9875 3.42673 20.2804 3.71962C20.5733 4.01251 20.5733 4.48738 20.2804 4.78028L15.8107 9.25L20 9.25C20.4143 9.25 20.75 9.5857 20.75 10Z"
        fill="currentColor"
      />
      <path
        d="M4 13.25C3.58579 13.25 3.25 13.5858 3.25 14C3.25 14.4142 3.58579 14.75 4 14.75L8.18933 14.75L3.71967 19.2197C3.42678 19.5126 3.42678 19.9874 3.71967 20.2803C4.01257 20.5732 4.48744 20.5732 4.78033 20.2803L9.25 15.8107V20C9.25 20.3899 9.54744 20.7102 9.92777 20.7466L10 20.75C10.4142 20.75 10.75 20.4142 10.75 20L10.75 14.5C10.75 13.8096 10.1904 13.25 9.5 13.25L4 13.25Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4.08611 18.9781L8.47039 14.6489L5.98557 12.1953C5.72208 11.9351 5.54688 11.6293 5.45984 11.2778C5.37822 10.9478 5.38372 10.6175 5.4764 10.2869C5.56915 9.95646 5.73654 9.67046 5.97848 9.42889C6.23623 9.1717 6.54585 8.99849 6.90732 8.90925L9.79456 8.19649C10.0612 8.13066 10.2916 8.0018 10.4858 7.80998L13.03 5.29774L11.4517 3.73925C11.1612 3.45237 11.1611 2.98716 11.4517 2.70021C11.7422 2.41332 12.2134 2.41339 12.5039 2.70028L21.6232 11.7051C21.9138 11.992 21.9138 12.4571 21.6232 12.744C21.3326 13.031 20.8616 13.031 20.571 12.744L18.9927 11.1855L16.4485 13.6978C16.2542 13.8896 16.1238 14.1171 16.0571 14.3804L15.3353 17.2314C15.2449 17.5883 15.0695 17.894 14.809 18.1485C14.5644 18.3875 14.2748 18.5528 13.94 18.6443C13.6053 18.7359 13.2708 18.7413 12.9366 18.6607C12.5806 18.5748 12.2709 18.4017 12.0075 18.1416L9.52262 15.6879L5.13834 20.0172C4.84778 20.3041 4.37667 20.3041 4.08611 20.0172C3.79556 19.7303 3.79555 19.2651 4.08611 18.9781ZM14.0823 6.33678L11.5381 8.84902C11.1495 9.23273 10.6886 9.49039 10.1555 9.62205L7.26822 10.3347C7.08116 10.3809 6.96191 10.4957 6.91053 10.6792C6.85901 10.8626 6.90146 11.0217 7.03779 11.1563L13.0597 17.1026C13.196 17.2372 13.357 17.2791 13.5428 17.2282C13.7286 17.1774 13.8449 17.0597 13.8916 16.875L14.6134 14.024C14.7467 13.4975 15.0077 13.0424 15.3963 12.6587L17.9404 10.1465L14.0823 6.33678Z"
        fill="currentColor"
      />
    </svg>
  );
}

function NewChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M12.7022 3.97908C12.5075 4.17492 12.1909 4.17585 11.9951 3.98116C10.9399 2.93216 9.51796 2.33325 7.99999 2.33325C4.87039 2.33325 2.33333 4.87032 2.33333 7.99992C2.33333 11.1295 4.87039 13.6666 7.99999 13.6666C9.50853 13.6666 10.9224 13.0752 11.9759 12.0377C12.1726 11.844 12.4892 11.8464 12.6829 12.0431C12.8767 12.2399 12.8743 12.5565 12.6775 12.7502C11.4388 13.9701 9.77376 14.6666 7.99999 14.6666C4.31809 14.6666 1.33333 11.6818 1.33333 7.99992C1.33333 4.31802 4.31809 1.33325 7.99999 1.33325C9.78486 1.33325 11.4594 2.03855 12.7001 3.27198C12.8959 3.46667 12.8969 3.78325 12.7022 3.97908ZM5.99999 7.99992C5.99999 7.72378 6.22386 7.49992 6.49999 7.49992H11.457V6.58865C11.457 6.32955 11.7397 6.16952 11.9618 6.30282L14.3139 7.71408C14.5297 7.84355 14.5297 8.15628 14.3139 8.28575L11.9618 9.69702C11.7397 9.83032 11.457 9.67029 11.457 9.41119V8.49992H6.49999C6.22386 8.49992 5.99999 8.27605 5.99999 7.99992Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6.26735 14.6615L8.00004 14.7488H16.9862C17.8978 14.7488 18.549 14.5411 18.9397 14.1256C19.3366 13.7101 19.535 13.0682 19.535 12.2V7.93946C19.535 7.02783 19.3366 6.37666 18.9397 5.98595C18.549 5.59525 17.8978 5.3999 16.9862 5.3999H13.1443C12.9148 5.3999 12.7288 5.47432 12.5861 5.62316C12.4497 5.7658 12.3815 5.94254 12.3815 6.1534C12.3815 6.35805 12.4497 6.5348 12.5861 6.68364C12.7288 6.82627 12.9148 6.89759 13.1443 6.89759H16.9862C17.3645 6.89759 17.6311 6.97821 17.7862 7.13945C17.9474 7.3007 18.0281 7.56737 18.0281 7.93946V12.2C18.0281 12.5783 17.9474 12.848 17.7862 13.0093C17.6311 13.1705 17.3645 13.2511 16.9862 13.2511H8.00004L6.27589 13.3313L7.60004 12.2279L9.57215 10.3116C9.64037 10.2434 9.68998 10.1689 9.72099 10.0883C9.7582 10.0077 9.7768 9.91158 9.7768 9.79995C9.7768 9.58289 9.70859 9.40614 9.57215 9.26971C9.44192 9.13327 9.26517 9.06506 9.04191 9.06506C8.83106 9.06506 8.64811 9.14258 8.49307 9.29762L4.25117 13.4372C4.08372 13.5922 4 13.7783 4 13.9953C4 14.2124 4.08372 14.4015 4.25117 14.5628L8.49307 18.7024C8.64811 18.8574 8.83106 18.9349 9.04191 18.9349C9.26517 18.9349 9.44192 18.8667 9.57215 18.7303C9.70859 18.5876 9.7768 18.4078 9.7768 18.1907C9.7768 18.0853 9.7582 17.9923 9.72099 17.9117C9.68998 17.8248 9.64037 17.7473 9.57215 17.6791L7.60004 15.7721L6.26735 14.6615Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  pressed,
  children,
  className = "",
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  pressed?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex size-fit items-center justify-center rounded-[6px] p-1 text-[10px] text-[#1d1e2ba6] transition-colors hover:bg-black/[0.03] hover:text-[#1d1e2bf2] disabled:pointer-events-none disabled:opacity-35 ${className}`}
    >
      <span className="inline-flex size-4 items-center justify-center opacity-80">
        {children}
      </span>
    </button>
  );
}

export default function ChatWidget() {
  const {
    messages,
    input,
    setInput,
    sendMessage,
    isStreaming,
    isSubmittingNickname,
    error,
    nickname,
    isExpanded,
    setIsExpanded,
    isPinned,
    setIsPinned,
    startNewConversation,
  } = useChat();

  const [focused, setFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming, isExpanded]);

  const showHeader = Boolean(nickname) || isSubmittingNickname;
  const hasMessages = messages.length > 0;
  const canSend = Boolean(input.trim()) && !isStreaming && !isSubmittingNickname;

  const headerText = error
    ? error
    : isSubmittingNickname
      ? "正在记录昵称…"
      : isStreaming
        ? "正在回复…"
        : nickname
          ? "和文喆聊天"
          : "取个昵称再开始吧";

  const placeholder = !nickname
    ? focused || input
      ? "1~20个字符, 账号基于访问设备记录哦…"
      : "Ask me anything…"
    : "Ask me anything…";

  const widthClass = isExpanded
    ? "w-[560px]"
    : showHeader
      ? "w-[480px]"
      : "w-[360px]";

  const bodyHeightClass = isExpanded
    ? "h-[390px]"
    : showHeader
      ? "h-[99px]"
      : "h-[48px]";

  return (
    <section
      aria-label="和文喆聊天"
      className="fixed bottom-[48px] left-1/2 z-50 hidden origin-bottom -translate-x-1/2 md:block"
    >
      <div
        className={`relative flex flex-col justify-end overflow-hidden rounded-[16px] border border-[#1d1e2b1a] bg-white/80 font-sans shadow-[0_4px_36px_12px_rgba(29,30,43,0.1)] backdrop-blur-[24px] backdrop-saturate-150 transition-[width,background-color,border-color] duration-[360ms] ${widthClass} ${showHeader ? "bg-[#161927]/[0.02]" : ""}`}
        style={{ transitionTimingFunction: EASE }}
      >
        {/* Header — CSS grid 0fr/1fr 做展开收起 */}
        <div
          className="grid transition-[grid-template-rows] duration-[360ms]"
          style={{
            gridTemplateRows: showHeader ? "30px" : "0fr",
            transitionTimingFunction: EASE,
          }}
        >
          <div className="min-h-0 overflow-hidden">
            <header className="relative z-10 flex h-[30px] w-full shrink-0 items-center gap-1 overflow-hidden px-2 pb-0.5 pt-1 text-[14px] leading-6 text-[#1d1e2bd9]">
              <p
                className={`min-w-0 flex-1 truncate px-2 ${error ? "text-red-500" : ""}`}
                aria-live="polite"
              >
                {headerText}
              </p>
            </header>
          </div>
        </div>

        {/* Body: messages + composer */}
        <div
          className={`relative flex w-full shrink-0 flex-col rounded-[15px] border-t-[0.5px] border-[#1d1e2b1a] bg-white/80 px-3 py-3 transition-[height,border-radius] duration-[360ms] ${bodyHeightClass}`}
          style={{ transitionTimingFunction: EASE }}
        >
          {nickname && (
            <IconButton
              label={isExpanded ? "收起" : "展开"}
              disabled={isPinned && isExpanded}
              onClick={() => setIsExpanded(!isExpanded)}
              className="absolute right-3 top-3 z-10"
            >
              {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
            </IconButton>
          )}

          {isExpanded && hasMessages && (
            <div className="mb-2 min-h-0 flex-1 overflow-y-auto pr-8">
              <div className="flex flex-col gap-3 py-1">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-[14px] leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#1d1e2bf2] text-white"
                          : "bg-white/70 text-[#1d1e2bf2] shadow-sm"
                      }`}
                    >
                      {msg.content || (
                        <span className="inline-block animate-pulse text-[#1d1e2b73]">
                          …
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={placeholder}
            disabled={isSubmittingNickname || isStreaming}
            maxLength={nickname ? undefined : 20}
            rows={1}
            aria-label="输入你想对文喆说的话"
            className={`w-full resize-none bg-transparent pb-6 pl-1 pr-7 text-[16px] leading-6 text-[#1d1e2bf2] outline-none placeholder:text-[#1d1e2b73] disabled:cursor-not-allowed ${
              isExpanded && hasMessages ? "h-[72px] shrink-0" : "min-h-0 flex-1"
            }`}
          />

          <div
            className={`absolute bottom-3 left-3 flex h-6 items-center gap-1 transition-[opacity,transform] duration-200 ease-out ${
              nickname && isExpanded
                ? "translate-y-0 opacity-100 delay-100"
                : "pointer-events-none translate-y-1 opacity-0"
            }`}
          >
            <IconButton
              label="常驻展开"
              pressed={isPinned}
              onClick={() => setIsPinned(!isPinned)}
              className={isPinned ? "text-[#1d1e2bf2]" : ""}
            >
              <PinIcon />
            </IconButton>
            <IconButton label="开始新对话" onClick={startNewConversation}>
              <NewChatIcon />
            </IconButton>
          </div>

          <button
            type="button"
            aria-label="发送"
            disabled={!canSend}
            onClick={sendMessage}
            className="absolute bottom-3 right-3 inline-flex size-fit items-center justify-center rounded-[6px] bg-black/[0.03] p-1 text-[10px] text-[#1d1e2ba6] transition-colors hover:text-[#1d1e2bf2] disabled:opacity-35"
          >
            <span className="inline-flex size-4 items-center justify-center opacity-80">
              <SendIcon />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
