"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { getMessages, type Messages } from "@/lib/i18n/messages";
import {
  applyLocale,
  applyTheme,
  persistLocale,
  persistTheme,
} from "@/lib/preferences/apply";
import { runPreferenceTransition } from "@/lib/preferences/transition";
import { LANGUAGE_KEY, THEME_KEY } from "@/lib/preferences/types";
import type { Locale, Theme } from "@/lib/preferences/types";

type PreferencesContextValue = {
  theme: Theme;
  locale: Locale;
  messages: Messages;
  setTheme: (theme: Theme) => void;
  setLocale: (locale: Locale) => void;
  toggleTheme: () => void;
  toggleLocale: () => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_KEY && (event.newValue === "light" || event.newValue === "dark")) {
      applyTheme(event.newValue);
      emit();
    }
    if (event.key === LANGUAGE_KEY && (event.newValue === "zh" || event.newValue === "en")) {
      applyLocale(event.newValue);
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getThemeSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getLocaleSnapshot(): Locale {
  return document.documentElement.lang.startsWith("en") ? "en" : "zh";
}

function getThemeServerSnapshot(): Theme {
  return "light";
}

function getLocaleServerSnapshot(): Locale {
  return "zh";
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribe,
    getThemeSnapshot,
    getThemeServerSnapshot
  );
  const locale = useSyncExternalStore(
    subscribe,
    getLocaleSnapshot,
    getLocaleServerSnapshot
  );

  const setTheme = useCallback((next: Theme) => {
    const current: Theme = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
    if (current === next) return;
    runPreferenceTransition(() => {
      persistTheme(next);
      emit();
    });
  }, []);

  const setLocale = useCallback((next: Locale) => {
    const current: Locale = document.documentElement.lang.startsWith("en")
      ? "en"
      : "zh";
    if (current === next) return;
    runPreferenceTransition(() => {
      persistLocale(next);
      emit();
    });
  }, []);

  const toggleTheme = useCallback(() => {
    const next: Theme =
      document.documentElement.classList.contains("dark") ? "light" : "dark";
    runPreferenceTransition(() => {
      persistTheme(next);
      emit();
    });
  }, []);

  const toggleLocale = useCallback(() => {
    const next: Locale = document.documentElement.lang.startsWith("en")
      ? "zh"
      : "en";
    runPreferenceTransition(() => {
      persistLocale(next);
      emit();
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      locale,
      messages: getMessages(locale),
      setTheme,
      setLocale,
      toggleTheme,
      toggleLocale,
    }),
    [theme, locale, setTheme, setLocale, toggleTheme, toggleLocale]
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return ctx;
}
