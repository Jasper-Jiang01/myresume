/**
 * Figma: Project（作品）
 * 组件名称：Project
 * 组件描述：Project 组件是用于显示我的作品，包含标题、内容和作品。
 * 组件属性：
 *  - title: string，标题
 *  - items: string[]，作品
 */
import { project } from "@/lib/content";
import { BulletItem } from "./BulletItem";
import { SectionCard } from "./SectionCard";

export function Project() {
  return (
    <SectionCard title={project.title} icon="/assets/section-project.svg">
      <ul className="flex flex-col gap-2">
        {project.items.map((item) => (
          <li key={item}>
            <BulletItem label={item} />
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
