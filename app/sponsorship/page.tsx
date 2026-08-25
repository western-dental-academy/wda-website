import Link from "next/link";
import AnimateIn from "@/components/AnimateIn";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sponsorship",
  description:
    "Partner with Western Dental Academy to support dental professional development in Alberta and gain meaningful visibility within the dental industry.",
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const supports = [
  {
    title: "Professional Development",
    description:
      "Funding workshops, guest speaker events, and courses that keep dental professionals current and competent.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
      </svg>
    ),
  },
  {
    title: "Community Access",
    description:
      "Making professional development more accessible to dental professionals across Alberta, including rural communities.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0z" />
      </svg>
    ),
  },
  {
    title: "Industry Innovation",
    description:
      "Supporting the development of new and unique PD offerings that address the evolving needs of the dental industry.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
  },
];

const recognition = [
  {
    emoji: "🏆",
    title: "Wall of Sponsors",
    description:
      "Your name or logo displayed permanently in our facility, seen by every student, instructor, and visitor who walks through our doors.",
  },
  {
    emoji: "📱",
    title: "Social Media Recognition",
    description:
      "Featured across WDA's social media platforms including Instagram, Facebook, and LinkedIn, reaching our growing community of dental professionals.",
  },
  {
    emoji: "🌐",
    title: "Website Recognition",
    description:
      "Acknowledged on our website as a valued WDA partner and supporter of dental professional development.",
  },
];

