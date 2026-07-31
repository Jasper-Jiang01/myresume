"use client";

/**
 * 组件名称：HoverPreviewCard
 * 组件描述：包裹一个可点击的外链，鼠标 hover 时在其上方弹出一个跟随鼠标位置、
 *          带惯性摆动的预览气泡卡片。实现参考 skills/inertia-trail-animation.md。
 * 组件属性：
 *  - href: string，跳转链接
 *  - previewTitle: string，预览卡片标题
 *  - previewDescription: string，预览卡片描述
 *  - children: ReactNode，触发 hover 的可点击内容
 *  - className: string，触发元素的类名
 */

import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useTrail } from "@react-spring/web";
import Image from "next/image";
import { withBasePath } from "@/lib/paths";

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
  previewDescription?: string;
  /** 预览图片路径，若提供则替换 previewDescription 文本 */
  previewImage?: string;
  children: ReactNode;
  className?: string;
};

export function HoverPreviewCard({
  href,
  previewTitle,
  previewDescription,
  previewImage,
  children,
  className,
}: HoverPreviewCardProps) {
  const [visible, setVisible] = useState(false);
  const [cardPos, setCardPos] = useState({ x: 0, y: 0 });
  const [rotate, setRotate] = useState(0);
  const [mounted, setMounted] = useState(false);
  const bottomX = useRef(0);

  // 仅在客户端挂载完成后才渲染 Portal，避免 SSR 阶段 document 不存在
  // 导致首次客户端渲染与服务端输出结构不一致（hydration mismatch）
  useEffect(() => {
    setMounted(true);
  }, []);

  const [, api] = useTrail<{ x: number }>(2, (index) => ({
    x: 0,
    config: index === 0 ? FAST_CONFIG : SLOW_CONFIG,
    onChange: (result: { value: { x: number } }) => {
      if (index === 0) {
        bottomX.current = result.value.x;
      } else {
        const dx = result.value.x - bottomX.current;
        setRotate(dx * TILT_FACTOR);
        setCardPos((prev) => ({ ...prev, x: result.value.x }));
      }
    },
  }));

  const handleMouseEnter = (e: MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top - CARD_OFFSET_Y;
    // 瞬移到初始位置，避免第一次出现时从残留坐标飞入
    api.set({ x });
    setCardPos({ x, y });
    setVisible(true);
  };

  const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    api.start(() => ({ x: e.clientX }));
  };

  const handleMouseLeave = () => {
    setVisible(false);
  };

  return (
    <>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={className}
      >
        {children}
      </a>
      {mounted &&
        createPortal(
          <div
            aria-hidden
            className="pointer-events-none fixed z-50 transition-[opacity,transform] duration-200 ease-out"
            style={{
              left: cardPos.x,
              top: cardPos.y,
              opacity: visible ? 1 : 0,
              transform: `translate(-50%, -100%) rotate(${rotate}deg) scale(${visible ? 1 : 0.9})`,
              transformOrigin: "50% 100%",
            }}
          >
            <div className="flex items-center justify-center bg-white p-0">
              {previewImage ? (
                // 调整图片的大小，样式等
                <Image
                  src={withBasePath(previewImage)}
                  alt={previewTitle}
                  width={220}
                  height={160}
                  className="rounded-lg border border-[#EEEEEE]"
                  unoptimized
                />
              ) : previewDescription ? (
                <p className="mt-1 text-sm text-muted">{previewDescription}</p>
              ) : null}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
