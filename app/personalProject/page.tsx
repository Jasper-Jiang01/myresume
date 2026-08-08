import { SiteDockNav } from "@/components/SiteDockNav";
import { siteNavItems } from "@/lib/siteNav";
import { ProjectCard } from "./_components/ProjectCard";
import projects from "./_content/projects";

/**
 * personalProject 页面
 * 项目文案与封面图数据统一维护于 ./_content/projects.ts。
 */
export default function PersonalProject() {
  return (
    <main className="relative z-10 min-h-screen px-4 py-8 sm:px-8 sm:py-16">
      {/* Dock 导航：站内共享的导航项配置，见 lib/siteNav.tsx */}
      <SiteDockNav items={siteNavItems} />

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
              key={project.title}
              {...project}
              revealIndex={index}
              className="w-full sm:w-[calc((100%-0.5rem)/2)]"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
