/**
 * Figma: Tools
 * 组件名称：Tools
 * 组件描述：Tools 组件是用于显示我的工具，包含标题、内容和工具。
 * 组件属性：
 *  - title: string，标题
 *  - items: string[]，工具
 */

import { tools } from "@/lib/content";
import { BulletItem } from "./shared/BulletItem";
import { SectionCard } from "./shared/SectionCard";

/** Figma: Tools */
export function Tools() {
  return (
    <SectionCard title={tools.title} icon="/assets/section-tools.svg" iconImageSize={18}>
      <ul className="flex flex-col gap-2">
        {tools.items.map((item, index) => (
          <li key={`${item}-${index}`}>
            <BulletItem label={item} />
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
