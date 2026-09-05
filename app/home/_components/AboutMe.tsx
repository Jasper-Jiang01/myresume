/**
 * Figma: AboutMe
 * 组件名称：AboutMe
 * 组件描述：AboutMe 组件是用于显示关于我的信息，包含标题、内容和兴趣爱好。
 */
import type { HomeContent } from "../_content/content";
import { SectionCard } from "./SectionCard";

export function AboutMe({ aboutMe }: { aboutMe: HomeContent["aboutMe"] }) {
  return (
    <SectionCard
      title={aboutMe.title}
      icon="/assets/section-experience.svg"
      iconImageSize={22}
    >
      <div className="flex flex-col gap-2 text-body text-muted">
        <div className="flex flex-col gap-1">
          {aboutMe.paragraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          <p><strong className="font-medium text-primary">{aboutMe.passionLabel}</strong></p>
          <p>{aboutMe.passions}</p>
        </div>
      </div>
    </SectionCard>
  );
}
