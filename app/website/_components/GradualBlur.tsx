"use client";

import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./GradualBlur.css";

type BlurPosition = "top" | "bottom" | "left" | "right";
type BlurCurve = "linear" | "bezier" | "ease-in" | "ease-out" | "ease-in-out";

type GradualBlurProps = {
  position?: BlurPosition;
  strength?: number;
  height?: string;
  width?: string;
  divCount?: number;
  exponential?: boolean;
  curve?: BlurCurve;
  opacity?: number;
  animated?: boolean | "scroll";
  duration?: string;
  easing?: string;
  hoverIntensity?: number;
  target?: "parent" | "page";
  zIndex?: number;
  onAnimationComplete?: () => void;
  className?: string;
  style?: CSSProperties;
};

const curveFunctions: Record<BlurCurve, (progress: number) => number> = {
  linear: (progress) => progress,
  bezier: (progress) => progress * progress * (3 - 2 * progress),
  "ease-in": (progress) => progress * progress,
  "ease-out": (progress) => 1 - Math.pow(1 - progress, 2),
  "ease-in-out": (progress) =>
    progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2,
};

const gradientDirections: Record<BlurPosition, string> = {
  top: "to top",
  bottom: "to bottom",
  left: "to left",
  right: "to right",
};

export function GradualBlur({
  position = "bottom",
  strength = 2,
  height = "6rem",
  width,
  divCount = 5,
  exponential = false,
  curve = "linear",
  opacity = 1,
  animated = false,
  duration = "0.3s",
  easing = "ease-out",
  hoverIntensity,
  target = "parent",
  zIndex = 1000,
  onAnimationComplete,
  className = "",
  style,
}: GradualBlurProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(animated !== "scroll");

  useEffect(() => {
    if (animated !== "scroll") return;

    if (target === "page") {
      let previousScrollY = window.scrollY;
      let frame = 0;
      const updateVisibility = () => {
        frame = 0;
        const currentScrollY = window.scrollY;
        const scrollingDown = currentScrollY > previousScrollY + 1;
        const scrollingUp = currentScrollY < previousScrollY - 1;
        const maximumScroll = document.documentElement.scrollHeight - window.innerHeight;
        const atPageEnd = currentScrollY >= maximumScroll - 4;

        if (scrollingDown && currentScrollY > 24 && !atPageEnd) {
          setIsVisible(true);
        } else if (scrollingUp || currentScrollY <= 24 || atPageEnd) {
          setIsVisible(false);
        }
        previousScrollY = currentScrollY;
      };
      const handleScroll = () => {
        if (!frame) frame = requestAnimationFrame(updateVisibility);
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", handleScroll);
        if (frame) cancelAnimationFrame(frame);
      };
    }

    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [animated, target]);

  useEffect(() => {
    if (!isVisible || animated !== "scroll" || !onAnimationComplete) return;
    const durationValue = Number.parseFloat(duration);
    const multiplier = duration.includes("ms") ? 1 : 1000;
    const timeout = window.setTimeout(
      onAnimationComplete,
      durationValue * multiplier,
    );
    return () => window.clearTimeout(timeout);
  }, [animated, duration, isVisible, onAnimationComplete]);

  const layers = useMemo(() => {
    const result = [];
    const safeDivCount = Math.max(1, divCount);
    const increment = 100 / safeDivCount;
    const activeStrength = isHovered && hoverIntensity
      ? strength * hoverIntensity
      : strength;
    const curveFunction = curveFunctions[curve];

    for (let index = 1; index <= safeDivCount; index += 1) {
      const progress = curveFunction(index / safeDivCount);
      const blurValue = exponential
        ? Math.pow(2, progress * 4) * 0.0625 * activeStrength
        : 0.0625 * (progress * safeDivCount + 1) * activeStrength;
      const pointOne = Math.round((increment * index - increment) * 10) / 10;
      const pointTwo = Math.round(increment * index * 10) / 10;
      const pointThree = Math.round((increment * index + increment) * 10) / 10;
      const pointFour = Math.round((increment * index + increment * 2) * 10) / 10;
      let gradient = `transparent ${pointOne}%, black ${pointTwo}%`;
      if (pointThree <= 100) gradient += `, black ${pointThree}%`;
      if (pointFour <= 100) gradient += `, transparent ${pointFour}%`;

      const layerStyle: CSSProperties = {
        position: "absolute",
        inset: 0,
        maskImage: `linear-gradient(${gradientDirections[position]}, ${gradient})`,
        WebkitMaskImage: `linear-gradient(${gradientDirections[position]}, ${gradient})`,
        backdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
        WebkitBackdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
        opacity,
        transition: animated && animated !== "scroll"
          ? `backdrop-filter ${duration} ${easing}`
          : undefined,
      };
      result.push(<div key={index} style={layerStyle} />);
    }

    return result;
  }, [
    animated,
    curve,
    divCount,
    duration,
    easing,
    exponential,
    hoverIntensity,
    isHovered,
    opacity,
    position,
    strength,
  ]);

  const isVertical = position === "top" || position === "bottom";
  const isPageTarget = target === "page";
  const containerStyle: CSSProperties = {
    position: isPageTarget ? "fixed" : "absolute",
    pointerEvents: hoverIntensity ? "auto" : "none",
    opacity: isVisible ? 1 : 0,
    transition: animated ? `opacity ${duration} ${easing}` : undefined,
    zIndex: isPageTarget ? zIndex + 100 : zIndex,
    ...(isVertical
      ? {
          height,
          width: width ?? "100%",
          [position]: 0,
          left: 0,
          right: 0,
        }
      : {
          width: width ?? height,
          height: "100%",
          [position]: 0,
          top: 0,
          bottom: 0,
        }),
    ...style,
  };

  return (
    <div
      ref={containerRef}
      className={`gradual-blur ${isPageTarget ? "gradual-blur-page" : "gradual-blur-parent"} ${className}`.trim()}
      style={containerStyle}
      onMouseEnter={hoverIntensity ? () => setIsHovered(true) : undefined}
      onMouseLeave={hoverIntensity ? () => setIsHovered(false) : undefined}
      aria-hidden="true"
    >
      <div className="gradual-blur-inner">{layers}</div>
    </div>
  );
}
