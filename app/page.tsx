import Image from "next/image";
import Link from "next/link";
import AnimateIn from "@/components/AnimateIn";
import { FloatingPaths } from "@/components/ui/background-paths";
import NewsletterSignup from "@/components/NewsletterSignup";
import HeroHeadlineSection from "@/components/HeroHeadlineSection";

// ─── Data ─────────────────────────────────────────────────────────────────────

const programs = [
  {
    num: "01",
    title: "Workshops",
    description:
      "Hands-on and led by practitioners, professionals, and other industry experts, bringing practical knowledge, fresh perspectives, and ongoing learning experiences. We're continually expanding our offerings, so be sure to check back often.",
    tags: ["Hands-On", "Expert-Led"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Guest Speakers",
    description:
      "WDA takes an innovative approach by offering unique sessions that expand the thinking of dental professionals. Many of these speaker sessions are open to the public as well, to enrich community involvement. We're continually expanding our offerings, so be sure to check back often.",
    tags: ["Industry Experts", "Open Events"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Courses",
    description:
      "Focused on refreshing theoretical knowledge. We will also offer clinical refresher courses. WDA is consistently developing online courses. We're continually expanding our offerings, so be sure to check back often.",
    tags: ["Online", "In Person"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
      </svg>
    ),
  },
];

const pillars = [
  {
    title: "Industry Expert Leaders",
    description:
      "Learn from practicing dental professionals and professionals from a variety of industries, each bringing valuable expertise, practical knowledge, and unique perspectives.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
      </svg>
    ),
  },
];

// ─── Stagger helper ────────────────────────────────────────────────────────────

function heroStyle(delaySeconds: number): React.CSSProperties {
  return {
    animation: "slideUpFade 0.65s ease both",
    animationDelay: `${delaySeconds}s`,
  };
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════ */}
      <section
        className="relative flex items-center overflow-hidden"
        style={{
          backgroundColor: "#1E3560",
          minHeight: "calc(100vh - 5rem)",
        }}
      >
        {/* Animated path layer */}
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />

        {/* Decorative radial accents */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-32 w-[640px] h-[640px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(74,159,212,0.12) 0%, transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-48 -left-24 w-[480px] h-[480px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(74,159,212,0.07) 0%, transparent 70%)",
          }}
        />


        <div className="relative w-full max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-16 items-center">
          {/* ── Left: copy ── */}
          <HeroHeadlineSection />

          {/* ── Right: feature card ── */}
          <div style={heroStyle(0.48)} className="w-full lg:w-auto">
            <div
              className="rounded-2xl p-8 min-w-[260px] lg:min-w-[300px]"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(8px)",
              }}
            >
              <p
                className="text-[10px] font-bold tracking-[0.22em] uppercase mb-7"
                style={{ color: "#4A9FD4" }}
              >
                What We Offer
              </p>

              <div className="flex flex-col gap-6">
                {[
                  { val: "Workshops", label: "Hands-on sessions in our facility" },
                  { val: "Guest Speakers", label: "Variety of industry experts" },
                  { val: "Courses", label: "Online and in person" },
                ].map(({ val, label }) => (
                  <div key={val} className="flex items-center gap-4">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: "#4A9FD4" }}
                    />
                    <span
                      className="text-lg font-bold shrink-0 w-32"
                      style={{
                        color: "#ffffff",
                        fontFamily: "var(--font-montserrat), sans-serif",
                      }}
                    >
                      {val}
                    </span>
                    <span
                      className="text-sm leading-snug"
                      style={{ color: "rgba(255,255,255,0.55)" }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Diagonal transition into programs */}
        <div className="absolute bottom-0 inset-x-0 pointer-events-none" aria-hidden>
          <svg
            viewBox="0 0 1440 56"
            preserveAspectRatio="none"
            className="w-full block"
            style={{ height: "56px", fill: "#ffffff" }}
          >
            <path d="M0,56 L1440,0 L1440,56 Z" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          WHAT WE OFFER
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: "#ffffff" }}>
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <AnimateIn className="text-center mb-16 max-w-2xl mx-auto">
            <p
              className="text-xs font-bold tracking-[0.2em] uppercase mb-3"
              style={{ color: "#4A9FD4" }}
            >
              What We Offer
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{
                color: "#1E3560",
                fontFamily: "var(--font-montserrat), sans-serif",
              }}
            >
              Professional Development
            </h2>
            <p style={{ color: "#2B303A" }}>
              Professional Development opportunities at WDA are designed to enhance soft skills as well as strengthen practical, real-world skills.
            </p>
          </AnimateIn>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((p, i) => (
              <AnimateIn key={p.num} delay={i * 110} className="flex flex-col">
                <div
                  className="group relative flex flex-col flex-1 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  style={{ backgroundColor: "#F4F7F9" }}
                >
                  {/* Blue top accent */}
                  <div className="h-1 w-full" style={{ backgroundColor: "#4A9FD4" }} />

                  {/* Amber left accent — appears on hover */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ backgroundColor: "#E67E22" }}
                    aria-hidden
                  />

                  <div className="flex flex-col flex-1 p-8">
                    {/* Number + icon row */}
                    <div className="flex items-center justify-between mb-6">
                      <span
                        className="text-xs font-bold tracking-[0.18em] uppercase"
                        style={{ color: "#4A9FD4" }}
                      >
                        {p.num}
                      </span>
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: "#1E3560" }}
                      >
                        {p.icon}
                      </div>
                    </div>

                    <h3
                      className="text-lg font-bold mb-3"
                      style={{
                        color: "#1E3560",
                        fontFamily: "var(--font-montserrat), sans-serif",
                      }}
                    >
                      {p.title}
                    </h3>

                    <p
                      className="text-sm leading-relaxed flex-1 mb-6"
                      style={{ color: "#2B303A" }}
                    >
                      {p.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {p.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-semibold px-3 py-1 rounded-full"
                          style={{
                            backgroundColor: "rgba(30,53,96,0.08)",
                            color: "#1E3560",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <Link
                      href="/professional-development"
                      className="group inline-flex items-center gap-1.5 text-sm font-bold transition-colors duration-200"
                      style={{ color: "#4A9FD4" }}
                    >
                      Learn More
                      <span className="transition-transform duration-200 group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>

          {/* Bottom CTA */}
          <AnimateIn className="text-center mt-14" delay={80}>
            <Link
              href="/professional-development"
              className="inline-flex items-center gap-2 rounded-lg px-8 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02]"
              style={{ backgroundColor: "#1E3560" }}
            >
              Explore All Opportunities
            </Link>
          </AnimateIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          OUR DIFFERENCE
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: "#F4F7F9" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-16 items-start">
            {/* Left: section copy */}
            <AnimateIn className="lg:sticky lg:top-28">
              <p
                className="text-xs font-bold tracking-[0.2em] uppercase mb-4"
                style={{ color: "#4A9FD4" }}
              >
                Our Difference
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold mb-5 leading-tight"
                style={{
                  color: "#1E3560",
                  fontFamily: "var(--font-montserrat), sans-serif",
                }}
              >
                Why Western
                <br />
                Dental Academy?
              </h2>
              <p className="text-base leading-relaxed mb-8" style={{ color: "#2B303A" }}>
                WDA is proactively responding to Alberta&apos;s needs and helping fill gaps across the dental industry and maintain competence through engagement and unique professional development opportunities. From hiring instructors to planning
                sessions, everything comes back to that principle.
              </p>
              <Link
                href="/about"
                className="group inline-flex items-center gap-2 text-sm font-bold transition-colors duration-200"
                style={{ color: "#1E3560" }}
              >
                Meet Our Team
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </AnimateIn>

            {/* Right: pillars */}
            <div className="flex flex-col gap-6">
              {pillars.map((p, i) => (
                <AnimateIn key={p.title} delay={i * 120}>
                  <div
                    className="flex gap-5 p-7 rounded-2xl transition-all duration-300 hover:shadow-md"
                    style={{ backgroundColor: "#ffffff" }}
                  >
                    {/* Icon badge */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 mt-0.5"
                      style={{ backgroundColor: "#4A9FD4" }}
                    >
                      {p.icon}
                    </div>

                    <div>
                      <h3
                        className="text-base font-bold mb-2"
                        style={{
                          color: "#1E3560",
                          fontFamily: "var(--font-montserrat), sans-serif",
                        }}
                      >
                        {p.title}
                      </h3>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: "#2B303A" }}
                      >
                        {p.description}
                      </p>
                    </div>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FINAL CTA BANNER
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-24" style={{ backgroundColor: "#1E3560" }}>
        {/* Radial accent */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 50% 120%, rgba(74,159,212,0.14) 0%, transparent 70%)",
          }}
        />

        {/* Streaming lines background */}
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />


        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <AnimateIn>
            <p
              className="text-xs font-bold tracking-[0.2em] uppercase mb-5"
              style={{ color: "#4A9FD4" }}
            >
              Get Started
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-white mb-5 leading-tight"
              style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              Registrations are now open
              <br />
              for professional development.
            </h2>
            <p
              className="text-lg leading-relaxed mb-10 max-w-xl mx-auto"
              style={{ color: "rgba(255,255,255,0.65)" }}
            >
              Connect with our team to find the right session. We&apos;d love
              to hear from you, or if you have any ideas for PD offerings you would like.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="rounded-lg px-8 py-3.5 text-sm font-bold text-white transition-all duration-200 bg-[#E67E22] hover:bg-[#CF6D17] hover:scale-[1.03]"
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

      <NewsletterSignup />
    </>
  );
}
