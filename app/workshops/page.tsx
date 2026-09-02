import type { Metadata } from "next";
import Link from "next/link";
import AnimateIn from "@/components/AnimateIn";
import { FloatingPaths } from "@/components/ui/background-paths";
import { client } from "@/sanity/lib/client";

// Force SSR on every request — prevents Vercel from serving a stale cached
// page after new workshop offerings are added to Sanity.
export const dynamic = 'force-dynamic'

// ─── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Workshops & Professional Development",
  description:
    "Explore professional development workshops at Western Dental Academy — hands-on clinical skills, dental radiography, infection control, and NDAB exam preparation for dental teams in Alberta.",
};

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

// ─── Dynamic offering card (old card style) ────────────────────────────────────

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

  // Build price display line
  let priceDisplay: string | null = null;
  if (offering.hasVirtualOption && offering.virtualPrice != null && offering.price != null) {
    priceDisplay = `$${offering.price} in-person · $${offering.virtualPrice} virtual`;
  } else if (offering.price != null) {
    priceDisplay = `$${offering.price} CAD`;
  }

  // Build duration/hours display
  const durationDisplay = offering.hours != null ? `${offering.hours} CADA CPP Hours` : null;

  // Build CADA note from Sanity fields if not in static content
  const cadaNote =
    staticContent?.cadaNote ??
    (offering.cadaCppCodes && offering.cadaCppCodes.length > 0
      ? `Meets CADA Competency Profile #s ${offering.cadaCppCodes.join(", ")}. Provides a certificate of attendance to support your annual CCP submission.`
      : null);

  return (
    <AnimateIn delay={index * 80} className="flex flex-col">
      <div
        className="group flex flex-col flex-1 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-4 border-red-500"
        style={{ backgroundColor: "#F4F7F9" }}
      >
        {/* Blue top accent */}
        <div className="h-1 w-full" style={{ backgroundColor: "#4A9FD4" }} />

        <div className="flex flex-col flex-1 p-6 sm:p-8">
          {/* Badge row */}
          <div className="flex items-center justify-between mb-5">
            <StatusBadge hasUpcoming={hasUpcoming} />
          </div>

          {/* Title */}
          <h2
            className="text-xl font-bold mb-3 leading-snug"
            style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            {offering.title}
          </h2>

          {/* Price · Hours */}
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

          {/* Description */}
          {offering.description && (
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#2B303A" }}>
              {offering.description}
            </p>
          )}

          {/* Highlights */}
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

          {/* Divider */}
          <div className="mb-5 h-px" style={{ backgroundColor: "rgba(30,53,96,0.1)" }} />

          {/* Tags */}
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

          {/* What to bring / Ideal for */}
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

          {/* CADA note */}
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

          {/* CTA */}
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

// ─── Ergonomics grouped card (old card style, hardcoded content) ───────────────

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

  // Session sub-labels (subtitle after "Ergonomics in Dentistry: ")
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
        {/* Blue top accent */}
        <div className="h-1 w-full" style={{ backgroundColor: "#4A9FD4" }} />

        <div className="flex flex-col flex-1 p-6 sm:p-8">
          {/* Badge row */}
          <div className="flex items-center justify-between mb-5">
            <StatusBadge hasUpcoming={hasUpcoming} />
          </div>

          {/* Title */}
          <h2
            className="text-xl font-bold mb-3 leading-snug"
            style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            Ergonomics in Dentistry
          </h2>

          {/* Price · Duration */}
          <div className="flex items-center gap-3 mb-4 -mt-1">
            <span className="text-sm font-bold" style={{ color: "#E67E22" }}>
              $40 CAD
            </span>
            <span className="text-xs" style={{ color: "rgba(30,53,96,0.25)" }}>·</span>
            <span className="text-xs" style={{ color: "rgba(43,48,58,0.5)" }}>
              1.5 hours/session
            </span>
          </div>

          {/* Description */}
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

          {/* Session pills */}
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

          {/* Highlights */}
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

          {/* Divider */}
          <div className="mb-5 h-px" style={{ backgroundColor: "rgba(30,53,96,0.1)" }} />

          {/* Tags */}
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

          {/* What to bring / Ideal for */}
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

          {/* CADA note */}
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

          {/* CTA */}
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

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function WorkshopsPage() {
  // Fetch all offerings with their scheduled dates
  let offerings: WorkshopOffering[] = [];
  try {
    offerings = await client.fetch<WorkshopOffering[]>(
      `*[_type == "workshopOffering"] | order(title asc) {
        _id, title, category, description, price, hasVirtualOption, virtualPrice,
        capacity, hours, cadaCppCodes,
        "dates": *[_type == "workshopDate" && references(^._id)] | order(date asc) {
          _id, date, active
        }
      }`,
      {},
      { cache: 'no-store' }
    );
  } catch {
    // silently fall back to static data
  }

  // Separate ergonomics offerings (grouped into one card) from all others
  const ergonomicsOfferings = offerings.filter((o) =>
    o.title.startsWith("Ergonomics in Dentistry")
  );
  const otherOfferings = offerings.filter(
    (o) => !o.title.startsWith("Ergonomics in Dentistry")
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            name: "Ergonomics in Dentistry Workshop",
            description:
              "A hands-on workshop for dental professionals covering ergonomics, intentional movement, and breathwork to prevent burnout and support career longevity.",
            organizer: {
              "@type": "Organization",
              name: "Western Dental Academy",
              url: "https://westerndentalacademy.com",
            },
            location: {
              "@type": "Place",
              name: "Western Dental Academy",
              address: {
                "@type": "PostalAddress",
                streetAddress: "150 Chippewa Road, Suite 258",
                addressLocality: "Sherwood Park",
                addressRegion: "AB",
                addressCountry: "CA",
              },
            },
            offers: {
              "@type": "Offer",
              price: "40",
              priceCurrency: "CAD",
              url: "https://westerndentalacademy.com/register",
            },
          }),
        }}
      />

      {/* ═══════════════════════════════════════════════════════════
          PAGE HERO
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "#1E3560" }}>
        {/* Dot-grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(circle, #4A9FD4 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Radial glow top-right */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(74,159,212,0.15) 0%, transparent 70%)",
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
              <li style={{ color: "rgba(255,255,255,0.25)" }} aria-hidden>/</li>
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
                Whether you&apos;re building new clinical skills or refreshing your knowledge, WDA
                offers practical, expert-led workshops designed around real dental office experience.
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
                    style={{ color: "#4A9FD4", fontFamily: "var(--font-montserrat), sans-serif" }}
                  >
                    {val}
                  </span>
                  <span className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
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
                style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                Now Accepting Registrations
              </h2>
              <p className="text-sm max-w-sm" style={{ color: "#2B303A" }}>
                Hands-on sessions in our Sherwood Park facility, delivered by experienced dental
                professionals.
              </p>
            </div>
          </AnimateIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {ergonomicsOfferings.length > 0 && (
              <ErgonomicsGroupCard
                key="ergonomics-group"
                offerings={ergonomicsOfferings}
                index={0}
              />
            )}
            {otherOfferings.map((o, i) => (
              <WorkshopOfferingCard
                key={o._id}
                offering={o}
                index={ergonomicsOfferings.length > 0 ? i + 1 : i}
              />
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
                style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}
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
                Our team can walk you through each workshop, discuss your professional development
                goals, and help you find the best fit — no pressure, no commitment required.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="rounded-lg px-7 py-3.5 text-sm font-bold text-white transition-all duration-200 bg-[#E67E22] hover:bg-[#CF6D17] hover:scale-[1.02]"
                >
                  Contact Us
                </Link>
                <Link
                  href="/contact"
                  className="rounded-lg px-7 py-3.5 text-sm font-bold transition-all duration-200 border hover:bg-white"
                  style={{ color: "#1E3560", borderColor: "rgba(30,53,96,0.25)" }}
                >
                  Visit Our Facility
                </Link>
              </div>
            </AnimateIn>

            {/* Info card */}
            <AnimateIn delay={120}>
              <div className="rounded-2xl p-8" style={{ backgroundColor: "#1E3560" }}>
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
                      value: "Online theory + hands-on training in Sherwood Park, AB",
                    },
                  ].map(({ label, value }) => (
                    <li
                      key={label}
                      className="pb-6 last:pb-0"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <p
                        className="text-xs font-bold tracking-wide uppercase mb-1"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                      >
                        {label}
                      </p>
                      <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>
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
