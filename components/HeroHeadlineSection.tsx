import type { CSSProperties } from "react";
import Link from "next/link";

const LINE_1 = ["Stay", "current."];
const LINE_2 = ["Stay", "competent."];
const LINE_3 = ["Get", "Connected."];

const EASE = "cubic-bezier(0.16,1,0.3,1)";

function fadeUp(delay: number): CSSProperties {
  return {
    animationName: "heroFadeUp",
    animationDuration: "0.55s",
    animationTimingFunction: EASE,
    animationFillMode: "both",
    animationDelay: `${delay}s`,
  };
}

function wordReveal(wordIndex: number): CSSProperties {
  return {
    display: "inline-block",
    marginRight: "0.28em",
    animationName: "wordReveal",
    animationDuration: "0.5s",
    animationTimingFunction: EASE,
    animationFillMode: "both",
    animationDelay: `${0.05 + wordIndex * 0.07}s`,
  };
}

export default function HeroHeadlineSection() {
  // Build a flat word list so each word gets a unique stagger index
  const l1 = LINE_1.length;
  const l2 = LINE_2.length;

  return (
    <div className="max-w-2xl">
      {/* Eyebrow badge */}
      <div style={fadeUp(0)}>
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
      </div>

      {/* H1 — word-by-word stagger via CSS animation */}
      <h1
        className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.15] mb-6"
        style={{ color: "#ffffff", fontFamily: "var(--font-montserrat), sans-serif" }}
      >
        {/* Line 1: white */}
        <span className="block">
          {LINE_1.map((w, i) => (
            <span key={w} style={wordReveal(i)}>{w}</span>
          ))}
        </span>
        {/* Line 2: brand blue */}
        <span className="block" style={{ color: "#4A9FD4" }}>
          {LINE_2.map((w, i) => (
            <span key={w} style={wordReveal(l1 + i)}>{w}</span>
          ))}
        </span>
        {/* Line 3: white */}
        <span className="block">
          {LINE_3.map((w, i) => (
            <span
              key={w}
              style={{
                ...wordReveal(l1 + l2 + i),
                marginRight: i < LINE_3.length - 1 ? "0.28em" : undefined,
              }}
            >
              {w}
            </span>
          ))}
        </span>
      </h1>

      {/* Subheading */}
      <p
        className="text-lg leading-relaxed mb-10 max-w-xl"
        style={{ color: "rgba(255,255,255,0.68)", ...fadeUp(0.62) }}
      >
        A modern facility offering relevant yet unique professional development.
        WDA is here to strengthen and empower dental professionals in
        Alberta&apos;s oral health workforce.
      </p>

      {/* CTAs */}
      <div style={fadeUp(0.78)}>
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
      </div>
    </div>
  );
}
