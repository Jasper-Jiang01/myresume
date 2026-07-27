/**
 * Figma: Skills
 * 组件名称：Skills
 * 组件描述：Skills 组件是用于显示我的技能，包含标题、内容和技能。
 * 组件属性：
 *  - title: string，标题
 *  - rows: string[][]，技能
 */

import { skills } from "@/lib/content";
import { SectionCard } from "./SectionCard";

/** Figma: Skills */
export function Skills() {
  return (
    <SectionCard title={skills.title} icon="/assets/section-skills.svg" iconImageSize={19}>
      <div className="flex flex-col gap-2">
        {skills.rows.map((row) => (
          <div key={row.join("-")} className="flex flex-wrap gap-2">
            {row.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center justify-center rounded-chip bg-[#F0F0F0] px-2 py-1 text-body text-muted"
              >
                {skill}
              </span>
            ))}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
