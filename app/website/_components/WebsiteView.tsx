"use client";

import { Fragment } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { pickText, type LocalizedText } from "@/lib/i18n/locale";
import { withBasePath } from "@/lib/paths";
import { projectDetailsPath } from "@/app/projectDetails/_content/projects";
import { websiteCases, websiteContact, websiteCopy } from "../_content/content";
import { BorderGlow } from "./BorderGlow";
import { CapabilityIcon } from "./CapabilityIcon";
import { GradualBlur } from "./GradualBlur";
import { HeroScene } from "./HeroScene";
import { InteractionLayer } from "./InteractionLayer";
import { MotionDirector } from "./MotionDirector";

const Galaxy = dynamic(
  () => import("./Galaxy").then((mod) => mod.Galaxy),
  { ssr: false, loading: () => null },
);

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

function lines(text: string) {
  return text.split("\n").map((line, index) => (
    <Fragment key={index}>
      {index > 0 ? <br /> : null}
      {line}
    </Fragment>
  ));
}

export function WebsiteView() {
  const { locale } = usePreferences();
  const t = (value: LocalizedText) => pickText(locale, value);

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
      <Link href="/personalProject" aria-label={t(websiteCopy.back)} className="backList">
        <ArrowLeft size={14} />
      </Link>

      <section className="hero" id="home">
        <header className="nav shell">
          <Link className="brandLogo" href="/home" aria-label={t(websiteCopy.brandName)}>
            <Image
              src={withBasePath("/images/avatar.png")}
              alt={t(websiteCopy.brandName)}
              width={32}
              height={32}
              priority
            />
          </Link>
          <nav aria-label={t(websiteCopy.navAria)}>
            <a href="#work">{t(websiteCopy.navWork)}</a>
            <a href="#capabilities">{t(websiteCopy.navCapabilities)}</a>
          </nav>
          <a className="contactPill" href="#contact">
            <i /> {t(websiteCopy.talk)} <span>↗</span>
          </a>
        </header>
        <HeroScene />
      </section>

      <section className="work section" id="work">
        <div className="shell">
          <div className="sectionTop">
            <span>{t(websiteCopy.workKicker)}</span>
            <span>{t(websiteCopy.workYears)}</span>
          </div>
          <div className="workHeading">
            <div>
              <span className="workKicker">{t(websiteCopy.workLabel)}</span>
              <h2 className="editorialTitle">
                <span className="editorialLeadLine">{t(websiteCopy.workTitleLead)}</span>
                <span className="editorialLine">{t(websiteCopy.workTitleLine)}</span>
              </h2>
            </div>
            <a className="seeWork" href="#contact">
              {t(websiteCopy.workDiscuss)} <span>↗</span>
            </a>
          </div>
          <div className="projects">
            {websiteCases.map((project) => (
              <article className="project" key={project.slug}>
                <BorderGlow className="projectGlow" {...projectGlowProps}>
                  <Link
                    className="projectVisual"
                    href={projectDetailsPath(project.slug)}
                    aria-label={t(project.name)}
                  >
                    <Image
                      className="projectCover"
                      src={withBasePath(project.coverImage)}
                      alt={`${t(project.name)} — ${t(project.label)}`}
                      fill
                      sizes="(min-width: 1024px) 42vw, 92vw"
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
                        {t(project.name)} — {t(project.label)}
                      </Link>
                    </h3>
                    <div className="projectTags">
                      <i>{t(project.type)}</i>
                      <i>{t(project.role)}</i>
                      <i>{t(project.result)}</i>
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
          <span>{t(websiteCopy.capKicker)}</span>
          <span>{t(websiteCopy.capHow)}</span>
        </div>
        <div className="capIntro">
          <h2 className="editorialTitle">
            <span className="editorialLeadLine">{t(websiteCopy.capTitleLead)}</span>
            <span className="editorialLine">{t(websiteCopy.capTitleLine)}</span>
          </h2>
          <p>
            {t(websiteCopy.capIntroZh)}
            <br />
            <span>{lines(t(websiteCopy.capIntroEn))}</span>
          </p>
        </div>
        <div className="capGrid">
          {websiteCopy.capabilities.map((capability) => (
            <article key={capability.no}>
              <span>{capability.no}</span>
              <div className="capIcon">
                <CapabilityIcon no={capability.no} />
              </div>
              <h3>{t(capability.title)}</h3>
              <h4>{t(capability.en)}</h4>
              <p>{t(capability.body)}</p>
            </article>
          ))}
        </div>
        <div className="process">
          {websiteCopy.process.map((step, index) => (
            <Fragment key={step}>
              {index > 0 ? <i aria-hidden="true">→</i> : null}
              <span>{step}</span>
            </Fragment>
          ))}
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
            <span>{t(websiteCopy.contactKicker)}</span>
            <span>{t(websiteCopy.contactMeta)}</span>
          </div>
          <div className="availability">
            <i /> {t(websiteCopy.contactAvail)}
          </div>
          <h2 className="editorialTitle">
            <span className="editorialLeadLine">{t(websiteCopy.contactTitleLead)}</span>
            <span className="editorialLine">{t(websiteCopy.contactTitleLine)}</span>
          </h2>
          <a className="mail" href={`mailto:${websiteContact.email}`}>
            {websiteContact.email} <span>↗</span>
          </a>
          <div className="contactBottom">
            <p>{t(websiteCopy.contactBody)}</p>
            <div>
              <button type="button" onClick={() => navigator.clipboard.writeText(websiteContact.wechat)}>
                {t(websiteCopy.aboutWechat)}
              </button>
              <a href={withBasePath(websiteContact.pdfHref)} download={websiteContact.pdfFilename}>
                {t(websiteCopy.contactPdf)}
              </a>
              <a href={`mailto:${websiteContact.email}`}>{t(websiteCopy.aboutEmail)}</a>
            </div>
            <span>{t(websiteCopy.copyright)}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
