import type { Metadata } from "next";
import Link from "next/link";
import { FloatingPaths } from "@/components/ui/background-paths";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description:
    "Western Dental Academy is committed to ensuring our website is accessible to all users, including those with disabilities. Learn about our accessibility standards and how to report issues.",
};

const LAST_UPDATED = "May 21, 2026";

const accessibilityFeatures = [
  {
    heading: "Keyboard Navigation",
    body: "All interactive elements — navigation menus, forms, buttons, and links — are reachable and operable using a keyboard alone, without requiring a mouse or pointer device.",
  },
  {
    heading: "Alternative Text on Images",
    body: "Meaningful images across the site include descriptive alt text so users relying on screen readers receive equivalent information. Decorative images are marked to be ignored by assistive technology.",
  },
  {
    heading: "Colour Contrast Compliance",
    body: "Text and interactive elements are designed to meet the WCAG 2.1 AA minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text, supporting users with low vision or colour-blindness.",
  },
  {
    heading: "Semantic HTML Structure",
    body: "Pages are built with semantic HTML5 elements — headings, landmarks, lists, and form labels — so that assistive technologies can accurately interpret and navigate the page structure.",
  },
  {
    heading: "Screen Reader Compatibility",
    body: "The site is developed to work with common screen readers including NVDA, JAWS, VoiceOver (macOS and iOS), and TalkBack (Android). ARIA labels and roles are used where native HTML semantics are insufficient.",
  },
  {
    heading: "Resizable Text",
    body: "Text can be resized up to 200% using browser zoom without loss of content or functionality. Layouts are responsive and adapt gracefully at increased text sizes.",
  },
  {
    heading: "Focus Indicators",
    body: "Visible focus indicators are present on all interactive elements, ensuring keyboard-only users can clearly see which element is currently active.",
  },
];

// ─── Shared prose styles ──────────────────────────────────────────────────────

const SECTION_EYEBROW = "text-[0.68rem] font-bold uppercase tracking-[0.18em] mb-3";
const SECTION_HEADING = "text-lg font-bold text-[#1E3560] mb-4";
const BODY_TEXT = "text-sm leading-relaxed text-[#2B303A]/70";

export default function AccessibilityPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-36 pb-14" style={{ backgroundColor: "#1E3560" }}>
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
        <div className="relative max-w-4xl mx-auto px-6">
          <p
            className={`${SECTION_EYEBROW}`}
            style={{ color: "#4A9FD4", fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            Legal &amp; Compliance
          </p>
          <h1
            className="text-3xl sm:text-4xl font-bold text-white mb-5 leading-tight"
            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            Accessibility Statement
          </h1>
          <p
            className="text-base leading-relaxed max-w-2xl"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            Western Dental Academy is committed to ensuring that our website is
            accessible and usable by everyone, including people with disabilities.
            We continuously work to improve the digital experience for all visitors.
          </p>
        </div>
      </section>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="max-w-2xl space-y-14">

            {/* Our Commitment */}
            <div>
              <p
                className={SECTION_EYEBROW}
                style={{ color: "#4A9FD4", fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                01
              </p>
              <h2
                className={SECTION_HEADING}
                style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                Our Commitment
              </h2>
              <p className={`${BODY_TEXT} mb-4`}>
                Western Dental Academy believes that access to information about dental
                education and professional training should not be limited by disability
                or assistive technology. We are committed to providing a website
                experience that is perceivable, operable, understandable, and robust
                for all users — the four principles that underpin the Web Content
                Accessibility Guidelines.
              </p>
              <p className={BODY_TEXT}>
                Accessibility is not a one-time project but an ongoing practice. As
                we build and update this site, accessibility considerations are part
                of our development and design process from the outset.
              </p>
            </div>

            {/* Standards */}
            <div>
              <p
                className={SECTION_EYEBROW}
                style={{ color: "#4A9FD4", fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                02
              </p>
              <h2
                className={SECTION_HEADING}
                style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                Standards We Follow
              </h2>
              <p className={`${BODY_TEXT} mb-4`}>
                This website aims to conform to{" "}
                <strong className="font-semibold text-[#1E3560]">
                  WCAG 2.1 Level AA
                </strong>{" "}
                — the internationally recognised standard for web accessibility
                published by the World Wide Web Consortium (W3C). Level AA
                compliance addresses the most significant barriers for users with
                visual, auditory, motor, cognitive, and neurological disabilities.
              </p>
              <p className={BODY_TEXT}>
                Where technically feasible, we also strive to meet Level AAA criteria
                for critical user flows including program enquiries, application
                submissions, and contact forms.
              </p>
            </div>

            {/* Accessibility Features */}
            <div>
              <p
                className={SECTION_EYEBROW}
                style={{ color: "#4A9FD4", fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                03
              </p>
              <h2
                className={SECTION_HEADING}
                style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                Accessibility Features
              </h2>
              <p className={`${BODY_TEXT} mb-7`}>
                The following accessibility features are implemented across the
                Western Dental Academy website:
              </p>
              <ul className="space-y-5">
                {accessibilityFeatures.map(({ heading, body }) => (
                  <li
                    key={heading}
                    className="flex gap-4"
                  >
                    <span
                      className="mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 translate-y-2"
                      style={{ backgroundColor: "#4A9FD4" }}
                      aria-hidden
                    />
                    <div>
                      <p
                        className="text-sm font-bold text-[#1E3560] mb-1"
                        style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
                      >
                        {heading}
                      </p>
                      <p className={BODY_TEXT}>{body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Known Issues */}
            <div>
              <p
                className={SECTION_EYEBROW}
                style={{ color: "#4A9FD4", fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                04
              </p>
              <h2
                className={SECTION_HEADING}
                style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                Known Limitations
              </h2>
              <div
                className="rounded-xl p-6"
                style={{
                  backgroundColor: "#F4F7F9",
                  border: "1px solid rgba(30,53,96,0.07)",
                }}
              >
                <p className={`${BODY_TEXT} mb-3`}>
                  While we strive for full WCAG 2.1 AA conformance, some areas of
                  the site are still being improved:
                </p>
                <ul className="space-y-2 text-sm leading-relaxed text-[#2B303A]/70">
                  {[
                    "Some embedded third-party content (such as map widgets and video embeds) may not fully conform to accessibility standards. We are evaluating alternatives where possible.",
                    "PDF documents and downloadable resources are being reviewed and updated to meet accessible document standards.",
                    "Older blog content published prior to our accessibility audit may contain images without alt text. These are being updated on a rolling basis.",
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <span
                        className="mt-2 w-1 h-1 rounded-full shrink-0"
                        style={{ backgroundColor: "#2B303A", opacity: 0.35 }}
                        aria-hidden
                      />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className={`${BODY_TEXT} mt-4`}>
                  We are actively working to resolve these limitations and aim to
                  address identified issues within 30 days of discovery.
                </p>
              </div>
            </div>

            {/* Feedback */}
            <div>
              <p
                className={SECTION_EYEBROW}
                style={{ color: "#4A9FD4", fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                05
              </p>
              <h2
                className={SECTION_HEADING}
                style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                Report an Accessibility Issue
              </h2>
              <p className={`${BODY_TEXT} mb-4`}>
                We welcome feedback on the accessibility of this website. If you
                encounter a barrier, experience difficulty accessing any content, or
                have suggestions for improvement, please contact us — we take all
                reports seriously.
              </p>
              <p className={`${BODY_TEXT} mb-6`}>
                When reporting an issue, please include the URL of the page where you
                encountered the problem, a description of the barrier, and the
                assistive technology or browser you were using. This helps us
                reproduce and resolve the issue as quickly as possible.
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
