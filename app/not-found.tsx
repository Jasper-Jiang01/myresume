"use client";

import Link from "next/link";
import { usePreferences } from "@/components/preferences/PreferencesProvider";

export default function NotFound() {
  const { messages } = usePreferences();

  return (
    <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:px-8 sm:py-16">
      <div className="flex flex-col items-center gap-4 text-center sm:gap-6">
        <span className="text-5xl font-bold text-primary sm:text-6xl">404</span>
        <h1 className="text-title font-medium text-primary">
          {messages.notFound.title}
        </h1>
        <p className="max-w-sm text-body text-muted">
          {messages.notFound.body}
        </p>
        <Link
          href="/home"
          className="mt-2 rounded-chip bg-[var(--btn-bg)] px-5 py-2 text-body text-[var(--btn-fg)] transition-opacity hover:opacity-80"
        >
          {messages.notFound.back}
        </Link>
      </div>
    </main>
  );
}
