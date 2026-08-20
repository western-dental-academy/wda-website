"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

// ── Headline split into individual words per visual line ───────────────────────
const LINE_1 = ["Stay", "current."];
const LINE_2 = ["Stay", "competent."]; // brand blue
const LINE_3 = ["Get", "Connected."];

// ── Framer Motion variants ─────────────────────────────────────────────────────

const headlineContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const wordItem = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: EASE },
  },
};

function delayedFade(delay: number) {
  return {
    hidden: { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, delay, ease: EASE },
    },
  };
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function HeroHeadlineSection() {
  const reduced = useReducedMotion();
  // When reduced motion is preferred, skip all enter animations
  const initial = reduced ? "show" : "hidden";

  return (
    <div className="max-w-2xl">
      {/* Eyebrow badge */}
      <motion.div
        variants={delayedFade(0)}
        initial={initial}
        animate="show"
      >
        <div
          className="inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 mb-8"
          style={{
            backgroundColor: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.13)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: "#4A9FD4" }}
          />
          <span
            className="text-xs font-semibold tracking-[0.18em] uppercase"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            Edmonton&apos;s Leading Dental Academy
          </span>
        </div>
      </motion.div>

      {/* H1 — word-by-word stagger */}
      <motion.h1
        className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.15] mb-6"
        style={{
          color: "#ffffff",
          fontFamily: "var(--font-montserrat), sans-serif",
        }}
        variants={headlineContainer}
        initial={initial}
        animate="show"
      >
        {/* Line 1: white */}
        <span className="block">
          {LINE_1.map((w) => (
            <motion.span
              key={w}
              variants={wordItem}
              className="inline-block mr-[0.28em]"
            >
              {w}
            </motion.span>
          ))}
        </span>
        {/* Line 2: brand blue */}
        <span className="block" style={{ color: "#4A9FD4" }}>
          {LINE_2.map((w) => (
            <motion.span
              key={w}
              variants={wordItem}
              className="inline-block mr-[0.28em]"
            >
              {w}
            </motion.span>
          ))}
        </span>
        {/* Line 3: white */}
        <span className="block">
          {LINE_3.map((w, i) => (
            <motion.span
              key={w}
              variants={wordItem}
              className={`inline-block${i < LINE_3.length - 1 ? " mr-[0.28em]" : ""}`}
            >
              {w}
            </motion.span>
          ))}
        </span>
      </motion.h1>

      {/* Subheading — fades in after headline words complete */}
      <motion.p
        className="text-lg leading-relaxed mb-10 max-w-xl"
        style={{ color: "rgba(255,255,255,0.68)" }}
        variants={delayedFade(0.62)}
        initial={initial}
        animate="show"
      >
        A modern facility offering high quality, unique professional development.
        WDA is here to strengthen and empower dental professionals in
        Alberta&apos;s oral health workforce.
      </motion.p>

      {/* CTAs — follows subheading */}
      <motion.div
        variants={delayedFade(0.78)}
        initial={initial}
        animate="show"
      >
        <div className="flex flex-wrap gap-4">
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
