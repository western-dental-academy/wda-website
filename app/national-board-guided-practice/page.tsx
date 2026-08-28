import type { Metadata } from "next";
import Link from "next/link";
import AnimateIn from "@/components/AnimateIn";
import { FloatingPaths } from "@/components/ui/background-paths";

export const metadata: Metadata = {
  title: "National Board Guided Practice",
  description:
    "An 8-hour hands-on practical workshop preparing dental professional candidates for the NDAEB Clinical Practice Evaluation. Build confidence across all nine CPE clinical skills.",
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function NPEWorkshopPage() {
  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: "#1E3560" }}
      >
        {/* Dot-grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(circle, #4A9FD4 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Radial glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 w-[560px] h-[560px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(74,159,212,0.14) 0%, transparent 70%)",
          }}
        />
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />

        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-24">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-10">
            <ol className="flex items-center gap-2 text-xs font-semibold flex-wrap">
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
              <li>
                <Link
                  href="/professional-development"
                  className="transition-colors duration-200 hover:text-white"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  Professional Development
                </Link>
              </li>
              <li style={{ color: "rgba(255,255,255,0.25)" }} aria-hidden>/</li>
              <li style={{ color: "rgba(255,255,255,0.7)" }}>National Board Guided Practice</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-end">
            {/* Copy */}
            <div>
              {/* Eyebrow pill */}
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7"
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.13)",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: "#378ADD" }}
                />
                <span
                  className="text-xs font-semibold tracking-[0.18em] uppercase"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Guided Practice Workshop
                </span>
              </div>

              <h1
                className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5 max-w-3xl"
                style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                National Board
                <br />
                <span style={{ color: "#4A9FD4" }}>Guided Practice Workshop</span>
              </h1>

              <p
                className="text-lg font-semibold mb-4"
                style={{
                  color: "rgba(255,255,255,0.75)",
                  fontFamily: "var(--font-montserrat), sans-serif",
                }}
              >
                8-Hour Workshop — Prepare with confidence for your NDAEB Clinical Practice
                Evaluation
              </p>
            </div>

            {/* Stats card */}
            <div className="w-full lg:w-auto">
              <div
                className="rounded-2xl p-7 min-w-[220px]"
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <p
                  className="text-[10px] font-bold tracking-[0.22em] uppercase mb-6"
                  style={{ color: "#4A9FD4" }}
                >
                  At a Glance
                </p>
                <div className="flex flex-col gap-5">
                  {[
                    { label: "Duration", value: "8 Hours" },
                    { label: "Format", value: "Hands-On Practice" },
                    { label: "Skills", value: "9 CPE Clinical Skills" },
                    { label: "Investment", value: "$600" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p
                        className="text-[9px] font-bold tracking-[0.18em] uppercase mb-0.5"
                        style={{ color: "rgba(255,255,255,0.35)" }}
                      >
                        {label}
                      </p>
                      <p
                        className="text-sm font-bold"
                        style={{ color: "#ffffff" }}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom rule */}
        <div
          className="absolute bottom-0 inset-x-0 h-px"
          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          aria-hidden
        />
      </section>

      {/* ═══════════════════════════════════════════════════════════
          OVERVIEW + IDEAL FOR
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: "#ffffff" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-16 items-start">
            {/* Left: description */}
            <AnimateIn>
              <p
                className="text-xs font-bold tracking-[0.2em] uppercase mb-4"
                style={{ color: "#4A9FD4" }}
              >
                Workshop Overview
              </p>
              <h2
                className="text-3xl font-bold mb-6 leading-tight"
                style={{
                  color: "#1E3560",
                  fontFamily: "var(--font-montserrat), sans-serif",
                }}
              >
                Prepare with Purpose
              </h2>
              <div className="flex flex-col gap-4 text-base leading-relaxed" style={{ color: "#2B303A" }}>
                <p>
                  This comprehensive 8-hour hands-on practical workshop is designed to prepare dental
                  professional candidates for the National Dental Assisting Examining Board (NDAEB)
                  Clinical Practice Evaluation (CPE). The workshop provides focused instruction,
                  practical skill refinement, and evaluation strategies aligned with the nine
                  clinical skills and professional practice standards assessed during the CPE.
                </p>
                <p>
                  Candidates will strengthen their understanding of critical evaluation criteria,
                  infection prevention and control requirements, and time management techniques.
                  Through simulated clinical exercises, guided practice, and case-based prescriptions,
                  participants will gain confidence performing procedures on manikins to prepare for
                  the CPE.
                </p>
                <p>
                  Emphasis is placed on helping candidates identify and avoid common critical errors
                  that result in unsuccessful outcomes.
                </p>
                <div
                  className="rounded-xl p-4 text-sm leading-relaxed"
                  style={{
                    backgroundColor: "rgba(74,159,212,0.08)",
                    border: "1px solid rgba(74,159,212,0.18)",
                    color: "#2B303A",
                  }}
                >
                  <span style={{ color: "#1E3560", fontWeight: 600 }}>Please note: </span>
                  While attendance at the preparation workshop does not guarantee board examination
                  success, it provides participants with valuable preparation and resources to support
                  their readiness.
                </div>
              </div>
            </AnimateIn>

            {/* Right: ideal for */}
            <AnimateIn delay={130}>
              <div
                className="rounded-2xl p-8"
                style={{ backgroundColor: "#F4F7F9" }}
              >
                <p
                  className="text-xs font-bold tracking-[0.2em] uppercase mb-5"
                  style={{ color: "#4A9FD4" }}
                >
                  Ideal For
                </p>
                <ul className="flex flex-col gap-4">
                  {[
                    "Graduates of non-registered/non-accredited dental assisting programs preparing for the NDAEB CPE",
                    "Internationally educated dental professionals seeking NDAEB certification",
                    "Dental professionals requiring re-evaluation of unsuccessful CPE skills",
                    "Candidates seeking structured preparation prior to their scheduled CPE",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        className="mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: "#1E3560" }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth={2.5}
                          aria-hidden
                          className="w-3 h-3"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      </span>
                      <span
                        className="text-sm leading-relaxed"
                        style={{ color: "#2B303A" }}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          LEARNING OUTCOMES
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: "#F4F7F9" }}>
        <div className="max-w-6xl mx-auto px-6">
          <AnimateIn className="mb-12 max-w-xl">
            <p
              className="text-xs font-bold tracking-[0.2em] uppercase mb-3"
              style={{ color: "#4A9FD4" }}
            >
              Learning Outcomes
            </p>
            <h2
              className="text-3xl font-bold leading-tight"
              style={{
                color: "#1E3560",
                fontFamily: "var(--font-montserrat), sans-serif",
              }}
            >
              By the End of This Workshop,
              <br />
              Participants Will Have Had the Opportunity To:
            </h2>
          </AnimateIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                num: "01",
                text: "Apply infection prevention and control principles required for all CPE skills",
              },
              {
                num: "02",
                text: "Utilise correct ergonomics throughout clinical procedures",
              },
              {
                num: "03",
                text: "Practice effective time management and decision-making during skill performance",
              },
              {
                num: "04",
                text: "Perform the nine NDAEB CPE clinical skills according to prescribed evaluation criteria",
              },
              {
                num: "05",
                text: "Utilise appropriate safety practices and professional behaviours throughout clinical procedures",
              },
            ].map(({ num, text }, i) => (
              <AnimateIn key={num} delay={i * 80}>
                <div
                  className="relative flex flex-col gap-4 rounded-2xl p-7 h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  style={{ backgroundColor: "#ffffff" }}
                >
                  {/* Ghost number */}
                  <span
                    aria-hidden
                    className="absolute bottom-3 right-4 font-bold leading-none select-none pointer-events-none"
                    style={{
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "5rem",
                      color: "rgba(30,53,96,0.04)",
                      lineHeight: 1,
                    }}
                  >
                    {num}
                  </span>
                  <span
                    className="text-[10px] font-bold tracking-[0.18em] uppercase relative z-10"
                    style={{ color: "#4A9FD4" }}
                  >
                    {num}
                  </span>
                  <p
                    className="text-sm leading-relaxed relative z-10"
                    style={{ color: "#2B303A" }}
                  >
                    {text}
                  </p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          DETAILS STRIP
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-20" style={{ backgroundColor: "#1E3560" }}>
        <div className="max-w-6xl mx-auto px-6">
          <AnimateIn className="mb-12 text-center">
            <p
              className="text-xs font-bold tracking-[0.2em] uppercase mb-3"
              style={{ color: "#4A9FD4" }}
            >
              Workshop Details
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold text-white leading-tight"
              style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              Everything You Need to Know
            </h2>
          </AnimateIn>

          <AnimateIn delay={80}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  label: "Duration",
                  value: "8 Hours including lunch and break",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                    </svg>
                  ),
                },
                {
                  label: "Clinical Attire Needed",
                  value: (
                    <ul style={{ margin: 0, paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <li>Scrubs</li>
                      <li>Safety glasses (loops are an option)</li>
                      <li>Indoor shoes with closed toe and heel</li>
                      <li>Scrub cap or cultural headcover</li>
                      <li>Candidate handbook (can be downloaded from the NDAEB website)</li>
                    </ul>
                  ),
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2m-6 9 2 2 4-4" />
                    </svg>
                  ),
                },
                {
                  label: "What to Bring",
                  value: "Lunch, snack, and water bottle",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0z" />
                    </svg>
                  ),
                },
                {
                  label: "Delivery Format",
                  value: "Instructor-led, demonstration and hands-on practice, skills coaching and feedback",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0z" />
                    </svg>
                  ),
                },
                {
                  label: "Reference",
                  value: "Aligned with the NDAEB Clinical Practice Evaluation Candidate Handbook",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                    </svg>
                  ),
                },
              ].map(({ label, value, icon }) => (
                <div
                  key={label}
                  className="flex gap-4 rounded-2xl p-6"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 mt-0.5"
                    style={{ backgroundColor: "rgba(74,159,212,0.2)" }}
                  >
                    <span style={{ color: "#4A9FD4" }}>{icon}</span>
                  </div>
                  <div>
                    <p
                      className="text-[10px] font-bold tracking-[0.18em] uppercase mb-1.5"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                      {label}
                    </p>
                    <div className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
                      {value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-24" style={{ backgroundColor: "#F4F7F9" }}>
        <div className="max-w-4xl mx-auto px-6">
          <AnimateIn>
            <div
              className="rounded-2xl p-10 sm:p-14 text-center"
              style={{ backgroundColor: "#ffffff", boxShadow: "0 4px 32px rgba(30,53,96,0.08)" }}
            >
              <p
                className="text-xs font-bold tracking-[0.2em] uppercase mb-4"
                style={{ color: "#4A9FD4" }}
              >
                Ready to Register?
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold mb-5 leading-tight"
                style={{
                  color: "#1E3560",
                  fontFamily: "var(--font-montserrat), sans-serif",
                }}
              >
                Connect with Our Team to Find
                <br />
                the Next Available Date.
              </h2>
              <p
                className="text-base leading-relaxed mb-10 max-w-lg mx-auto"
                style={{ color: "#2B303A" }}
              >
                Workshop dates are offered on a rolling basis. Reach out and we&apos;ll let you
                know when the next session is scheduled.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/contact"
                  className="rounded-lg px-8 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:bg-[#CF6D17] hover:scale-[1.02]"
                  style={{ backgroundColor: "#E67E22" }}
                >
                  Contact Us
                </Link>
                <Link
                  href="/professional-development"
                  className="rounded-lg px-8 py-3.5 text-sm font-bold transition-all duration-200 border hover:bg-[#F4F7F9]"
                  style={{ color: "#1E3560", borderColor: "rgba(30,53,96,0.2)" }}
                >
                  All Professional Development
                </Link>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>
    </>
  );
}
