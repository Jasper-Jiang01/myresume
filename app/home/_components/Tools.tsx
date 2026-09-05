/**
 * Figma: Tools
 * 组件名称：Tools
 * 组件描述：Tools 组件是用于显示我的工具，包含标题、内容和工具。
 */
import type { HomeContent } from "../_content/content";
import { BulletItem } from "./BulletItem";
import { SectionCard } from "./SectionCard";

export function Tools({ tools }: { tools: HomeContent["tools"] }) {
  return (
    <SectionCard title={tools.title} icon="/assets/section-tools.svg" iconImageSize={18}>
      <ul className="flex h-[90px] flex-col">
        {tools.items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex flex-1 items-center">
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
