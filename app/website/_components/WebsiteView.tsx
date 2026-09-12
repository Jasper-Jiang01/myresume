"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { withBasePath } from "@/lib/paths";
import { projectDetailsPath } from "@/app/projectDetails/_content/projects";
import { websiteCases, websiteContact } from "../_content/content";
import { BorderGlow } from "./BorderGlow";
import { CapabilityIcon } from "./CapabilityIcon";
import { Galaxy } from "./Galaxy";
import { GradualBlur } from "./GradualBlur";
import { HeroScene } from "./HeroScene";
import { InteractionLayer } from "./InteractionLayer";
import { MotionDirector } from "./MotionDirector";

const projectGlowProps = {
  edgeSensitivity: 24,
  glowColor: "199 48 74",
  backgroundColor: "#111313",
  borderRadius: 18,
  glowRadius: 34,
  glowIntensity: 0.85,
  coneSpread: 22,
  fillOpacity: 0.28,
  colors: ["#f47b43", "#9fc7d9", "#9b8cff"],
};

export function WebsiteView() {
  return (
    <div className="website-page">
      <MotionDirector />
      <InteractionLayer />
      <GradualBlur
        target="page"
        position="bottom"
        height="12rem"
        strength={3.6}
        divCount={9}
        curve="bezier"
        exponential
        opacity={1}
        animated="scroll"
        duration="0.28s"
        easing="cubic-bezier(.2,.8,.2,1)"
        zIndex={0}
        className="site-scroll-blur"
      />
      <Link href="/personalProject" aria-label="返回列表版" className="backList">
        <ArrowLeft size={14} />
      </Link>

      <section className="hero" id="home">
        <header className="nav shell">
          <Link className="brandLogo" href="/home" aria-label="蒋文喆">
            <img src={withBasePath("/images/avatar.png")} alt="蒋文喆" />
          </Link>
          <nav aria-label="Main navigation">
            <a href="#work">Work</a>
            <a href="#about">About</a>
            <a href="#capabilities">Capabilities</a>
          </nav>
          <a className="contactPill" href="#contact">
            <i /> Let’s talk <span>↗</span>
          </a>
        </header>
        <HeroScene />
      </section>

      <section className="about section shell" id="about">
        <div className="aboutEyebrow">
          <i /> WHY CHOOSE ME
        </div>
        <div className="aboutHeader">
          <h2 className="editorialTitle">
            <span className="editorialLeadLine">Meet the mind</span>
            <span className="editorialLine">Behind the work</span>
          </h2>
          <div className="aboutSocial">
            <a href={`mailto:${websiteContact.email}`}>EMAIL</a>
            <button type="button" onClick={() => navigator.clipboard.writeText(websiteContact.wechat)}>
              WX
            </button>
            <a href={withBasePath(websiteContact.pdfHref)} download={websiteContact.pdfFilename}>
              PDF
            </a>
          </div>
        </div>
        <div className="aboutShowcase">
          <figure className="portrait aboutPortrait">
            <img
              className="portraitPhoto"
              src={withBasePath("/images/avatar.png")}
              alt="蒋文喆"
            />
            <figcaption>SHANGHAI, CN · MEITUAN INTERNATIONAL</figcaption>
          </figure>
          <div className="aboutDetails">
            <p className="aboutLead">
              I bring together product thinking, visual craft, and engineering to create
              clear digital experiences that actually ship.
            </p>
            <div className="aboutLocation">
              <span>◎</span>
              <p>
                BASED IN SHANGHAI
                <br />
                <b>MEITUAN INTERNATIONAL · PREVIOUSLY ANT</b>
              </p>
            </div>
            <div className="aboutCards">
              <article className="aboutMetricCard">
                <strong>
                  0—1
                </strong>
                <span>END-TO-END DESIGN ENGINEER</span>
                <ul>
                  <li>美团境外事业部</li>
                  <li>蚂蚁 · World First</li>
                  <li>设计到上线</li>
                </ul>
                <a href="#contact">
                  LET’S WORK TOGETHER <b>↗</b>
                </a>
              </article>
              <article className="aboutFactCard">
                <img src={withBasePath("/personalProject/1.jpg")} alt="" />
                <span>RECENT · 01/02</span>
                <strong>美团</strong>
                <p>
                  境外事业部
                  <br />
                  设计工程师
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="work section" id="work">
        <div className="shell">
          <div className="sectionTop">
            <span>02 / SELECTED WORK</span>
            <span>2024—2026</span>
          </div>
          <div className="workHeading">
            <div>
              <span className="workKicker">CASE STUDIES</span>
              <h2 className="editorialTitle">
                <span className="editorialLeadLine">Selected</span>
                <span className="editorialLine">stories</span>
              </h2>
            </div>
            <a className="seeWork" href="#contact">
              Discuss a project <span>↗</span>
            </a>
          </div>
          <div className="projects">
            {websiteCases.map((project) => (
              <article className="project" key={project.slug}>
                <BorderGlow className="projectGlow" {...projectGlowProps}>
                  <Link
                    className="projectVisual"
                    href={projectDetailsPath(project.slug)}
                    aria-label={project.name.zh}
                  >
                    <img
                      className="projectCover"
                      src={withBasePath(project.coverImage)}
                      alt={`${project.name.zh} project cover`}
                    />
                    <span className="projectArrow" aria-hidden="true">
                      ↗
                    </span>
                  </Link>
                </BorderGlow>
                <div className="projectInfo">
                  <span>{project.index}</span>
                  <div>
                    <h3>
                      <Link href={projectDetailsPath(project.slug)}>
                        {project.name.zh} — {project.label.zh}
                      </Link>
                    </h3>
                    <div className="projectTags">
                      <i>{project.type.zh}</i>
                      <i>{project.role.zh}</i>
                      <i>{project.result.zh}</i>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="capabilities section shell" id="capabilities">
        <div className="sectionTop">
          <span>03 / CAPABILITIES</span>
          <span>HOW I CREATE VALUE</span>
        </div>
        <div className="capIntro">
          <h2 className="editorialTitle">
            <span className="editorialLeadLine">FROM DIRECTION</span>
            <span className="editorialLine">TO DELIVERY.</span>
          </h2>
          <p>
            不仅定义设计，也把它写进代码、送上线。
            <br />
            <span>
              I define the direction, build the system,
              <br />
              and stay until it ships.
            </span>
          </p>
        </div>
        <div className="capGrid">
          {[
            ["01", "全流程产品设计", "End-to-end Design", "从调研、产品定义到交互、视觉与最终落地，建立完整而清晰的体验秩序。"],
            ["02", "设计工程落地", "Design Engineering", "用 React / Next.js 把设计变成可上线的界面，减少跨角色损耗。"],
            ["03", "交互与动效", "Motion & Interaction", "让界面有节奏、有反馈，复杂流程也能走得顺。"],
            ["04", "0—1 产品设计", "Zero to One", "从概念、MVP 到正式上线，持续验证并交付真实价值。"],
          ].map(([no, title, en, text]) => (
            <article key={no}>
              <span>{no}</span>
              <div className="capIcon">
                <CapabilityIcon no={no} />
              </div>
              <h3>{title}</h3>
              <h4>{en}</h4>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className="process">
          <span>RESEARCH</span>
          <i>→</i>
          <span>ANALYZE</span>
          <i>→</i>
          <span>DEFINE</span>
          <i>→</i>
          <span>DESIGN</span>
          <i>→</i>
          <span>BUILD</span>
          <i>→</i>
          <span>SHIP</span>
        </div>
      </section>

      <footer className="contact" id="contact">
        <div className="contactGalaxy">
          <Galaxy
            starSpeed={0.5}
            density={0.5}
            hueShift={0}
            speed={0.4}
            glowIntensity={0.25}
            saturation={0}
            mouseRepulsion
            repulsionStrength={1}
            twinkleIntensity={1}
            rotationSpeed={0.05}
            transparent
          />
        </div>
        <div className="contactVeil" />
        <div className="shell contactInner">
          <div className="sectionTop">
            <span>04 / CONTACT</span>
            <span>SHANGHAI · GMT+8</span>
          </div>
          <div className="availability">
            <i /> AVAILABLE FOR FULL-TIME · PROJECTS · CONSULTING
          </div>
          <h2 className="editorialTitle">
            <span className="editorialLeadLine">LET’S MAKE</span>
            <span className="editorialLine">SOMETHING MATTER.</span>
          </h2>
          <a className="mail" href={`mailto:${websiteContact.email}`}>
            {websiteContact.email} <span>↗</span>
          </a>
          <div className="contactBottom">
            <p>如果你在找一个能把设计做完、也能把东西做上线的人，欢迎写信或加微信。</p>
            <div>
              <button type="button" onClick={() => navigator.clipboard.writeText(websiteContact.wechat)}>
                WECHAT
              </button>
              <a href={withBasePath(websiteContact.pdfHref)} download={websiteContact.pdfFilename}>
                PDF
              </a>
              <a href={`mailto:${websiteContact.email}`}>EMAIL</a>
            </div>
            <span>© 2026 蒋文喆</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
