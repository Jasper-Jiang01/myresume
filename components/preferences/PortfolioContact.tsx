"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { contact, pageCopy } from "@/app/personalProject/_content/projects";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { pickText } from "@/lib/i18n/locale";
import { withBasePath } from "@/lib/paths";

const icons = {
  wechat: "/assets/chip-wechat.svg",
  email: "/assets/chip-email.svg",
} as const;

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }
}

function ContactCopy({
  copied,
  label,
  copiedLabel,
  iconSrc,
  onClick,
}: {
  copied: boolean;
  label: string;
  copiedLabel: string;
  iconSrc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-copied={copied ? "" : undefined}
      onClick={onClick}
      aria-label={copied ? copiedLabel : label}
      className="group/contact inline-flex h-7 items-center gap-0 rounded-[6px] border-[0.5px] border-transparent bg-transparent px-1.5 text-xs text-primary transition-[gap,padding,background-color,border-color] duration-200 ease-out hover:gap-1.5 hover:border-stroke hover:bg-[var(--card-glass)] hover:px-2 hover:backdrop-blur-sm focus-visible:gap-1.5 focus-visible:border-stroke focus-visible:bg-[var(--card-glass)] focus-visible:px-2 focus-visible:outline-none data-[copied]:border-stroke data-[copied]:bg-[var(--card-glass)] data-[copied]:backdrop-blur-sm"
    >
      <span className="relative grid size-4 shrink-0 place-items-center">
        <Image
          src={withBasePath(iconSrc)}
          alt=""
          width={16}
          height={16}
          aria-hidden
          className={`size-4 transition duration-200 ease-out motion-reduce:transition-none dark:brightness-0 dark:invert ${
            copied ? "scale-50 opacity-0" : "scale-100 opacity-100"
          }`}
        />
        <Check
          aria-hidden
          className={`absolute size-3.5 transition duration-200 ease-out motion-reduce:transition-none ${
            copied ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        />
      </span>
      <span
        className="grid grid-cols-[0fr] opacity-0 transition-[grid-template-columns,opacity] duration-200 ease-out motion-reduce:transition-none group-hover/contact:grid-cols-[1fr] group-hover/contact:opacity-100 group-focus-visible/contact:grid-cols-[1fr] group-focus-visible/contact:opacity-100"
      >
        <span className="min-w-0 overflow-hidden whitespace-nowrap leading-none">{label}</span>
      </span>
    </button>
  );
}

export function PortfolioContact() {
  const { locale } = usePreferences();
  const [copied, setCopied] = useState<"wechat" | "email" | null>(null);
  const copiedLabel = pickText(locale, pageCopy.copied);

  const handleCopy = useCallback(async (key: "wechat" | "email", value: string) => {
    const ok = await copyText(value);
    if (!ok) return;
    setCopied(key);
    window.setTimeout(() => {
      setCopied((current) => (current === key ? null : current));
    }, 1800);
  }, []);

  return (
    <div className="flex items-center gap-1">
      <ContactCopy
        copied={copied === "wechat"}
        label={pickText(locale, pageCopy.getWechat)}
        copiedLabel={copiedLabel}
        iconSrc={icons.wechat}
        onClick={() => handleCopy("wechat", contact.wechat)}
      />
      <ContactCopy
        copied={copied === "email"}
        label={pickText(locale, pageCopy.getEmail)}
        copiedLabel={copiedLabel}
        iconSrc={icons.email}
        onClick={() => handleCopy("email", contact.email)}
      />
      <span className="sr-only" aria-live="polite">
        {copied ? copiedLabel : ""}
      </span>
    </div>
  );
}
