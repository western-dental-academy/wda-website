"use client";

import { useState } from "react";
import Link from "next/link";
import AnimateIn from "@/components/AnimateIn";
import InlineNewsletterForm from "@/components/InlineNewsletterForm";

// ─── Workshop data ─────────────────────────────────────────────────────────────

const workshops = [
  {
    num: "01",
    title: "Ergonomics in Dentistry: Move Well, Breathe Well, Practice Longer",
    badge: "Registration Open",
    price: 40,
    duration: "1.5 hours",
    description:
      "Developed by a Registered Dental Assistant (RDA) and Registered Yoga Teacher 200 (RYT200). Dental professionals spend countless hours caring for others, often in sustained postures that place significant demands on the body. This interactive workshop is designed specifically for dental health care professionals who want to understand the impact of ergonomics and develop practical strategies to prevent pain, injury, and burnout. Includes guided breathwork, yoga-inspired movement, stretches, and a closing Yoga Nidra relaxation practice. There will be 3 separate sessions available focusing on different areas of the body.",
    highlights: [
      "Ergonomic risk factors and posture principles for dental practice",
      "Guided breathwork techniques to reduce tension and support focus",
      "Yoga-inspired movement sequences adapted for dental professionals",
      "Targeted stretches for specific areas of the body",
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
        <div className="flex flex-col flex-1 p-6 sm:p-8">
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

type Tab = "workshops" | "guest-speakers" | "courses" | "practical-exam-prep";

const TABS: { id: Tab; label: string }[] = [
  { id: "workshops",          label: "Workshops" },
  { id: "guest-speakers",     label: "Guest Speakers" },
  { id: "courses",            label: "Courses" },
  { id: "practical-exam-prep", label: "Practical Exam Prep" },
];

export default function PDTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("workshops");

  return (
    <section className="py-20" style={{ backgroundColor: "#ffffff" }}>
      <div className="max-w-6xl mx-auto px-6">
        {/* Tab bar */}
        <div
          className="flex flex-wrap items-center gap-1 mb-14 rounded-xl p-1.5 w-full sm:w-fit"
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
              className="rounded-lg px-5 py-2.5 text-sm font-bold transition-all duration-200 min-h-[44px]"
              style={
                activeTab === id
                  ? { backgroundColor: "#E67E22", color: "#ffffff" }
                  : { backgroundColor: "transparent", color: "rgba(230,126,34,0.7)" }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* Workshops */}
        <div className={activeTab === "workshops" ? undefined : "hidden"}>
          <div className="mb-12">
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#4A9FD4" }}>
              Current Workshops
            </p>
            <h2
              className="text-3xl font-bold leading-tight"
              style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              Hands-On Professional Development
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {workshops.map((w, i) => (
              <WorkshopCard key={w.num} workshop={w} index={i} />
            ))}
          </div>
        </div>

        {/* Guest Speakers */}
        <div className={activeTab === "guest-speakers" ? undefined : "hidden"}>
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
            <p className="text-base leading-relaxed mb-6" style={{ color: "#2B303A" }}>
              Guest speaker opportunities coming soon. Sign up to be notified when guest speaker events are announced.
            </p>
            <div className="flex justify-center">
              <InlineNewsletterForm successMessage="You're subscribed! We'll notify you when guest speaker events are announced." />
            </div>
          </div>
        </div>

        {/* Courses */}
        <div className={activeTab === "courses" ? undefined : "hidden"}>
          <div className="mb-12">
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#4A9FD4" }}>
              Coming Soon
            </p>
            <h2
              className="text-3xl font-bold leading-tight"
              style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              Courses
            </h2>
            <p className="mt-4 text-base leading-relaxed" style={{ color: "#2B303A" }}>
              Courses are coming soon.
            </p>
          </div>
          <div className="pt-10 border-t" style={{ borderColor: "rgba(30,53,96,0.08)" }}>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "#2B303A" }}>
              Sign up to be notified when new courses are available.
            </p>
            <InlineNewsletterForm successMessage="You're subscribed! We'll notify you when new courses are available." />
          </div>
        </div>

        {/* Practical Exam Prep */}
        <div className={activeTab === "practical-exam-prep" ? undefined : "hidden"}>
          <div className="mb-12">
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#4A9FD4" }}>
              Available Now
            </p>
            <h2
              className="text-3xl font-bold leading-tight"
              style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              Practical Exam Prep
            </h2>
          </div>
          <div className="flex flex-col">
            <div
              className="flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl max-w-2xl"
              style={{ backgroundColor: "#F4F7F9" }}
            >
              <div className="h-1 w-full" style={{ backgroundColor: "#4A9FD4" }} />
              <div className="flex flex-col p-8">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: "#4A9FD4" }}>01</p>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em]"
                    style={{ backgroundColor: "rgba(230,126,34,0.12)", color: "#E67E22" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#E67E22" }} />
                    Launching Soon
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3 leading-snug" style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}>
                  National Practical Evaluation Guided Practice Workshop
                </h3>
                <div className="flex items-center gap-3 mb-4 -mt-1">
                  <span className="text-xs" style={{ color: "rgba(43,48,58,0.5)" }}>8 hours · Hands-On</span>
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: "#2B303A" }}>
                  Structured guided practice for dental assisting candidates preparing for the NDAEB Clinical Practice Evaluation (CPE). Covers all nine clinical skills assessed during the CPE with focused instruction, hands-on practice, and skill reinforcement.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {["Exam Preparation", "Hands-On", "Expert-Led", "Certificate of Attendance"].map((tag) => (
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
                  href="/national-board-guided-practice"
                  className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white self-start transition-all duration-200 hover:scale-[1.02]"
                  style={{ backgroundColor: "#E67E22" }}
                >
                  Learn More
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
