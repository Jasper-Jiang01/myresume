"use client";

import { p5i } from "p5i";
import { useLayoutEffect, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const {
  mount,
  unmount,
  createCanvas,
  background,
  noFill,
  stroke,
  noise,
  noiseSeed,
  resizeCanvas,
  cos,
  sin,
  TWO_PI,
} = p5i();

const SCALE = 200;
const LENGTH = 10;
const SPACING = 15;
const VIEW_BUFFER = SPACING * 4;

function getForceOnPoint(x: number, y: number, z: number) {
  return (noise(x / SCALE, y / SCALE, z) - 0.5) * 2 * TWO_PI;
}

/** 由坐标决定透明度，滚动裁剪后重新生成同一格点时观感稳定。 */
function opacityFor(x: number, y: number) {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return (n - Math.floor(n)) * 0.5 + 0.5;
}

function viewportPointBudget(w: number, h: number) {
  const cols = Math.ceil(w / SPACING) + 3;
  const rows = Math.ceil((h + VIEW_BUFFER * 2) / SPACING) + 3;
  return cols * rows;
}

export default function ArtDots() {
  const elRef = useRef<HTMLDivElement | null>(null);
  const points = useRef<{ x: number; y: number; opacity: number }[]>([]);
  const sizeRef = useRef({ w: 0, h: 0 });
  const offsetYRef = useRef(0);
  const syncPointsRef = useRef<() => void>(() => {});
  const pathname = usePathname();

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    // 尊重用户的「减少动态效果」系统偏好：命中时时间参数固定，
    // 点阵渲染为静止的一帧而非持续噪声运动，仍保留装饰性视觉但不产生动效
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    sizeRef.current = {
      w: window.innerWidth,
      h: window.innerHeight,
    };
    offsetYRef.current = window.scrollY;

    // 只保留当前视口附近的点。详情页很长时若按整页高度累加，
    // 返回短页面后每帧仍会遍历数十万点，造成明显卡顿。
    const syncPoints = () => {
      const { w, h } = sizeRef.current;
      const offsetY = offsetYRef.current;
      const yMin = offsetY - VIEW_BUFFER;
      const yMax = offsetY + h + VIEW_BUFFER;
      const y0 = -SPACING / 2;
      const startN = Math.ceil((yMin - y0) / SPACING);
      const next: { x: number; y: number; opacity: number }[] = [];

      for (let x = -SPACING / 2; x < w + SPACING; x += SPACING) {
        for (let y = y0 + startN * SPACING; y < yMax + SPACING; y += SPACING) {
          next.push({ x, y, opacity: opacityFor(x, y) });
        }
      }
      points.current = next;
    };
    syncPointsRef.current = syncPoints;

    const palette = () =>
      document.documentElement.classList.contains("dark")
        ? { bg: "#121318", stroke: [140, 140, 150] as const }
        : { bg: "#ffffff", stroke: [200, 200, 200] as const };

    const setup = () => {
      const { w, h } = sizeRef.current;
      createCanvas(w, h);
      background(palette().bg);
      stroke("#ccc");
      noFill();
      noiseSeed(+new Date());
      syncPoints();
    };

    const draw = ({
      circle,
    }: {
      circle: (x: number, y: number, d: number) => void;
    }) => {
      const { w, h } = sizeRef.current;
      offsetYRef.current = window.scrollY;
      if (points.current.length > viewportPointBudget(w, h)) {
        syncPoints();
      }

      const { bg, stroke: strokeRgb } = palette();
      background(bg);
      // 固定时间参数 → noise 输出恒定，画面静止不再持续变化
      const t = prefersReducedMotion ? 0 : +new Date() / 10000;
      const offsetY = offsetYRef.current;

      for (const p of points.current) {
        const { x, y } = p;
        const rad = getForceOnPoint(x, y, t);
        const length = (noise(x / SCALE, y / SCALE, t * 2) + 0.5) * LENGTH;
        const nx = x + cos(rad) * length;
        const ny = y + sin(rad) * length;
        stroke(
          strokeRgb[0],
          strokeRgb[1],
          strokeRgb[2],
          (Math.abs(cos(rad)) * 0.8 + 0.2) * p.opacity * 255,
        );
        circle(nx, ny - offsetY, 1);
      }
    };

    mount(el, { setup, draw });

    const canvas = el.querySelector("canvas");
    if (canvas) {
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";
    }

    const handleResize = () => {
      sizeRef.current = {
        w: window.innerWidth,
        h: window.innerHeight,
      };
      resizeCanvas(sizeRef.current.w, sizeRef.current.h);
      syncPoints();
    };

    let scrollRaf = 0;
    const handleScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        offsetYRef.current = window.scrollY;
        syncPoints();
      });
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      syncPointsRef.current = () => {};
      unmount();
    };
  }, []);

  useLayoutEffect(() => {
    offsetYRef.current = window.scrollY;
    syncPointsRef.current();
  }, [pathname]);

  return (
    <div
      ref={elRef}
      className="pointer-events-none fixed inset-0 z-0 h-[100dvh] w-screen"
      aria-hidden
    />
  );
}
