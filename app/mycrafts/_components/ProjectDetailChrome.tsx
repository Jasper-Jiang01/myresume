"use client";

import Link from "next/link";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { pickText, type LocalizedText } from "@/lib/i18n/locale";

export function ProjectDetailChrome({
  title,
  category,
  description,
}: {
  title: string;
  category: string;
  description: LocalizedText;
}) {
  const { locale, messages } = usePreferences();

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-4 backdrop-blur-sm sm:px-8 sm:py-6">
        <Link
          href="/mycrafts"
          className="text-body font-medium text-muted no-underline transition-colors hover:text-primary"
        >
          {messages.backToWork}
        </Link>
        <div className="flex flex-col items-end">
          <span className="text-body font-medium text-primary">{title}</span>
          <span className="text-sm text-muted">{category}</span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1400px] px-4 pb-4 sm:px-8">
        <p className="text-body leading-relaxed text-muted">
          {pickText(locale, description)}
        </p>
      </div>
    </>
  );
}

export function ProjectMissing() {
  const { messages } = usePreferences();
  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="text-body text-muted">{messages.projectMissing}</p>
      <Link
        href="/mycrafts"
        className="text-body font-medium text-primary underline underline-offset-4"
      >
        {messages.backToCrafts}
      </Link>
    </div>
  );
}
