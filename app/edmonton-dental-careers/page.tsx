import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  TrendingUp,
  Users,
  Banknote,
  Building2,
  ChevronRight,
} from "lucide-react";
import { FloatingPaths } from "@/components/ui/background-paths";

export const metadata: Metadata = {
  title: "Dental Careers in Edmonton | Dental Assistant Training Alberta",
  description:
    "Explore dental assistant careers in Edmonton, Alberta. Learn about salaries, hiring demand, and how Western Dental Academy prepares you for a rewarding career in the Edmonton dental field.",
  keywords: [
    "dental assistant training Edmonton",
    "dental assisting program Alberta",
    "become a dental assistant Edmonton",
    "dental careers Edmonton Alberta",
    "dental assistant salary Edmonton",
    "ACDA certified dental assistant Alberta",
  ],
  openGraph: {
    title: "Dental Careers in Edmonton | Western Dental Academy",
    description:
      "Alberta's dental sector is growing. Discover the career opportunities, salaries, and training pathways available to dental assistants in Edmonton.",
    url: "https://westerndentalacademy.com/edmonton-dental-careers",
  },
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const heroStats = [
  { value: "3,500+", label: "Dental practices in Alberta" },
  { value: "$52,000+", label: "Avg. starting salary in Edmonton" },
  { value: "12%", label: "Projected sector growth by 2030" },
];

const practiceTypes = [
  {
    name: "General & Family Dentistry",
    desc: "The most common entry point for new graduates — routine procedures, preventive care, and patient education.",
  },
  {
    name: "Dental Specialist Offices",
    desc: "Oral surgery, endodontics, periodontics, and prosthodontics practices often pay premium rates for experienced assistants.",
  },
  {
    name: "Pediatric Dentistry",
    desc: "Specialized care for children requiring strong communication skills and a calm, reassuring chairside manner.",
  },
  {
    name: "Orthodontic Clinics",
    desc: "High-volume, appointment-driven environments with consistent schedules and strong long-term career stability.",
  },
  {
    name: "Community & Public Health",
    desc: "Indigenous health centres, publicly funded programs, and Edmonton community clinics serving underserved populations.",
  },
];

const whyEdmontonCards = [
  {
    icon: BadgeCheck,
    headline: "Alberta-Regulated Certification",
    body: "The Alberta College of Dental Assistants (ACDA) regulates the profession province-wide. WDA's curriculum is aligned to ACDA standards, so graduates enter the workforce with credentials that Edmonton employers recognize and expect from day one.",
  },
  {
    icon: TrendingUp,
    headline: "A Growing City, A Growing Industry",
    body: "Edmonton's metro population has surpassed one million and continues to expand. New residential communities, a growing healthcare corridor, and increasing demand for preventive dental care mean new practices are opening regularly across the city.",
  },
  {
    icon: Users,
    headline: "Build Your Network Locally",
    body: "Training in Edmonton means your clinical hours, practicum placements, and instructor relationships are all local. When it's time to job search, you're already embedded in the Edmonton dental community — not starting from scratch.",
  },
  {
    icon: Banknote,
    headline: "Strong Return on Your Investment",
    body: "A dental assisting program can be completed in under a year. With starting salaries averaging $45,000–$55,000, most WDA graduates see a full return on their education investment within 12–18 months of entering the workforce.",
  },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function EdmontonDentalCareersPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-36 pb-0" style={{ backgroundColor: "#1E3560" }}>
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
        <div className="relative max-w-6xl mx-auto px-6 pb-14">
          <p
            className="text-[0.68rem] font-bold uppercase tracking-[0.22em] mb-4"
            style={{ color: "#4A9FD4", fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            Edmonton, Alberta
          </p>
          <h1
            className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-white leading-tight mb-5 max-w-3xl"
            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            Start Your Dental Career<br className="hidden sm:block" /> in Edmonton
          </h1>
          <p
            className="text-base sm:text-lg leading-relaxed max-w-2xl"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            Alberta's dental sector is growing faster than the national average.
            With thousands of practices across the province and a population that
            continues to expand, Edmonton is one of Canada's most promising cities
            to launch a rewarding dental assisting career.
          </p>
        </div>

        {/* Stats strip */}
        <div
          className="max-w-6xl mx-auto px-6"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <dl className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08]">
            {heroStats.map(({ value, label }) => (
              <div key={label} className="py-7 sm:px-8 first:pl-0 last:pr-0">
                <dt
                  className="text-3xl font-bold mb-1"
                  style={{ color: "#4A9FD4", fontFamily: "var(--font-montserrat), sans-serif" }}
                >
                  {value}
                </dt>
                <dd className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Edmonton Job Market ──────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">

          {/* Section header */}
          <div className="max-w-2xl mb-14">
            <p
              className="text-[0.68rem] font-bold uppercase tracking-[0.22em] mb-3"
              style={{ color: "#4A9FD4", fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              The Local Landscape
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold text-[#1E3560] mb-4 leading-tight"
              style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              The Edmonton Dental Job Market
            </h2>
            <p className="text-base leading-relaxed text-[#2B303A]/70">
              Understanding the local market is the first step toward a confident
              career decision. Here's what dental assisting looks like in Edmonton
              and across Alberta today.
            </p>
          </div>

          {/* Two-column content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

            {/* Left column */}
            <div className="space-y-10">

              {/* Demand */}
              <div>
                <h3
                  className="text-base font-bold text-[#1E3560] mb-3 flex items-center gap-2"
                  style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
                >
                  <span
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: "#4A9FD4" }}
                  >
                    1
                  </span>
                  Growing Demand for Dental Assistants
                </h3>
                <p className="text-sm leading-relaxed text-[#2B303A]/70">
                  Alberta's dental workforce is under sustained pressure. An aging
                  population, rising awareness of preventive oral care, and the
                  continued expansion of private dental practices across Edmonton and
                  surrounding communities have driven consistent year-over-year
                  hiring demand. The Alberta College of Dental Assistants (ACDA)
                  projects ongoing growth through 2030, with Edmonton among the
                  highest-hiring regions in the province.
                </p>
              </div>

              {/* Salary */}
              <div>
                <h3
                  className="text-base font-bold text-[#1E3560] mb-3 flex items-center gap-2"
                  style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
                >
                  <span
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: "#4A9FD4" }}
                  >
                    2
                  </span>
                  Competitive Salaries in Alberta
                </h3>
                <p className="text-sm leading-relaxed text-[#2B303A]/70 mb-4">
                  Alberta is one of the highest-paying provinces for dental
                  assistants in Canada — a direct reflection of the province's
                  strong economy and the regulated nature of the profession.
                </p>
                {/* Salary tiers */}
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ border: "1px solid rgba(30,53,96,0.08)" }}
                >
                  {[
                    { tier: "Entry-Level (Level I)", range: "$45,000 – $55,000 / yr" },
                    { tier: "Experienced (Level II)", range: "$55,000 – $72,000 / yr" },
                    { tier: "Senior / Lead Assistant", range: "$68,000 – $80,000+ / yr" },
                  ].map(({ tier, range }, i) => (
                    <div
                      key={tier}
                      className="flex items-center justify-between px-5 py-3.5 text-sm"
                      style={{
                        backgroundColor: i % 2 === 0 ? "#F4F7F9" : "#FFFFFF",
                        borderBottom: i < 2 ? "1px solid rgba(30,53,96,0.06)" : undefined,
                      }}
                    >
                      <span className="font-medium text-[#2B303A]">{tier}</span>
                      <span className="font-bold" style={{ color: "#1E3560" }}>
                        {range}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-[#2B303A]/45">
                  Figures are estimates based on Alberta market data. Actual compensation varies by employer, experience, and benefits package.
                </p>
              </div>

              {/* Career growth */}
              <div>
                <h3
                  className="text-base font-bold text-[#1E3560] mb-3 flex items-center gap-2"
                  style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
                >
                  <span
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: "#4A9FD4" }}
                  >
                    4
                  </span>
                  Career Growth &amp; Advancement
                </h3>
                <p className="text-sm leading-relaxed text-[#2B303A]/70">
                  A dental assisting certificate is a starting point, not a
                  ceiling. Alberta's Level I and Level II designation framework
                  gives assistants a structured development pathway recognized
                  province-wide. Many dental assistants advance to senior
                  chair-side roles, practice management, or continue into dental
                  hygiene programs. The profession rewards longevity — experienced
                  assistants are among the most valued members of any dental team.
                </p>
              </div>
            </div>

            {/* Right column — workplace types */}
            <div>
              <h3
                className="text-base font-bold text-[#1E3560] mb-5 flex items-center gap-2"
                style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                <span
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white shrink-0"
                  style={{ backgroundColor: "#4A9FD4" }}
                >
                  3
                </span>
                Where Edmonton Dental Assistants Work
              </h3>
              <p className="text-sm leading-relaxed text-[#2B303A]/70 mb-6">
                Dental assistants in Alberta work across a diverse range of practice
                settings — each with its own pace, patient demographic, and career
                culture.
              </p>
              <ul className="space-y-3">
                {practiceTypes.map(({ name, desc }) => (
                  <li
                    key={name}
                    className="rounded-xl p-5"
                    style={{
                      backgroundColor: "#F4F7F9",
                      border: "1px solid rgba(30,53,96,0.06)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Building2
                        className="w-4 h-4 shrink-0 mt-0.5 text-[#4A9FD4]"
                        strokeWidth={1.75}
                      />
                      <div>
                        <p
                          className="text-sm font-bold text-[#1E3560] mb-1"
                          style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
                        >
                          {name}
                        </p>
                        <p className="text-xs leading-relaxed text-[#2B303A]/65">
                          {desc}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Train in Edmonton ────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: "#F4F7F9", borderTop: "1px solid rgba(30,53,96,0.07)" }}>
        <div className="max-w-6xl mx-auto px-6">

          <div className="max-w-2xl mb-12">
            <p
              className="text-[0.68rem] font-bold uppercase tracking-[0.22em] mb-3"
              style={{ color: "#4A9FD4", fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              Local Advantage
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold text-[#1E3560] leading-tight"
              style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              Why Train in Edmonton
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {whyEdmontonCards.map(({ icon: Icon, headline, body }) => (
              <div
                key={headline}
                className="bg-white rounded-xl p-7"
                style={{ border: "1px solid rgba(30,53,96,0.07)" }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-5"
                  style={{ backgroundColor: "rgba(74,159,212,0.1)" }}
                >
                  <Icon className="w-5 h-5 text-[#4A9FD4]" strokeWidth={1.75} />
                </div>
                <h3
                  className="text-base font-bold text-[#1E3560] mb-3"
                  style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
                >
                  {headline}
                </h3>
                <p className="text-sm leading-relaxed text-[#2B303A]/65">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WDA Institution Pitch ────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: "#1E3560" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-start">

            <div className="max-w-2xl">
              <p
                className="text-[0.68rem] font-bold uppercase tracking-[0.22em] mb-4"
                style={{ color: "#4A9FD4", fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                Train Locally. Work Locally.
              </p>
              <h2
                className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-6"
                style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                Western Dental Academy —<br className="hidden sm:block" />
                Edmonton&apos;s Dental Training Institution
              </h2>
              <p
                className="text-base leading-relaxed mb-5"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                Western Dental Academy was founded specifically to serve Edmonton
                and Alberta's growing need for skilled, ACDA-ready dental
                professionals. Our programs are hands-on from day one — clinical
                simulation suites, real patient interaction through our practicum
                program, and an instructor team drawn directly from Edmonton's
                dental community.
              </p>
              <p
                className="text-base leading-relaxed"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                We don&apos;t just teach dental assisting — we connect graduates to
                local practices, prepare them for ACDA certification exams, and
                stay engaged with the Edmonton dental industry to keep our
                curriculum current. When you train at WDA, you&apos;re training
                for the job market right outside our doors.
              </p>
            </div>

            {/* Credential highlights */}
            <div className="lg:w-72 shrink-0">
              <div
                className="rounded-xl p-6 space-y-4"
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <p
                  className="text-[0.65rem] font-bold uppercase tracking-[0.18em]"
                  style={{ color: "#4A9FD4", fontFamily: "var(--font-montserrat), sans-serif" }}
                >
                  Program Highlights
                </p>
                {[
                  "ACDA-aligned curriculum",
                  "Hands-on clinical simulation labs",
                  "Real patient practicum placement",
                  "Edmonton-based job placement support",
                  "Programs under 12 months",
                  "Small cohort sizes — personalized instruction",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-2.5">
                    <ChevronRight
                      className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#4A9FD4]"
                      strokeWidth={2.5}
                    />
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                      {point}
                    </span>
                  </div>
                ))}
                <div className="pt-2">
                  <Link
                    href="/programs"
                    className="text-sm font-bold text-[#4A9FD4] hover:text-white transition-colors duration-200 flex items-center gap-1.5"
                  >
                    View all programs
                    <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p
            className="text-[0.68rem] font-bold uppercase tracking-[0.22em] mb-4"
            style={{ color: "#4A9FD4", fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            Ready to Begin?
          </p>
          <h2
            className="text-2xl sm:text-3xl font-bold text-[#1E3560] mb-4 leading-tight"
            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            Edmonton's Dental Industry Is Hiring.<br className="hidden sm:block" />
            Be Ready for It.
          </h2>
          <p className="text-sm leading-relaxed max-w-lg mx-auto mb-10 text-[#2B303A]/60">
            Take the first step toward a dental assisting career in Edmonton.
            Apply to Western Dental Academy or book a campus tour to see our
            facility and meet the team in person.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/apply"
              className="rounded-lg px-8 py-3.5 text-sm font-bold text-white transition-colors duration-200 bg-[#E67E22] hover:bg-[#CF6D17]"
            >
              Apply Now
            </Link>
            <Link
              href="/book-a-tour"
              className="rounded-lg border border-[#1E3560]/25 px-8 py-3.5 text-sm font-bold text-[#1E3560] transition-colors duration-200 hover:border-[#1E3560] hover:bg-[#1E3560] hover:text-white"
            >
              Book a Campus Tour
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
