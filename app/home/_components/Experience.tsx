/**
 * Figma: Experience
 * 组件名称：Experience
 * 组件描述：Experience 组件是用于显示我的工作经历，包含标题、内容和兴趣爱好。
 * 组件属性：
 *  - title: string，标题
 *  - items: { role: string, period: string }[]，工作经历
 */

"use client";

import { useHomeContent } from "../_content/useHomeContent";
import { ListDot } from "./BulletItem";
import { SectionCard } from "./SectionCard";

export function Experience() {
  const { experience } = useHomeContent();
  return (
    <SectionCard
      title={experience.title}
      icon="/assets/section-about.svg"
      iconImageSize={18}
    >
      <ul className="flex w-full flex-col gap-3">
        {experience.items.map((item) => (
          <li
            key={item.role}
            className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
          >
            <div className="flex min-w-0 items-center gap-2">
              <ListDot />
              <span className="text-body text-muted">{item.role}</span>
            </div>
            <span className="shrink-0 pl-5 text-body text-muted sm:pl-0">
              {item.period}
            </span>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
