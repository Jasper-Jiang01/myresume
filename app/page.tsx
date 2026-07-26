import { AboutMe } from "@/components/AboutMe";
import { Experience } from "@/components/Experience";
import { ProfileHeader } from "@/components/ProfileHeader";
import { Project } from "@/components/Project";
import { Skills } from "@/components/Skills";
import { Tools } from "@/components/Tools";

export default function Home() {
  return (
    /* 布局适配：固定内容宽 + sm: 网格重排；字号不随根缩放 */
    <main className="relative z-10 min-h-screen px-8 py-16">
      <div className="mx-auto flex w-full max-w-content flex-col gap-3">
        <ProfileHeader />

        {/* 默认单列；sm: 多列（字号与布局解耦） */}
        <div className="grid w-full grid-cols-12 gap-3">
          <div className="col-span-12">
            <AboutMe />
          </div>

          <div className="col-span-12 sm:col-span-7">
            <Project />
          </div>
          <div className="col-span-12 sm:col-span-5">
            <Tools />
          </div>

          <div className="col-span-12 sm:col-span-5">
            <Skills />
          </div>
          <div className="col-span-12 sm:col-span-7">
            <Experience />
          </div>
        </div>
      </div>
    </main>
  );
}
