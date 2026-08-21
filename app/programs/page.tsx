import type { Metadata } from "next";
import Link from "next/link";
import AnimateIn from "@/components/AnimateIn";
import type { Program } from "@/types/program";
import { FloatingPaths } from "@/components/ui/background-paths";

// ─── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Workshops & Professional Development",
  description:
    "Explore professional development workshops at Western Dental Academy — hands-on clinical skills training, radiography essentials, and continuing training for dental teams in Alberta.",
};

// ─── Sanity fetch (activate when CMS is connected) ────────────────────────────
//
// import { sanityFetch } from "@/sanity/lib/live";
// import { PROGRAMS_QUERY } from "@/sanity/lib/queries";
//
// Replace `PLACEHOLDER_PROGRAMS` below with:
// const { data: programs } = await sanityFetch({ query: PROGRAMS_QUERY });

// ─── Placeholder data ──────────────────────────────────────────────────────────

const PLACEHOLDER_PROGRAMS: Program[] = [
  {
    _id: "placeholder-1",
    title: "Distance Delivery Clinical Skills Workshop",
    slug: { current: "distance-delivery-clinical-skills-workshop" },
    description:
      "Designed for dental support staff who need flexible professional development without compromising the quality of hands-on training.",
    duration: "Contact for Details",
    cost: "Contact for Pricing",
    badge: "Launching Soon",
    highlights: [
      "Complete theory modules online at your own pace",
      "Continue working in your dental clinic while you learn",
      "Attend scheduled hands-on clinical training at Western Dental Academy",
      "Learn from highly qualified instructors with real-world experience",
      "Benefit from small cohort sizes and tailored support",
    ],
    closingStatement:
      "This workshop equips participants with practical clinical skills and professional confidence — no matter where they are located.",
  },
  {
    _id: "placeholder-2",
    title: "NDAB Skills Refresher Workshop",
    slug: { current: "ndab-skills-refresher-workshop" },
    description:
      "A focused skills workshop for dental assistants preparing for the National Dental Assisting Board (NDAB) exam — covering key topic areas and practical exam strategy.",
    duration: "Contact for Details",
    cost: "Contact for Pricing",
    badge: "Coming Soon",
    note: "Workshop schedule and pricing to be confirmed.",
  },
  {
    _id: "placeholder-3",
    title: "Introduction to the Dental Office",
    slug: { current: "introduction-to-the-dental-office" },
    description:
      "An introductory workshop designed to familiarize participants with the dental office environment — ideal for those exploring a future in dental support roles.",
    duration: "Contact for Details",
    cost: "Contact for Pricing",
    badge: "Coming Soon",
    eligibility: "Applicable to ages 16 and up",
    note: "Workshop name may be updated.",
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
      className="w-4 h-4 shrink-0"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
      />
    </svg>
  );
}

function CurrencyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
      className="w-4 h-4 shrink-0"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
      className="w-3.5 h-3.5 shrink-0 mt-0.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4.5 12.75 6 6 9-13.5"
      />
    </svg>
  );
}

