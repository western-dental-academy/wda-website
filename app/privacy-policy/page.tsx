import type { Metadata } from "next";
import Link from "next/link";
import { FloatingPaths } from "@/components/ui/background-paths";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Western Dental Academy collects, uses, and protects your personal information in accordance with Canada's Personal Information Protection and Electronic Documents Act (PIPEDA).",
};

const LAST_UPDATED = "May 21, 2026";

// ─── Shared styles ────────────────────────────────────────────────────────────

const EYEBROW = "text-[0.68rem] font-bold uppercase tracking-[0.18em] mb-3";
const H2 = "text-lg font-bold text-[#1E3560] mb-4";
const P = "text-sm leading-relaxed text-[#2B303A]/70";
const HEADING_FONT = { fontFamily: "var(--font-montserrat), sans-serif" };

// ─── Data ─────────────────────────────────────────────────────────────────────

const infoCollected = [
  {
    heading: "Information You Provide Directly",
    items: [
      "Contact and enquiry forms: name, email address, phone number, and the content of your message",
      "Program application forms: name, email, phone number, date of birth, educational background, and program preferences",
      "Newsletter sign-up: email address",
      "Campus tour booking: name, email, phone number, preferred date and time, and number of attendees",
    ],
  },
  {
    heading: "Information Collected Automatically",
    items: [
      "Technical data: IP address, browser type and version, operating system, referring URL, and pages visited",
      "Usage data: time spent on pages, links clicked, and general interaction patterns",
      "Cookie data: see the Cookies section below for details",
    ],
  },
];

const dataUses = [
  {
    purpose: "Responding to Inquiries",
    detail:
      "We use your contact information to reply to questions submitted through our contact form or booking forms, and to follow up on enquiries about our programs.",
  },
  {
    purpose: "Processing Applications",
    detail:
      "Application data is used to evaluate program applications, communicate admission decisions, and manage enrollment for accepted students.",
  },
  {
    purpose: "Sending Newsletters",
    detail:
      "If you subscribe to our newsletter, we use your email address to send program updates, upcoming start dates, and industry news. You may unsubscribe at any time using the link included in every email.",
  },
  {
    purpose: "Booking Campus Tours",
    detail:
      "Tour booking information is used solely to confirm and coordinate your facility visit and to follow up with relevant program information.",
  },
  {
    purpose: "Improving the Website",
    detail:
      "Where you have consented to analytics cookies, we use aggregated, anonymized data from Google Analytics to understand how visitors use the site and to improve content, navigation, and user experience.",
  },
];

const cookieTypes = [
  {
    name: "Consent Cookie",
    purpose: "Stores your cookie preference (accepted or declined) so the banner does not reappear on subsequent visits.",
    duration: "Persistent (stored in your browser's localStorage until cleared)",
    provider: "Western Dental Academy",
  },
  {
    name: "Google Analytics (_ga, _ga_*)",
    purpose: "Collects anonymized usage data — pages viewed, session duration, and general traffic patterns. No personally identifiable information is sent to Google.",
    duration: "Up to 26 months",
    provider: "Google LLC",
  },
];

