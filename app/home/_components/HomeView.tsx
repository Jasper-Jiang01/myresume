"use client";

import { useHomeContent } from "../_content/useHomeContent";
import { AboutMe } from "./AboutMe";
import { Experience } from "./Experience";
import { ProfileHeader } from "./ProfileHeader";
import { Project } from "./Project";
import { Skills } from "./Skills";
import { Tools } from "./Tools";

/** 唯一的首页 client 岛：读 locale，把文案当 props 交给展示组件。 */
export function HomeView() {
  const content = useHomeContent();

  return (
    <main className="relative z-10 min-h-screen px-4 py-8 sm:px-8 sm:py-16">
      <div className="mx-auto flex w-full max-w-content flex-col gap-3">
        <ProfileHeader profile={content.profile} />

        <div className="grid w-full grid-cols-12 gap-3">
          <div className="col-span-12">
            <AboutMe aboutMe={content.aboutMe} />
          </div>

          <div className="col-span-12 sm:col-span-7">
            <Project project={content.project} />
          </div>
          <div className="col-span-12 sm:col-span-5">
            <Tools tools={content.tools} />
          </div>

          <div className="col-span-12 sm:col-span-5">
            <Skills skills={content.skills} />
          </div>
          <div className="col-span-12 sm:col-span-7">
            <Experience experience={content.experience} />
          </div>
        </div>
      </div>
    </main>
  );
}
