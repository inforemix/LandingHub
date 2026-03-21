"use client";

import { useEffect } from "react";

export default function VideoLightbox({ isOpen, onClose, videoId = "JYpicNsur7s" }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 px-6"
      onClick={onClose}
    >
      <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="absolute -right-1 -top-12 text-4xl font-bold text-white"
          onClick={onClose}
          aria-label="Close video"
        >
          x
        </button>
        <div className="relative w-full pb-[56.25%]">
          <iframe
            className="absolute inset-0 h-full w-full rounded-xl"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title="Write Quest video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
