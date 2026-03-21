"use client";

import { useEffect, useRef, useState } from "react";

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  className = "",
  height = 597,
}) {
  const MOBILE_AUTO_DURATION_MS = 18000;
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileReveal, setMobileReveal] = useState(0);
  const [mobileBeforePan, setMobileBeforePan] = useState(0);
  const [mobileAfterPan, setMobileAfterPan] = useState(0);
  const [mobilePanRange, setMobilePanRange] = useState({ before: 0, after: 0 });
  const [isTouchDragging, setIsTouchDragging] = useState(false);
  const containerRef = useRef(null);
  const beforeImageRef = useRef(null);
  const afterImageRef = useRef(null);
  const lastMobileInteractionRef = useRef(0);
  const mobileRevealRef = useRef(0);
  const animationStartRef = useRef(Date.now());

  const updateMobilePanRange = () => {
    const container = containerRef.current;
    const beforeNode = beforeImageRef.current;
    const afterNode = afterImageRef.current;
    if (!container || !beforeNode || !afterNode) return;

    const containerWidth = container.clientWidth;
    if (!containerWidth) return;

    const beforeOverflow = Math.max(0, beforeNode.clientWidth - containerWidth);
    const afterOverflow = Math.max(0, afterNode.clientWidth - containerWidth);

    setMobilePanRange({ before: beforeOverflow, after: afterOverflow });
  };

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    mobileRevealRef.current = mobileReveal;
  }, [mobileReveal]);

  useEffect(() => {
    if (!isMobile) return undefined;
    let frameId = 0;
    const MANUAL_PAUSE_MS = 5000;

    const tick = () => {
      const now = Date.now();
      const manualPauseActive = isTouchDragging || now - lastMobileInteractionRef.current < MANUAL_PAUSE_MS;

      if (!manualPauseActive) {
        const elapsed = (now - animationStartRef.current) % MOBILE_AUTO_DURATION_MS;
        const progress = elapsed / MOBILE_AUTO_DURATION_MS;
        const pingPong = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
        const eased = 0.5 - 0.5 * Math.cos(Math.PI * pingPong);

        setMobileReveal(eased);
        setMobileBeforePan(eased);
        setMobileAfterPan(eased);
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [MOBILE_AUTO_DURATION_MS, isMobile, isTouchDragging]);

  useEffect(() => {
    if (!isMobile) return undefined;
    const onResize = () => updateMobilePanRange();
    updateMobilePanRange();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isMobile, beforeImage, afterImage]);

  const handleMouseMove = (e) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const updateRevealFromTouch = (clientX) => {
    const element = containerRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    if (!rect.width) return;
    const nextReveal = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    setMobileReveal(nextReveal);
    lastMobileInteractionRef.current = Date.now();
  };

  const handleTouchStart = (e) => {
    if (!isMobile || !e.touches?.length) return;
    setIsTouchDragging(true);
    updateRevealFromTouch(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!isMobile || !e.touches?.length) return;
    updateRevealFromTouch(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;
    setIsTouchDragging(false);
    const reveal = mobileRevealRef.current;
    const now = Date.now();
    animationStartRef.current = now - reveal * MOBILE_AUTO_DURATION_MS;
    lastMobileInteractionRef.current = now;
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-[20px] ${className}`}
      style={{ height }}
      onMouseEnter={() => !isMobile && setIsHovering(true)}
      onMouseLeave={() => !isMobile && setIsHovering(false)}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div className="absolute inset-0 overflow-hidden bg-[#dfe8f2]">
        <img
          ref={beforeImageRef}
          src={beforeImage}
          alt="Before polluted island"
          className={`absolute top-0 h-full bg-[#dfe8f2] ${isMobile ? "before-after-mobile-image" : "left-0 w-full object-contain"}`}
          style={isMobile ? { transform: `translateX(${-mobileBeforePan * mobilePanRange.before}px)` } : undefined}
          onLoad={updateMobilePanRange}
        />
      </div>

      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          opacity: isHovering || isMobile ? 1 : 0,
          transition: "opacity 0.28s ease-out",
          WebkitMaskImage: isMobile
            ? undefined
            : isHovering
              ? `radial-gradient(circle 360px at ${mousePosition.x}% ${mousePosition.y}%, rgba(0,0,0,1) 62%, rgba(0,0,0,0) 100%)`
              : "radial-gradient(circle 0px at 50% 50%, rgba(0,0,0,1), rgba(0,0,0,0))",
          maskImage: isMobile
            ? undefined
            : isHovering
              ? `radial-gradient(circle 360px at ${mousePosition.x}% ${mousePosition.y}%, rgba(0,0,0,1) 62%, rgba(0,0,0,0) 100%)`
              : "radial-gradient(circle 0px at 50% 50%, rgba(0,0,0,1), rgba(0,0,0,0))",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          clipPath: isMobile ? `inset(0 ${(1 - mobileReveal) * 100}% 0 0)` : undefined,
          WebkitClipPath: isMobile ? `inset(0 ${(1 - mobileReveal) * 100}% 0 0)` : undefined,
        }}
      >
        <img
          ref={afterImageRef}
          src={afterImage}
          alt="After clean island"
          className={`absolute top-0 h-full bg-[#dfe8f2] ${isMobile ? "before-after-mobile-image before-after-mobile-image-after" : "left-0 w-full object-contain"}`}
          style={isMobile ? { transform: `translateX(${-mobileAfterPan * mobilePanRange.after}px)` } : undefined}
          onLoad={updateMobilePanRange}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{
          opacity: isHovering || isMobile ? 0 : 1,
          transition: "opacity 0.3s ease-out",
        }}
      >
        <span className="rounded-full bg-black/50 px-6 py-3 text-2xl font-semibold text-[#fff9b9]">
          Hover to reveal
        </span>
      </div>

      {!isMobile ? (
        <>
          <div className="pointer-events-none absolute left-6 top-6 rounded-full bg-black/70 px-4 py-2 text-xl font-semibold text-white">
            Before: Polluted
          </div>

          <div
            className="pointer-events-none absolute right-6 top-6 rounded-full bg-[#00a651] px-4 py-2 text-xl font-semibold text-white"
            style={{
              opacity: isHovering || isMobile ? 1 : 0,
              transition: "opacity 0.3s ease-out",
            }}
          >
            After: Clean
          </div>
        </>
      ) : null}

      {isMobile ? (
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-[#fff9b9]">
          Swipe left for Before, right for After
        </div>
      ) : null}

      <style jsx>{`
        .before-after-mobile-image {
          width: auto;
          min-height: 100%;
          left: 0;
          object-fit: cover;
        }

        @media (min-width: 768px) {
          .before-after-mobile-image {
            min-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
