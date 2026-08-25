import type { Metadata } from "next";
import Link from "next/link";
import AnimateIn from "@/components/AnimateIn";
import type { TeamMember } from "@/types/teamMember";
import { FloatingPaths } from "@/components/ui/background-paths";
import { sanityFetch } from "@/sanity/lib/live";
import { TEAM_MEMBERS_QUERY } from "@/sanity/lib/queries";
import Image from 'next/image'
import { urlFor } from '@/lib/sanity/image'
import TeamCard from '@/components/TeamCard'

// ─── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Western Dental Academy — our mission, founding story, core values, and the team of dental professionals behind Edmonton's leading dental training facility.",
};


// ─── Core values ───────────────────────────────────────────────────────────────

const VALUES = [
  {
    num: "01",
    name: "Excellence",
    description:
      "In teaching, learning, and clinical practice — we hold ourselves and our students to the highest standards of dental training and professional development.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    ),
  },
  {
    num: "02",
    name: "Accessibility",
    description:
      "Removing barriers to professional development opportunities — geography, schedules, and circumstances should never limit access to high-quality dental training.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0z"
        />
      </svg>
    ),
  },
  {
    num: "03",
    name: "Integrity",
    description:
      "In all professional interactions — we are honest, transparent, and accountable in everything we deliver. Training instead of education guides our approach.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.97zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.97z"
        />
      </svg>
    ),
  },
  {
    num: "04",
    name: "Community",
    description:
      "Engagement and service — we invest in the communities we serve through outreach, oral health training, and partnerships that extend our impact beyond the classroom.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    ),
  },
  {
    num: "05",
    name: "Innovation",
    description:
      "In professional development design — we continuously engage with the oral health community to ensure our offerings reflect the latest advancements in dental practice.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
        />
      </svg>
    ),
  },
];



// ─── Value card ────────────────────────────────────────────────────────────────

