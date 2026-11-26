import type { Metadata } from "next";
import Link from "next/link";
import { FloatingPaths } from "@/components/ui/background-paths";
import TutoringInquiryForm from "@/components/tutoring/TutoringInquiryForm";
import { TUTORING_HOURLY_RATE, TUTORING_SERVICES, type TutoringService } from "@/lib/tutoring/shared";

export const metadata: Metadata = {
  title: "Tutoring & Coaching",
  description:
    "One-on-one tutoring for Dental Assisting studies and coaching for new Dental Assisting graduates at Western Dental Academy in the Edmonton Area. Online or in person, $50/hour.",
};

const STEPS = [
  {
    n: "01",
    title: "Tell us what you need",
    body: "Send a short inquiry with the areas you'd like help with, such as anatomy, terminology or study skills.",
  },
  {
    n: "02",
    title: "We match and schedule",
    body: "Our team pairs you with the instructor best suited to your goals and contacts you to set up a time.",
  },
  {
    n: "03",
    title: "Pay and get started",
    body: `Once your session is arranged, we email you a secure payment link. $${TUTORING_HOURLY_RATE} per hour, online or in person.`,
  },
];

export default async function TutoringPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;
  const initialService: TutoringService | undefined =
    service === "coaching" ? "coaching" : service === "tutoring" ? "tutoring" : undefined;

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
              <li style={{ color: "rgba(255,255,255,0.7)" }}>Tutoring &amp; Coaching</li>
            </ol>
          </nav>

          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7"
            style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.13)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#E67E22" }} />
            <span className="text-xs font-semibold tracking-[0.18em] uppercase" style={{ color: "rgba(255,255,255,0.7)" }}>
              Tutoring &amp; Coaching
            </span>
          </div>

          <h1
            className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5 max-w-2xl"
            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            One-on-one support, <span style={{ color: "#4A9FD4" }}>built around you.</span>
          </h1>

          <p className="text-lg leading-relaxed max-w-xl mb-8" style={{ color: "rgba(255,255,255,0.65)" }}>
            Personal tutoring for Dental Assisting studies and coaching for new graduates, led by experienced
            instructors at our dental training facility in the Edmonton Area or online.
          </p>

          <div className="flex flex-wrap gap-6 mb-10">
            {[
              { value: `$${TUTORING_HOURLY_RATE}`, label: "Per hour" },
              { value: "Online", label: "or in person" },
              { value: "Theory", label: "focused" },
            ].map(({ value, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <span className="text-lg font-bold" style={{ color: "#4A9FD4" }}>{value}</span>
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
              </div>
            ))}
          </div>

          <a
            href="#inquire"
            className="inline-flex items-center rounded-lg px-6 py-3 text-sm font-bold text-white bg-[#4A9FD4] hover:bg-white hover:text-[#1E3560] transition-colors duration-200"
          >
            Send an Inquiry
          </a>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} aria-hidden />
      </section>

      {/* ── The two services ───────────────────────── */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {TUTORING_SERVICES.map(s => (
              <article
                key={s.value}
                className="rounded-2xl p-8 flex flex-col"
                style={{ backgroundColor: "#F4F7F9", boxShadow: "0 1px 2px rgba(30,53,96,0.04)" }}
              >
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#E67E22" }}>
                  {s.short}
                </p>
                <h2
                  className="text-2xl font-semibold mb-2 text-[#1E3560]"
                  style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
                >
                  {s.title}
                </h2>
                <p className="text-sm mb-6" style={{ color: "rgba(43,48,58,0.6)" }}>{s.audience}</p>
                <ul className="space-y-3 text-sm leading-relaxed text-[#2B303A]/85 mb-8">
                  {s.points.map(pt => (
                    <li key={pt} className="flex gap-3">
                      <svg viewBox="0 0 20 20" fill="#4A9FD4" className="w-4 h-4 mt-0.5 shrink-0" aria-hidden>
                        <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0z" clipRule="evenodd" />
                      </svg>
                      <span>{pt}</span>
                    </li>
                  ))}
                  <li className="flex gap-3">
                    <svg viewBox="0 0 20 20" fill="#4A9FD4" className="w-4 h-4 mt-0.5 shrink-0" aria-hidden>
                      <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0z" clipRule="evenodd" />
                    </svg>
                    <span>
                      <strong className="text-[#1E3560]">${TUTORING_HOURLY_RATE}/hour</strong>, online and/or in person at our facility
                    </span>
                  </li>
                </ul>
                <a
                  href={`?service=${s.value}#inquire`}
                  className="mt-auto self-start rounded-lg px-5 py-2.5 text-sm font-bold transition-colors duration-200 border-[1.5px] border-[#1E3560] text-[#1E3560] hover:bg-[#1E3560] hover:text-white"
                >
                  Inquire about {s.short.toLowerCase()}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────── */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: "#F4F7F9" }}>
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#1E3560] mb-10" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
            How it works
          </h2>
          <ol className="grid md:grid-cols-3 gap-6">
            {STEPS.map(s => (
              <li key={s.n} className="rounded-2xl bg-white p-7" style={{ boxShadow: "0 4px 24px rgba(30,53,96,0.05)" }}>
                <span className="block text-3xl font-bold mb-4" style={{ color: "#4A9FD4", fontFamily: "var(--font-montserrat), sans-serif" }}>
                  {s.n}
                </span>
                <h3 className="text-lg font-medium mb-2" style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}>
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#2B303A]/75">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Inquiry form ───────────────────────────── */}
      <section id="inquire" className="py-16 sm:py-24 bg-white scroll-mt-24">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-[1fr_1.4fr] gap-12">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#1E3560] mb-4" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
              Send an inquiry
            </h2>
            <p className="text-sm leading-relaxed text-[#2B303A]/75 mb-6">
              Let us know where you&apos;d like support. We&apos;ll review your request, decide who can best help you,
              and reach out to set up a time.
            </p>
            <div className="rounded-2xl p-6 text-sm leading-relaxed" style={{ backgroundColor: "#F4F7F9" }}>
              <p className="font-semibold text-[#1E3560] mb-1">Prefer to talk first?</p>
              <p className="text-[#2B303A]/75">
                Call <a href="tel:5872691644" className="font-semibold text-[#4A9FD4]">587-269-1644</a> or email
              </p>
              <a href="mailto:info@westerndentalacademy.com" className="font-semibold text-[#4A9FD4] break-words">
                info@westerndentalacademy.com
              </a>
            </div>
          </div>
          <div className="relative rounded-2xl p-6 sm:p-8" style={{ backgroundColor: "#F4F7F9" }}>
            <TutoringInquiryForm key={initialService ?? "none"} initialService={initialService} />
          </div>
        </div>
      </section>
    </>
  );
}
