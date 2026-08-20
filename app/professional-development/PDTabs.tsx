"use client";

import { useState } from "react";
import Link from "next/link";
import AnimateIn from "@/components/AnimateIn";

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
  {
    num: "06",
    title: "Ergonomics in Dentistry: Move Well, Breathe Well, Practice Longer",
    badge: "Launching Soon",
    price: 35,
    duration: "1.5 hours",
    description:
      "Developed by a Registered Dental Assistant (RDA) and RYT 200. Dental professionals spend countless hours caring for others, often in sustained postures that place significant demands on the body. This interactive workshop is designed specifically for dental health care professionals who want to understand the impact of ergonomics and develop practical strategies to prevent pain, injury, and burnout. Includes guided breathwork, yoga-inspired movement, stretches, and a closing Yoga Nidra relaxation practice.",
    highlights: [
      "Ergonomic risk factors and posture principles for dental practice",
      "Guided breathwork techniques to reduce tension and support focus",
      "Yoga-inspired movement sequences adapted for dental professionals",
      "Targeted stretches for neck, shoulders, wrists, and lower back",
      "Closing Yoga Nidra relaxation practice",
    ],
    tags: ["Interactive", "Wellness", "CADA CCP Support", "Certificate of Attendance"],
  },
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden className="w-3.5 h-3.5 shrink-0 mt-0.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function WorkshopCard({ workshop, index }: { workshop: typeof workshops[number]; index: number }) {
  return (
    <AnimateIn delay={index * 80} className="flex flex-col">
      <div
        className="group flex flex-col flex-1 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        style={{ backgroundColor: "#F4F7F9" }}
      >
        <div className="h-1 w-full" style={{ backgroundColor: "#4A9FD4" }} />
        <div className="flex flex-col flex-1 p-8">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: "#4A9FD4" }}>{workshop.num}</p>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em]"
              style={{ backgroundColor: "rgba(230,126,34,0.12)", color: "#E67E22" }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#E67E22" }} />
              {workshop.badge}
            </span>
          </div>

          <h2 className="text-xl font-bold mb-3 leading-snug" style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}>
            {workshop.title}
          </h2>

          {"price" in workshop && (workshop.price !== undefined || "duration" in workshop) && (
            <div className="flex items-center gap-3 mb-4 -mt-1">
              {"price" in workshop && workshop.price !== undefined && (
                <span className="text-sm font-bold" style={{ color: "#E67E22" }}>${workshop.price} CAD</span>
              )}
              {"price" in workshop && workshop.price !== undefined && "duration" in workshop && workshop.duration && (
                <span className="text-xs" style={{ color: "rgba(30,53,96,0.25)" }}>·</span>
              )}
              {"duration" in workshop && workshop.duration && (
                <span className="text-xs" style={{ color: "rgba(43,48,58,0.5)" }}>{workshop.duration}</span>
              )}
            </div>
          )}

          <p className="text-sm leading-relaxed mb-6" style={{ color: "#2B303A" }}>{workshop.description}</p>

          <ul className="flex flex-col gap-2.5 mb-6 flex-1">
            {workshop.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2.5">
                <span style={{ color: "#4A9FD4" }}><CheckIcon /></span>
                <span className="text-sm leading-relaxed" style={{ color: "#2B303A" }}>{h}</span>
              </li>
            ))}
          </ul>

          <div className="mb-5 h-px" style={{ backgroundColor: "rgba(30,53,96,0.1)" }} />

          <div className="flex flex-wrap gap-2 mb-6">
            {workshop.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-semibold px-3 py-1 rounded-full"
                style={{ backgroundColor: "rgba(30,53,96,0.07)", color: "#1E3560" }}
              >
                {tag}
              </span>
            ))}
          </div>

          <Link
            href="/register"
            className="group/link inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white self-start transition-all duration-200 hover:scale-[1.02]"
            style={{ backgroundColor: "#E67E22" }}
          >
            Register
            <span className="transition-transform duration-200 group-hover/link:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </AnimateIn>
  );
}

type Tab = "workshops" | "guest-speakers" | "courses";

const TABS: { id: Tab; label: string }[] = [
  { id: "workshops", label: "Workshops" },
  { id: "guest-speakers", label: "Guest Speakers" },
  { id: "courses", label: "Courses" },
];

export default function PDTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("workshops");

  return (
    <section className="py-20" style={{ backgroundColor: "#ffffff" }}>
      <div className="max-w-6xl mx-auto px-6">
        {/* Tab bar */}
        <div
          className="flex items-center gap-1 mb-14 rounded-xl p-1.5 w-fit"
          style={{ backgroundColor: "#F4F7F9" }}
          role="tablist"
          aria-label="Professional development categories"
        >
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => setActiveTab(id)}
              className="rounded-lg px-5 py-2.5 text-sm font-bold transition-all duration-200"
              style={
                activeTab === id
                  ? { backgroundColor: "#1E3560", color: "#ffffff" }
                  : { backgroundColor: "transparent", color: "rgba(30,53,96,0.55)" }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* Workshops */}
        {activeTab === "workshops" && (
          <div>
            <AnimateIn className="mb-12">
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#4A9FD4" }}>
                Current Workshops
              </p>
              <h2
                className="text-3xl font-bold leading-tight"
                style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                Hands-On Clinical Development
              </h2>
            </AnimateIn>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {workshops.map((w, i) => (
                <WorkshopCard key={w.num} workshop={w} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Guest Speakers */}
        {activeTab === "guest-speakers" && (
          <AnimateIn>
            <div className="max-w-2xl mx-auto text-center py-16">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: "rgba(74,159,212,0.12)" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#4A9FD4" strokeWidth={1.5} aria-hidden className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                Guest Speaker Events
              </h2>
              <p className="text-base leading-relaxed mb-8" style={{ color: "#2B303A" }}>
                Guest speaker opportunities coming soon. Sign up for our newsletter to be notified
                when new speakers are announced.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg px-7 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02]"
                style={{ backgroundColor: "#E67E22" }}
              >
                Register Your Interest
              </Link>
            </div>
          </AnimateIn>
        )}

        {/* Courses */}
        {activeTab === "courses" && (
          <AnimateIn>
            <div className="max-w-2xl mx-auto text-center py-16">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: "rgba(74,159,212,0.12)" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#4A9FD4" strokeWidth={1.5} aria-hidden className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                </svg>
              </div>
              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                Online Courses
              </h2>
              <p className="text-base leading-relaxed mb-8" style={{ color: "#2B303A" }}>
                Online courses coming soon. WDA is developing non-credit online professional
                development courses for dental healthcare professionals.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg px-7 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02]"
                style={{ backgroundColor: "#E67E22" }}
              >
                Register Your Interest
              </Link>
            </div>
          </AnimateIn>
        )}
      </div>
    </section>
  );
}
