import type { Metadata } from "next";
import Link from "next/link";
import AnimateIn from "@/components/AnimateIn";
import type { Program } from "@/types/program";
import { FloatingPaths } from "@/components/ui/background-paths";

// ─── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Programs",
  description:
    "Explore dental training programs at Western Dental Academy — from our flagship 12-month Dental Assisting Certificate to continuing education courses for working professionals.",
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
    title: "Dental Assisting Certificate",
    slug: { current: "dental-assisting-certificate" },
    description:
      "Our flagship program provides comprehensive training in chairside dental assisting. Students master clinical procedures, dental radiography, infection control protocols, and patient communication — graduating fully prepared for immediate employment in dental practices across Alberta.",
    duration: "12 Months",
    cost: "Contact for Pricing",
    highlights: [
      "Chairside assisting and four-handed dentistry",
      "Dental radiography and digital imaging",
      "Infection prevention and control (IPAC)",
      "Dental materials and instrumentation",
      "Patient communication and care",
      "Clinical practicum with real patients",
    ],
  },
  {
    _id: "placeholder-2",
    title: "Dental Radiography Certification",
    slug: { current: "dental-radiography-certification" },
    description:
      "A focused course in dental radiography covering intraoral and extraoral imaging techniques, radiation safety protocols, digital imaging software, and proper exposure settings. Ideal for dental assistants looking to expand their scope of practice.",
    duration: "8 Weeks",
    cost: "Contact for Pricing",
    highlights: [
      "Intraoral and extraoral radiography",
      "Radiation safety and protective protocols",
      "Digital imaging software",
      "Exposure settings and quality assurance",
    ],
  },
  {
    _id: "placeholder-3",
    title: "Infection Control & IPAC",
    slug: { current: "infection-control-ipac" },
    description:
      "An intensive short course on infection prevention and control in dental environments. Covers current Alberta Health Services guidelines, sterilization procedures, personal protective equipment, and best practices for maintaining a safe clinical environment.",
    duration: "4 Weeks",
    cost: "Contact for Pricing",
    highlights: [
      "Alberta Health Services guidelines",
      "Sterilization and disinfection procedures",
      "PPE selection and use",
      "Instrument processing and handling",
    ],
  },
  {
    _id: "placeholder-4",
    title: "Dental Office Administration",
    slug: { current: "dental-office-administration" },
    description:
      "Designed for those pursuing a front-desk or administrative role in a dental practice. Covers appointment scheduling, dental billing and insurance claims, patient records management, and dental practice management software.",
    duration: "6 Months",
    cost: "Contact for Pricing",
    highlights: [
      "Appointment scheduling and recall systems",
      "Dental billing codes and insurance claims",
      "Patient records and privacy compliance",
      "Practice management software",
    ],
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
          {/* Number badge */}
          <p
            className="text-xs font-bold tracking-[0.18em] uppercase mb-5"
            style={{ color: "#4A9FD4" }}
          >
            {num}
          </p>

          {/* Title */}
          <h2
            className="text-xl font-bold mb-4 leading-snug"
            style={{
              color: "#1E3560",
              fontFamily: "var(--font-montserrat), sans-serif",
            }}
          >
            {program.title}
          </h2>

          {/* Description */}
          <p
            className="text-sm leading-relaxed flex-1 mb-7"
            style={{ color: "#2B303A" }}
          >
            {program.description}
          </p>

          {/* Highlights (if present) */}
          {program.highlights && program.highlights.length > 0 && (
            <ul className="flex flex-col gap-2 mb-7">
              {program.highlights.slice(0, 4).map((h) => (
                <li key={h} className="flex items-start gap-2.5">
                  <span style={{ color: "#4A9FD4" }}>
                    <CheckIcon />
                  </span>
                  <span className="text-xs leading-relaxed" style={{ color: "#2B303A" }}>
                    {h}
                  </span>
                </li>
              ))}
            </ul>
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

          {/* CTA */}
          <Link
            href={`/programs/${program.slug.current}`}
            className="group/link inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white self-start transition-all duration-200 hover:scale-[1.02]"
            style={{ backgroundColor: "#4A9FD4" }}
          >
            View Program Details
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
              <li style={{ color: "rgba(255,255,255,0.7)" }}>Programs</li>
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
                  Programs &amp; Courses
                </span>
              </div>

              <h1
                className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5"
                style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                Find Your Path in
                <br />
                <span style={{ color: "#4A9FD4" }}>Dental Care</span>
              </h1>

              <p
                className="text-lg leading-relaxed max-w-xl"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                Whether you&apos;re starting your dental career or advancing
                your existing skills, WDA offers practical, career-ready
                programs designed around real clinical experience.
              </p>
            </div>

            {/* Stats aside */}
            <div className="flex flex-row lg:flex-col gap-6 lg:gap-5 lg:items-end">
              {[
                { val: String(programs.length), label: "Programs Available" },
                { val: "100%", label: "Hands-On Training" },
                { val: "CDAA", label: "Curriculum Aligned" },
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
              All Programs
            </p>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <h2
                className="text-3xl font-bold leading-tight"
                style={{
                  color: "#1E3560",
                  fontFamily: "var(--font-montserrat), sans-serif",
                }}
              >
                {programs.length} Program
                {programs.length !== 1 ? "s" : ""} Available
              </h2>
              <p className="text-sm max-w-sm" style={{ color: "#2B303A" }}>
                All programs are delivered in-person in Edmonton, Alberta.
                Financing options available — contact us for details.
              </p>
            </div>
          </AnimateIn>

          {programs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
          PROGRAM COMPARISON TABLE
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: "#F4F7F9" }}>
        <div className="max-w-6xl mx-auto px-6">

          {/* Section intro */}
          <AnimateIn className="mb-12">
            <p
              className="text-xs font-bold tracking-[0.2em] uppercase mb-3"
              style={{ color: "#4A9FD4" }}
            >
              At a Glance
            </p>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <h2
                className="text-3xl font-bold leading-tight"
                style={{
                  color: "#1E3560",
                  fontFamily: "var(--font-montserrat), sans-serif",
                }}
              >
                Compare Programs
              </h2>
              <p className="text-sm max-w-sm" style={{ color: "rgba(43,48,58,0.65)" }}>
                Scroll horizontally on smaller screens to view all columns.
              </p>
            </div>
          </AnimateIn>

          {/* Table */}
          <AnimateIn>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ boxShadow: "0 4px 32px rgba(30,53,96,0.1), 0 1px 4px rgba(30,53,96,0.06)" }}
            >
              <div className="overflow-x-auto">
                <table className="w-full border-collapse" style={{ minWidth: "700px" }}>

                  {/* ── Header row ── */}
                  <thead>
                    <tr style={{ backgroundColor: "#1E3560" }}>
                      {/* Empty corner cell */}
                      <th
                        className="text-left px-6 py-5 w-44"
                        style={{ borderRight: "1px solid rgba(255,255,255,0.08)" }}
                      />

                      {/* Program columns */}
                      {[
                        { name: "Dental Assisting Certificate", flagship: true },
                        { name: "Dental Radiography Certification", flagship: false },
                        { name: "Infection Control & IPAC", flagship: false },
                        { name: "Dental Office Administration", flagship: false },
                      ].map(({ name, flagship }, ci) => (
                        <th
                          key={name}
                          className="px-5 py-5 text-left align-top"
                          style={{
                            borderRight: ci < 3 ? "1px solid rgba(255,255,255,0.08)" : "none",
                            borderTop: flagship ? "3px solid #4A9FD4" : "3px solid transparent",
                          }}
                        >
                          {flagship && (
                            <span
                              className="inline-block text-[9px] font-bold uppercase tracking-[0.18em] rounded-full px-2.5 py-0.5 mb-2"
                              style={{
                                backgroundColor: "rgba(74,159,212,0.2)",
                                color: "#4A9FD4",
                              }}
                            >
                              Flagship
                            </span>
                          )}
                          <p
                            className="text-sm font-bold leading-snug text-white"
                            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
                          >
                            {name}
                          </p>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {/* ── Body rows ── */}
                  <tbody>
                    {[
                      {
                        label: "Program Duration",
                        values: ["12 Months", "8 Weeks", "4 Weeks", "6 Months"],
                      },
                      {
                        label: "Total Cost",
                        values: [
                          "Contact for Pricing",
                          "Contact for Pricing",
                          "Contact for Pricing",
                          "Contact for Pricing",
                        ],
                      },
                      {
                        label: "Hands-On Clinic Hours",
                        values: ["200+ Hours", "40 Hours", "16 Hours", "N/A"],
                        flagship: ["200+ Hours"],
                      },
                      {
                        label: "Certification Earned",
                        values: [
                          "Dental Assisting Certificate",
                          "Radiography Certificate",
                          "IPAC Certificate",
                          "Office Admin Certificate",
                        ],
                      },
                      {
                        label: "Class Schedule",
                        values: [
                          "Full-Time",
                          "Part-Time Available",
                          "Part-Time Available",
                          "Full & Part-Time",
                        ],
                      },
                      {
                        label: "Start Dates",
                        values: [
                          "Rolling Admissions",
                          "Rolling Admissions",
                          "Rolling Admissions",
                          "Rolling Admissions",
                        ],
                      },
                      {
                        label: "Prerequisites",
                        values: [
                          "High School Diploma / GED",
                          "None Required",
                          "None Required",
                          "High School Diploma / GED",
                        ],
                      },
                    ].map((row, ri) => {
                      const rowBg = ri % 2 === 0 ? "#ffffff" : "#F4F7F9";
                      return (
                        <tr key={row.label} style={{ backgroundColor: rowBg }}>
                          {/* Row label */}
                          <td
                            className="px-6 py-4 text-xs font-bold uppercase tracking-[0.12em]"
                            style={{
                              color: "#1E3560",
                              fontFamily: "var(--font-montserrat), sans-serif",
                              borderRight: "1px solid rgba(30,53,96,0.08)",
                              backgroundColor: ri % 2 === 0 ? "#F4F7F9" : "#edf1f5",
                            }}
                          >
                            {row.label}
                          </td>

                          {/* Data cells */}
                          {row.values.map((val, ci) => (
                            <td
                              key={ci}
                              className="px-5 py-4 text-sm"
                              style={{
                                color: ci === 0 ? "#1E3560" : "#2B303A",
                                borderRight: ci < 3 ? "1px solid rgba(30,53,96,0.06)" : "none",
                                fontWeight: ci === 0 ? 600 : 400,
                              }}
                            >
                              {val}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>

                  {/* ── Footer row: CTA per column ── */}
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
                        Ready to apply?
                      </td>
                      {[true, false, false, false].map((flagship, ci) => (
                        <td
                          key={ci}
                          className="px-5 py-5"
                          style={{
                            borderRight: ci < 3 ? "1px solid rgba(255,255,255,0.08)" : "none",
                          }}
                        >
                          <Link
                            href="/apply"
                            className="inline-block rounded-lg px-4 py-2 text-xs font-bold transition-colors duration-200"
                            style={
                              flagship
                                ? { backgroundColor: "#E67E22", color: "#ffffff" }
                                : {
                                    backgroundColor: "rgba(255,255,255,0.08)",
                                    color: "rgba(255,255,255,0.7)",
                                  }
                            }
                          >
                            Apply Now →
                          </Link>
                        </td>
                      ))}
                    </tr>
                  </tfoot>

                </table>
              </div>
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
                Admissions
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
                program is right
                <br />
                for you?
              </h2>
              <p
                className="text-base leading-relaxed mb-8 max-w-md"
                style={{ color: "#2B303A" }}
              >
                Our admissions team can walk you through each program,
                discuss your goals, and help you find the best fit — no
                pressure, no commitment required.
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
                  Enrollment Info
                </p>
                <ul className="flex flex-col gap-6">
                  {[
                    {
                      label: "Next Cohort Start",
                      value: "Contact us for current start dates",
                    },
                    {
                      label: "Intake Format",
                      value: "Rolling admissions — apply any time",
                    },
                    {
                      label: "Prerequisites",
                      value: "High school diploma or equivalent",
                    },
                    {
                      label: "Location",
                      value: "Sherwood Park, AB — in-person",
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
