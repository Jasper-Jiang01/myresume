/**
 * Figma: Skills
 * 组件名称：Skills
 * 组件描述：Skills 组件是用于显示我的技能，包含标题、内容和技能。
 */
import type { HomeContent } from "../_content/content";
import { SectionCard } from "./SectionCard";

export function Skills({ skills }: { skills: HomeContent["skills"] }) {
  return (
    <SectionCard title={skills.title} icon="/assets/section-skills.svg" iconImageSize={19}>
      <div className="flex flex-col gap-2">
        {skills.rows.map((row) => (
          <div key={row.join("-")} className="flex flex-wrap gap-2">
            {row.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center justify-center rounded-chip bg-tag px-2 py-1 text-body text-muted"
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
