/**
 * Figma: Experience
 * 组件名称：Experience
 * 组件描述：Experience 组件是用于显示我的工作经历，包含标题、内容和兴趣爱好。
 */
import type { HomeContent } from "../_content/content";
import { BulletItem } from "./BulletItem";
import { SectionCard } from "./SectionCard";

export function Experience({ experience }: { experience: HomeContent["experience"] }) {
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
            <div className="min-w-0">
              <BulletItem
                label={item.role}
                icon={item.icon}
                iconOpacity={item.iconOpacity}
              />
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
