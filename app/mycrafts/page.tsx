import { ProjectCard } from "./_components/ProjectCard";
import { SiteFooter } from "./_components/SiteFooter";
import { SiteHeader } from "./_components/SiteHeader";
import projects from "./_content/projects";
import { withBasePath } from "@/lib/paths";
import Link from "next/link";

/**
 * 个人作品页
 * cssdoodle 项目集 —— 纯 CSS / GSAP 动效实验
 */

export default function MyCrafts() {
  return (
    <div className="relative z-10 min-h-screen">
      <SiteHeader />

      <main className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 px-4 pt-8 sm:grid-cols-2 sm:gap-6 sm:px-8 sm:pt-16 lg:grid-cols-3 lg:gap-8">
        {Object.entries(projects).map(([slug, project]) => (
          <Link
            key={slug}
            href={`/mycrafts/${slug}`}
            className="block outline-none"
          >
            <ProjectCard
              title={project.title}
              category={project.category}
              previewSrc={withBasePath(`/cssdoodle/${slug}/index.html`)}
              previewConfig={project.preview}
            />
          </Link>
        ))}
      </main>

      <SiteFooter />
    </div>
  );
}
