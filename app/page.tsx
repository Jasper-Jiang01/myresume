import { AboutMe } from "@/components/AboutMe";
import { Experience } from "@/components/Experience";
import { ProfileHeader } from "@/components/ProfileHeader";
import { Project } from "@/components/Project";
import { Skills } from "@/components/Skills";
import { Tools } from "@/components/Tools";

export default function Home() {
  return (
    /* mx-auto my-16 px-8 max-w-[864px] + gap-3 网格 */
    <main className="relative z-10 min-h-screen px-8 py-16">
      <div className="mx-auto flex w-full max-w-content flex-col gap-3">
        <ProfileHeader />

        {/* 默认单列；sm: 多列；gap-3 对齐 Aragakey grid gap-3 */}
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
