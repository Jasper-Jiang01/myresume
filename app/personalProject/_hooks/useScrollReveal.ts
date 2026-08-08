"use client";

/**
 * Hook 名称：useScrollReveal
 * Hook 描述：基于 GSAP + ScrollTrigger 实现的滚动进场浮现动画。
 *            元素进入视口时，从「向下偏移 + 透明」过渡到「原位 + 不透明」，
 *            缓动曲线对标原站 WebGL 插值惯性的观感（先快后缓的阻尼感）。
 * 用法：const ref = useScrollReveal<HTMLDivElement>({ delay: 0.1 });
 *      <div ref={ref}>...</div>
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

type UseScrollRevealOptions = {
  /** 进场延迟（秒），用于多张卡片依次错开（stagger） */
  delay?: number;
  /** 初始位移距离（px），默认 24 */
  distance?: number;
  /** 动画时长（秒），默认 0.8 */
  duration?: number;
};

export function useScrollReveal<T extends HTMLElement>({
  delay = 0,
  distance = 24,
  duration = 0.8,
}: UseScrollRevealOptions = {}) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 尊重用户的「减少动态效果」系统偏好，直接显示无动画
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    if (!registered) {
      gsap.registerPlugin(ScrollTrigger);
      registered = true;
    }

    gsap.set(el, { opacity: 0, y: distance });

    const tween = gsap.to(el, {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease: "power3.out", // 先快后缓的阻尼感，呼应原站插值惯性观感
      scrollTrigger: {
        trigger: el,
        start: "top 88%", // 元素顶部进入视口 88% 位置时触发，避免临进入就急促播放
        toggleActions: "play none none none",
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [delay, distance, duration]);

  return ref;
}
