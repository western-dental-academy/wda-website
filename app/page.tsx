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
    title: "Clinical Skills Workshop",
    description:
      "Hands-on workshop covering chairside techniques, instrument handling, infection control, and clinical protocols — delivered by practicing dental professionals.",
    tags: ["Hands-On", "Expert-Led"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Dental Radiography Essentials",
    description:
      "Practical training in digital radiography techniques, radiation safety procedures, and image handling for dental support staff and office teams across Alberta.",
    tags: ["Technical Skills", "Safety Focused"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Office Administration & Patient Communication",
    description:
      "Professional development covering patient intake, appointment workflows, dental software, and effective communication in a modern dental office environment.",
    tags: ["Professional Skills", "Office Ready"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0z" />
      </svg>
    ),
  },
];

const pillars = [
  {
    title: "Hands-On from Day One",
    description:
      "Clinical practice isn't reserved for the end of the program. Students work chairside with real equipment and real protocols from the very first weeks.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: "Industry-Expert Instructors",
    description:
      "Learn directly from practicing dental professionals with years of clinical experience in Alberta's dental industry — not just academic theory.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
      </svg>
    ),
  },
  {
    title: "Career Placement Support",
    description:
      "Our team actively connects graduates with dental clinics across Edmonton and Alberta — with resume coaching, interview prep, and direct employer referrals.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
];

const testimonials = [
  {
    quote:
      "WDA gave me the clinical confidence I needed from day one. By the time I graduated, I already felt like a professional — not a student stepping into the unknown.",
    name: "Sarah M.",
    program: "WDA Workshop Participant, 2024",
    initials: "SM",
  },
  {
    quote:
      "The instructors are actual dental professionals. They don't just teach from a textbook — they teach from real experience, and you can feel the difference.",
    name: "Jordan K.",
    program: "WDA Workshop Participant, 2023",
    initials: "JK",
  },
  {
    quote:
      "I had a job offer before I even crossed the stage. The career support team went above and beyond to make sure I was ready and connected.",
    name: "Priya D.",
    program: "WDA Workshop Participant, 2024",
    initials: "PD",
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

          {/* ── Right: stats card ── */}
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
                What to Expect
              </p>

              <div className="flex flex-col gap-6">
                {[
                  { val: "100%", label: "Hands-on workshop delivery" },
                  { val: "Flexible", label: "Workshop schedule formats" },
                  { val: "Expert", label: "Industry-led instruction" },
                ].map(({ val, label }) => (
                  <div key={val} className="flex items-center gap-4">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: "#4A9FD4" }}
                    />
                    <span
                      className="text-2xl font-bold shrink-0 w-20"
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

              <div
                className="mt-8 pt-6"
                style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
              >
                <Link
                  href="/book-a-tour"
                  className="group flex items-center gap-2 text-sm font-semibold transition-colors duration-200"
                  style={{ color: "#4A9FD4" }}
                >
                  Book a Campus Visit
                  <span className="transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
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
          PROGRAMS OVERVIEW
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
              Professional Development Workshops
            </h2>
            <p style={{ color: "#2B303A" }}>
              Every workshop at WDA is designed to build practical, real-world
              skills — delivered by experienced dental professionals in a
              hands-on clinical setting.
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
                      href="/workshops"
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
              href="/workshops"
              className="inline-flex items-center gap-2 rounded-lg px-8 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02]"
              style={{ backgroundColor: "#1E3560" }}
            >
              Explore All Workshops
            </Link>
          </AnimateIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          WHY CHOOSE WDA
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
                We built WDA around a simple belief: that great dental
                professionals are made through real experience, not just
                classroom hours. Every decision we make — from hiring
                instructors to designing the curriculum — comes back to that
                principle.
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
          TESTIMONIALS
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: "#ffffff" }}>
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <AnimateIn className="text-center mb-16 max-w-xl mx-auto">
            <p
              className="text-xs font-bold tracking-[0.2em] uppercase mb-3"
              style={{ color: "#4A9FD4" }}
            >
              Graduate Stories
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{
                color: "#1E3560",
                fontFamily: "var(--font-montserrat), sans-serif",
              }}
            >
              Real Outcomes,
              <br />
              Real Careers
            </h2>
            <p style={{ color: "#2B303A" }}>
              Hear from WDA graduates now working in dental practices across
              Edmonton and Alberta.
            </p>
          </AnimateIn>

          {/* Testimonial cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <AnimateIn key={t.name} delay={i * 100} className="flex flex-col">
                <div
                  className="flex flex-col flex-1 rounded-2xl p-8 relative overflow-hidden"
                  style={{ backgroundColor: "#F4F7F9" }}
                >
                  {/* Large quote mark */}
                  <div
                    className="absolute top-5 right-7 text-7xl font-serif leading-none select-none pointer-events-none"
                    style={{ color: "rgba(74,159,212,0.15)" }}
                    aria-hidden
                  >
                    &ldquo;
                  </div>

                  {/* Quote */}
                  <p
                    className="text-sm leading-relaxed italic flex-1 mb-8 relative"
                    style={{ color: "#2B303A" }}
                  >
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  {/* Divider */}
                  <div
                    className="mb-5 h-px"
                    style={{ backgroundColor: "rgba(30,53,96,0.1)" }}
                  />

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ backgroundColor: "#1E3560" }}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <p
                        className="text-sm font-bold"
                        style={{ color: "#1E3560" }}
                      >
                        {t.name}
                      </p>
                      <p className="text-xs" style={{ color: "#4A9FD4" }}>
                        {t.program}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimateIn>
            ))}
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
              Ready to Advance Your
              <br />
              Dental Skills?
            </h2>
            <p
              className="text-lg leading-relaxed mb-10 max-w-xl mx-auto"
              style={{ color: "rgba(255,255,255,0.65)" }}
            >
              Registrations are now open for our upcoming workshops. Connect
              with our team to find the right professional development
              opportunity — we&apos;d love to hear from you.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="rounded-lg px-8 py-3.5 text-sm font-bold text-white transition-all duration-200 bg-[#E67E22] hover:bg-[#CF6D17] hover:scale-[1.03]"
              >
                Register Interest
              </Link>
              <Link
                href="/workshops"
                className="rounded-lg px-8 py-3.5 text-sm font-bold text-white transition-all duration-200 border border-white/30 hover:border-white/55 hover:bg-white/10"
              >
                View Workshops
              </Link>
            </div>
          </AnimateIn>
        </div>
      </section>

      <NewsletterSignup />
    </>
  );
}
