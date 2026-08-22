"use client";

/**
 * 组件名称：HoverPreviewCard
 * 组件描述：包裹一个可点击的链接，鼠标 hover 时在其上方弹出一个跟随鼠标位置、
 *          带惯性摆动的预览气泡卡片。实现参考 skills/inertia-trail-animation.md。
 *          - 站内路由（internal=true）使用 next/link 做客户端跳转，避免整页刷新；
 *            此时 href 必须是未经 withBasePath 处理的原始站内路径（如 "/mycrafts"），
 *            basePath 由 next/link 自动附加，调用方不应重复拼接。
 *          - 外部链接 / 静态资源（internal=false，默认）使用原生 <a> 标签；
 *            此时 href 应由调用方按需自行处理（如站内静态资源需 withBasePath 包裹）。
 * 组件属性：
 *  - href: string，跳转链接
 *  - previewTitle: string，预览卡片标题
 *  - previewImage?: string，预览图片路径
 *  - children: ReactNode，触发 hover 的可点击内容
 *  - className: string，触发元素的类名
 *  - newTab?: boolean，是否在新标签页打开；仅对非站内路由生效，未传时非站内路由默认 true；
 *             若与 internal=true 同时显式传入，会被忽略并在开发环境打印警告
 *  - internal?: boolean，是否为站内路由，为 true 时使用 next/link 且忽略 newTab，默认 false
 */

import { useEffect, useRef, useState, type ReactNode, type MouseEvent, type FocusEvent } from "react";
import { createPortal } from "react-dom";
import { useTrail } from "@react-spring/web";
import Image from "next/image";
import Link from "next/link";
import { assertInternalHref, withBasePath } from "@/lib/paths";

// 快端点：高 tension + 低 friction，紧跟鼠标
const FAST_CONFIG = { tension: 1500, friction: 40 };
// 慢端点：高 mass + 低 tension，产生滞后感（惯性来源）
const SLOW_CONFIG = { mass: 2.6, tension: 400, friction: 50 };

// 水平位移差 → 旋转角度的映射系数，越大晃动越夸张
const TILT_FACTOR = 0.15;
// 卡片与触发元素之间的垂直间距（px）
const CARD_OFFSET_Y = 14;

type HoverPreviewCardProps = {
  href: string;
  previewTitle: string;
  /** 预览图片路径 */
  previewImage?: string;
  children: ReactNode;
  className?: string;
  /** 是否在新标签页打开；仅对非站内路由生效，未传时非站内路由默认 true；
   *  若与 internal=true 同时显式传入会被忽略，并在开发环境打印警告 */
  newTab?: boolean;
  /** 是否为站内路由，为 true 时使用 next/link 且忽略 newTab，默认 false */
  internal?: boolean;
};