function ValueCard({
  value,
  index,
}: {
  value: (typeof VALUES)[number];
  index: number;
}) {
  return (
    <AnimateIn delay={index * 100} className="flex flex-col">
      <div
        className="group relative flex flex-col flex-1 rounded-2xl p-8 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
        style={{ backgroundColor: "#F4F7F9" }}
      >
        {/* Ghost number — depth layer */}
        <span
          aria-hidden
          className="absolute bottom-0 right-4 font-bold leading-none select-none pointer-events-none translate-y-3"
          style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "7rem",
            color: "rgba(30,53,96,0.05)",
            lineHeight: 1,
          }}
        >
          {value.num}
        </span>

        {/* Icon */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white mb-6 relative z-10"
          style={{ backgroundColor: "#1E3560" }}
        >
          {value.icon}
        </div>

        {/* Name */}
        <h3
          className="text-lg font-bold mb-3 relative z-10"
          style={{
            color: "#1E3560",
            fontFamily: "var(--font-montserrat), sans-serif",
          }}
        >
          {value.name}
        </h3>

        {/* Description */}
        <p
          className="text-sm leading-relaxed relative z-10"
          style={{ color: "#2B303A" }}
        >
          {value.description}
        </p>
      </div>
    </AnimateIn>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function AboutPage() {
  
  const { data: team } = await sanityFetch({ query: TEAM_MEMBERS_QUERY }) as { data: any[] };

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
        {/* Radial glow */}
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
              <li style={{ color: "rgba(255,255,255,0.7)" }}>About</li>
            </ol>
          </nav>

          {/* Eyebrow */}
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
              Our Story
            </span>
          </div>

          <h1
            className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4 max-w-3xl"
            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            Training{" "}
            <span style={{ color: "#4A9FD4" }}>
              Dental Professionals
            </span>{" "}
            Today.
          </h1>

          <p
            className="text-sm font-semibold tracking-wide mb-5"
            style={{
              color: "#4A9FD4",
              fontFamily: "var(--font-montserrat), sans-serif",
            }}
          >
            Excellence in Dental Training. Innovation in Delivery. Commitment to Community.
          </p>

          <p
            className="text-lg leading-relaxed max-w-xl"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            Western Dental Academy is a modern, community-focused facility
            dedicated to delivering high-quality dental training and
            strengthening the oral health workforce across Alberta. We provide
            accessible professional development for practicing dental
            professionals seeking to enhance their skills.
          </p>
        </div>

        <div
          className="absolute bottom-0 inset-x-0 h-px"
          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          aria-hidden
        />
      </section>

      {/* ═══════════════════════════════════════════════════════════
          MISSION
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: "#ffffff" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-16 items-start">
            {/* Left: large mission statement */}
            <AnimateIn>
              <div
                className="w-10 mb-8"
                style={{ height: "3px", backgroundColor: "#4A9FD4" }}
              />
              <p
                className="text-xs font-bold tracking-[0.2em] uppercase mb-6"
                style={{ color: "#4A9FD4" }}
              >
                Our Mission
              </p>
              <blockquote
                className="text-3xl sm:text-4xl font-bold leading-[1.25] mb-8"
                style={{
                  color: "#1E3560",
                  fontFamily: "var(--font-montserrat), sans-serif",
                }}
              >
                To deliver exceptional dental training that is flexible,
                relevant, and grounded in{" "}
                <span style={{ color: "#4A9FD4" }}>real-world practice.</span>
              </blockquote>
              <p
                className="text-base leading-relaxed max-w-lg"
                style={{ color: "#2B303A" }}
              >
                That mission drives every pathway we create. Whether you are new to the field or a
                working professional seeking to enhance your skills, WDA is
                built to meet you where you are.
              </p>
            </AnimateIn>

            {/* Right: pillars card */}
            <AnimateIn delay={150} className="lg:pt-20">
              <div
                className="rounded-2xl p-8"
                style={{ backgroundColor: "#F4F7F9" }}
              >
                <p
                  className="text-xs font-bold tracking-[0.18em] uppercase mb-6"
                  style={{ color: "#4A9FD4" }}
                >
                  How We Do It
                </p>
                <ul className="flex flex-col gap-5">
                  {[
                    "Experienced instructors in dental training",
                    "Small course/workshop sizes for individual attention",
                    "Engage with dental professionals from day one",
                    "Deliver unique, relevant professional development opportunities.",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
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
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m4.5 12.75 6 6 9-13.5"
                          />
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
          COMMITMENT
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: "#F4F7F9" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <AnimateIn>
              <p
                className="text-xs font-bold tracking-[0.2em] uppercase mb-4"
                style={{ color: "#4A9FD4" }}
              >
                Our Commitment
              </p>
              <h2
                className="text-3xl font-bold mb-3 leading-tight"
                style={{
                  color: "#1E3560",
                  fontFamily: "var(--font-montserrat), sans-serif",
                }}
              >
                Accessible, High-Quality Training for Everyone
              </h2>
              <p
                className="text-sm font-semibold tracking-wide mb-6"
                style={{
                  color: "#4A9FD4",
                  fontFamily: "var(--font-montserrat), sans-serif",
                }}
              >
                Built to close the gap.
              </p>
              <p
                className="text-base leading-relaxed"
                style={{ color: "#2B303A" }}
              >
                We believe that geography, work schedules, and life circumstances
                should never limit a person&apos;s ability to pursue relevant PD
                opportunities in the dental industry including online non-credit
                continuing education courses, hands-on clinical refreshers, unique
                workshops and guest speakers.
              </p>
            </AnimateIn>
            <AnimateIn delay={130}>
              <div className="lg:pt-14">
                <p
                  className="text-base leading-relaxed mb-6"
                  style={{ color: "#2B303A" }}
                >
                  Our offerings are designed to support all learners, including
                  those in remote and rural communities, working professionals,
                  and anyone seeking a more accessible route into the dental
                  field.
                </p>
                <p
                  className="text-base leading-relaxed mb-8"
                  style={{ color: "#2B303A" }}
                >
                  With smaller class sizes, every student gets personable,
                  one-on-one interaction with instructors who bring both
                  real-world clinical experience and dental training expertise
                  into the classroom.
                </p>
                <div className="flex flex-wrap gap-3">
                  {[
                    "Online Theory Delivery",
                    "Remote & Rural Access",
                    "In Person Delivery",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="inline-block rounded-full px-4 py-1.5 text-xs font-semibold"
                      style={{
                        backgroundColor: "rgba(74,159,212,0.12)",
                        color: "#1E3560",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOUNDING STORY
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: "#ffffff" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: image placeholder */}
            <AnimateIn>
              <div className="relative">
                {/* Main placeholder block */}
                <div
                  className="w-full rounded-2xl overflow-hidden flex items-center justify-center"
                  style={{
                    backgroundColor: "#1E3560",
                    aspectRatio: "4/3",
                  }}
                >
                  {/* Background ghost text */}
                  <span
                    aria-hidden
                    className="absolute font-bold select-none pointer-events-none"
                    style={{
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "11rem",
                      color: "rgba(255,255,255,0.03)",
                      lineHeight: 1,
                    }}
                  >
                    WDA
                  </span>
                  {/* Centre label */}
                  <div className="relative z-10 flex flex-col items-center gap-3 text-center px-8">
                    <div
                      className="w-12 h-0.5 mx-auto"
                      style={{ backgroundColor: "#4A9FD4" }}
                    />
                    <p
                      className="text-xs font-bold tracking-[0.2em] uppercase"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                      Photo Coming Soon
                    </p>
                    <div
                      className="w-12 h-0.5 mx-auto"
                      style={{ backgroundColor: "#4A9FD4" }}
                    />
                  </div>
                </div>

                {/* Floating "Est." badge */}
                <div
                  className="absolute -bottom-4 -right-4 rounded-xl px-5 py-4 shadow-lg"
                  style={{ backgroundColor: "#4A9FD4" }}
                >
                  <p
                    className="text-xs font-bold text-white/70 tracking-widest uppercase"
                  >
                    Est.
                  </p>
                  <p
                    className="text-2xl font-bold text-white leading-none"
                    style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
                  >
                    2026
                  </p>
                </div>
              </div>
            </AnimateIn>

            {/* Right: story text */}
            <AnimateIn delay={130}>
              <p
                className="text-xs font-bold tracking-[0.2em] uppercase mb-4"
                style={{ color: "#4A9FD4" }}
              >
                The Founding Story
              </p>
              <h2
                className="text-3xl font-bold mb-6 leading-tight"
                style={{
                  color: "#1E3560",
                  fontFamily: "var(--font-montserrat), sans-serif",
                }}
              >
                Built to Close the Gap
                <br />Between Training and Practice
              </h2>

              <div
                className="flex flex-col gap-4 text-sm leading-relaxed"
                style={{ color: "#2B303A" }}
              >
                <p>
                  Western Dental Academy was founded by practicing dental
                  professionals who saw the same pattern repeating across
                  Edmonton clinics: graduates arriving technically trained but
                  clinically underprepared — confident on paper, uncertain
                  chairside.
                </p>
                <p>
                  The problem wasn&apos;t the students. It was an approach that
                  treated clinical experience as something students earned at
                  the end, after enough theory. WDA was built on the opposite
                  premise: real practice should come first, from the very first
                  week.
                </p>
                <p>
                  Today, WDA is built around that founding belief. Students work with professional-grade equipment,
                  apply current protocols, and develop the hands-on competence
                  that dental practices expect — not as a finishing touch, but
                  as the foundation everything else is built on.
                </p>
              </div>

              <Link
                href="/programs"
                className="group inline-flex items-center gap-2 mt-8 text-sm font-bold transition-colors duration-200"
                style={{ color: "#1E3560" }}
              >
                Explore Offerings
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CONTINUING TRAINING, GUEST SPEAKERS & COMMUNITY
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: "#F4F7F9" }}>
        <div className="max-w-6xl mx-auto px-6">
          <AnimateIn className="mb-14 max-w-xl">
            <p
              className="text-xs font-bold tracking-[0.2em] uppercase mb-3"
              style={{ color: "#4A9FD4" }}
            >
              Beyond the Classroom
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold leading-tight"
              style={{
                color: "#1E3560",
                fontFamily: "var(--font-montserrat), sans-serif",
              }}
            >
              Learning That Extends to the Whole Community
            </h2>
          </AnimateIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                title: "Continuing Training & Professional Development",
                body:
                  "Western Dental Academy is a hub for lifelong learning. Our continuing training courses and professional development workshops help dental hygienists, dental assistants, dental healthcare professionals (DHC), and administrative professionals stay current with industry standards, new technologies, and evolving best practices. From radiography refreshers to advanced clinical skills, our training offerings are built to support career growth and elevate the standard of care in dental practices across the province.",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                  </svg>
                ),
              },
              {
                num: "02",
                title: "Guest Speakers & Industry Expertise",
                body:
                  "We regularly host guest speakers, including dental specialists, industry innovators, and respected leaders in oral health. These events give learners and professionals access to cutting-edge knowledge, emerging trends, and practical insights that enrich their understanding of the profession.",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                ),
              },
              {
                num: "03",
                title: "Community Outreach & Training",
                body:
                  "Western Dental Academy is committed to improving oral health literacy in the communities we serve. Through community outreach sessions, school presentations, and partnerships with local organizations, we help individuals and families build the knowledge they need to maintain lifelong oral health. Our outreach initiatives also support underserved and remote communities, reinforcing our belief that oral health training — and accessible pathways into dental assisting — should be available to everyone.",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                ),
              },
            ].map(({ num, title, body, icon }, i) => (
              <AnimateIn key={num} delay={i * 100} className="flex flex-col">
                <div
                  className="group flex flex-col flex-1 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  style={{ backgroundColor: "#ffffff" }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white mb-6 shrink-0"
                    style={{ backgroundColor: "#1E3560" }}
                  >
                    {icon}
                  </div>
                  <p
                    className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3"
                    style={{ color: "#4A9FD4" }}
                  >
                    {num}
                  </p>
                  <h3
                    className="text-base font-bold mb-4 leading-snug"
                    style={{
                      color: "#1E3560",
                      fontFamily: "var(--font-montserrat), sans-serif",
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#2B303A" }}
                  >
                    {body}
                  </p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          VISION
      ═══════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-20"
        style={{ backgroundColor: "#1E3560" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 50% 120%, rgba(74,159,212,0.13) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimateIn>
            <p
              className="text-xs font-bold tracking-[0.2em] uppercase mb-5"
              style={{ color: "#4A9FD4" }}
            >
              Our Vision
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight"
              style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              Dental Training Instead of Education.
              <br />
              Relevant Professional Development.
            </h2>
            <p
              className="text-lg leading-relaxed max-w-2xl mx-auto"
              style={{ color: "rgba(255,255,255,0.65)" }}
            >
              Helping dental professionals maintain competence through unique
              professional development opportunities. WDA is committed to
              delivering training that strengthens Alberta&apos;s oral health
              workforce.
            </p>
          </AnimateIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CORE VALUES
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: "#ffffff" }}>
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <AnimateIn className="mb-14 max-w-xl">
            <p
              className="text-xs font-bold tracking-[0.2em] uppercase mb-3"
              style={{ color: "#4A9FD4" }}
            >
              What We Stand For
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold leading-tight"
              style={{
                color: "#1E3560",
                fontFamily: "var(--font-montserrat), sans-serif",
              }}
            >
              Our Values
            </h2>
          </AnimateIn>

          {/* Values grid — 2 cols on sm, 3 cols on lg (5 items: 3+2) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((value, i) => (
              <ValueCard key={value.num} value={value} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TEAM
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: "#F4F7F9" }}>
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <AnimateIn className="mb-14">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <div>
                <p
                  className="text-xs font-bold tracking-[0.2em] uppercase mb-3"
                  style={{ color: "#4A9FD4" }}
                >
                  The People Behind WDA
                </p>
                <h2
                  className="text-3xl sm:text-4xl font-bold leading-tight"
                  style={{
                    color: "#1E3560",
                    fontFamily: "var(--font-montserrat), sans-serif",
                  }}
                >
                  Meet the Team
                </h2>
              </div>
              <p
                className="text-sm max-w-xs sm:text-right"
                style={{ color: "#2B303A" }}
              >
                Every WDA instructor is an active dental professional — not a
                retired clinician, not a career academic.
              </p>
            </div>
          </AnimateIn>

          {/* Team grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <TeamCard key={member._id} member={member} index={i} />
            ))}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          VIRTUAL CLINIC TOUR
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: "#ffffff" }}>
        <div className="max-w-6xl mx-auto px-6">

          {/* ── Section header ── */}
          <AnimateIn className="text-center mb-12">
            <p
              className="text-[0.68rem] font-bold uppercase tracking-[0.22em] mb-4"
              style={{ color: "#4A9FD4", fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              Inside WDA
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-[#1E3560] mb-4 leading-tight"
              style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              See Our Facility
            </h2>
            <p
              className="text-base leading-relaxed max-w-xl mx-auto"
              style={{ color: "rgba(43,48,58,0.65)" }}
            >
              Get an up-close look at the clinic, equipment, and learning spaces
              where WDA students train. Seeing is believing — and we&apos;re proud
              of what we&apos;ve built.
            </p>
          </AnimateIn>

          {/* ── Video block ── */}
          <AnimateIn delay={60}>
            {/*
              ─────────────────────────────────────────────────────────────────
              VIDEO SWAP INSTRUCTIONS
              When a real embed URL is ready, replace TOUR_VIDEO_URL with it:
                YouTube : "https://www.youtube.com/embed/VIDEO_ID"
                Vimeo   : "https://player.vimeo.com/video/VIDEO_ID"
              The iframe renders automatically; remove the placeholder block.
              ─────────────────────────────────────────────────────────────────
            */}
            {(() => {
              const TOUR_VIDEO_URL: string | null = null;
              return (
                <div
                  className="relative w-full overflow-hidden rounded-2xl"
                  style={{
                    aspectRatio: "16 / 9",
                    boxShadow: "0 8px 48px rgba(30,53,96,0.18), 0 2px 8px rgba(30,53,96,0.1)",
                  }}
                >
                  {TOUR_VIDEO_URL ? (
                    /* ── Real embed ── */
                    <iframe
                      src={TOUR_VIDEO_URL}
                      title="WDA Virtual Clinic Tour"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                      style={{ border: 0 }}
                    />
                  ) : (
                    /* ── Placeholder ── */
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center gap-6"
                      style={{ backgroundColor: "#1E3560" }}
                    >
                      {/* Dot-grid texture */}
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-[0.04]"
                        style={{
                          backgroundImage:
                            "radial-gradient(circle, #4A9FD4 1px, transparent 1px)",
                          backgroundSize: "32px 32px",
                        }}
                      />
                      {/* Radial glow */}
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0"
                        style={{
                          background:
                            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(74,159,212,0.12) 0%, transparent 70%)",
                        }}
                      />

                      {/* Play button */}
                      <div
                        className="relative z-10 flex flex-col items-center gap-5"
                        role="img"
                        aria-label="Virtual clinic tour — coming soon"
                      >
                        <div
                          className="w-20 h-20 rounded-full flex items-center justify-center transition-transform duration-300"
                          style={{
                            backgroundColor: "#E67E22",
                            boxShadow: "0 0 0 12px rgba(230,126,34,0.15), 0 0 0 24px rgba(230,126,34,0.07)",
                          }}
                        >
                          {/* Play triangle — offset right slightly for optical centering */}
                          <svg
                            viewBox="0 0 24 24"
                            fill="white"
                            aria-hidden
                            className="w-8 h-8 translate-x-0.5"
                          >
                            <path d="M8 5.14v14l11-7-11-7z" />
                          </svg>
                        </div>

                        <div className="text-center">
                          <p
                            className="text-lg font-bold text-white leading-tight"
                            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
                          >
                            Virtual Clinic Tour
                          </p>
                          <p
                            className="text-sm mt-1 font-medium"
                            style={{ color: "rgba(255,255,255,0.45)" }}
                          >
                            Coming Soon
                          </p>
                        </div>
                      </div>

                      {/* Corner watermark */}
                      <p
                        className="absolute bottom-4 right-5 text-[10px] font-bold uppercase tracking-[0.2em] select-none"
                        style={{ color: "rgba(255,255,255,0.12)", fontFamily: "var(--font-montserrat), sans-serif" }}
                        aria-hidden
                      >
                        Western Dental Academy
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </AnimateIn>

          {/* ── Feature highlights ── */}
          <AnimateIn delay={120}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12">
              {[
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15a2.25 2.25 0 0 1 .45 2.31L19.8 15Zm0 0-4.3-4.3M5 14.5 1.5 18m0 0a2.25 2.25 0 0 0 3.182 3.182L8.5 17.5m-7-3L5 14.5m13.3.2 3.5 3.5a2.25 2.25 0 0 1-3.182 3.182L15 17.5m6-3L17 10.6" />
                    </svg>
                  ),
                  heading: "State-of-the-Art Equipment",
                  body: "Train in a modern clinic equipped with digital imaging and charting, and current dental materials found in professional dental practices.",
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                    </svg>
                  ),
                  heading: "Real Clinical Environment",
                  body: "Real clinical environment: skill refresher courses mimic the workplace.",
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                    </svg>
                  ),
                  heading: "Modern Learning Spaces",
                  body: "Modern learning spaces: our facility includes a large classroom as well as space for various style workshops that embody a professional atmosphere.",
                },
              ].map(({ icon, heading, body }) => (
                <div key={heading} className="flex flex-col items-center text-center sm:items-start sm:text-left gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: "#1E3560" }}
                  >
                    {icon}
                  </div>
                  <div>
                    <h3
                      className="text-sm font-bold text-[#1E3560] mb-1.5 leading-snug"
                      style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
                    >
                      {heading}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(43,48,58,0.65)" }}>
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </AnimateIn>

          {/* ── CTA ── */}
          <AnimateIn delay={180}>
            <div className="mt-12 flex justify-center">
              <Link
                href="/register"
                className="inline-block rounded-lg px-8 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:bg-[#CF6D17] hover:scale-[1.02]"
                style={{ backgroundColor: "#E67E22" }}
              >
                Register →
              </Link>
            </div>
          </AnimateIn>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          NATIONAL BOARD GUIDED PRACTICE WORKSHOP
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-16" style={{ backgroundColor: "#F4F7F9" }}>
        <div className="max-w-6xl mx-auto px-6">
          <AnimateIn>
            <div
              className="rounded-2xl p-8 sm:p-10"
              style={{ backgroundColor: "#1E3560" }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-center">
                <div>
                  <p
                    className="text-xs font-bold tracking-[0.2em] uppercase mb-4"
                    style={{ color: "#4A9FD4" }}
                  >
                    Coming Soon
                  </p>
                  <h2
                    className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight"
                    style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
                  >
                    National Board
                    <br />
                    Guided Practice Workshop
                  </h2>
                  <p
                    className="text-base leading-relaxed mb-6"
                    style={{ color: "rgba(255,255,255,0.65)" }}
                  >
                    WDA is developing structured guided practice workshops to support dental assisting certification preparation. Register your interest to be notified when details are available.
                  </p>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02]"
                    style={{ backgroundColor: "#E67E22" }}
                  >
                    Register
                  </Link>
                </div>
                <div className="flex items-center justify-center">
                  <div
                    className="w-28 h-28 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(74,159,212,0.15)" }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="#4A9FD4" strokeWidth={1.5} aria-hidden className="w-12 h-12">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA
      ═══════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-20"
        style={{ backgroundColor: "#1E3560" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 50% 120%, rgba(74,159,212,0.13) 0%, transparent 70%)",
          }}
        />

        {/* Streaming lines background */}
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
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
              Professional Development
              <br />
              for Dental Professionals.
            </h2>
            <p
              className="text-base leading-relaxed mb-10 max-w-lg mx-auto"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Find the right workshop, guest speaker event, or course for your
              career. Connect with our team — we&apos;d love to help.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/professional-development"
                className="rounded-lg px-8 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02]"
                style={{ backgroundColor: "#4A9FD4" }}
              >
                Explore
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
