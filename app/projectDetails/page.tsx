import type { Metadata } from "next";
import { ProjectDetailsView } from "./_components/ProjectDetailsView";
import {
  DEFAULT_PROJECT_SLUG,
  getProjectDetails,
} from "./_content/projects";

const project = getProjectDetails(DEFAULT_PROJECT_SLUG);

export const metadata: Metadata = {
  title: project
    ? `${project.title.zh} · 蒋文喆`
    : "项目详情 · 蒋文喆",
  description: project?.description?.zh,
};

export default function ProjectDetailsPage() {
  if (!project) return null;
  return <ProjectDetailsView project={project} />;
}
