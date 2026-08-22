"use client";

import { ProjectCard } from "./_components/ProjectCard";
import projects from "./_content/projects";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { pickText } from "@/lib/i18n/locale";

/**
 * personalProject 页面
 * 项目文案与封面图数据统一维护于 ./_content/projects.ts。
 */
export default function PersonalProject() {
  const { locale } = usePreferences();

  return (
    <main className="relative z-10 min-h-screen px-4 py-8 sm:px-8 sm:py-16">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 pt-16 sm:pt-8">
        <h1
          style={{ fontFamily: "var(--font-serif)" }}
          className="text-center text-[0.875rem] font-bold uppercase tracking-wide text-primary sm:text-[1.75rem] lg:text-[2.25rem]"
        >
          Portfolio
        </h1>

        <div className="flex flex-row flex-wrap gap-2">
          {projects.map((project, index) => (
            <ProjectCard
              key={index}
              title={pickText(locale, project.title)}
              category={project.category}
              description={pickText(locale, project.description)}
              coverImage={project.coverImage}
              defaultOpen={project.defaultOpen}
              revealIndex={index}
              className="w-full sm:w-[calc((100%-0.5rem)/2)]"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
