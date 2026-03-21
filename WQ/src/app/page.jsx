"use client";

import { useEffect, useState } from "react";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import DraggableElement from "@/components/DraggableElement";
import Titles from "@/components/Titles";
import Ui from "@/components/Ui";
import VideoLightbox from "@/components/VideoLightbox";
import { getLandingContent } from "@/lib/content";
import heroImage from "@/Assets/Web-Hero.jpg";
import topSection1 from "@/Assets/Top-section1.jpg";
import topSection2 from "@/Assets/Top-section2.jpg";
import story1 from "@/Assets/story1.jpg";
import story2 from "@/Assets/story2.jpg";
import beforeImage from "@/Assets/before.jpg";
import afterImage from "@/Assets/after.jpg";
import gallery1 from "@/Assets/gallery1.jpg";
import gallery2 from "@/Assets/gallery2.jpg";
import gallery3 from "@/Assets/gallery3.jpg";
import gallery4 from "@/Assets/gallery4.jpg";
import gallery5 from "@/Assets/gallery5.jpg";
import gallery6 from "@/Assets/gallery6.jpg";
import bottomImage from "@/Assets/bottom.jpg";
import woodNav from "@/Assets/wood-nav.jpg";

const DECOR = {
  drone: "/assets/drone.png",
  moon: "/assets/font-moon.png",
  light: "/assets/font-light.png",
  sky: "/assets/font-sky.png",
  sun: "/assets/font-sun.png",
  human: "/assets/font-human.png",
  ground: "/assets/font-ground.png",
  robot1: "/assets/Robot1.png",
  robot2: "/assets/Robot2.png",
  watergun: "/assets/watergun.png",
  weapon1: "/assets/weapon1.png",
};

const draggables = [
  { src: DECOR.drone, x: -8, y: 208, w: 289, alt: "Drone", floating: true, mobile: true },
  { src: DECOR.moon, x: 744, y: 778, w: 92, alt: "Moon icon" },
  { src: DECOR.light, x: 1210, y: 1410, w: 100, alt: "Light icon" },
  { src: DECOR.sun, x: -50, y: 1900, w: 96, alt: "Sun icon", mobile: true, z: "z-10" },
  { src: DECOR.human, x: 1200, y: 1900, w: 96, alt: "Human icon", mobile: true, z: "z-10" },
  { src: DECOR.watergun, x: 120, y: 3400, w: 168, alt: "Watergun icon" },
  { src: DECOR.weapon1, x: 328, y: 3360, w: 140, alt: "Weapon icon" },
  { src: DECOR.sky, x: 350, y: 3720, w: 95, alt: "Sky icon", z: "z-20" },
  { src: DECOR.ground, x: 1260, y: 3720, w: 88, alt: "Ground icon" },
];