const pipedaRights = [
  {
    right: "Right to Access",
    detail:
      "You have the right to request access to the personal information we hold about you and to receive a copy of it in a reasonable timeframe.",
  },
  {
    right: "Right to Correction",
    detail:
      "If the personal information we hold about you is inaccurate or incomplete, you have the right to request that it be corrected.",
  },
  {
    right: "Right to Withdraw Consent",
    detail:
      "Where our use of your personal information is based on consent, you may withdraw that consent at any time. Withdrawal does not affect the lawfulness of processing that occurred before withdrawal.",
  },
  {
    right: "Right to Complain",
    detail:
      "If you believe your privacy rights have been violated, you have the right to file a complaint with the Office of the Privacy Commissioner of Canada (OPC) at priv.gc.ca.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PrivacyPolicyPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-36 pb-14" style={{ backgroundColor: "#1E3560" }}>
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
        <div className="relative max-w-4xl mx-auto px-6">
          <p
            className={EYEBROW}
            style={{ color: "#4A9FD4", ...HEADING_FONT }}
          >
            Legal &amp; Compliance
          </p>
          <h1
            className="text-3xl sm:text-4xl font-bold text-white mb-5 leading-tight"
            style={HEADING_FONT}
          >
            Privacy Policy
          </h1>
          <p
            className="text-base leading-relaxed max-w-2xl"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            Western Dental Academy is committed to protecting the personal
            information of everyone who interacts with our website. This policy
            explains what we collect, why we collect it, and how we keep it safe
            — in plain language.
          </p>
        </div>
      </section>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="max-w-2xl space-y-14">

            {/* 01 — Introduction */}
            <div>
              <p className={EYEBROW} style={{ color: "#4A9FD4", ...HEADING_FONT }}>01</p>
              <h2 className={H2} style={HEADING_FONT}>Introduction</h2>
              <p className={`${P} mb-4`}>
                Western Dental Academy (&ldquo;WDA&rdquo;, &ldquo;we&rdquo;,
                &ldquo;our&rdquo;) operates the website at{" "}
                <span className="font-semibold text-[#2B303A]">
                  westerndentalacademy.com
                </span>
                . This Privacy Policy describes how we collect, use, disclose,
                and protect personal information in connection with your use of
                our website and the services we offer.
              </p>
              <p className={`${P} mb-4`}>
                WDA operates in accordance with Canada&apos;s{" "}
                <span className="font-semibold text-[#2B303A]">
                  Personal Information Protection and Electronic Documents Act
                  (PIPEDA)
                </span>{" "}
                and, where applicable, the{" "}
                <span className="font-semibold text-[#2B303A]">
                  Alberta Personal Information Protection Act (PIPA)
                </span>
                . These laws govern how private-sector organizations collect,
                use, and disclose personal information in the course of
                commercial activity.
              </p>
              <p className={P}>
                By using our website, you agree to the collection and use of
                information in accordance with this policy. We encourage you to
                read it carefully. If you have any questions, you can{" "}
                <Link
                  href="/contact"
                  className="underline underline-offset-2 text-[#4A9FD4] hover:text-[#1E3560] transition-colors duration-200"
                >
                  contact us
                </Link>{" "}
                at any time.
              </p>
            </div>

            {/* 02 — Information We Collect */}
            <div>
              <p className={EYEBROW} style={{ color: "#4A9FD4", ...HEADING_FONT }}>02</p>
              <h2 className={H2} style={HEADING_FONT}>Information We Collect</h2>
              <p className={`${P} mb-7`}>
                We only collect personal information that is necessary for a
                specific, identified purpose. The categories below describe what
                we collect and how.
              </p>
              <div className="space-y-7">
                {infoCollected.map(({ heading, items }) => (
                  <div key={heading}>
                    <p
                      className="text-sm font-bold text-[#1E3560] mb-3"
                      style={HEADING_FONT}
                    >
                      {heading}
                    </p>
                    <ul className="space-y-2">
                      {items.map((item, i) => (
                        <li key={i} className="flex gap-3 text-sm leading-relaxed text-[#2B303A]/70">
                          <span
                            className="mt-2 w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: "#4A9FD4" }}
                            aria-hidden
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* 03 — How We Use Your Information */}
            <div>
              <p className={EYEBROW} style={{ color: "#4A9FD4", ...HEADING_FONT }}>03</p>
              <h2 className={H2} style={HEADING_FONT}>How We Use Your Information</h2>
              <p className={`${P} mb-7`}>
                We use personal information only for the purposes for which it
                was collected, or for purposes consistent with those purposes
                with your knowledge and consent.
              </p>
              <div className="space-y-5">
                {dataUses.map(({ purpose, detail }) => (
                  <div
                    key={purpose}
                    className="rounded-xl p-5"
                    style={{
                      backgroundColor: "#F4F7F9",
                      border: "1px solid rgba(30,53,96,0.07)",
                    }}
                  >
                    <p className="text-sm font-bold text-[#1E3560] mb-1.5" style={HEADING_FONT}>
                      {purpose}
                    </p>
                    <p className="text-sm leading-relaxed text-[#2B303A]/65">{detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 04 — Cookies */}
            <div>
              <p className={EYEBROW} style={{ color: "#4A9FD4", ...HEADING_FONT }}>04</p>
              <h2 className={H2} style={HEADING_FONT}>Cookies</h2>
              <p className={`${P} mb-4`}>
                Cookies are small text files placed on your device when you
                visit a website. We use a limited set of cookies, described
                below. No analytics cookies are loaded until you explicitly
                consent via the cookie banner shown on your first visit.
              </p>
              <div
                className="rounded-xl overflow-hidden mb-5"
                style={{ border: "1px solid rgba(30,53,96,0.08)" }}
              >
                {/* Table header */}
                <div
                  className="grid grid-cols-[1fr_1.6fr_auto] gap-4 px-5 py-3 text-[0.68rem] font-bold uppercase tracking-[0.14em]"
                  style={{ backgroundColor: "#1E3560", color: "rgba(255,255,255,0.55)" }}
                >
                  <span>Cookie</span>
                  <span>Purpose</span>
                  <span>Duration</span>
                </div>
                {cookieTypes.map(({ name, purpose, duration, provider }, i) => (
                  <div
                    key={name}
                    className="grid grid-cols-[1fr_1.6fr_auto] gap-4 px-5 py-4 text-xs leading-relaxed text-[#2B303A]/70 items-start"
                    style={{
                      backgroundColor: i % 2 === 0 ? "#F4F7F9" : "#FFFFFF",
                      borderBottom: i < cookieTypes.length - 1 ? "1px solid rgba(30,53,96,0.06)" : undefined,
                    }}
                  >
                    <div>
                      <p className="font-bold text-[#1E3560]">{name}</p>
                      <p className="mt-0.5 opacity-60">{provider}</p>
                    </div>
                    <p>{purpose}</p>
                    <p className="whitespace-nowrap">{duration.split(" (")[0]}</p>
                  </div>
                ))}
              </div>
              <p className={P}>
                You can withdraw your consent at any time by clearing your
                browser&apos;s localStorage data (the key is{" "}
                <code className="text-xs font-mono bg-[#F4F7F9] px-1.5 py-0.5 rounded text-[#1E3560]">
                  wda_cookie_consent
                </code>
                ). You may also configure your browser to block or delete
                cookies entirely — please refer to your browser&apos;s help
                documentation for instructions.
              </p>
            </div>

            {/* 05 — Data Sharing */}
            <div>
              <p className={EYEBROW} style={{ color: "#4A9FD4", ...HEADING_FONT }}>05</p>
              <h2 className={H2} style={HEADING_FONT}>Data Sharing</h2>
              <p className={`${P} mb-4`}>
                <strong className="font-semibold text-[#1E3560]">
                  We do not sell, rent, or trade your personal information
                </strong>{" "}
                to any third party under any circumstances.
              </p>
              <p className={`${P} mb-4`}>
                We may share information with trusted service providers who
                assist us in operating the website and delivering our services.
                These providers act as data processors on our behalf and are
                contractually required to protect your information and use it
                only for the specific purposes we define:
              </p>
              <ul className="space-y-2 mb-4">
                {[
                  "Google LLC — Google Analytics for anonymized website usage statistics (only if you have consented to analytics cookies)",
                  "Email service providers — for delivering newsletter and transactional emails to subscribers",
                  "Sanity.io — content management infrastructure for storing and delivering website content",
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-[#2B303A]/70">
                    <span
                      className="mt-2 w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: "#4A9FD4" }}
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <p className={P}>
                We may also disclose personal information if required to do so
                by law or in response to a valid legal request from a government
                authority.
              </p>
            </div>

            {/* 06 — Data Retention */}
            <div>
              <p className={EYEBROW} style={{ color: "#4A9FD4", ...HEADING_FONT }}>06</p>
              <h2 className={H2} style={HEADING_FONT}>Data Retention</h2>
              <p className={`${P} mb-5`}>
                We retain personal information only for as long as necessary to
                fulfil the purpose for which it was collected, or as required by
                applicable law.
              </p>
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid rgba(30,53,96,0.08)" }}
              >
                {[
                  { category: "Contact & enquiry records", retention: "2 years from last contact" },
                  { category: "Program application data", retention: "5 years from last interaction" },
                  { category: "Newsletter subscriber data", retention: "Until you unsubscribe" },
                  { category: "Analytics data (Google Analytics)", retention: "26 months (Google default)" },
                  { category: "Tour booking records", retention: "1 year from tour date" },
                ].map(({ category, retention }, i) => (
                  <div
                    key={category}
                    className="flex items-center justify-between gap-6 px-5 py-3.5 text-sm"
                    style={{
                      backgroundColor: i % 2 === 0 ? "#F4F7F9" : "#FFFFFF",
                      borderBottom: i < 4 ? "1px solid rgba(30,53,96,0.06)" : undefined,
                    }}
                  >
                    <span className="text-[#2B303A]/70">{category}</span>
                    <span className="font-semibold text-[#1E3560] shrink-0">{retention}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 07 — Your Rights (PIPEDA) */}
            <div>
              <p className={EYEBROW} style={{ color: "#4A9FD4", ...HEADING_FONT }}>07</p>
              <h2 className={H2} style={HEADING_FONT}>Your Rights Under PIPEDA</h2>
              <p className={`${P} mb-7`}>
                As a resident of Canada, you have the following rights in
                relation to your personal information under the Personal
                Information Protection and Electronic Documents Act:
              </p>
              <div className="space-y-5">
                {pipedaRights.map(({ right, detail }) => (
                  <div key={right} className="flex gap-4">
                    <span
                      className="mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 translate-y-2"
                      style={{ backgroundColor: "#4A9FD4" }}
                      aria-hidden
                    />
                    <div>
                      <p
                        className="text-sm font-bold text-[#1E3560] mb-1"
                        style={HEADING_FONT}
                      >
                        {right}
                      </p>
                      <p className="text-sm leading-relaxed text-[#2B303A]/70">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="mt-7 rounded-xl p-5"
                style={{
                  backgroundColor: "#F4F7F9",
                  border: "1px solid rgba(30,53,96,0.07)",
                }}
              >
                <p className="text-sm leading-relaxed text-[#2B303A]/70">
                  To exercise any of these rights, please submit a written
                  request to us using the contact details in Section 08 below.
                  We will respond within{" "}
                  <span className="font-semibold text-[#2B303A]">30 days</span>{" "}
                  of receiving your request, or notify you if additional time is
                  required.
                </p>
              </div>
            </div>

            {/* 08 — Contact */}
            <div>
              <p className={EYEBROW} style={{ color: "#4A9FD4", ...HEADING_FONT }}>08</p>
              <h2 className={H2} style={HEADING_FONT}>Privacy Concerns &amp; Contact</h2>
              <p className={`${P} mb-4`}>
                If you have any questions about this Privacy Policy, wish to
                exercise your rights, or have concerns about how your personal
                information has been handled, please contact us:
              </p>
              <div
                className="rounded-xl p-6 mb-6"
                style={{
                  backgroundColor: "#F4F7F9",
                  border: "1px solid rgba(30,53,96,0.07)",
                }}
              >
                <p className="text-sm leading-relaxed text-[#2B303A]/70 space-y-1">
                  <span className="block font-bold text-[#1E3560]" style={HEADING_FONT}>
                    Western Dental Academy
                  </span>
                  <span className="block">150 Chippewa Road, Suite 258</span>
                  <span className="block">Sherwood Park, AB, Canada</span>
                  <span className="block">
                    <a
                      href="mailto:info@westerndentalacademy.com"
                      className="text-[#4A9FD4] hover:text-[#1E3560] transition-colors duration-200"
                    >
                      info@westerndentalacademy.com
                    </a>
                  </span>
                </p>
              </div>
              <p className={`${P} mb-6`}>
                If you are not satisfied with our response, you have the right
                to contact the{" "}
                <span className="font-semibold text-[#2B303A]">
                  Office of the Privacy Commissioner of Canada (OPC)
                </span>{" "}
                at{" "}
                <span className="font-semibold text-[#2B303A]">priv.gc.ca</span>{" "}
                or by calling 1-800-282-1376.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold text-white transition-colors duration-200 bg-[#4A9FD4] hover:bg-[#1E3560]"
              >
                Contact Us
              </Link>
            </div>

            {/* Last Updated */}
            <div
              className="pt-8"
              style={{ borderTop: "1px solid rgba(30,53,96,0.08)" }}
            >
              <p className="text-xs text-[#2B303A]/40">
                Last updated:{" "}
                <span className="font-semibold text-[#2B303A]/55">{LAST_UPDATED}</span>
              </p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
