import type { Metadata } from "next";
import projects from "../_content/projects";
import { CSSDOODLE_IFRAME_SANDBOX } from "@/lib/iframeSandbox";
import { withBasePath } from "@/lib/paths";
import {
  ProjectDetailChrome,
  ProjectMissing,
} from "../_components/ProjectDetailChrome";

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
    title: `${project.title} · Jiang Wenzhe`,
    description: project.description.zh,
  };
}

export default function ProjectDetail({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const project = projects[slug];

  // 注意：当前使用 output: "export" 纯静态导出模式，
  // generateStaticParams 之外的 slug 不会生成对应 HTML 文件，
  // 这段兜底 UI 仅在 next dev / next start 开发/预览模式下生效。
  if (!project) {
    return <ProjectMissing />;
  }

  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <ProjectDetailChrome
        title={project.title}
        category={project.category}
        description={project.description}
      />

      {/* iframe 全屏展示项目 */}
      <div className="relative flex-1 overflow-hidden">
        <iframe
          src={withBasePath(`/cssdoodle/${slug}/index.html`)}
          title={project.title}
          className="absolute inset-0 h-full w-full border-0"
          sandbox={CSSDOODLE_IFRAME_SANDBOX}
          loading="lazy"
        />
      </div>
    </div>
  );
}