export default function Page() {
  const defaultContent = getLandingContent();
  const [content, setContent] = useState(defaultContent);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const [email, setEmail] = useState("");
  const [signupState, setSignupState] = useState({ status: "idle", message: "", confirmUrl: "" });

  const handleSignup = async () => {
    if (!email.trim()) {
      setSignupState({ status: "error", message: "Please enter your email.", confirmUrl: "" });
      return;
    }

    setSignupState({ status: "loading", message: "Submitting...", confirmUrl: "" });

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok || !result?.ok) {
        setSignupState({ status: "error", message: result?.message || "Unable to submit right now.", confirmUrl: "" });
        return;
      }
      setSignupState({ status: "success", message: result.message || "Thanks! You are on the list.", confirmUrl: result.confirmUrl || "" });
      setEmail("");
    } catch {
      setSignupState({ status: "error", message: "Network error. Please try again.", confirmUrl: "" });
    }
  };

  useEffect(() => {
    const onScroll = () => {
      const next = Math.min(window.scrollY * 0.06, 70);
      setParallaxOffset(next);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadContent = async () => {
      try {
        const response = await fetch("/api/content");
        const data = await response.json();
        if (!isMounted) return;
        if (response.ok && data?.ok && data.content) {
          setContent((prev) => ({ ...prev, ...data.content }));
        }
      } catch {
        // Keep static fallback if content API is unavailable.
      }
    };

    loadContent();
    return () => {
      isMounted = false;
    };
  }, []);

  const imageMap = {
    hero: content.heroImage || heroImage.src,
    top1: content.topSection1Image || topSection1.src,
    top2: content.topSection2Image || topSection2.src,
    story1: content.storyImage1 || story1.src,
    story2: content.storyImage2 || story2.src,
    before: content.beforeImage || beforeImage.src,
    after: content.afterImage || afterImage.src,
    gallery1: content.gallery1Image || gallery1.src,
    gallery2: content.gallery2Image || gallery2.src,
    gallery3: content.gallery3Image || gallery3.src,
    gallery4: content.gallery4Image || gallery4.src,
    gallery5: content.gallery5Image || gallery5.src,
    gallery6: content.gallery6Image || gallery6.src,
    bottom: content.bottomImage || bottomImage.src,
    woodNav: content.woodNavImage || woodNav.src,
  };

  const lowerLeft = [imageMap.gallery1, imageMap.gallery3, imageMap.gallery5];
  const lowerRight = [imageMap.gallery2, imageMap.gallery4, imageMap.gallery6];
  const tryDemoUrl = content.tryDemoUrl || "https://writequest.netlify.app";
  const [failedImages, setFailedImages] = useState({});
  const getSafeSrc = (key, preferred, fallback) => (failedImages[key] ? fallback : preferred || fallback);
  const markImageFailed = (key) => setFailedImages((prev) => ({ ...prev, [key]: true }));

  return (
    <main className="relative overflow-x-hidden bg-[#fdf9f1] text-[#53280d]">
      <section className="relative h-[580px] w-full overflow-hidden md:h-[845px]">
        <img
          src={getSafeSrc("hero", imageMap.hero, heroImage.src)}
          onError={() => markImageFailed("hero")}
          alt="Hero background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute left-1/2 top-[56%] flex -translate-x-1/2 -translate-y-1/2 translate-x-0 flex-col items-center gap-2 md:top-[58%] md:translate-x-[6%] md:gap-3">
          <Titles property1="hero" />
          <Ui property1="play-1" onClick={() => setIsVideoOpen(true)} />
          <p className="px-3 text-center text-[16px] font-semibold text-white [text-shadow:0_3px_8px_rgba(0,0,0,0.72)] md:px-4 md:text-[36px]">
            {content.heroSubtitle}
          </p>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-[1440px] px-4 pb-20 pt-10 md:px-12 md:pb-28 md:pt-14">
        {draggables.map((item, idx) => (
          <DraggableElement key={`${item.alt}-${idx}`} initialX={item.x} initialY={item.y} className={`${item.mobile ? "" : "hidden md:block"} ${item.z || ""}`} floating={item.floating} wobble={item.wobble}>
            <img
              src={item.src}
              alt={item.alt}
              className={`pointer-events-none ${item.alt === "Drone" ? "w-[173px] md:w-[289px]" : ""}`}
              style={item.alt === "Drone" ? undefined : { width: item.w }}
            />
          </DraggableElement>
        ))}

        <div className="mx-auto flex max-w-[1160px] flex-col gap-4 md:flex-row md:gap-8">
          <img src={getSafeSrc("top1", imageMap.top1, topSection1.src)} onError={() => markImageFailed("top1")} alt="Top section scene" className="h-[280px] w-full rounded-[18px] object-cover md:h-[400px] md:w-[678px]" />
          <img src={getSafeSrc("top2", imageMap.top2, topSection2.src)} onError={() => markImageFailed("top2")} alt="Top section side" className="h-[240px] w-full rounded-[18px] object-cover md:h-[400px] md:w-[336px]" />
        </div>

        <div className="mx-auto mt-12 grid max-w-[1160px] grid-cols-1 gap-8 md:mt-16 md:grid-cols-[420px_1fr] md:gap-10">
          <div>
            <p className="text-[20px] tracking-[8px] text-[#9d9b95]">{content.storyTag}</p>
            <h2 className="mt-5 text-[34px] font-bold leading-[1.08] md:text-[46px] md:leading-[1.03]">
              {content.storyTitleLine1}
              <br />
              {content.storyTitleLine2}
            </h2>
            <p className="mt-6 text-[20px] leading-[1.35] md:mt-8 md:text-[25px] md:leading-[1.28]">
              {content.storyParagraph1}
            </p>
            <p className="mt-5 text-[20px] leading-[1.35] md:mt-6 md:text-[25px] md:leading-[1.28]">
              {content.storyParagraph2}
            </p>
          </div>
          <div className="space-y-6">
            <img src={getSafeSrc("story1", imageMap.story1, story1.src)} onError={() => markImageFailed("story1")} alt="Story image one" className="h-[260px] w-full rounded-[18px] object-cover md:h-[330px]" />
            <img src={getSafeSrc("story2", imageMap.story2, story2.src)} onError={() => markImageFailed("story2")} alt="Story image two" className="h-[260px] w-full rounded-[18px] object-cover md:h-[330px]" />
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-[1160px] md:mt-24">
          <h3 className="text-center text-[34px] font-semibold">{content.previewTitle}</h3>
          <div className="mt-7 grid grid-cols-1 items-center gap-10 md:grid-cols-[596px_1fr] md:gap-16">
            <div className="h-[280px] overflow-hidden rounded-[14px] border-2 border-[#8b6f4d] bg-black md:h-[381px]">
              <video autoPlay loop muted playsInline className="h-full w-full object-cover">
                <source
                  src="https://raw.githubusercontent.com/inforemix/media/refs/heads/main/assets/Gameplay.mp4"
                  type="video/mp4"
                />
              </video>
            </div>
            <div className="relative flex flex-col items-center text-center md:items-start md:text-left">
              <p className="max-w-[10.5ch] whitespace-pre-line break-words text-center text-[28px] font-semibold leading-[1.18] text-[#a4510f] md:max-w-[12ch] md:text-left md:text-[52px] md:leading-[1.1]">
                {content.previewPrompt}
              </p>
              <a href={tryDemoUrl} target="_blank" rel="noreferrer" className="mt-8 inline-block">
                <Ui property1="button">Try the demo</Ui>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full bg-[#fdf9f1] px-4 py-10 md:py-14">
        <div className="mx-auto max-w-[970px] text-center text-[26px] leading-[1.4] text-[#4a2a14] md:text-[36px]">
          {content.learnSectionText}
        </div>
      </section>

      <section className="mx-auto mt-8 w-full max-w-[1440px] overflow-hidden px-4 pb-[80px] md:px-6 md:pb-[110px]">
        <div style={{ transform: `translateY(${parallaxOffset}px)` }}>
          <BeforeAfterSlider beforeImage={getSafeSrc("before", imageMap.before, beforeImage.src)} afterImage={getSafeSrc("after", imageMap.after, afterImage.src)} className="mx-auto w-full max-w-[1440px]" height={621} />
        </div>
      </section>

      <section className="relative mx-auto mt-16 flex w-full max-w-[1440px] flex-col items-center px-4 py-6 md:mt-20 md:px-8">
        <DraggableElement initialX={-480} initialY={8} className="hidden md:block z-10" wobble>
          <img src={DECOR.robot1} alt="Robot left" className="pointer-events-none w-[184px] object-contain" />
        </DraggableElement>
        <DraggableElement initialX={560} initialY={-6} className="hidden md:block z-10" wobble>
          <img src={DECOR.robot2} alt="Robot right" className="pointer-events-none w-[215px] object-contain" />
        </DraggableElement>
        <h3 className="text-center text-[38px] font-semibold md:text-[46px]">{content.signupHeadline}</h3>
        <p className="mt-2 text-center text-[22px] text-[#514236] md:text-[24px]">{content.signupSubheadline}</p>
        <Ui
          property1="two"
          className="mt-5 max-w-[780px]"
          inputValue={email}
          inputOnChange={(e) => setEmail(e.target.value)}
          inputOnKeyDown={(e) => {
            if (e.key === "Enter") handleSignup();
          }}
          submitDisabled={signupState.status === "loading"}
          onClick={handleSignup}
          submitLabel={signupState.status === "loading" ? "Submitting" : "Sign up"}
        />
        <p className={`mt-3 text-[13px] ${signupState.status === "error" ? "text-[#b62500]" : "text-[#7b746d]"}`}>
          {signupState.message || content.signupPrivacy}
        </p>
        {signupState.confirmUrl ? (
          <a className="mt-1 text-[12px] text-[#3c6c8f] underline" href={signupState.confirmUrl} target="_blank" rel="noreferrer">
            Test confirm link
          </a>
        ) : null}
      </section>

      <section className="mx-auto mt-16 grid min-h-0 w-full max-w-[1440px] grid-cols-1 gap-5 px-4 pb-14 md:mt-24 md:min-h-[1420px] md:grid-cols-2 md:gap-10 md:px-12 md:pb-20">
        <div className="space-y-5 pt-0 md:space-y-6 md:pt-[220px]">
          {lowerLeft.map((src, idx) => (
            <div key={idx} className="gallery-tilt-card group relative h-[220px] overflow-hidden rounded-[30px] md:h-[367px]">
              <div className="gallery-reveal-inner absolute bottom-0 left-0 right-0 h-[220px] rounded-[30px] md:h-[266px] md:group-hover:h-[367px]">
                <img
                  src={getSafeSrc(`gallery-left-${idx}`, src, [gallery1.src, gallery3.src, gallery5.src][idx])}
                  onError={() => markImageFailed(`gallery-left-${idx}`)}
                  alt={`Creative scene left ${idx + 1}`}
                  className="absolute inset-0 h-full w-full rounded-[30px] object-cover transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover:scale-[1.015] md:group-hover:opacity-0"
                />
                <img
                  src={getSafeSrc(`gallery-left-full-${idx}`, src, [gallery1.src, gallery3.src, gallery5.src][idx])}
                  onError={() => markImageFailed(`gallery-left-full-${idx}`)}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full rounded-[30px] object-contain opacity-0 transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover:scale-100 md:group-hover:opacity-100"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-5 md:space-y-6">
          {lowerRight.map((src, idx) => (
            <div key={idx} className="gallery-tilt-card group relative h-[220px] overflow-hidden rounded-[30px] md:h-[367px]">
              <div className="gallery-reveal-inner absolute bottom-0 left-0 right-0 h-[220px] rounded-[30px] md:h-[266px] md:group-hover:h-[367px]">
                <img
                  src={getSafeSrc(`gallery-right-${idx}`, src, [gallery2.src, gallery4.src, gallery6.src][idx])}
                  onError={() => markImageFailed(`gallery-right-${idx}`)}
                  alt={`Creative scene right ${idx + 1}`}
                  className="absolute inset-0 h-full w-full rounded-[30px] object-cover transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover:scale-[1.015] md:group-hover:opacity-0"
                />
                <img
                  src={getSafeSrc(`gallery-right-full-${idx}`, src, [gallery2.src, gallery4.src, gallery6.src][idx])}
                  onError={() => markImageFailed(`gallery-right-full-${idx}`)}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full rounded-[30px] object-contain opacity-0 transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover:scale-100 md:group-hover:opacity-100"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-0 w-full md:mt-2">
        <img src={getSafeSrc("bottom", imageMap.bottom, bottomImage.src)} onError={() => markImageFailed("bottom")} alt="Final clean island scene" className="block h-auto w-full object-contain" />
      </section>

      <section className="relative w-full overflow-hidden py-8 md:py-10">
        <img src={getSafeSrc("woodNav", imageMap.woodNav, woodNav.src)} onError={() => markImageFailed("woodNav")} alt="Wood navigation background" className="absolute inset-0 h-full w-full object-cover" />
        <div className="relative mx-auto flex max-w-[1440px] flex-col items-center px-8 text-center">
          <Titles property1="footer" />
          <p className="mt-2 text-[15px] tracking-[0.6px] text-[#fff9b9]">{content.footerText}</p>
        </div>
      </section>

      <VideoLightbox isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />

      <style jsx global>{`
        .gallery-tilt-card {
          transform-style: preserve-3d;
          transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .gallery-reveal-inner {
          transition: height 0.9s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: height;
        }

        @media (min-width: 768px) {
          .gallery-tilt-card:hover {
            transform: perspective(900px) rotateX(2deg) rotateY(-2deg) translateY(-2px);
          }
        }
      `}</style>
    </main>
  );
}
