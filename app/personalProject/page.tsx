import { ProjectCard } from "./_components/ProjectCard";
import projects from "./_content/projects";

/**
 * personalProject 页面
 * 项目文案与封面图数据统一维护于 ./_content/projects.ts。
 */
export default function PersonalProject() {
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
            // 数据源为静态固定顺序的数组、无独立 id/slug 字段，且不会增删排序，
            // 用 index 做 key 是安全的；避免用 title 做 key 在标题重复时产生冲突风险
            <ProjectCard
              key={index}
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
