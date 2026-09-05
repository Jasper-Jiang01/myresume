/**
 * Figma: Project（作品）
 * 组件名称：Project
 * 组件描述：Project 组件是用于显示我的作品，包含标题、内容和作品。
 */
import type { HomeContent } from "../_content/content";
import { BulletItem } from "./BulletItem";
import { SectionCard } from "./SectionCard";

export function Project({ project }: { project: HomeContent["project"] }) {
  return (
    <SectionCard title={project.title} icon="/assets/section-project.svg">
      <ul className="flex h-[90px] flex-col">
        {project.items.map((item) => (
          <li key={item.label} className="flex flex-1 items-center">
            <BulletItem
              label={item.label}
              icon={item.icon}
              iconSize={item.iconSize}
              iconOpacity={item.iconOpacity}
              offsetX={item.offsetX}
              href={item.href}
              previewImage={item.previewImage}
              newTab={item.newTab}
              internal={item.internal}
            />
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
