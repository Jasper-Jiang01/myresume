import type { Locale } from "@/lib/preferences/types";

export type LocalizedText = { zh: string; en: string };

export function pickText(locale: Locale, value: string | LocalizedText): string {
  return typeof value === "string" ? value : value[locale];
}
