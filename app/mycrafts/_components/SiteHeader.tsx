"use client";

import Link from "next/link";
import { usePreferences } from "@/components/preferences/PreferencesProvider";

export function SiteHeader() {
  const { messages } = usePreferences();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6">
      <Link
        href="/"
        className="text-body font-medium text-primary no-underline transition-opacity hover:opacity-60"
      >
        Jiang Wenze
      </Link>

      <nav className="flex items-center gap-6">
        <Link
          href="/"
          className="text-body text-muted no-underline transition-colors hover:text-primary"
        >
          {messages.nav.work}
        </Link>
        <Link
          href="/home"
          className="text-body text-muted no-underline transition-colors hover:text-primary"
        >
          {messages.nav.info}
        </Link>
      </nav>
    </header>
  );
}
