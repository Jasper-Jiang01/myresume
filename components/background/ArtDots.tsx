"use client";

import { p5i } from "p5i";
import { useEffect, useRef } from "react";

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

function getForceOnPoint(x: number, y: number, z: number) {
  return (noise(x / SCALE, y / SCALE, z) - 0.5) * 2 * TWO_PI;
}

export default function ArtDots() {
  const elRef = useRef<HTMLDivElement | null>(null);
  const existingPoints = useRef(new Set<string>());
  const points = useRef<{ x: number; y: number; opacity: number }[]>([]);
  const sizeRef = useRef({ w: 0, h: 0 });
  const offsetYRef = useRef(0);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    sizeRef.current = {
      w: window.innerWidth,
      h: window.innerHeight,
    };
    offsetYRef.current = window.scrollY;

    const addPoints = () => {
      const { w, h } = sizeRef.current;
      const offsetY = offsetYRef.current;

      for (let x = -SPACING / 2; x < w + SPACING; x += SPACING) {
        for (let y = -SPACING / 2; y < h + offsetY + SPACING; y += SPACING) {
          const id = `${x}-${y}`;
          if (existingPoints.current.has(id)) continue;
          existingPoints.current.add(id);
          points.current.push({ x, y, opacity: Math.random() * 0.5 + 0.5 });
        }
      }
    };

    const setup = () => {
      const { w, h } = sizeRef.current;
      createCanvas(w, h);
      background("#ffffff");
      stroke("#ccc");
      noFill();
      noiseSeed(+new Date());
      addPoints();
    };

    const draw = ({
      circle,
    }: {
      circle: (x: number, y: number, d: number) => void;
    }) => {
      background("#ffffff");
      const t = +new Date() / 10000;
      const offsetY = offsetYRef.current;

      for (const p of points.current) {
        const { x, y } = p;
        const rad = getForceOnPoint(x, y, t);
        const length = (noise(x / SCALE, y / SCALE, t * 2) + 0.5) * LENGTH;
        const nx = x + cos(rad) * length;
        const ny = y + sin(rad) * length;
        stroke(
          200,
          200,
          200,
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
      addPoints();
    };

    const handleScroll = () => {
      offsetYRef.current = window.scrollY;
      addPoints();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      unmount();
    };
  }, []);

  return (
    <div
      ref={elRef}
      className="pointer-events-none fixed inset-0 z-0 h-[100dvh] w-screen"
      aria-hidden
    />
  );
}
