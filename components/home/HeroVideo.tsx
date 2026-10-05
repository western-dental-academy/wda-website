"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Brand loop rendered with HyperFrames (source project: ../wda-hero-video).
// Swap these to change the hero video. Files live in /public/videos.
const VIDEO_WEBM = "/videos/web-hero-loop.webm";
const VIDEO_MP4 = "/videos/web-hero-loop.mp4";
const VIDEO_POSTER = "/videos/web-hero-poster.jpg";

// Frame shown when reduced motion is on (the video stays paused here).
const STILL_FRAME_SECONDS = 2.6;

export default function HeroVideo() {
  const reduce = useReducedMotion() ?? false;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (reduce) {
      video.pause();
      const showStill = () => {
        video.currentTime = STILL_FRAME_SECONDS;
      };
      if (video.readyState >= 1) showStill();
      else video.addEventListener("loadedmetadata", showStill, { once: true });
      return () => video.removeEventListener("loadedmetadata", showStill);
    }

    // Some browsers ignore the autoplay attribute after hydration; nudge it.
    video.play().catch(() => {});
  }, [reduce]);

  return (
    <motion.div
      data-hero-anim
      className="w-full"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : { delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="relative w-full aspect-video rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "#1E3560",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 30px 80px -20px rgba(0,0,0,0.55)",
        }}
      >
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          poster={VIDEO_POSTER}
          autoPlay={!reduce}
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          tabIndex={-1}
        >
          <source src={VIDEO_WEBM} type="video/webm" />
          <source src={VIDEO_MP4} type="video/mp4" />
        </video>
      </div>
    </motion.div>
  );
}