const tiers = [
  {
    title: "Community Supporter",
    description: "Show your support for dental professional development in Alberta.",
  },
  {
    title: "Industry Partner",
    description: "Gain meaningful visibility within Alberta's dental community.",
    featured: true,
  },
  {
    title: "Founding Sponsor",
    description: "Be recognized as a cornerstone supporter of WDA's mission.",
  },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SponsorshipPage() {
  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════ */}
      <section
        className="relative flex items-center overflow-hidden py-28"
        style={{ backgroundColor: "#1E3560" }}
      >
        {/* Radial accent */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-32 w-[560px] h-[560px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(74,159,212,0.12) 0%, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-20 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(74,159,212,0.07) 0%, transparent 70%)" }}
        />

        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <div
            className="inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 mb-8"
            style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.13)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#4A9FD4" }} />
            <span className="text-xs font-semibold tracking-[0.18em] uppercase" style={{ color: "rgba(255,255,255,0.7)" }}>
              Sponsorship &amp; Partnership
            </span>
          </div>

          <h1
            className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight"
            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            Partner With Us
          </h1>
          <p className="text-lg max-w-xl mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.68)" }}>
            Support dental professional development in Alberta and get recognized for it.
          </p>
        </div>

        {/* Diagonal transition */}
        <div className="absolute bottom-0 inset-x-0 pointer-events-none" aria-hidden>
          <svg viewBox="0 0 1440 56" preserveAspectRatio="none" className="w-full block" style={{ height: "56px", fill: "#ffffff" }}>
            <path d="M0,56 L1440,0 L1440,56 Z" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          WHY SPONSOR WDA?
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: "#ffffff" }}>
        <div className="max-w-6xl mx-auto px-6">
          <AnimateIn className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#4A9FD4" }}>
              Why Partner With Us
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold mb-6"
              style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              Why Sponsor WDA?
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "#2B303A" }}>
              Western Dental Academy is committed to strengthening Alberta&apos;s dental community through unique
              professional development opportunities. By partnering with WDA, your business or organization directly
              supports the ongoing education and growth of dental professionals across the province — while gaining
              meaningful visibility within the dental industry.
            </p>
          </AnimateIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          YOUR SPONSORSHIP SUPPORTS
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: "#F4F7F9" }}>
        <div className="max-w-6xl mx-auto px-6">
          <AnimateIn className="text-center mb-14">
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#4A9FD4" }}>
              Impact
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold"
              style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              Your Sponsorship Supports
            </h2>
          </AnimateIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {supports.map((item, i) => (
              <AnimateIn key={item.title} delay={i * 110}>
                <div
                  className="flex flex-col h-full rounded-2xl p-8"
                  style={{ backgroundColor: "#ffffff", border: "1.5px solid rgba(30,53,96,0.08)" }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white mb-5 shrink-0"
                    style={{ backgroundColor: "#1E3560" }}
                  >
                    {item.icon}
                  </div>
                  <h3
                    className="text-base font-bold mb-3"
                    style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#2B303A" }}>
                    {item.description}
                  </p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          HOW WE RECOGNIZE OUR SPONSORS
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: "#ffffff" }}>
        <div className="max-w-6xl mx-auto px-6">
          <AnimateIn className="text-center mb-14">
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#4A9FD4" }}>
              Recognition
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold"
              style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              How We Recognize Our Sponsors
            </h2>
          </AnimateIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {recognition.map((item, i) => (
              <AnimateIn key={item.title} delay={i * 110}>
                <div
                  className="flex flex-col h-full rounded-2xl p-8"
                  style={{ backgroundColor: "#F4F7F9", border: "1.5px solid rgba(30,53,96,0.08)" }}
                >
                  <span className="text-3xl mb-5" aria-hidden>{item.emoji}</span>
                  <h3
                    className="text-base font-bold mb-3"
                    style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#2B303A" }}>
                    {item.description}
                  </p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TAX NOTE
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-12" style={{ backgroundColor: "#F4F7F9" }}>
        <div className="max-w-3xl mx-auto px-6">
          <AnimateIn>
            <div
              className="rounded-2xl px-8 py-6"
              style={{
                backgroundColor: "rgba(74,159,212,0.06)",
                border: "1.5px solid rgba(74,159,212,0.18)",
              }}
            >
              <div className="flex items-start gap-4">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden
                  className="w-5 h-5 shrink-0 mt-0.5"
                  style={{ color: "#4A9FD4" }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <div>
                  <p
                    className="text-sm font-bold mb-2"
                    style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}
                  >
                    A Note on Sponsorship
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "#2B303A" }}>
                    WDA is not a registered non-profit organization, and as such we are unable to issue charitable
                    tax receipts. However, sponsorship contributions to WDA may be considered a business promotion
                    or advertising expense and may be eligible for deduction under your business accounting. We
                    recommend consulting your accountant or financial advisor to confirm eligibility for your
                    specific situation.
                  </p>
                </div>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SPONSORSHIP TIERS
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: "#ffffff" }}>
        <div className="max-w-6xl mx-auto px-6">
          <AnimateIn className="text-center mb-14">
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#4A9FD4" }}>
              Opportunities
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              Sponsorship Opportunities
            </h2>
            <p className="text-sm" style={{ color: "rgba(43,48,58,0.55)" }}>
              Contact us to discuss the right opportunity for your organization.
            </p>
          </AnimateIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {tiers.map((tier, i) => (
              <AnimateIn key={tier.title} delay={i * 110}>
                <div
                  className="flex flex-col h-full rounded-2xl overflow-hidden"
                  style={{
                    border: tier.featured ? "2px solid #4A9FD4" : "1.5px solid rgba(30,53,96,0.09)",
                    boxShadow: tier.featured ? "0 4px 24px rgba(74,159,212,0.12)" : "none",
                  }}
                >
                  {tier.featured && (
                    <div className="px-6 py-2 text-center" style={{ backgroundColor: "#4A9FD4" }}>
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col flex-1 p-8">
                    <h3
                      className="text-lg font-bold mb-3"
                      style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}
                    >
                      {tier.title}
                    </h3>
                    <p className="text-sm leading-relaxed flex-1 mb-8" style={{ color: "#2B303A" }}>
                      {tier.description}
                    </p>
                    <Link
                      href="/contact"
                      className="block text-center rounded-lg px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02]"
                      style={{ backgroundColor: "#E67E22" }}
                    >
                      Contact Us to Learn More
                    </Link>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden" style={{ backgroundColor: "#1E3560" }}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 60% 80% at 50% 120%, rgba(74,159,212,0.14) 0%, transparent 70%)" }}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <AnimateIn>
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-5" style={{ color: "#4A9FD4" }}>
              Get In Touch
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-white mb-5 leading-tight"
              style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              Interested in Partnering With WDA?
            </h2>
            <p className="text-lg leading-relaxed mb-10 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.65)" }}>
              We&apos;d love to connect and find the right sponsorship opportunity for your business or organization.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg px-8 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:scale-[1.03]"
              style={{ backgroundColor: "#E67E22" }}
            >
              Get In Touch
            </Link>
            <p className="mt-10 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              For sponsorship inquiries, contact us at{" "}
              <a
                href="mailto:info@westerndentalacademy.com"
                className="underline transition-colors duration-200 hover:text-white/70"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                info@westerndentalacademy.com
              </a>
            </p>
          </AnimateIn>
        </div>
      </section>
    </>
  );
}
