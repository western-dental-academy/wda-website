"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// ─── Copy ─────────────────────────────────────────────────────────────────────

const HOOK = "Sharpen your skills. Stay current. Practise with confidence.";

const ROTATING_LINES = [
  "Hands-on workshops",
  "Online brush-up courses",
  "Professional development",
];

// ─── Logo ─────────────────────────────────────────────────────────────────────
// Paths copied verbatim from "public/Western Dental Academy Logo-IconOnly-Updated.svg"
// (Inkscape labels "W" and "Top"), in the paths' own coordinate space.

const LOGO_W_PATH =
  "m 92.066639,92.037393 16.575201,43.767397 c 0,0 2.12438,4.82817 7.5737,4.76251 5.49011,-0.0661 7.40833,-4.76251 7.40833,-4.76251 l 8.66511,-18.1901 8.99583,18.1901 c 0,0 1.82633,4.76252 7.27604,4.76251 5.42396,-10e-6 7.37526,-4.76251 7.37526,-4.76251 L 172.6162,92.037391 h -10.59315 l -13.4622,37.483549 c 0,0 -10.9225,-24.10712 -11.77396,-26.47066 -0.95911,-2.66237 -2.64011,-3.291158 -4.49792,-3.291157 -1.8578,10e-7 -3.48919,0.546107 -4.49791,3.291157 -0.86651,2.35806 -11.77396,26.47066 -11.77396,26.47066 L 102.57298,92.037393 Z";

const LOGO_CROWN_PATH =
  "m 107.89704,65.756358 c -8.113229,0.03695 -17.978449,7.931777 -17.479409,17.406689 0.13243,2.514447 1.649008,8.874346 1.649008,8.874346 h 10.506341 c 0,0 -4.153648,-10.449368 2.84785,-14.150948 9.30176,-4.917683 17.50401,8.148814 26.86815,8.204506 9.74438,0.05795 17.84763,-12.717442 28.05874,-8.204506 7.24384,3.201511 1.67533,14.150946 1.67533,14.150946 3.53363,-2.74e-4 7.05952,4.55e-4 10.59315,0 0,0 1.41171,-6.359897 1.54414,-8.874344 0.53231,-10.106573 -6.43461,-17.635097 -17.34726,-17.406689 -10.66411,0.223206 -15.8795,7.920859 -24.5241,8.106883 -8.6446,0.186024 -12.20955,-8.16236 -24.39194,-8.106883 z";

const LOGO_VIEWBOX = "89 64.5 86.5 77";

// Bounding box of the crown path, used for the clip wipe.
const CROWN_X = 89;
const CROWN_Y = 64.5;
const CROWN_W = 86.5;
const CROWN_H = 28;

// The hero sits on navy, so the mark uses the brand's own inverted colours
// (see "Western Dental Academy Logo- Inverted-Icon Only-Updated.svg").
// For a light background, swap to W_FILL = "#1E3560" and CROWN_FILL = "#4A9FD4".
const W_FILL = "#4A9FD4";
const CROWN_FILL = "#FFFFFF";

