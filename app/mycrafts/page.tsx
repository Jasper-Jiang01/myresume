import { ProjectCard } from "./_components/ProjectCard";
import { ProjectGrid } from "./_components/ProjectGrid";
import { SiteFooter } from "./_components/SiteFooter";
import { SiteHeader } from "./_components/SiteHeader";

/**
 * 个人作品页
 * 参考 caiguangxi.com 的作品网格布局
 * 内容待填充——替换 projects 数组中的数据即可
 */

const projects = [
  {
    title: "作品 1",
    category: "Brand, Website",
    image: "/images/list-dot.svg",
  },
  {
    title: "作品 2",
    category: "Product, AI Art",
    image: "/images/list-dot.svg",
  },
  {
    title: "作品 3",
    category: "Data Visualization",
    image: "/images/list-dot.svg",
  },
  {
    title: "作品 4",
    category: "3D, Motion",
    image: "/images/list-dot.svg",
  },
  {
    title: "作品 5",
    category: "Website",
    image: "/images/list-dot.svg",
  },
  {
    title: "作品 6",
    category: "Brand",
    image: "/images/list-dot.svg",
  },
];

export default function MyCrafts() {
  return (
    <div className="relative z-10 min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-8 sm:pt-16">
        <ProjectGrid>
          {projects.map((project) => (
            <ProjectCard
              key={project.title}
              title={project.title}
              category={project.category}
              image={project.image}
            />
          ))}
        </ProjectGrid>
      </main>

      <SiteFooter />
    </div>
  );
}
