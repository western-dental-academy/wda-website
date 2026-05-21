import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, CheckCircle2 } from "lucide-react";
import BookATourForm from "@/components/BookATourForm";
import { FloatingPaths } from "@/components/ui/background-paths";

export const metadata: Metadata = {
  title: "Book a Campus Tour",
  description:
    "Schedule a guided tour of Western Dental Academy's clinical training facility in Edmonton. Meet our admissions team and see our state-of-the-art labs in person.",
};

const contactInfo = [
  {
    icon: MapPin,
    label: "Address",
    value: "Edmonton, Alberta, Canada",
    href: undefined,
  },
  {
    icon: Phone,
    label: "Phone",
    value: "(780) 000-0000",
    href: "tel:+17800000000",
  },
  {
    icon: Mail,
    label: "Email",
    value: "info@westerndentalacademy.com",
    href: "mailto:info@westerndentalacademy.com",
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Mon – Fri, 8:00 am – 5:00 pm",
    href: undefined,
  },
];

const tourExpectations = [
  "A guided walkthrough of our state-of-the-art clinical training labs and simulation suites",
  "One-on-one time with an admissions advisor to discuss programs, costs, and upcoming start dates",
  "A chance to meet current students and see hands-on demonstrations in action",
];

export default function BookATourPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-36 pb-16" style={{ backgroundColor: "#1E3560" }}>
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
        <div className="relative max-w-6xl mx-auto px-6">
          <p
            className="text-[0.68rem] font-bold uppercase tracking-[0.22em] mb-4"
            style={{
              color: "#4A9FD4",
              fontFamily: "var(--font-montserrat), sans-serif",
            }}
          >
            Campus Visit
          </p>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight max-w-2xl"
            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            Book a Campus Tour
          </h1>
          <p
            className="text-base leading-relaxed max-w-xl"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            Experience Western Dental Academy firsthand. Tour our clinical
            facility, meet the team, and get every question answered — in person.
          </p>
        </div>
      </section>

      {/* ── Form + Side panel ────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 lg:gap-16 items-start">

            {/* ── Booking form ── */}
            <div>
              <h2
                className="text-xl font-bold text-[#1E3560] mb-1"
                style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                Request Your Visit
              </h2>
              <p className="text-sm text-[#2B303A]/60 mb-8">
                Fill in the details below and we&apos;ll confirm your tour within
                one business day.
              </p>
              <BookATourForm />
            </div>

            {/* ── Side panel ── */}
            <aside className="space-y-6 lg:sticky lg:top-28">

              {/* Contact info */}
              <div className="rounded-xl p-7" style={{ backgroundColor: "#F4F7F9" }}>
                <p
                  className="text-[0.68rem] font-bold uppercase tracking-[0.18em] mb-5"
                  style={{
                    color: "#4A9FD4",
                    fontFamily: "var(--font-montserrat), sans-serif",
                  }}
                >
                  Find Us
                </p>
                <ul className="space-y-4">
                  {contactInfo.map(({ icon: Icon, label, value, href }) => (
                    <li key={label} className="flex items-start gap-3">
                      <Icon
                        className="w-4 h-4 shrink-0 mt-0.5 text-[#4A9FD4]"
                        strokeWidth={1.75}
                      />
                      {href ? (
                        <a
                          href={href}
                          className="text-sm text-[#2B303A]/70 hover:text-[#1E3560] transition-colors duration-200"
                        >
                          {value}
                        </a>
                      ) : (
                        <span className="text-sm text-[#2B303A]/70">{value}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* What to expect */}
              <div className="rounded-xl p-7" style={{ backgroundColor: "#1E3560" }}>
                <p
                  className="text-[0.68rem] font-bold uppercase tracking-[0.18em] mb-5"
                  style={{
                    color: "#4A9FD4",
                    fontFamily: "var(--font-montserrat), sans-serif",
                  }}
                >
                  What to Expect
                </p>
                <ul className="space-y-4">
                  {tourExpectations.map((text, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2
                        className="w-4 h-4 shrink-0 mt-0.5 text-[#4A9FD4]"
                        strokeWidth={1.75}
                      />
                      <span
                        className="text-sm leading-relaxed"
                        style={{ color: "rgba(255,255,255,0.65)" }}
                      >
                        {text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
