"use client";

import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
} from "react";
import "./BorderGlow.css";

type BorderGlowProps = {
  children: ReactNode;
  className?: string;
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  animated?: boolean;
  colors?: string[];
  fillOpacity?: number;
};

type GlowStyle = CSSProperties & Record<`--${string}`, string | number>;

function parseHSL(hslString: string) {
  const match = hslString.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 40, s: 80, l: 80 };

  return {
    h: Number.parseFloat(match[1]),
    s: Number.parseFloat(match[2]),
    l: Number.parseFloat(match[3]),
  };
}

function buildGlowVars(glowColor: string, intensity: number) {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const keys = ["", "-60", "-50", "-40", "-30", "-20", "-10"];
  const variables: GlowStyle = {};

  opacities.forEach((opacity, index) => {
    variables[`--glow-color${keys[index]}`] =
      `hsl(${base} / ${Math.min(opacity * intensity, 100)}%)`;
  });

  return variables;
}

const gradientPositions = [
  "80% 55%",
  "69% 34%",
  "8% 6%",
  "41% 38%",
  "86% 85%",
  "82% 18%",
  "51% 4%",
];
const gradientKeys = [
  "--gradient-one",
  "--gradient-two",
  "--gradient-three",
  "--gradient-four",
  "--gradient-five",
  "--gradient-six",
  "--gradient-seven",
] as const;
const colorMap = [0, 1, 2, 0, 1, 2, 1];

function buildGradientVars(colors: string[]) {
  const palette = colors.length > 0 ? colors : ["#c084fc"];
  const variables: GlowStyle = {};

  gradientKeys.forEach((key, index) => {
    const color = palette[Math.min(colorMap[index], palette.length - 1)];
    variables[key] =
      `radial-gradient(at ${gradientPositions[index]}, ${color} 0px, transparent 50%)`;
  });
  variables["--gradient-base"] = `linear-gradient(${palette[0]} 0 100%)`;

  return variables;
}

const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);
const easeInCubic = (value: number) => value * value * value;

export function BorderGlow({
  children,
  className = "",
  edgeSensitivity = 30,
  glowColor = "40 80 80",
  backgroundColor = "#120f17",
  borderRadius = 28,
  glowRadius = 40,
  glowIntensity = 1,
  coneSpread = 25,
  animated = false,
  colors = ["#c084fc", "#f472b6", "#38bdf8"],
  fillOpacity = 0.5,
}: BorderGlowProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const getCenter = useCallback((element: HTMLElement) => {
    const { width, height } = element.getBoundingClientRect();
    return [width / 2, height / 2] as const;
  }, []);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const [centerX, centerY] = getCenter(card);
      const deltaX = x - centerX;
      const deltaY = y - centerY;
      const scaleX = deltaX === 0 ? Number.POSITIVE_INFINITY : centerX / Math.abs(deltaX);
      const scaleY = deltaY === 0 ? Number.POSITIVE_INFINITY : centerY / Math.abs(deltaY);
      const edge = Math.min(Math.max(1 / Math.min(scaleX, scaleY), 0), 1);
      let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
      if (angle < 0) angle += 360;

      card.style.setProperty("--edge-proximity", (edge * 100).toFixed(3));
      card.style.setProperty("--cursor-angle", `${angle.toFixed(3)}deg`);
    },
    [getCenter],
  );

  useEffect(() => {
    const card = cardRef.current;
    if (!animated || !card) return;

    const animationFrames = new Set<number>();
    const timeouts = new Set<ReturnType<typeof setTimeout>>();
    const animateValue = ({
      start = 0,
      end = 100,
      duration,
      delay = 0,
      ease,
      onUpdate,
      onEnd,
    }: {
      start?: number;
      end?: number;
      duration: number;
      delay?: number;
      ease: (value: number) => number;
      onUpdate: (value: number) => void;
      onEnd?: () => void;
    }) => {
      const timeout = setTimeout(() => {
        const startedAt = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - startedAt) / duration, 1);
          onUpdate(start + (end - start) * ease(progress));
          if (progress < 1) {
            const frame = requestAnimationFrame(tick);
            animationFrames.add(frame);
          } else {
            onEnd?.();
          }
        };
        const frame = requestAnimationFrame(tick);
        animationFrames.add(frame);
      }, delay);
      timeouts.add(timeout);
    };

    const angleStart = 110;
    const angleEnd = 465;
    card.classList.add("sweep-active");
    card.style.setProperty("--cursor-angle", `${angleStart}deg`);

    animateValue({
      duration: 500,
      ease: easeOutCubic,
      onUpdate: (value) => card.style.setProperty("--edge-proximity", `${value}`),
    });
    animateValue({
      duration: 1500,
      ease: easeInCubic,
      end: 50,
      onUpdate: (value) =>
        card.style.setProperty(
          "--cursor-angle",
          `${(angleEnd - angleStart) * (value / 100) + angleStart}deg`,
        ),
    });
    animateValue({
      start: 50,
      duration: 2250,
      delay: 1500,
      ease: easeOutCubic,
      onUpdate: (value) =>
        card.style.setProperty(
          "--cursor-angle",
          `${(angleEnd - angleStart) * (value / 100) + angleStart}deg`,
        ),
    });
    animateValue({
      start: 100,
      end: 0,
      duration: 1500,
      delay: 2500,
      ease: easeInCubic,
      onUpdate: (value) => card.style.setProperty("--edge-proximity", `${value}`),
      onEnd: () => card.classList.remove("sweep-active"),
    });

    return () => {
      timeouts.forEach(clearTimeout);
      animationFrames.forEach(cancelAnimationFrame);
      card.classList.remove("sweep-active");
    };
  }, [animated]);

  const style: GlowStyle = {
    "--card-bg": backgroundColor,
    "--edge-sensitivity": edgeSensitivity,
    "--border-radius": `${borderRadius}px`,
    "--glow-padding": `${glowRadius}px`,
    "--cone-spread": coneSpread,
    "--fill-opacity": fillOpacity,
    ...buildGlowVars(glowColor, glowIntensity),
    ...buildGradientVars(colors),
  };

  return (
    <div
      ref={cardRef}
      className={`border-glow-card ${className}`.trim()}
      style={style}
      onPointerMove={handlePointerMove}
    >
      <span className="edge-light" aria-hidden="true" />
      <div className="border-glow-inner">{children}</div>
    </div>
  );
}
