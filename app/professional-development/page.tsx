import type { Metadata } from "next";
import Link from "next/link";
import { FloatingPaths } from "@/components/ui/background-paths";
import AnimateIn from "@/components/AnimateIn";
import PDTabs from "./PDTabs";

export const metadata: Metadata = {
  title: "Professional Development",
  description:
    "WDA offers hands-on workshops, guest speaker events, and professional development courses for dental healthcare professionals in Alberta.",
};

export default function ProfessionalDevelopmentPage() {
  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          PAGE HERO
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "#1E3560" }}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(circle, #4A9FD4 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(74,159,212,0.15) 0%, transparent 70%)" }}
        />
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />

        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-20">
          <nav aria-label="Breadcrumb" className="mb-10">
            <ol className="flex items-center gap-2 text-xs font-semibold">
              <li>
                <Link
                  href="/"
                  className="transition-colors duration-200 hover:text-white"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  Home
                </Link>
              </li>
              <li style={{ color: "rgba(255,255,255,0.25)" }} aria-hidden>/</li>
              <li style={{ color: "rgba(255,255,255,0.7)" }}>Professional Development</li>
            </ol>
          </nav>

          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7"
            style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.13)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#4A9FD4" }} />
            <span
              className="text-xs font-semibold tracking-[0.18em] uppercase"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Professional Development
            </span>
          </div>

          <h1
            className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5 max-w-3xl"
            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            Unique Opportunities for{" "}
            <span style={{ color: "#4A9FD4" }}>Dental Professionals</span>
          </h1>

          <p
            className="text-lg leading-relaxed max-w-xl"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            WDA offers hands-on workshops, guest speaker events, and professional development
            courses — all designed to help dental professionals maintain competence and stay
            current in Alberta&apos;s oral health industry.
          </p>
        </div>

        <div
          className="absolute bottom-0 inset-x-0 h-px"
          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          aria-hidden
        />
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TABS + CONTENT (client component)
      ═══════════════════════════════════════════════════════════ */}
      <PDTabs />

      {/* ═══════════════════════════════════════════════════════════
          CTA
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-20" style={{ backgroundColor: "#1E3560" }}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 50% 120%, rgba(74,159,212,0.13) 0%, transparent 70%)",
          }}
        />
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimateIn>
            <p
              className="text-xs font-bold tracking-[0.2em] uppercase mb-5"
              style={{ color: "#4A9FD4" }}
            >
              Questions?
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-white mb-5 leading-tight"
              style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              Not Sure Which Offering
              <br />
              Is Right for You?
            </h2>
            <p
              className="text-base leading-relaxed mb-10 max-w-lg mx-auto"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Our team can walk you through each offering and help you find the right fit.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="rounded-lg px-8 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:bg-[#CF6D17] hover:scale-[1.02]"
                style={{ backgroundColor: "#E67E22" }}
              >
                Register
              </Link>
              <Link
                href="/contact"
                className="rounded-lg px-8 py-3.5 text-sm font-bold text-white transition-all duration-200 border border-white/30 hover:border-white/55 hover:bg-white/10"
              >
                Contact Us
              </Link>
            </div>
          </AnimateIn>
        </div>
      </section>
    </>
  );
}
