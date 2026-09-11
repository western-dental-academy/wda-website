"use client";

import { useState } from "react";
import Link from "next/link";
import AnimateIn from "@/components/AnimateIn";
import InlineNewsletterForm from "@/components/InlineNewsletterForm";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface WorkshopDate {
  _id: string;
  date: string;
  active: boolean;
}

interface WorkshopOffering {
  _id: string;
  title: string;
  category: string;
  description?: string;
  price?: number;
  hasVirtualOption?: boolean;
  virtualPrice?: number;
  capacity?: number;
  hours?: number;
  cadaCppCodes?: string[];
  dates: WorkshopDate[];
}

// ─── Per-offering static content not stored in Sanity ─────────────────────────

interface Speaker {
  name: string;
  affiliation: string;
  topic: string;
  description: string;
}

interface OfferingStaticContent {
  displayTitle?: string;
  durationOverride?: string;
  dateOverride?: string;
  highlights: string[];
  tags: string[];
  foodNote?: string;
  agendaNote?: string;
  whatToBring?: string;
  idealFor?: string;
  cadaNote?: string;
  speakers?: Speaker[];
}

const OFFERING_STATIC: Record<string, OfferingStaticContent> = {
  "Renewal Wellness": {
    displayTitle: "Renewal Wellness Guest Speaker Event",
    durationOverride: "All Day Event",
    highlights: [
      "Registration Renewal Unraveled — Jolene Moore",
      "Obstructive Sleep Apnea — Samantha Coleman & Emily Griffiths",
      "Session 3 — TBD",
      "Financial Wellness — Drill into Your Finances — Josie McKenzie",
      "Limiting your Liability in Emergency Situations — Tony Korobanik",
    ],
    dateOverride: "October 3, 2026",
    tags: ["Full Day", "In-Person & Virtual", "Meets all Professional CCP Requirements", "Certificate of Attendance"],
    foodNote: "In-person session includes Lunch, Snacks and Refreshments",
    agendaNote: "Day's agenda will be sent with your email confirmation. Certificate of attendance will include breakdown of hours for each speaker.",
    cadaNote: "Meets requirements for all Professional Continued Competency programs",
    speakers: [
      {
        name: "Jolene Moore",
        affiliation: "Western Dental Academy",
        topic: "Registration Renewal Unraveled",
        description: "Have questions during the renewal process? Wondering why registration is necessary or where to get Liability Insurance? Jolene will discuss common myths, offer suggestions to make the registration process easier, and answer your questions.",
      },
      {
        name: "Samantha Coleman & Emily Griffiths",
        affiliation: "Sleep Well Diagnostics Ltd",
        topic: "Obstructive Sleep Apnea",
        description: "Both Registered Respiratory Therapists with backgrounds in critical care at the University of Alberta Hospital, Samantha and Emily are passionate about preventative sleep care, patient education, and early detection. They opened Sleep Well Diagnostics in April 2026 to bring high-quality, accessible sleep care to Fort Saskatchewan and surrounding communities.",
      },
      {
        name: "TBD",
        affiliation: "",
        topic: "Session 3",
        description: "Speaker and topic to be announced.",
      },
      {
        name: "Josie McKenzie",
        affiliation: "PFSL Investments",
        topic: "Financial Wellness — Drill Down Into Your Finances",
        description: "A Financial Services Representative on a mission to make wealth planning and financial literacy simple and accessible. Josie will share practical, real-world strategies to help you build healthy money habits, optimize investments, and take control of your financial future.",
      },
      {
        name: "Tony Korobanik",
        affiliation: "Prepared Now",
        topic: "Limiting Your Liability in Emergency Situations",
        description: "Are you prepared to react in an emergency situation? Do you know your roles and responsibilities? This talk will get you thinking and motivated to learn more about reducing risk in your practice.",
      },
    ],
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getNextUpcomingDate(dates: WorkshopDate[]): WorkshopDate | null {
  const now = new Date();
  const upcoming = dates
    .filter((d) => d.active && new Date(d.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return upcoming[0] ?? null;
}

// ─── Shared card sub-components ────────────────────────────────────────────────

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
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function StatusBadge({ hasUpcoming }: { hasUpcoming: boolean }) {
  return hasUpcoming ? (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em]"
      style={{ backgroundColor: "rgba(22,163,74,0.12)", color: "#16A34A" }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#16A34A" }} />
      Registration Open
    </span>
  ) : (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em]"
      style={{ backgroundColor: "rgba(230,126,34,0.12)", color: "#E67E22" }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#E67E22" }} />
      Coming Soon
    </span>
  );
}

// ─── Dynamic offering card ─────────────────────────────────────────────────────

function WorkshopOfferingCard({
  offering,
  index,
}: {
  offering: WorkshopOffering;
  index: number;
}) {
  const nextDate = getNextUpcomingDate(offering.dates);
  const hasUpcoming = nextDate !== null;
  const staticContent = OFFERING_STATIC[offering.title];
  const [openSpeakers, setOpenSpeakers] = useState<Record<number, boolean>>({});
  const [expanded, setExpanded] = useState(false);

  function toggleSpeaker(i: number) {
    setOpenSpeakers((prev) => ({ ...prev, [i]: !prev[i] }));
  }

  let priceDisplay: string | null = null;
  if (offering.hasVirtualOption && offering.virtualPrice != null && offering.price != null) {
    priceDisplay = `$${offering.price} in-person · $${offering.virtualPrice} virtual`;
  } else if (offering.price != null) {
    priceDisplay = `$${offering.price} CAD`;
  }

  const durationDisplay = staticContent?.durationOverride ?? (offering.hours != null ? `${offering.hours} CCP Hours` : null);

  const cadaNote =
    staticContent?.cadaNote ??
    (offering.cadaCppCodes && offering.cadaCppCodes.length > 0
      ? `Meets various competencies for the CCP`
      : null);

  return (
    <AnimateIn delay={index * 80} className="flex flex-col">
      <div
        className="group flex flex-col flex-1 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        style={{ backgroundColor: "#F4F7F9" }}
      >
        <div className="h-1 w-full" style={{ backgroundColor: "#4A9FD4" }} />

        <div className="flex flex-col flex-1 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-5">
            <StatusBadge hasUpcoming={hasUpcoming} />
          </div>

          <h2
            className="text-xl font-bold mb-3 leading-snug"
            style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            {staticContent?.displayTitle ?? offering.title}
          </h2>

          {staticContent?.dateOverride && (
            <div className="flex items-center gap-1.5 mb-3 -mt-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden className="w-3.5 h-3.5 shrink-0" style={{ color: "#378ADD" }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span className="text-sm font-semibold" style={{ color: "#1E3560" }}>{staticContent.dateOverride}</span>
            </div>
          )}

          {(priceDisplay || durationDisplay) && (
            <div className="flex items-center gap-3 mb-4 -mt-1">
              {priceDisplay && (
                <span className="text-sm font-bold" style={{ color: "#E67E22" }}>
                  {priceDisplay}
                </span>
              )}
              {priceDisplay && durationDisplay && (
                <span className="text-xs" style={{ color: "rgba(30,53,96,0.25)" }}>·</span>
              )}
              {durationDisplay && (
                <span className="text-xs" style={{ color: "rgba(43,48,58,0.5)" }}>
                  {durationDisplay}
                </span>
              )}
            </div>
          )}

          {/* Collapsible body */}
          <div className="relative">
            <div
              className={expanded ? "" : "overflow-hidden"}
              style={{ maxHeight: expanded ? undefined : 320 }}
            >
              {offering.description && (
                <p className="text-sm leading-relaxed mb-3" style={{ color: "#2B303A" }}>
                  {offering.description}
                </p>
              )}
              {staticContent?.foodNote && (
                <p className="text-xs leading-relaxed mb-6" style={{ color: "#E67E22", fontStyle: "italic" }}>
                  {staticContent.foodNote}
                </p>
              )}

              {staticContent?.highlights && staticContent.highlights.length > 0 && (
                <ul className="flex flex-col gap-2.5 mb-6">
                  {staticContent.highlights.map((h) => (
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

              {staticContent?.speakers && staticContent.speakers.length > 0 && (
                <div className="mb-6">
                  <p
                    className="text-xs font-bold uppercase tracking-[0.15em] mb-3"
                    style={{ color: "rgba(30,53,96,0.45)" }}
                  >
                    Speakers
                  </p>
                  <div
                    className="rounded-xl overflow-hidden"
                    style={{ border: "1.5px solid rgba(30,53,96,0.1)" }}
                  >
                    {staticContent.speakers.map((speaker, i) => {
                      const isOpen = !!openSpeakers[i];
                      const isLast = i === staticContent.speakers!.length - 1;
                      return (
                        <div
                          key={i}
                          style={
                            !isLast
                              ? { borderBottom: "1px solid rgba(30,53,96,0.08)" }
                              : undefined
                          }
                        >
                          <button
                            type="button"
                            onClick={() => toggleSpeaker(i)}
                            className="w-full flex items-start justify-between gap-3 px-4 py-3 text-left transition-colors duration-150"
                            style={{ backgroundColor: isOpen ? "rgba(30,53,96,0.03)" : "transparent" }}
                            aria-expanded={isOpen}
                          >
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-baseline gap-1.5">
                                <span className="text-sm font-bold" style={{ color: "#1E3560" }}>
                                  {speaker.name}
                                </span>
                                {speaker.affiliation && (
                                  <>
                                    <span className="text-xs" style={{ color: "rgba(30,53,96,0.3)" }}>·</span>
                                    <span className="text-xs italic" style={{ color: "rgba(43,48,58,0.5)" }}>
                                      {speaker.affiliation}
                                    </span>
                                  </>
                                )}
                              </div>
                              <p className="text-xs mt-0.5" style={{ color: "#378ADD" }}>
                                {speaker.topic}
                              </p>
                            </div>
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2.5}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden
                              className="w-3.5 h-3.5 shrink-0 mt-1 transition-transform duration-200"
                              style={{
                                color: "rgba(30,53,96,0.35)",
                                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                              }}
                            >
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </button>
                          {isOpen && (
                            <div className="px-4 pb-3">
                              <p className="text-xs leading-relaxed" style={{ color: "rgba(43,48,58,0.65)" }}>
                                {speaker.description}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mb-5 h-px" style={{ backgroundColor: "rgba(30,53,96,0.1)" }} />

              {staticContent?.tags && staticContent.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {staticContent.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-semibold px-3 py-1 rounded-full"
                      style={{ backgroundColor: "rgba(30,53,96,0.07)", color: "#1E3560" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {staticContent?.agendaNote && (
                <p className="text-xs mb-5 leading-relaxed" style={{ color: "rgba(43,48,58,0.5)", fontStyle: "italic" }}>
                  {staticContent.agendaNote}
                </p>
              )}

              {(staticContent?.whatToBring || staticContent?.idealFor) && (
                <div className="mb-5 flex flex-col gap-2">
                  {staticContent.whatToBring && (
                    <p className="text-xs leading-relaxed" style={{ color: "#2B303A" }}>
                      <span
                        className="font-bold uppercase tracking-wide"
                        style={{ color: "rgba(30,53,96,0.4)", fontSize: "10px" }}
                      >
                        What to bring:{" "}
                      </span>
                      {staticContent.whatToBring}
                    </p>
                  )}
                  {staticContent.idealFor && (
                    <p className="text-xs leading-relaxed" style={{ color: "#2B303A" }}>
                      <span
                        className="font-bold uppercase tracking-wide"
                        style={{ color: "rgba(30,53,96,0.4)", fontSize: "10px" }}
                      >
                        Ideal for:{" "}
                      </span>
                      {staticContent.idealFor}
                    </p>
                  )}
                </div>
              )}

              {cadaNote && (
                <div
                  className="mb-5 rounded-lg px-4 py-3 text-xs leading-relaxed"
                  style={{
                    backgroundColor: "rgba(230,126,34,0.08)",
                    border: "1px solid rgba(230,126,34,0.18)",
                    color: "#2B303A",
                  }}
                >
                  {cadaNote}
                </div>
              )}
            </div>
            {!expanded && (
              <div
                className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
                style={{ background: "linear-gradient(to bottom, transparent, #F4F7F9)" }}
              />
            )}
          </div>
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            className="self-start text-xs font-bold mt-1 mb-4 transition-colors duration-150"
            style={{ color: "#1E3560" }}
          >
            {expanded ? "Show Less ↑" : "Read More ↓"}
          </button>
          <div className="flex-1" />

          {hasUpcoming ? (
            <>
              {nextDate && (
                <div className="flex items-center gap-1.5 mb-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden className="w-3.5 h-3.5 shrink-0" style={{ color: "#378ADD" }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span className="text-sm font-semibold" style={{ color: "#1E3560" }}>
                    {new Date(nextDate.date).toLocaleDateString("en-CA", {
                      timeZone: "America/Edmonton",
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
              <Link
                href={`/register?offering=${encodeURIComponent(offering.title)}&dateId=${nextDate!._id}`}
                className="group/link inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white self-start transition-all duration-200 hover:scale-[1.02]"
                style={{ backgroundColor: "#E67E22" }}
              >
                Register Now
                <span className="transition-transform duration-200 group-hover/link:translate-x-1">→</span>
              </Link>
            </>
          ) : (
            <button
              disabled
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold self-start cursor-not-allowed"
              style={{ backgroundColor: "rgba(43,48,58,0.08)", color: "rgba(43,48,58,0.35)" }}
            >
              Coming Soon
            </button>
          )}
        </div>
      </div>
    </AnimateIn>
  );
}

// ─── Ergonomics grouped card ────────────────────────────────────────────────────

function ErgonomicsGroupCard({
  offerings,
  index,
}: {
  offerings: WorkshopOffering[];
  index: number;
}) {
  const allDates = offerings.flatMap((o) => o.dates);
  const hasUpcoming = getNextUpcomingDate(allDates) !== null;
  const [expanded, setExpanded] = useState(false);

  const prefix = "Ergonomics in Healthcare: ";

  return (
    <AnimateIn delay={index * 80} className="flex flex-col">
      <div
        className="group flex flex-col flex-1 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        style={{ backgroundColor: "#F4F7F9" }}
      >
        <div className="h-1 w-full" style={{ backgroundColor: "#4A9FD4" }} />

        <div className="flex flex-col flex-1 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-5">
            <StatusBadge hasUpcoming={hasUpcoming} />
          </div>

          <h2
            className="text-xl font-bold mb-3 leading-snug"
            style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            Ergonomics in Healthcare
          </h2>

          <div className="mb-4">
            <span className="inline-block bg-[#0D3B6E] text-white text-xs font-semibold px-3 py-1 rounded-full">
              In-Person
            </span>
          </div>

          <div className="flex items-center gap-3 mb-4 -mt-1">
            <span className="text-sm font-bold" style={{ color: "#E67E22" }}>
              $40 CAD
            </span>
            <span className="text-xs" style={{ color: "rgba(30,53,96,0.25)" }}>·</span>
            <span className="text-xs" style={{ color: "rgba(43,48,58,0.5)" }}>
              1.5 hours/session
            </span>
          </div>

          {/* Collapsible body */}
          <div className="relative">
            <div
              className={expanded ? "" : "overflow-hidden"}
              style={{ maxHeight: expanded ? undefined : 320 }}
            >
              <p className="text-sm leading-relaxed mb-4" style={{ color: "#2B303A" }}>
                Developed by a Registered Dental Assistant (RDA) and RYT 200. Healthcare professionals
                spend countless hours caring for others, often in sustained postures that place
                significant demands on the body. This interactive workshop is designed specifically for
                healthcare professionals who want to understand the impact of ergonomics and
                develop practical strategies to prevent pain, injury, and burnout. Includes guided
                breathwork, yoga-inspired movement, stretches, and a closing Yoga Nidra relaxation
                practice. There will be 3 separate sessions available focusing on different areas of the
                body. Each session targets a specific area, so you can attend one or all three.
              </p>

              <ul className="flex flex-col gap-2.5 mb-6">
                {[
                  "Ergonomic risk factors and posture principles for dental practice",
                  "Guided breathwork techniques to reduce tension and support focus",
                  "Yoga-inspired movement sequences adapted for healthcare professionals",
                  "Targeted stretches for specific areas of the body",
                  "Closing Yoga Nidra relaxation practice",
                ].map((h) => (
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

              <div className="mb-5 h-px" style={{ backgroundColor: "rgba(30,53,96,0.1)" }} />

              <div className="flex flex-wrap gap-2 mb-6">
                {["Interactive", "Wellness", "CCP Support", "Certificate of Attendance"].map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-semibold px-3 py-1 rounded-full"
                    style={{ backgroundColor: "rgba(30,53,96,0.07)", color: "#1E3560" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mb-5 flex flex-col gap-2">
                <p className="text-xs leading-relaxed" style={{ color: "#2B303A" }}>
                  <span
                    className="font-bold uppercase tracking-wide"
                    style={{ color: "rgba(30,53,96,0.4)", fontSize: "10px" }}
                  >
                    What to bring:{" "}
                  </span>
                  Water bottle, yoga mat, and comfortable clothes
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "#2B303A" }}>
                  <span
                    className="font-bold uppercase tracking-wide"
                    style={{ color: "rgba(30,53,96,0.4)", fontSize: "10px" }}
                  >
                    Ideal for:{" "}
                  </span>
                  Dentists, dental hygienists, dental assistants, treatment coordinators, and all dental
                  team members
                </p>
              </div>

              <div
                className="mb-5 rounded-lg px-4 py-3 text-xs leading-relaxed"
                style={{
                  backgroundColor: "rgba(230,126,34,0.08)",
                  border: "1px solid rgba(230,126,34,0.18)",
                  color: "#2B303A",
                }}
              >
                Meets various competencies for the CCP
              </div>
            </div>
            {!expanded && (
              <div
                className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
                style={{ background: "linear-gradient(to bottom, transparent, #F4F7F9)" }}
              />
            )}
          </div>
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            className="self-start text-xs font-bold mt-1 mb-4 transition-colors duration-150"
            style={{ color: "#1E3560" }}
          >
            {expanded ? "Show Less ↑" : "Read More ↓"}
          </button>
          <div className="flex-1" />

          <div className="flex flex-col" style={{ borderTop: "1px solid rgba(30,53,96,0.08)" }}>
            {offerings.map((o) => {
              const sessionName = o.title.startsWith(prefix)
                ? o.title.slice(prefix.length)
                : o.title;
              const sessionDate = getNextUpcomingDate(o.dates);
              const href = sessionDate
                ? `/register?offering=${encodeURIComponent(o.title)}&dateId=${sessionDate._id}`
                : `/register?offering=${encodeURIComponent(o.title)}`;
              return (
                <div
                  key={o._id}
                  className="flex items-center gap-3 py-3"
                  style={{ borderBottom: "1px solid rgba(30,53,96,0.08)" }}
                >
                  <span className="text-sm font-bold flex-1 min-w-0" style={{ color: "#1E3560" }}>
                    {sessionName}
                  </span>
                  <span className="text-xs shrink-0" style={{ color: "rgba(43,48,58,0.45)" }}>
                    {sessionDate
                      ? new Date(sessionDate.date).toLocaleDateString("en-CA", {
                          timeZone: "America/Edmonton",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "No dates scheduled"}
                  </span>
                  {sessionDate ? (
                    <Link
                      href={href}
                      className="shrink-0 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-all duration-200 hover:scale-[1.02]"
                      style={{ backgroundColor: "#E67E22" }}
                    >
                      Register <span>→</span>
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="shrink-0 inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-bold cursor-not-allowed"
                      style={{ backgroundColor: "rgba(43,48,58,0.08)", color: "rgba(43,48,58,0.35)" }}
                    >
                      Coming Soon
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AnimateIn>
  );
}

// ─── Tabs ──────────────────────────────────────────────────────────────────────

type Tab = "events" | "courses" | "practical-exam-prep";

const TABS: { id: Tab; label: string }[] = [
  { id: "events",              label: "Events" },
  { id: "courses",             label: "Courses" },
  { id: "practical-exam-prep", label: "Practical Exam Prep" },
];

export default function PDTabs({ offerings }: { offerings: WorkshopOffering[] }) {
  const [activeTab, setActiveTab] = useState<Tab>("events");

  const ergonomicsOfferings = offerings.filter((o) =>
    o.title.startsWith("Ergonomics in Healthcare")
  );
  const eventOfferings = offerings
    .filter(
      (o) =>
        (o.category === "workshop" || o.category === "guest-speaker") &&
        !o.title.startsWith("Ergonomics in Healthcare")
    )
    .sort((a, b) => {
      const aDate = getNextUpcomingDate(a.dates);
      const bDate = getNextUpcomingDate(b.dates);
      if (aDate && bDate) return new Date(aDate.date).getTime() - new Date(bDate.date).getTime();
      if (aDate) return -1;
      if (bDate) return 1;
      return 0;
    });
  const courseOfferings = offerings.filter(
    (o) => o.category === "course"
  );

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

        {/* Events */}
        <div className={activeTab === "events" ? undefined : "hidden"}>
          <div className="mb-12">
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#4A9FD4" }}>
              Upcoming Events
            </p>
            <h2
              className="text-3xl font-bold leading-tight"
              style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              Professional Development Events
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {ergonomicsOfferings.length > 0 && (
              <ErgonomicsGroupCard offerings={ergonomicsOfferings} index={0} />
            )}
            {eventOfferings.map((o, i) => (
              <WorkshopOfferingCard
                key={o._id}
                offering={o}
                index={ergonomicsOfferings.length > 0 ? i + 1 : i}
              />
            ))}
          </div>
        </div>

        {/* Courses */}
        <div className={activeTab === "courses" ? undefined : "hidden"}>
          {courseOfferings.length > 0 ? (
            <>
              <div className="mb-12">
                <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#4A9FD4" }}>
                  Available Courses
                </p>
                <h2
                  className="text-3xl font-bold leading-tight"
                  style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}
                >
                  Courses
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {courseOfferings.map((o, i) => (
                  <WorkshopOfferingCard key={o._id} offering={o} index={i} />
                ))}
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
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
