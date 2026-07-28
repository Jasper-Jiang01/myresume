import Link from "next/link";
import type { Metadata } from "next";
import projects from "../_content/projects";
import { withBasePath } from "@/lib/paths";

export function generateStaticParams() {
  return Object.keys(projects).map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const project = projects[params.slug];
  if (!project) return { title: "Project Not Found" };
  return {
    title: `${project.title} · Jiang Wenze`,
    description: project.description,
  };
}

export default function ProjectDetail({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const project = projects[slug];

  if (!project) {
    return (
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-body text-muted">项目不存在</p>
        <Link
          href="/mycrafts"
          className="text-body font-medium text-primary underline underline-offset-4"
        >
          返回作品列表
        </Link>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      {/* 顶部工具栏 */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-4 backdrop-blur-sm sm:px-8 sm:py-6">
        <Link
          href="/mycrafts"
          className="text-body font-medium text-muted no-underline transition-colors hover:text-primary"
        >
          ← 返回作品
        </Link>
        <div className="flex flex-col items-end">
          <span className="text-body font-medium text-primary">
            {project.title}
          </span>
          <span className="text-sm text-muted">{project.category}</span>
        </div>
      </header>

      {/* 项目描述区 */}
      <div className="mx-auto w-full max-w-[1400px] px-4 pb-4 sm:px-8">
        <p className="text-body leading-relaxed text-muted">
          {project.description}
        </p>
      </div>

      {/* iframe 全屏展示项目 */}
      <div className="relative flex-1 overflow-hidden">
        <iframe
          src={withBasePath(`/cssdoodle/${slug}/index.html`)}
          title={project.title}
          className="absolute inset-0 h-full w-full border-0"
          sandbox="allow-scripts allow-same-origin allow-popups"
          loading="lazy"
        />
      </div>
    </div>
  );
}
