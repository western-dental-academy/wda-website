import type { Metadata } from "next";
import Link from "next/link";
import AnimateIn from "@/components/AnimateIn";
import { FloatingPaths } from "@/components/ui/background-paths";

// ─── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Workshops & Professional Development",
  description:
    "Explore professional development workshops at Western Dental Academy — hands-on clinical skills, dental radiography, infection control, and NDAB exam preparation for dental teams in Alberta.",
};

// ─── Workshop data ─────────────────────────────────────────────────────────────

const workshops = [
  {
    num: "01",
    title: "Clinical Skills Workshop",
    badge: "Launching Soon",
    description:
      "Hands-on workshop covering chairside techniques, instrument handling, dental materials, infection control, and clinical protocols — delivered by practicing dental professionals in a real clinical environment.",
    highlights: [
      "Chairside procedures and instrument handling",
      "Infection control and sterilization best practices",
      "Dental materials and tray setup",
      "Patient management and communication fundamentals",
      "Small cohort size for individualized attention",
    ],
    tags: ["Hands-On", "Expert-Led", "Certificate of Attendance"],
  },
  {
    num: "02",
    title: "Dental Radiography Essentials",
    badge: "Coming Soon",
    description:
      "Practical training in digital radiography techniques, radiation safety procedures, and image handling for dental support staff and office teams across Alberta.",
    highlights: [
      "Digital X-ray technique and positioning",
      "Radiation safety regulations and compliance",
      "Image quality assessment and error identification",
      "ALARA principles and protective protocols",
    ],
    tags: ["Technical Skills", "Safety Focused", "Certificate of Attendance"],
  },
  {
    num: "03",
    title: "Infection Control & Sterilization",
    badge: "Coming Soon",
    description:
      "Best practices for sterilization, disinfection, and infection prevention in dental environments — aligned with current RCDSO and Alberta Health Services guidelines.",
    highlights: [
      "Instrument sterilization cycles and monitoring",
      "Surface disinfection and barrier protection",
      "Personal protective equipment (PPE) protocols",
      "Regulatory compliance and documentation",
    ],
    tags: ["Safety Focused", "Compliance", "Certificate of Attendance"],
  },
  {
    num: "04",
    title: "Office Administration & Patient Communication",
    badge: "Coming Soon",
    description:
      "Professional development covering patient intake workflows, appointment management, dental software navigation, and effective communication in a modern dental office environment.",
    highlights: [
      "Patient intake and records management",
      "Scheduling and appointment workflows",
      "Dental software and electronic charting basics",
      "Professional communication and patient interaction",
    ],
    tags: ["Professional Skills", "Office Ready", "Certificate of Attendance"],
  },
  {
    num: "05",
    title: "NDAB Exam Preparation",
    badge: "Coming Soon",
    description:
      "A focused skills refresher and exam strategy workshop for dental assistants preparing for the National Dental Assisting Board (NDAB) exam — covering key subject areas, clinical competencies, and test-taking strategies.",
    highlights: [
      "Review of key NDAB subject domains",
      "Practical clinical competency refresher",
      "Exam strategy and question-format practice",
      "Study planning and resource guidance",
    ],
    tags: ["Exam Preparation", "Self-Directed", "Certificate of Attendance"],
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

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

function WorkshopCard({
  workshop,
  index,
}: {
  workshop: (typeof workshops)[number];
  index: number;
}) {
  return (
    <AnimateIn delay={index * 80} className="flex flex-col">
      <div
        className="group flex flex-col flex-1 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        style={{ backgroundColor: "#F4F7F9" }}
      >
        {/* Blue top accent */}
        <div className="h-1 w-full" style={{ backgroundColor: "#4A9FD4" }} />

        <div className="flex flex-col flex-1 p-8">
          {/* Number + badge row */}
          <div className="flex items-center justify-between mb-5">
            <p
              className="text-xs font-bold tracking-[0.18em] uppercase"
              style={{ color: "#4A9FD4" }}
            >
              {workshop.num}
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
              {workshop.badge}
            </span>
          </div>

          {/* Title */}
          <h2
            className="text-xl font-bold mb-3 leading-snug"
            style={{
              color: "#1E3560",
              fontFamily: "var(--font-montserrat), sans-serif",
            }}
          >
            {workshop.title}
          </h2>

          {/* Description */}
          <p
            className="text-sm leading-relaxed mb-6"
            style={{ color: "#2B303A" }}
          >
            {workshop.description}
          </p>

          {/* Highlights */}
          <ul className="flex flex-col gap-2.5 mb-6 flex-1">
            {workshop.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2.5">
                <span style={{ color: "#4A9FD4" }}>
                  <CheckIcon />
                </span>
                <span
                  className="text-sm leading-relaxed"
                  style={{ color: "#2B303A" }}
                >
                  {h}
                </span>
              </li>
            ))}
          </ul>

          {/* Divider */}
          <div
            className="mb-5 h-px"
            style={{ backgroundColor: "rgba(30,53,96,0.1)" }}
          />

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {workshop.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-semibold px-3 py-1 rounded-full"
                style={{
                  backgroundColor: "rgba(30,53,96,0.07)",
                  color: "#1E3560",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/register"
            className="group/link inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white self-start transition-all duration-200 hover:scale-[1.02]"
            style={{ backgroundColor: "#E67E22" }}
          >
            Register
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

export default function WorkshopsPage() {
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
                Whether you&apos;re building new clinical skills or refreshing
                your knowledge, WDA offers practical, expert-led workshops
                designed around real dental office experience.
              </p>
            </div>

            {/* Stats aside */}
            <div className="flex flex-row lg:flex-col gap-6 lg:gap-5 lg:items-end">
              {[
                { val: "100%", label: "Hands-On Delivery" },
                { val: "Flexible", label: "Schedule Formats" },
                { val: "Expert", label: "Industry Instructors" },
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
          WORKSHOPS GRID
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
                training at our Sherwood Park facility.
              </p>
            </div>
          </AnimateIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {workshops.map((workshop, i) => (
              <WorkshopCard key={workshop.num} workshop={workshop} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          REGISTRATION CTA
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
                professional development goals, and help you find the best
                fit — no pressure, no commitment required.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="rounded-lg px-7 py-3.5 text-sm font-bold text-white transition-all duration-200 bg-[#E67E22] hover:bg-[#CF6D17] hover:scale-[1.02]"
                >
                  Contact Us
                </Link>
                <Link
                  href="/book-a-tour"
                  className="rounded-lg px-7 py-3.5 text-sm font-bold transition-all duration-200 border hover:bg-white"
                  style={{
                    color: "#1E3560",
                    borderColor: "rgba(30,53,96,0.25)",
                  }}
                >
                  Book a Campus Visit
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
                      label: "Credential",
                      value: "Certificate of Attendance issued upon completion",
                    },
                    {
                      label: "Location",
                      value:
                        "Online theory + hands-on training in Sherwood Park, AB",
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
                <div
                  className="mt-6 pt-6"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
                >
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
