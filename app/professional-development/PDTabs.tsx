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

interface OfferingStaticContent {
  highlights: string[];
  tags: string[];
  whatToBring?: string;
  idealFor?: string;
  cadaNote?: string;
}

const OFFERING_STATIC: Record<string, OfferingStaticContent> = {
  "Renewal Wellness": {
    highlights: [
      "Registration Renewal Unraveled — Jolene Moore",
      "Obstructive Sleep Apnea — Samantha Coleman & Emily Griffiths",
      "Dementia and Oral Health Care — Naomi Klassen",
      "Financial Health for the DHCP — Josie McKenzie",
      "Limiting your Liability in Emergency Situations — Tony Korobanik",
    ],
    tags: ["Full Day", "In-Person & Virtual", "CADA CPP Support", "Certificate of Attendance"],
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

  let priceDisplay: string | null = null;
  if (offering.hasVirtualOption && offering.virtualPrice != null && offering.price != null) {
    priceDisplay = `$${offering.price} in-person · $${offering.virtualPrice} virtual`;
  } else if (offering.price != null) {
    priceDisplay = `$${offering.price} CAD`;
  }

  const durationDisplay = offering.hours != null ? `${offering.hours} CADA CPP Hours` : null;

  const cadaNote =
    staticContent?.cadaNote ??
    (offering.cadaCppCodes && offering.cadaCppCodes.length > 0
      ? `Meets CADA Competency Profile #s ${offering.cadaCppCodes.join(", ")}. Provides a certificate of attendance to support your annual CCP submission.`
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
            {offering.title}
          </h2>

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

          {offering.description && (
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#2B303A" }}>
              {offering.description}
            </p>
          )}

          {staticContent?.highlights && staticContent.highlights.length > 0 && (
            <ul className="flex flex-col gap-2.5 mb-6 flex-1">
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

          <div className="mb-5 h-px" style={{ backgroundColor: "rgba(30,53,96,0.1)" }} />

          {staticContent?.tags && staticContent.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
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
              }}
            >
              <span className="font-bold" style={{ color: "#E67E22" }}>CADA: </span>
              <span style={{ color: "#2B303A" }}>{cadaNote}</span>
            </div>
          )}

          {hasUpcoming ? (
            <Link
              href="/register"
              className="group/link inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white self-start transition-all duration-200 hover:scale-[1.02]"
              style={{ backgroundColor: "#E67E22" }}
            >
              Register Now
              <span className="transition-transform duration-200 group-hover/link:translate-x-1">→</span>
            </Link>
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
  const nextDate = getNextUpcomingDate(allDates);
  const hasUpcoming = nextDate !== null;

  const prefix = "Ergonomics in Dentistry: ";
  const sessions = offerings
    .map((o) => (o.title.startsWith(prefix) ? o.title.slice(prefix.length) : o.title))
    .filter(Boolean);

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
            Ergonomics in Dentistry
          </h2>

          <div className="flex items-center gap-3 mb-4 -mt-1">
            <span className="text-sm font-bold" style={{ color: "#E67E22" }}>
              $40 CAD
            </span>
            <span className="text-xs" style={{ color: "rgba(30,53,96,0.25)" }}>·</span>
            <span className="text-xs" style={{ color: "rgba(43,48,58,0.5)" }}>
              1.5 hours/session
            </span>
          </div>

          <p className="text-sm leading-relaxed mb-4" style={{ color: "#2B303A" }}>
            Developed by a Registered Dental Assistant (RDA) and RYT 200. Dental professionals
            spend countless hours caring for others, often in sustained postures that place
            significant demands on the body. This interactive workshop is designed specifically for
            dental health care professionals who want to understand the impact of ergonomics and
            develop practical strategies to prevent pain, injury, and burnout. Includes guided
            breathwork, yoga-inspired movement, stretches, and a closing Yoga Nidra relaxation
            practice. There will be 3 separate sessions available focusing on different areas of the
            body. Each session targets a specific area, so you can attend one or all three.
          </p>

          {sessions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {sessions.map((session) => (
                <span
                  key={session}
                  className="text-[11px] font-semibold px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: "rgba(74,159,212,0.10)", color: "#1E3560" }}
                >
                  {session}
                </span>
              ))}
            </div>
          )}

          <ul className="flex flex-col gap-2.5 mb-6 flex-1">
            {[
              "Ergonomic risk factors and posture principles for dental practice",
              "Guided breathwork techniques to reduce tension and support focus",
              "Yoga-inspired movement sequences adapted for dental professionals",
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
            {["Interactive", "Wellness", "CADA CCP Support", "Certificate of Attendance"].map((tag) => (
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
            }}
          >
            <span className="font-bold" style={{ color: "#E67E22" }}>CADA: </span>
            <span style={{ color: "#2B303A" }}>
              Meets CADA Competency Profile #s B-4-2, I-5-3, or I-5-4. Provides a certificate of
              attendance to support your annual CCP submission.
            </span>
          </div>

          {hasUpcoming ? (
            <Link
              href="/register"
              className="group/link inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white self-start transition-all duration-200 hover:scale-[1.02]"
              style={{ backgroundColor: "#E67E22" }}
            >
              Register Now
              <span className="transition-transform duration-200 group-hover/link:translate-x-1">→</span>
            </Link>
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

// ─── Tabs ──────────────────────────────────────────────────────────────────────

type Tab = "workshops" | "guest-speakers" | "courses" | "practical-exam-prep";

const TABS: { id: Tab; label: string }[] = [
  { id: "workshops",           label: "Workshops" },
  { id: "guest-speakers",      label: "Guest Speakers" },
  { id: "courses",             label: "Courses" },
  { id: "practical-exam-prep", label: "Practical Exam Prep" },
];

export default function PDTabs({ offerings }: { offerings: WorkshopOffering[] }) {
  const [activeTab, setActiveTab] = useState<Tab>("workshops");

  const ergonomicsOfferings = offerings.filter((o) =>
    o.title.startsWith("Ergonomics in Dentistry")
  );
  const workshopOfferings = offerings.filter(
    (o) => o.category === "workshop" && !o.title.startsWith("Ergonomics in Dentistry")
  );
  const guestSpeakerOfferings = offerings.filter(
    (o) => o.category === "guest-speaker"
  );
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
            {ergonomicsOfferings.length > 0 && (
              <ErgonomicsGroupCard offerings={ergonomicsOfferings} index={0} />
            )}
            {workshopOfferings.map((o, i) => (
              <WorkshopOfferingCard
                key={o._id}
                offering={o}
                index={ergonomicsOfferings.length > 0 ? i + 1 : i}
              />
            ))}
          </div>
        </div>

        {/* Guest Speakers */}
        <div className={activeTab === "guest-speakers" ? undefined : "hidden"}>
          {guestSpeakerOfferings.length > 0 ? (
            <>
              <div className="mb-12">
                <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#4A9FD4" }}>
                  Guest Speaker Events
                </p>
                <h2
                  className="text-3xl font-bold leading-tight"
                  style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}
                >
                  Learn From Industry Experts
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {guestSpeakerOfferings.map((o, i) => (
                  <WorkshopOfferingCard key={o._id} offering={o} index={i} />
                ))}
              </div>
            </>
          ) : (
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
          )}
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