function ProgramCard({ program, index }: { program: Program; index: number }) {
  const num = String(index + 1).padStart(2, "0");

  return (
    <AnimateIn delay={index * 100} className="flex flex-col">
      <div
        className="group flex flex-col flex-1 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        style={{ backgroundColor: "#F4F7F9" }}
      >
        {/* Blue top accent */}
        <div className="h-1 w-full" style={{ backgroundColor: "#4A9FD4" }} />

        <div className="flex flex-col flex-1 p-8">
          {/* Number + status badge row */}
          <div className="flex items-center justify-between mb-5">
            <p
              className="text-xs font-bold tracking-[0.18em] uppercase"
              style={{ color: "#4A9FD4" }}
            >
              {num}
            </p>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em]"
              style={{
                backgroundColor: "rgba(230,126,34,0.12)",
                color: "#E67E22",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: "#E67E22" }}
              />
              {program.badge ?? "Launching Soon"}
            </span>
          </div>

          {/* Title */}
          <h2
            className="text-xl font-bold mb-2 leading-snug"
            style={{
              color: "#1E3560",
              fontFamily: "var(--font-montserrat), sans-serif",
            }}
          >
            {program.title}
          </h2>

          {/* Eligibility (if present) */}
          {program.eligibility && (
            <p
              className="text-xs font-semibold mb-4"
              style={{ color: "#4A9FD4" }}
            >
              {program.eligibility}
            </p>
          )}

          {/* Description */}
          <p
            className="text-sm leading-relaxed mb-7"
            style={{ color: "#2B303A" }}
          >
            {program.description}
          </p>

          {/* Highlights (if present) */}
          {program.highlights && program.highlights.length > 0 && (
            <ul className="flex flex-col gap-2.5 mb-6">
              {program.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2.5">
                  <span style={{ color: "#4A9FD4" }}>
                    <CheckIcon />
                  </span>
                  <span className="text-sm leading-relaxed" style={{ color: "#2B303A" }}>
                    {h}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Closing statement (if present) */}
          {program.closingStatement && (
            <p
              className="text-sm font-semibold leading-relaxed italic mb-7"
              style={{ color: "#1E3560" }}
            >
              {program.closingStatement}
            </p>
          )}

          {/* Divider */}
          <div
            className="mb-5 h-px"
            style={{ backgroundColor: "rgba(30,53,96,0.1)" }}
          />

          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div
              className="flex items-center gap-1.5 text-xs font-semibold"
              style={{ color: "#1E3560" }}
            >
              <ClockIcon />
              {program.duration}
            </div>
            <div
              className="flex items-center gap-1.5 text-xs font-semibold"
              style={{ color: "#1E3560" }}
            >
              <CurrencyIcon />
              {program.cost}
            </div>
          </div>

          {/* Note (if present) */}
          {program.note && (
            <p
              className="text-[11px] italic mb-6"
              style={{ color: "rgba(43,48,58,0.5)" }}
            >
              {program.note}
            </p>
          )}

          {/* CTA */}
          <Link
            href="/contact"
            className="group/link inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white self-start transition-all duration-200 hover:scale-[1.02]"
            style={{ backgroundColor: "#E67E22" }}
          >
            Enquire Now
            <span className="transition-transform duration-200 group-hover/link:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </AnimateIn>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function ProgramsPage() {
  // Swap this line when Sanity is connected:
  const programs = PLACEHOLDER_PROGRAMS;

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          PAGE HERO
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
            backgroundImage:
              "radial-gradient(circle, #4A9FD4 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Radial glow top-right */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(74,159,212,0.15) 0%, transparent 70%)",
          }}
        />
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />

        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-20">
          {/* Breadcrumb */}
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
              <li style={{ color: "rgba(255,255,255,0.25)" }} aria-hidden>
                /
              </li>
              <li style={{ color: "rgba(255,255,255,0.7)" }}>Workshops</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-end">
            {/* Copy */}
            <div>
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7"
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
                  Workshops &amp; Development
                </span>
              </div>

              <h1
                className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5"
                style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                Professional Development
                <br />
                <span style={{ color: "#4A9FD4" }}>for Dental Teams</span>
              </h1>

              <p
                className="text-lg leading-relaxed max-w-xl"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                Whether you&apos;re building new skills or refreshing your
                clinical knowledge, WDA offers practical, expert-led workshops
                designed around real dental office experience.
              </p>
            </div>

            {/* Stats aside */}
            <div className="flex flex-row lg:flex-col gap-6 lg:gap-5 lg:items-end">
              {[
                { val: "Online", label: "Theory Delivery" },
                { val: "100%", label: "Hands-On Clinical Training" },
                { val: "Flexible", label: "Learn on Your Schedule" },
              ].map(({ val, label }) => (
                <div key={label} className="flex flex-col lg:items-end">
                  <span
                    className="text-2xl font-bold leading-none"
                    style={{
                      color: "#4A9FD4",
                      fontFamily: "var(--font-montserrat), sans-serif",
                    }}
                  >
                    {val}
                  </span>
                  <span
                    className="text-xs mt-1"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    {label}
                  </span>
                </div>
              ))}
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
          PROGRAMS GRID
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: "#ffffff" }}>
        <div className="max-w-6xl mx-auto px-6">
          {/* Section intro */}
          <AnimateIn className="mb-14">
            <p
              className="text-xs font-bold tracking-[0.2em] uppercase mb-3"
              style={{ color: "#4A9FD4" }}
            >
              Current Workshops
            </p>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <h2
                className="text-3xl font-bold leading-tight"
                style={{
                  color: "#1E3560",
                  fontFamily: "var(--font-montserrat), sans-serif",
                }}
              >
                Now Accepting Registrations
              </h2>
              <p className="text-sm max-w-sm" style={{ color: "#2B303A" }}>
                Flexible delivery — complete theory online and attend hands-on
                clinical training at our Sherwood Park facility.
              </p>
            </div>
          </AnimateIn>

          {programs.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {programs.map((program, i) => (
                <ProgramCard key={program._id} program={program} index={i} />
              ))}
            </div>
          ) : (
            /* Empty state for when Sanity returns no results */
            <AnimateIn>
              <div
                className="rounded-2xl py-20 flex flex-col items-center text-center"
                style={{ backgroundColor: "#F4F7F9" }}
              >
                <p
                  className="text-lg font-semibold mb-2"
                  style={{ color: "#1E3560" }}
                >
                  Programs coming soon
                </p>
                <p className="text-sm mb-6" style={{ color: "#2B303A" }}>
                  Our upcoming program schedule is being finalized.
                </p>
                <Link
                  href="/contact"
                  className="rounded-lg px-6 py-2.5 text-sm font-bold text-white transition-colors duration-200 bg-[#E67E22] hover:bg-[#CF6D17]"
                >
                  Get Notified
                </Link>
              </div>
            </AnimateIn>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PROGRAM AT A GLANCE
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: "#F4F7F9" }}>
        <div className="max-w-6xl mx-auto px-6">

          <AnimateIn className="mb-12">
            <p
              className="text-xs font-bold tracking-[0.2em] uppercase mb-3"
              style={{ color: "#4A9FD4" }}
            >
              At a Glance
            </p>
            <h2
              className="text-3xl font-bold leading-tight"
              style={{
                color: "#1E3560",
                fontFamily: "var(--font-montserrat), sans-serif",
              }}
            >
              Workshop Overview
            </h2>
          </AnimateIn>

          <AnimateIn>
            <div
              className="rounded-2xl overflow-hidden max-w-2xl"
              style={{ boxShadow: "0 4px 32px rgba(30,53,96,0.1), 0 1px 4px rgba(30,53,96,0.06)" }}
            >
              <div
                className="px-6 py-4"
                style={{ backgroundColor: "#1E3560", borderTop: "3px solid #4A9FD4" }}
              >
                <p
                  className="text-sm font-bold text-white leading-snug"
                  style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
                >
                  Distance Delivery Clinical Skills Workshop
                </p>
              </div>
              <table className="w-full border-collapse">
                <tbody>
                  {[
                    { label: "Delivery Format", value: "Online theory + in-person clinical training" },
                    { label: "Credential", value: "Certificate of Attendance" },
                    { label: "Schedule", value: "Flexible — continue working while you learn" },
                    { label: "Clinical Training", value: "Scheduled at Western Dental Academy" },
                    { label: "Cohort Size", value: "Small — tailored support for every participant" },
                    { label: "Start Dates", value: "Contact us for upcoming workshop dates" },
                    { label: "Prerequisites", value: "Contact us for requirements" },
                    { label: "Pricing", value: "Contact for Details" },
                  ].map(({ label, value }, ri) => (
                    <tr key={label} style={{ backgroundColor: ri % 2 === 0 ? "#ffffff" : "#F4F7F9" }}>
                      <td
                        className="px-6 py-4 text-xs font-bold uppercase tracking-[0.12em] w-44"
                        style={{
                          color: "#1E3560",
                          fontFamily: "var(--font-montserrat), sans-serif",
                          borderRight: "1px solid rgba(30,53,96,0.08)",
                          backgroundColor: ri % 2 === 0 ? "#F4F7F9" : "#edf1f5",
                        }}
                      >
                        {label}
                      </td>
                      <td
                        className="px-5 py-4 text-sm font-medium"
                        style={{ color: "#1E3560" }}
                      >
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: "#1E3560" }}>
                    <td
                      className="px-6 py-5 text-xs font-bold uppercase tracking-[0.14em]"
                      style={{
                        color: "rgba(255,255,255,0.4)",
                        borderRight: "1px solid rgba(255,255,255,0.08)",
                        fontFamily: "var(--font-montserrat), sans-serif",
                      }}
                    >
                      Interested?
                    </td>
                    <td className="px-5 py-5">
                      <Link
                        href="/contact"
                        className="inline-block rounded-lg px-4 py-2 text-xs font-bold transition-colors duration-200 hover:bg-[#CF6D17]"
                        style={{ backgroundColor: "#E67E22", color: "#ffffff" }}
                      >
                        Enquire Now →
                      </Link>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </AnimateIn>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          ENROLLMENT CTA
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: "#F4F7F9" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Copy */}
            <AnimateIn>
              <p
                className="text-xs font-bold tracking-[0.2em] uppercase mb-4"
                style={{ color: "#4A9FD4" }}
              >
                Registration
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold mb-5 leading-tight"
                style={{
                  color: "#1E3560",
                  fontFamily: "var(--font-montserrat), sans-serif",
                }}
              >
                Not sure which
                <br />
                workshop is right
                <br />
                for you?
              </h2>
              <p
                className="text-base leading-relaxed mb-8 max-w-md"
                style={{ color: "#2B303A" }}
              >
                Our team can walk you through each workshop, discuss your
                professional development goals, and help you find the right
                fit — no pressure, no commitment required.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="rounded-lg px-7 py-3.5 text-sm font-bold text-white transition-all duration-200 bg-[#E67E22] hover:bg-[#CF6D17] hover:scale-[1.02]"
                >
                  Talk to Admissions
                </Link>
                <Link
                  href="/contact"
                  className="rounded-lg px-7 py-3.5 text-sm font-bold transition-all duration-200 border hover:bg-white"
                  style={{
                    color: "#1E3560",
                    borderColor: "rgba(30,53,96,0.25)",
                  }}
                >
                  Book a Campus Tour
                </Link>
              </div>
            </AnimateIn>

            {/* Info card */}
            <AnimateIn delay={120}>
              <div
                className="rounded-2xl p-8"
                style={{ backgroundColor: "#1E3560" }}
              >
                <p
                  className="text-xs font-bold tracking-[0.18em] uppercase mb-6"
                  style={{ color: "#4A9FD4" }}
                >
                  Registration Info
                </p>
                <ul className="flex flex-col gap-6">
                  {[
                    {
                      label: "Next Workshop",
                      value: "Contact us for current workshop dates",
                    },
                    {
                      label: "Registration",
                      value: "Rolling intake — register any time",
                    },
                    {
                      label: "Prerequisites",
                      value: "Contact us for workshop-specific requirements",
                    },
                    {
                      label: "Location",
                      value: "Online theory + hands-on training in Sherwood Park, AB",
                    },
                  ].map(({ label, value }) => (
                    <li
                      key={label}
                      className="pb-6 last:pb-0"
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <p
                        className="text-xs font-bold tracking-wide uppercase mb-1"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                      >
                        {label}
                      </p>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "rgba(255,255,255,0.85)" }}
                      >
                        {value}
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <Link
                    href="mailto:info@westerndentalacademy.com"
                    className="group flex items-center gap-2 text-sm font-bold transition-colors duration-200"
                    style={{ color: "#4A9FD4" }}
                  >
                    info@westerndentalacademy.com
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>
    </>
  );
}
