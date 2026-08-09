"use client";

/**
 * 组件名称：Dock
 * 组件描述：macOS 风格的悬浮工具栏（Dock）。桌面端鼠标靠近某个图标时，
 *          图标会根据与鼠标的水平距离弹性放大，并在上方浮现文案提示；
 *          移植自 React Bits Dock，使用 motion（Framer Motion）驱动动画。
 * 组件属性：
 *  - items: DockItemData[]，Dock 项列表，每项包含 icon、label，以及 href（渲染为 Link）
 *           或 onClick（渲染为普通可交互 div）二选一，可选 className
 *  - className?: string，追加在 Dock 面板上的类名
 *  - distance?: number，计算放大效果时使用的鼠标感应距离（像素）
 *  - panelHeight?: number，Dock 面板高度（像素）
 *  - baseItemSize?: number，Dock 项的基础尺寸（像素）
 *  - dockHeight?: number，Dock 容器的最大高度（像素）
 *  - magnification?: number，鼠标悬停时 Dock 项放大后的尺寸（像素）
 *  - spring?: SpringOptions，弹簧动画的配置参数
 */

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  type MotionValue,
  type SpringOptions,
} from "motion/react";
import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type ReactElement,
} from "react";
import Link from "next/link";
import "./Dock.css";

/**
 * 读取系统「减少动态效果」偏好；命中时应禁用/降级 Dock 的放大动效。
 * 仅在客户端生效，SSR 阶段默认返回 false（首屏无动效差异，避免 hydration mismatch）。
 */
function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mql.matches);
    const handleChange = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return prefersReduced;
}

// motion 包裹 next/link，使 Dock 项在具备放大动效的同时，
// 保留 <a> 语义（预加载、中键/右键新开标签页、右键菜单等浏览器原生能力）
const MotionLink = motion.create(Link);
// motion 包裹原生 <button>，使无 href 的 Dock 项（仅触发点击回调）
// 保留原生按钮语义（键盘 Enter/Space 触发、可访问性树中的 button role 等），
// 避免用 div + role="button" + 手动 onKeyDown 模拟按钮行为
const MotionButton = motion.create("button");

export type DockItemData = {
  icon: ReactNode;
  label: ReactNode;
  /** 跳转链接；提供时渲染为可导航的 <a>（next/link），支持预加载/中键新开/右键菜单 */
  href?: string;
  /** 点击回调；未提供 href 时生效，渲染为普通可交互 div（如触发弹层等非导航场景） */
  onClick?: () => void;
  className?: string;
};

export type DockProps = {
  items: DockItemData[];
  className?: string;
  distance?: number;
  panelHeight?: number;
  baseItemSize?: number;
  dockHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
};

type DockItemProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  mouseX: MotionValue<number>;
  spring: SpringOptions;
  distance: number;
  magnification: number;
  baseItemSize: number;
  label: ReactNode;
};

type IsHoveredProp = { isHovered?: MotionValue<number> };

function DockItem({
  children,
  className = "",
  href,
  onClick,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
  label,
}: DockItemProps) {
  const ref = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize,
    };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize]
  );
  const size = useSpring(targetSize, spring);

  const ariaLabel = typeof label === "string" ? label : undefined;

  // isHovered 是 useMotionValue，引用在组件生命周期内稳定，
  // 用 useCallback 固定这几个事件回调，避免每次渲染都创建新函数
  const handleHoverStart = useCallback(() => isHovered.set(1), [isHovered]);
  const handleHoverEnd = useCallback(() => isHovered.set(0), [isHovered]);
  const handleFocus = useCallback(() => isHovered.set(1), [isHovered]);
  const handleBlur = useCallback(() => isHovered.set(0), [isHovered]);

  const sharedProps = {
    style: { width: size, height: size },
    onHoverStart: handleHoverStart,
    onHoverEnd: handleHoverEnd,
    onFocus: handleFocus,
    onBlur: handleBlur,
    className: `dock-item ${className}`,
    "aria-label": ariaLabel,
  } as const;

  const content = Children.map(children, (child) =>
    isValidElement(child)
      ? cloneElement(child as ReactElement<IsHoveredProp>, { isHovered })
      : child
  );

  // 有 href 时渲染为 next/link 包裹的 <a>，保留浏览器原生导航能力
  // （预加载、中键/Cmd+点击新标签页打开、右键菜单「在新标签页中打开」等），
  // 与站内其它路由跳转统一使用 Link 的理念保持一致。
  if (href) {
    return (
      <MotionLink
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        {...sharedProps}
        onClick={onClick}
      >
        {content}
      </MotionLink>
    );
  }

  // 未提供 href 时渲染为原生 <button>（如仅触发弹层等非导航场景），
  // 原生按钮自带键盘 Enter/Space 触发与可访问性语义，无需手动模拟
  return (
    <MotionButton
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      {...sharedProps}
      onClick={onClick}
      aria-haspopup="true"
    >
      {content}
    </MotionButton>
  );
}

function DockLabel({
  children,
  className = "",
  isHovered,
}: { children: ReactNode; className?: string } & IsHoveredProp) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    const unsubscribe = isHovered.on("change", (latest) => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`dock-label ${className}`}
          role="tooltip"
          style={{ x: "-50%" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`dock-icon ${className}`}>{children}</div>;
}

export default function Dock({
  items,
  className = "",
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelHeight = 68,
  dockHeight = 256,
  baseItemSize = 50,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);
  const prefersReducedMotion = usePrefersReducedMotion();
  // 命中「减少动态效果」偏好时，感应距离归零 → 放大倍数恒为 baseItemSize，
  // 即关闭鼠标接近放大效果，同时保留基础的 hover 文案提示（非位移/缩放类，符合规范）
  const effectiveDistance = prefersReducedMotion ? 0 : distance;
  const effectiveMagnification = prefersReducedMotion ? baseItemSize : magnification;

  const maxHeight = useMemo(
    () => Math.max(dockHeight, effectiveMagnification + effectiveMagnification / 2 + 4),
    [effectiveMagnification, dockHeight]
  );
  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightRow, spring);

  // isHovered / mouseX 是 useMotionValue，引用稳定，用 useCallback 固定这两个回调
  const handlePanelMouseMove = useCallback(
    ({ pageX }: { pageX: number }) => {
      isHovered.set(1);
      mouseX.set(pageX);
    },
    [isHovered, mouseX]
  );
  const handlePanelMouseLeave = useCallback(() => {
    isHovered.set(0);
    mouseX.set(Infinity);
  }, [isHovered, mouseX]);

  return (
    <motion.div style={{ height, scrollbarWidth: "none" }} className="dock-outer">
      <motion.div
        onMouseMove={handlePanelMouseMove}
        onMouseLeave={handlePanelMouseLeave}
        className={`dock-panel ${className}`}
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label="Application dock"
      >
        {items.map((item) => (
          <DockItem
            key={item.href ?? (typeof item.label === "string" ? item.label : undefined) ?? JSON.stringify(item.label)}
            href={item.href}
            onClick={item.onClick}
            className={item.className}
            mouseX={mouseX}
            spring={spring}
            distance={effectiveDistance}
            magnification={effectiveMagnification}
            baseItemSize={baseItemSize}
            label={item.label}
          >
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel>{item.label}</DockLabel>
          </DockItem>
        ))}
      </motion.div>
    </motion.div>
  );
}
