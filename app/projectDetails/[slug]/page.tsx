import type { Metadata } from "next";
import {
  ProjectDetailsMissing,
  ProjectDetailsView,
} from "../_components/ProjectDetailsView";
import { getProjectDetails, listProjectSlugs } from "../_content/projects";

export function generateStaticParams() {
  return listProjectSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const project = getProjectDetails(params.slug);
  if (!project) return { title: "项目不存在" };
  return {
    title: `${project.title.zh} · 蒋文喆`,
    description: project.description?.zh,
  };
}

export default function ProjectDetailsBySlug({
  params,
}: {
  params: { slug: string };
}) {
  const project = getProjectDetails(params.slug);
  if (!project) return <ProjectDetailsMissing />;
  return <ProjectDetailsView project={project} />;
}
