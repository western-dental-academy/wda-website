import type { Metadata } from "next";
import Link from "next/link";
import InvigilationBookingForm from "@/components/invigilation/InvigilationBookingForm";
import { FloatingPaths } from "@/components/ui/background-paths";
import { getInvigilationSettings } from "@/lib/invigilation/server";
import { DAY_KEYS, formatHour, hourOf, lengthsFor, type InvigilationSettings } from "@/lib/invigilation/settings";

export const metadata: Metadata = {
  title: "Exam Invigilation",
  description:
    "Book a supervised exam invigilation session at Western Dental Academy in the Edmonton Area. Online booking, flexible session lengths, accommodations available.",
};

export const dynamic = "force-dynamic";

const DAY_LABELS: Record<string, string> = {
  monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday", thursday: "Thursday",
  friday: "Friday", saturday: "Saturday", sunday: "Sunday",
};

// Group consecutive days with the same hours: "Tuesday – Thursday  8:00 AM – 8:00 PM"
function hoursRows(settings: InvigilationSettings) {
  const order = [...DAY_KEYS.slice(1), DAY_KEYS[0]];
  const rows: { days: string; hours: string }[] = [];
  let run: { first: string; last: string; hours: string } | null = null;
  for (const day of order) {
    const h = settings.weeklyHours.find(w => w.day === day);
    const hours = h ? `${formatHour(hourOf(h.open))} – ${formatHour(hourOf(h.close))}` : "Closed";
    if (run && run.hours === hours) run.last = day;
    else {
      if (run) rows.push({ days: run.first === run.last ? DAY_LABELS[run.first] : `${DAY_LABELS[run.first]} – ${DAY_LABELS[run.last]}`, hours: run.hours });
      run = { first: day, last: day, hours };
    }
  }
  if (run) rows.push({ days: run.first === run.last ? DAY_LABELS[run.first] : `${DAY_LABELS[run.first]} – ${DAY_LABELS[run.last]}`, hours: run.hours });
  return rows;
}

function lengthsLabel(settings: InvigilationSettings) {
  const l = lengthsFor(settings, []);
  return l.length > 1 ? `${l[0]}–${l[l.length - 1]}` : String(l[0] ?? "");
}

const policies = (settings: InvigilationSettings) => [
  {
    title: "Booking",
    items: [
      `Exams must be booked at least ${settings.minDaysNotice} days before your appointment.`,
      "Book online, email info@westerndentalacademy.com, or call 780-499-9153.",
      "Accommodations (quiet room, noise-cancelling headphones, extra time, etc.) must be indicated when you book.",
      "A verbal exam reader is an extra charge equal to the invigilation fee.",
      "Western Dental Academy reserves the right to reschedule or cancel an appointment if needed. If this happens, we'll contact you as soon as possible to arrange a new time.",
    ],
  },
  {
    title: "Your instructor or exam centre",
    items: [
      "Must send us, at least 48 hours before your exam: the exam password or a paper copy sent to our office.",
      "A list of acceptable items (scrap paper, ruler, calculator, formula sheets, etc.).",
      "A contact phone number or email for any issues during the exam.",
    ],
  },
  {
    title: "What to bring",
    items: [
      "Photo ID and your confirmation email.",
      "For computer-based exams: a Windows or Mac laptop, fully charged, and its charger. Chromebooks and iPads are not supported.",
      "If your exam uses Safe Exam Browser (for example, CAEC exams), download and install it from safeexambrowser.org before you arrive and make sure it opens. Installing needs administrator access, so work- or school-managed laptops may not allow it; check ahead of time.",
      "Any other items required for your exam.",
    ],
  },
  {
    title: "In the exam room",
    items: [
      "Exams are written in our classroom, supervised by instructional staff.",
      "Our classroom is on the second floor and there is no elevator. If stairs are a concern, please call us before booking.",
      `No more than ${settings.maxStudentsPerHour} students write at once. Students with accommodations write one at a time.`,
      "Phones and smartwatches off and stored in your bag. Bags, coats and hats stay at the front; no hats.",
      "Only clear water bottles are permitted.",
    ],
  },
];

