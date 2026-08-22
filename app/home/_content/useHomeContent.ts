"use client";

import { home } from "@/app/home/_content/content";
import { usePreferences } from "@/components/preferences/PreferencesProvider";

export function useHomeContent() {
  const { locale } = usePreferences();
  return home[locale];
}
