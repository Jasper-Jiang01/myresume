import {
  LANGUAGE_KEY,
  THEME_KEY,
  type Locale,
  type Theme,
} from "./types";

export function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

export function isLocale(value: string | null): value is Locale {
  return value === "zh" || value === "en";
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

export function applyLocale(locale: Locale) {
  document.documentElement.lang = locale === "en" ? "en" : "zh-CN";
}

export function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (isTheme(stored)) return stored;
  } catch {
    /* private mode / blocked storage */
  }
  return "light";
}

export function readStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    /* private mode / blocked storage */
  }
  return "zh";
}

function readDomTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function persistTheme(theme: Theme) {
  if (readDomTheme() === theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
    return;
  }

  applyTheme(theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
}

function readDomLocale(): Locale {
  return document.documentElement.lang.startsWith("en") ? "en" : "zh";
}

export function persistLocale(locale: Locale) {
  if (readDomLocale() === locale) {
    try {
      localStorage.setItem(LANGUAGE_KEY, locale);
    } catch {
      /* ignore */
    }
    return;
  }

  applyLocale(locale);
  try {
    localStorage.setItem(LANGUAGE_KEY, locale);
  } catch {
    /* ignore */
  }
}

/**
 * 在 React 水合前同步 html class / lang，避免主题闪白。
 * 与 Alii 作品集一致：localStorage key 为 theme / language。
 */
export const PREFERENCES_BOOTSTRAP_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});if(t!=="light"&&t!=="dark")t="light";var l=localStorage.getItem(${JSON.stringify(LANGUAGE_KEY)});if(l!=="en"&&l!=="zh")l="zh";var r=document.documentElement;r.classList.remove("light","dark");r.classList.add(t);r.style.colorScheme=t;r.lang=l==="en"?"en":"zh-CN";}catch(e){}})();`;