export function HoverPreviewCard({
  href,
  previewTitle,
  previewImage,
  children,
  className,
  newTab,
  internal = false,
}: HoverPreviewCardProps) {
  // 非站内路由默认新标签页打开；internal=true 时 newTab 恒不生效（next/link 原地跳转）。
  const resolvedNewTab = internal ? false : newTab ?? true;
  const [visible, setVisible] = useState(false);
  // cardPos.y 仅在 enter/focus 时设置一次（不随鼠标移动高频变化），保留为 state 即可
  const [cardY, setCardY] = useState(0);
  const [mounted, setMounted] = useState(false);
  const bottomX = useRef(0);
  // cardX / rotate 随鼠标移动由 spring 动画每帧更新，改为直接写 DOM（transform）
  // 而不经过 React state，避免鼠标移动时的高频 setState 触发整棵子树重渲染
  const cardRef = useRef<HTMLDivElement | null>(null);
  const cardXRef = useRef(0);
  const rotateRef = useRef(0);
  // useTrail 的 onChange 回调在初始化时创建、不随渲染更新闭包，
  // 用 ref 同步保存 visible 最新值供该回调读取，避免读到过期值
  const visibleRef = useRef(visible);
  visibleRef.current = visible;
  // 持有预加载 Image 实例的引用，防止其在挂载期间被 GC 回收导致预加载请求被提前中断。
  // 若仅在 effect 内创建局部变量 `new window.Image()` 而不持有引用，
  // 该对象在部分浏览器实现下可能在请求完成前就被当作垃圾回收，使预加载失效。
  const preloadImageRef = useRef<HTMLImageElement | null>(null);

  // 将当前 cardXRef/rotateRef 的值应用到卡片 DOM 的 transform 上
  const applyCardTransform = (visibleNow: boolean) => {
    const el = cardRef.current;
    if (!el) return;
    el.style.left = `${cardXRef.current}px`;
    el.style.transform = `translate(-50%, -100%) rotate(${rotateRef.current}deg) scale(${visibleNow ? 1 : 0.9})`;
  };

  useEffect(() => {
    // 仅在调用方显式传了 newTab 且与 internal=true 冲突时才提示，
    // 避免 newTab 使用默认值时产生误报噪音。
    if (internal && newTab !== undefined) {
      console.warn(
        `[HoverPreviewCard] href="${href}"：internal=true 时传入的 newTab=${newTab} 会被忽略` +
          `（站内路由固定用 next/link 原地跳转，不支持新标签页打开），请检查调用方是否传错了参数组合。`
      );
    }
    if (internal) {
      assertInternalHref(href, "HoverPreviewCard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internal, newTab, href]);

  // 仅在客户端挂载完成后才渲染 Portal，避免 SSR 阶段 document 不存在
  // 导致首次客户端渲染与服务端输出结构不一致（hydration mismatch）
  useEffect(() => {
    setMounted(true);
    // 预加载预览图，避免 hover 时才请求导致延迟；用 ref 持有该 Image 实例，
    // 避免其在加载完成前被判定为不可达对象而被提前回收。
    if (previewImage) {
      const img = new window.Image();
      img.src = withBasePath(previewImage);
      preloadImageRef.current = img;
    }
    return () => {
      preloadImageRef.current = null;
    };
  }, [previewImage]);

  const [, api] = useTrail<{ x: number }>(2, (index) => ({
    x: 0,
    config: index === 0 ? FAST_CONFIG : SLOW_CONFIG,
    onChange: (result: { value: { x: number } }) => {
      if (index === 0) {
        bottomX.current = result.value.x;
      } else {
        const dx = result.value.x - bottomX.current;
        rotateRef.current = dx * TILT_FACTOR;
        cardXRef.current = result.value.x;
        // 该 onChange 回调在 useTrail 初始化时创建、不会随组件渲染更新闭包，
        // 用 visibleRef.current 读取最新的 visible 值，避免闭包陈旧值问题
        applyCardTransform(visibleRef.current);
      }
    },
  }));

  const handleMouseEnter = (e: MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top - CARD_OFFSET_Y;
    // 瞬移到初始位置，避免第一次出现时从残留坐标飞入
    api.set({ x });
    cardXRef.current = x;
    rotateRef.current = 0;
    setCardY(y);
    applyCardTransform(true);
    setVisible(true);
  };

  const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    api.start(() => ({ x: e.clientX }));
  };

  const handleMouseLeave = () => {
    setVisible(false);
    applyCardTransform(false);
  };

  // 键盘 Tab 聚焦到触发元素时，用其自身位置作为卡片锚点展示预览；
  // 失焦时隐藏，保证键盘用户也能获得与鼠标 hover 等价的预览体验
  const handleFocus = (e: FocusEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top - CARD_OFFSET_Y;
    api.set({ x });
    cardXRef.current = x;
    rotateRef.current = 0;
    setCardY(y);
    applyCardTransform(true);
    setVisible(true);
  };

  const handleBlur = () => {
    setVisible(false);
    applyCardTransform(false);
  };

  const hoverHandlers = {
    onMouseEnter: handleMouseEnter,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
  };

  return (
    <>
      {internal ? (
        <Link href={href} className={className} {...hoverHandlers}>
          {children}
        </Link>
      ) : (
        <a
          href={href}
          {...(resolvedNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className={className}
          {...hoverHandlers}
        >
          {children}
        </a>
      )}
      {mounted &&
        createPortal(
          <div
            ref={cardRef}
            aria-hidden
            className="pointer-events-none fixed z-50 transition-[opacity,transform] duration-200 ease-out"
            style={{
              left: cardXRef.current,
              top: cardY,
              opacity: visible ? 1 : 0,
              transform: `translate(-50%, -100%) rotate(${rotateRef.current}deg) scale(${visible ? 1 : 0.9})`,
              transformOrigin: "50% 100%",
            }}
          >
            <div className="flex items-center justify-center bg-surface p-0">
              {previewImage && (
                <Image
                  src={withBasePath(previewImage)}
                  alt={previewTitle}
                  width={220}
                  height={160}
                  className="rounded-lg border border-cardBorder"
                  unoptimized
                />
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