export default async function ExamInvigilationPage({
  searchParams,
}: {
  searchParams: Promise<{ cancelled?: string }>;
}) {
  const [{ cancelled }, settings] = await Promise.all([searchParams, getInvigilationSettings()]);
  const rows = hoursRows(settings);

  return (
    <>
      {/* ── Hero ───────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "#1E3560" }}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: "radial-gradient(circle, #4A9FD4 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(74,159,212,0.13) 0%, transparent 70%)" }}
        />
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />

        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-20">
          <nav aria-label="Breadcrumb" className="mb-10">
            <ol className="flex items-center gap-2 text-xs font-semibold">
              <li>
                <Link href="/" className="transition-colors duration-200 hover:text-white" style={{ color: "rgba(255,255,255,0.45)" }}>
                  Home
                </Link>
              </li>
              <li style={{ color: "rgba(255,255,255,0.25)" }} aria-hidden>/</li>
              <li style={{ color: "rgba(255,255,255,0.7)" }}>Exam Invigilation</li>
            </ol>
          </nav>

          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7"
            style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.13)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#E67E22" }} />
            <span className="text-xs font-semibold tracking-[0.18em] uppercase" style={{ color: "rgba(255,255,255,0.7)" }}>
              Exam Invigilation
            </span>
          </div>

          <h1
            className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5 max-w-2xl"
            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            Write your exam <span style={{ color: "#4A9FD4" }}>with us.</span>
          </h1>

          <p className="text-lg leading-relaxed max-w-xl mb-8" style={{ color: "rgba(255,255,255,0.65)" }}>
            Book a supervised seat in our Sherwood Park classroom for your online or paper exam. Pick a date and
            time below, pay securely, and we&apos;ll have your seat ready.
          </p>

          <div className="flex flex-wrap gap-6">
            {[
              { value: `$${settings.sessionPrice}`, label: "Per session" },
              { value: `${lengthsLabel(settings)} hr`, label: "Sessions" },
              { value: `${settings.minDaysNotice} days`, label: "Notice required" },
            ].map(({ value, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <span className="text-lg font-bold" style={{ color: "#4A9FD4" }}>{value}</span>
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} aria-hidden />
      </section>

      {/* ── Booking form ───────────────────────────── */}
      <section className="py-16" style={{ backgroundColor: "#F4F7F9" }}>
        <div className="max-w-6xl mx-auto px-6">
          <InvigilationBookingForm settings={settings} cancelled={cancelled === "1"} />
        </div>
      </section>

      {/* ── Hours + policies ───────────────────────── */}
      <section id="policies" className="py-16 sm:py-24 bg-white scroll-mt-24">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-[280px_1fr] gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-[#1E3560] mb-5" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
              Invigilation hours
            </h2>
            <dl className="space-y-3 text-sm">
              {rows.map(r => (
                <div key={r.days} className="flex flex-col">
                  <dt className="font-semibold text-[#1E3560]">{r.days}</dt>
                  <dd className="text-[#2B303A]/65">{r.hours}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-[#2B303A]/50 mt-5 leading-relaxed">
              Sessions start on the hour and must finish by closing time. Our classroom is on the second floor with no
              elevator. Questions? Call{" "}
              <a href="tel:7804999153" className="font-semibold text-[#4A9FD4]">780-499-9153</a>.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[#1E3560] mb-6" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
              Invigilation policies
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {policies(settings).map(p => (
                <div key={p.title} className="rounded-2xl p-6" style={{ backgroundColor: "#F4F7F9" }}>
                  <h3 className="text-base font-medium mb-3" style={{ color: "#4A9FD4", fontFamily: "var(--font-montserrat), sans-serif" }}>
                    {p.title}
                  </h3>
                  <ul className="space-y-2 text-sm leading-relaxed text-[#2B303A]/80">
                    {p.items.map(i => (
                      <li key={i} className="flex gap-2.5">
                        <span className="mt-2 w-1 h-1 rounded-full bg-[#1E3560] shrink-0" aria-hidden />
                        <span>{i}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