// ─── Timing (seconds) ─────────────────────────────────────────────────────────

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const T = {
  w: 0,
  crown: 0.5,
  crownDraw: 0.8,
  wordmark: 1.3,
  hook: 1.7,
  ctas: 2.1,
  rotateStart: 2.4,
  rotateEvery: 2.5,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AnimatedHero() {
  const reduce = useReducedMotion() ?? false;
  const crownClipId = `hero-crown-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [rotating, setRotating] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      setRotating(true);
      interval = setInterval(
        () => setIndex((i) => (i + 1) % ROTATING_LINES.length),
        T.rotateEvery * 1000,
      );
    }, T.rotateStart * 1000);
    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [reduce]);

  // Every animated element starts at opacity 0 in the server HTML (text stays
  // in the markup for SEO). With reduced motion, durations and delays drop to
  // zero so the final state renders immediately on hydration.
  const at = (delay: number, duration = 0.6) =>
    reduce ? { duration: 0 } : { delay, duration, ease: EASE_OUT };

  const fadeUp = (delay: number, y = 16) => ({
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: at(delay),
  });

  const lineVisible = reduce || rotating;
  const currentLine = ROTATING_LINES[reduce ? 0 : index];

  return (
    <div className="max-w-2xl text-center sm:text-left">
      {/* No-JS fallback: show the final state */}
      <noscript>
        <style>{`[data-hero-anim]{opacity:1!important;transform:none!important}[data-hero-wipe]{width:${CROWN_W}px!important}`}</style>
      </noscript>

      {/* ── Logo + wordmark ── */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 mb-8">
        <svg
          viewBox={LOGO_VIEWBOX}
          role="img"
          aria-label="Western Dental Academy logo"
          className="block shrink-0 w-[80px] h-[71px] sm:w-[96px] sm:h-[85px] overflow-visible"
        >
          {/* W: rises into place */}
          <motion.path
            data-hero-anim
            d={LOGO_W_PATH}
            fill={W_FILL}
            {...fadeUp(T.w, 40)}
          />

          {/* Crown: left-to-right clip wipe. A pathLength stroke draw traces this
              closed outline down the inner curve and back, so it doesn't read as
              drawing across the top. */}
          <defs>
            <clipPath id={crownClipId}>
              <motion.rect
                data-hero-wipe
                x={CROWN_X}
                y={CROWN_Y}
                height={CROWN_H}
                initial={{ width: 0 }}
                animate={{ width: CROWN_W }}
                transition={reduce ? { duration: 0 } : { delay: T.crown, duration: T.crownDraw, ease: "easeInOut" }}
              />
            </clipPath>
          </defs>
          <path d={LOGO_CROWN_PATH} fill={CROWN_FILL} clipPath={`url(#${crownClipId})`} />
        </svg>

        <motion.p
          data-hero-anim
          className="text-2xl sm:text-[1.65rem] font-bold leading-tight text-white"
          style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={at(T.wordmark)}
        >
          Western Dental Academy
        </motion.p>
      </div>

      {/* ── Hook ── */}
      <motion.h1
        data-hero-anim
        className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold leading-[1.15] mb-5 text-white"
        style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
        {...fadeUp(T.hook)}
      >
        {HOOK}
      </motion.h1>

      {/* ── Rotating line (height reserved to avoid layout shift) ── */}
      <ul className="sr-only">
        {ROTATING_LINES.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <div
        aria-live="off"
        aria-hidden
        className="relative h-8 sm:h-9 overflow-hidden mb-8"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={currentLine}
            data-hero-anim
            className="absolute inset-x-0 text-lg sm:text-xl font-semibold leading-8 sm:leading-9"
            style={{ color: "#4BA3E3", fontFamily: "var(--font-montserrat), sans-serif" }}
            initial={{ opacity: 0, y: 14 }}
            animate={lineVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            exit={{ opacity: 0, y: -14 }}
            transition={reduce ? { duration: 0 } : { duration: 0.4, ease: EASE_OUT }}
          >
            {currentLine}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* ── Supporting copy + CTAs ── */}
      <motion.div data-hero-anim {...fadeUp(T.ctas)}>
        <p
          className="text-lg leading-relaxed mb-10 max-w-xl mx-auto sm:mx-0"
          style={{ color: "rgba(255,255,255,0.68)" }}
        >
          A modern facility offering relevant yet unique professional development.
          WDA is here to strengthen and empower dental professionals in
          Alberta&apos;s oral health workforce. Looking ahead, WDA is committed to
          helping fill gaps in the dental industry and supporting the future of
          oral healthcare in Alberta.
        </p>
        <div className="flex flex-wrap justify-center sm:justify-start gap-4">
          <Link
            href="/professional-development"
            className="rounded-lg px-7 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:scale-[1.05]"
            style={{ backgroundColor: "#4A9FD4" }}
          >
            Professional Development
          </Link>
          <Link
            href="/about"
            className="rounded-lg px-7 py-3.5 text-sm font-bold text-white transition-all duration-200 border border-white/25 hover:border-white/50 hover:bg-white/10"
          >
            About WDA
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
