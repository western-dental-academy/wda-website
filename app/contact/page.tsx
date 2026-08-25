import type { Metadata } from "next";
import Link from "next/link";
import AnimateIn from "@/components/AnimateIn";
import ContactForm from "@/components/ContactForm";
import { FloatingPaths } from "@/components/ui/background-paths";

// ─── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Western Dental Academy — ask about our professional development opportunities, registration, or schedule a call with our team. We respond within one business day.",
};

// ─── Contact details ───────────────────────────────────────────────────────────

const CONTACT_DETAILS = [
  {
    label: "Address",
    value: "150 Chippewa Road, Suite 258, Sherwood Park, AB",
    href: undefined,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden
        className="w-4 h-4 shrink-0 mt-0.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0 1 15 0z"
        />
      </svg>
    ),
  },
  {
    label: "Phone",
    value: "(780) 000-0000",
    href: "tel:+17800000000",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden
        className="w-4 h-4 shrink-0 mt-0.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25z"
        />
      </svg>
    ),
  },
  {
    label: "Email",
    value: "info@westerndentalacademy.com",
    href: "mailto:info@westerndentalacademy.com",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden
        className="w-4 h-4 shrink-0 mt-0.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
        />
      </svg>
    ),
  },
];

const HOURS = [
  { day: "Monday – Friday", hours: "8:00 am – 5:00 pm", open: true },
  { day: "Saturday", hours: "By appointment", open: true },
  { day: "Sunday", hours: "Closed", open: false },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ContactPage() {
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
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(74,159,212,0.14) 0%, transparent 70%)",
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
              <li style={{ color: "rgba(255,255,255,0.7)" }}>Contact</li>
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
              Get in Touch
            </span>
          </div>

          <h1
            className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5 max-w-2xl"
            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            We&apos;d Love to{" "}
            <span style={{ color: "#4A9FD4" }}>Hear from You.</span>
          </h1>

          <p
            className="text-lg leading-relaxed max-w-xl"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            Questions about our professional development opportunities,
            registration, or anything else — our team is here to help.
            Expect a reply within one business day.
          </p>
        </div>

        <div
          className="absolute bottom-0 inset-x-0 h-px"
          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          aria-hidden
        />
      </section>

      {/* ═══════════════════════════════════════════════════════════
          MAIN BODY
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: "#ffffff" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-14 items-start">

            {/* ── Left: Form ── */}
            <AnimateIn>
              <div
                className="rounded-2xl p-8 sm:p-10"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1.5px solid rgba(30,53,96,0.09)",
                  boxShadow:
                    "0 4px 24px rgba(30,53,96,0.06), 0 1px 4px rgba(30,53,96,0.04)",
                }}
              >
                <p
                  className="text-xs font-bold tracking-[0.2em] uppercase mb-3"
                  style={{ color: "#4A9FD4" }}
                >
                  Send a Message
                </p>
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{
                    color: "#1E3560",
                    fontFamily: "var(--font-montserrat), sans-serif",
                  }}
                >
                  How Can We Help?
                </h2>
                <p
                  className="text-sm leading-relaxed mb-8"
                  style={{ color: "rgba(43,48,58,0.65)" }}
                >
                  Fill in the form and we&apos;ll be in touch shortly. All
                  fields marked{" "}
                  <span style={{ color: "#4A9FD4" }} aria-hidden>
                    *
                  </span>{" "}
                  are required.
                </p>

                <ContactForm />
              </div>
            </AnimateIn>

            {/* ── Right: Sidebar ── */}
            <div className="flex flex-col gap-6">

              {/* Contact info card */}
              <AnimateIn delay={100}>
                <div
                  className="rounded-2xl p-8"
                  style={{ backgroundColor: "#1E3560" }}
                >
                  <p
                    className="text-[10px] font-bold tracking-[0.2em] uppercase mb-6"
                    style={{ color: "#4A9FD4" }}
                  >
                    Contact Details
                  </p>
                  <ul className="flex flex-col gap-5">
                    {CONTACT_DETAILS.map(({ label, value, href, icon }) => (
                      <li key={label} className="flex items-start gap-3.5">
                        <span style={{ color: "#4A9FD4" }}>{icon}</span>
                        <div>
                          <p
                            className="text-[10px] font-bold tracking-widest uppercase mb-0.5"
                            style={{ color: "rgba(255,255,255,0.35)" }}
                          >
                            {label}
                          </p>
                          {href ? (
                            <a
                              href={href}
                              className="text-sm font-medium transition-colors duration-200 hover:text-white"
                              style={{ color: "rgba(255,255,255,0.8)" }}
                            >
                              {value}
                            </a>
                          ) : (
                            <p
                              className="text-sm font-medium"
                              style={{ color: "rgba(255,255,255,0.8)" }}
                            >
                              {value}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimateIn>

              {/* Hours card */}
              <AnimateIn delay={180}>
                <div
                  className="rounded-2xl p-8"
                  style={{ backgroundColor: "#F4F7F9" }}
                >
                  <p
                    className="text-[10px] font-bold tracking-[0.2em] uppercase mb-6"
                    style={{ color: "#4A9FD4" }}
                  >
                    Business Hours
                  </p>
                  <ul className="flex flex-col gap-0">
                    {HOURS.map(({ day, hours, open }, i) => (
                      <li
                        key={day}
                        className={`flex items-center justify-between py-3.5 ${
                          i < HOURS.length - 1 ? "border-b" : ""
                        }`}
                        style={
                          i < HOURS.length - 1
                            ? { borderColor: "rgba(30,53,96,0.08)" }
                            : {}
                        }
                      >
                        <span
                          className="text-sm font-medium"
                          style={{ color: "#1E3560" }}
                        >
                          {day}
                        </span>
                        <span
                          className="text-sm font-semibold"
                          style={{ color: open ? "#2B303A" : "rgba(43,48,58,0.4)" }}
                        >
                          {hours}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div
                    className="mt-6 pt-5 flex items-start gap-2.5"
                    style={{ borderTop: "1px solid rgba(30,53,96,0.08)" }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#4A9FD4"
                      strokeWidth={1.75}
                      aria-hidden
                      className="w-4 h-4 shrink-0 mt-0.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9-3.75h.008v.008H12V8.25z"
                      />
                    </svg>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "rgba(43,48,58,0.55)" }}
                    >
                      Responses to online inquiries are sent during business
                      hours, Monday through Friday.
                    </p>
                  </div>
                </div>
              </AnimateIn>

              {/* Google Maps embed */}
              <AnimateIn delay={240}>
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    boxShadow: "0 4px 24px rgba(30,53,96,0.10)",
                    border: "1px solid rgba(30,53,96,0.08)",
                  }}
                >
                  <iframe
                    src="https://maps.google.com/maps?q=150+Chippewa+Road%2C+Suite+258%2C+Sherwood+Park%2C+AB%2C+Canada&t=&z=16&ie=UTF8&iwloc=&output=embed"
                    width="100%"
                    height="300"
                    style={{ border: "none", display: "block" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Western Dental Academy — 150 Chippewa Road, Suite 258, Sherwood Park, AB"
                  />
                </div>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=150+Chippewa+Road+Suite+258+Sherwood+Park+AB+Canada"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold transition-colors duration-200"
                  style={{ color: "#4A9FD4" }}
                >
                  Open in Google Maps
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </a>
              </AnimateIn>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          COMMON QUESTIONS PREVIEW
      ═══════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: "#1E3560" }} className="relative overflow-hidden py-16">
        {/* Streaming lines background */}
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
        <div className="relative max-w-6xl mx-auto px-6">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p
                className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3"
                style={{
                  color: "#4A9FD4",
                  fontFamily: "var(--font-montserrat), sans-serif",
                }}
              >
                FAQ
              </p>
              <h2
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                Frequently Asked Questions
              </h2>
            </div>
            <Link
              href="/faq"
              className="shrink-0 text-sm font-semibold transition-colors duration-200 hover:text-white"
              style={{ color: "#4A9FD4" }}
            >
              View all FAQ →
            </Link>
          </div>

          {/* 3 static Q&A cards */}
          <div className="flex flex-col gap-4">
            {[
              {
                q: "How do workshops support my CADA CCP?",
                a: "Each participant receives a certificate of attendance along with structured learning objectives. You can use these to document the workshop in your annual CADA Continuing Competence Program (CCP) submission.",
              },
              {
                q: "Where are workshops held?",
                a: "Workshops are held at our facility in Sherwood Park, Alberta (Edmonton area). Free parking is available on site.",
              },
              {
                q: "How do I register?",
                a: "Browse our Professional Development page to find available workshops, courses, and guest speaker events. Click Register on any offering to complete your registration and payment online. Guest speaker events may vary in pricing — some may be complimentary.",
              },
            ].map(({ q, a }) => (
              <div
                key={q}
                className="rounded-xl p-6"
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <p
                  className="text-sm font-semibold text-white mb-2"
                  style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
                >
                  {q}
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  {a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          QUICK LINKS STRIP
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-16" style={{ backgroundColor: "#F4F7F9" }}>
        <div className="max-w-6xl mx-auto px-6">
          <AnimateIn>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                {
                  label: "Explore Professional Development",
                  description: "Browse all WDA workshops and find the right fit.",
                  href: "/professional-development",
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
                        d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                      />
                    </svg>
                  ),
                },
                {
                  label: "About WDA",
                  description: "Learn about our mission, values, and team.",
                  href: "/about",
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
                  label: "Board Exam Prep",
                  description: "Come see our modern facility in person.",
                  href: "/national-board-guided-practice",
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
                        d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
                      />
                    </svg>
                  ),
                },
              ].map(({ label, description, href, icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="group flex items-start gap-4 rounded-xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  style={{ backgroundColor: "#ffffff" }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 mt-0.5 transition-colors duration-200"
                    style={{ backgroundColor: "#1E3560" }}
                  >
                    {icon}
                  </div>
                  <div>
                    <p
                      className="text-sm font-bold mb-1 transition-colors duration-200 group-hover:text-[#4A9FD4]"
                      style={{ color: "#1E3560" }}
                    >
                      {label}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: "rgba(43,48,58,0.65)" }}>
                      {description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </AnimateIn>
        </div>
      </section>
    </>
  );
}
