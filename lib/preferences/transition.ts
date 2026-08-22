"use client";

import { flushSync } from "react-dom";

const FADE_MS = 180;
let fadeToken = 0;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function fadeThen(update: () => void) {
  const root = document.documentElement;
  const overlay = document.querySelector(".theme-fade-overlay");
  const token = ++fadeToken;
  const previousBg = getComputedStyle(root).getPropertyValue("--bg").trim();
  if (overlay instanceof HTMLElement && previousBg) {
    overlay.style.background = previousBg;
  }
  root.classList.add("theme-fading");

  window.setTimeout(() => {
    if (token !== fadeToken) return;
    flushSync(update);
    requestAnimationFrame(() => {
      if (token !== fadeToken) return;
      root.classList.remove("theme-fading");
      window.setTimeout(() => {
        if (token !== fadeToken) return;
        if (overlay instanceof HTMLElement) overlay.style.background = "";
      }, FADE_MS);
    });
  }, FADE_MS);
}

/**
 * 主题 / 语言切换共用：优先 View Transition 透明度交叉淡入淡出，
 * 不支持时用背景遮罩淡入 → 提交 → 淡出。
 */
export function runPreferenceTransition(update: () => void) {
  if (prefersReducedMotion()) {
    update();
    return;
  }

  const doc = document as Document & {
    startViewTransition?: (updateCallback: () => void) => unknown;
  };

  if (typeof doc.startViewTransition === "function") {
    doc.startViewTransition(() => {
      flushSync(update);
    });
    return;
  }

  fadeThen(update);
}
