import type { Metadata } from "next";
import Link from "next/link";
import { FloatingPaths } from "@/components/ui/background-paths";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Read the terms and conditions governing your use of the Western Dental Academy website. These terms are governed by the laws of Alberta, Canada.",
};

const LAST_UPDATED = "May 21, 2026";

// ─── Shared styles ────────────────────────────────────────────────────────────

const EYEBROW = "text-[0.68rem] font-bold uppercase tracking-[0.18em] mb-3";
const H2 = "text-lg font-bold text-[#1E3560] mb-4";
const P = "text-sm leading-relaxed text-[#2B303A]/70";
const HEADING_FONT = { fontFamily: "var(--font-montserrat), sans-serif" };

// ─── Data ─────────────────────────────────────────────────────────────────────

const prohibitedUses = [
  "Using the site in any way that violates applicable federal, provincial, or local laws or regulations",
  "Reproducing, distributing, or republishing any content from this site without prior written permission from Western Dental Academy",
  "Attempting to gain unauthorized access to any part of the site, its servers, or any system or network connected to it",
  "Transmitting any unsolicited or unauthorized advertising, promotional material, or spam",
  "Interfering with or disrupting the integrity or performance of the website or its associated infrastructure",
  "Using automated tools (scrapers, bots, crawlers) to extract data from the site without express written consent",
  "Impersonating Western Dental Academy, its staff, or any other person or entity",
];

const permittedUses = [
  "Accessing and browsing the site for personal, non-commercial informational purposes",
  "Submitting enquiry, application, or booking forms to initiate contact with WDA",
  "Sharing links to pages on this site, provided the content is not misrepresented",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TermsOfUsePage() {
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
            Terms of Use
          </h1>
          <p
            className="text-base leading-relaxed max-w-2xl"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            These terms govern your access to and use of the Western Dental
            Academy website. Please read them carefully before using the site.
          </p>
        </div>
      </section>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="max-w-2xl space-y-14">

            {/* 01 — Acceptance of Terms */}
            <div>
              <p className={EYEBROW} style={{ color: "#4A9FD4", ...HEADING_FONT }}>01</p>
              <h2 className={H2} style={HEADING_FONT}>Acceptance of Terms</h2>
              <p className={`${P} mb-4`}>
                By accessing or using the Western Dental Academy website at{" "}
                <span className="font-semibold text-[#2B303A]">
                  westerndentalacademy.com
                </span>{" "}
                (the &ldquo;Site&rdquo;), you agree to be bound by these Terms
                of Use and all applicable laws and regulations. If you do not
                agree with any part of these terms, you must discontinue use of
                the Site immediately.
              </p>
              <p className={P}>
                These terms apply to all visitors, users, and anyone else who
                accesses the Site, whether through a browser, mobile device, or
                any other means.
              </p>
            </div>

            {/* 02 — Use of the Website */}
            <div>
              <p className={EYEBROW} style={{ color: "#4A9FD4", ...HEADING_FONT }}>02</p>
              <h2 className={H2} style={HEADING_FONT}>Use of the Website</h2>
              <p className={`${P} mb-6`}>
                The Site is provided for informational purposes relating to
                Western Dental Academy&apos;s programs, services, and
                admissions. Your use of the Site is subject to the following
                conditions.
              </p>

              <div className="space-y-6">
                <div>
                  <p
                    className="text-sm font-bold text-[#1E3560] mb-3"
                    style={HEADING_FONT}
                  >
                    Permitted Uses
                  </p>
                  <ul className="space-y-2">
                    {permittedUses.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-sm leading-relaxed text-[#2B303A]/70"
                      >
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

                <div>
                  <p
                    className="text-sm font-bold text-[#1E3560] mb-3"
                    style={HEADING_FONT}
                  >
                    Prohibited Uses
                  </p>
                  <ul className="space-y-2">
                    {prohibitedUses.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-sm leading-relaxed text-[#2B303A]/70"
                      >
                        <span
                          className="mt-2 w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: "rgba(230,126,34,0.6)" }}
                          aria-hidden
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 03 — Intellectual Property */}
            <div>
              <p className={EYEBROW} style={{ color: "#4A9FD4", ...HEADING_FONT }}>03</p>
              <h2 className={H2} style={HEADING_FONT}>Intellectual Property</h2>
              <p className={`${P} mb-4`}>
                All content on this Site — including but not limited to text,
                graphics, logos, icons, images, audio clips, and software — is
                the property of Western Dental Academy or its content suppliers
                and is protected by Canadian and international copyright,
                trademark, and other intellectual property laws.
              </p>
              <p className={`${P} mb-4`}>
                The Western Dental Academy name, logo, and all related marks,
                product and service names, designs, and slogans are trademarks
                of Western Dental Academy. You may not use such marks without
                our prior written permission.
              </p>
              <p className={P}>
                Nothing on this Site should be construed as granting, by
                implication or otherwise, any licence or right to use any
                intellectual property without the prior written permission of
                Western Dental Academy or the relevant third-party owner.
              </p>
            </div>

            {/* 04 — Program Information */}
            <div>
              <p className={EYEBROW} style={{ color: "#4A9FD4", ...HEADING_FONT }}>04</p>
              <h2 className={H2} style={HEADING_FONT}>Program Information</h2>
              <div
                className="rounded-xl p-6"
                style={{
                  backgroundColor: "#F4F7F9",
                  border: "1px solid rgba(30,53,96,0.07)",
                }}
              >
                <p className={`${P} mb-4`}>
                  Program descriptions, tuition fees, schedules, start dates,
                  prerequisites, and all other program details published on this
                  Site are provided for general informational purposes only and
                  are{" "}
                  <span className="font-semibold text-[#1E3560]">
                    subject to change without notice
                  </span>
                  .
                </p>
                <p className={`${P} mb-4`}>
                  Western Dental Academy makes reasonable efforts to keep
                  program information current; however, we cannot guarantee that
                  all information displayed on the Site accurately reflects
                  current program offerings, fees, or availability at the time
                  of your visit.
                </p>
                <p className={P}>
                  For the most current and accurate program details, please{" "}
                  <Link
                    href="/contact"
                    className="underline underline-offset-2 text-[#4A9FD4] hover:text-[#1E3560] transition-colors duration-200"
                  >
                    contact WDA directly
                  </Link>{" "}
                  before making any enrollment decision or financial commitment.
                </p>
              </div>
            </div>

            {/* 05 — Limitation of Liability */}
            <div>
              <p className={EYEBROW} style={{ color: "#4A9FD4", ...HEADING_FONT }}>05</p>
              <h2 className={H2} style={HEADING_FONT}>Limitation of Liability</h2>
              <p className={`${P} mb-4`}>
                The Site and its content are provided on an &ldquo;as is&rdquo;
                and &ldquo;as available&rdquo; basis without any warranty of any
                kind, express or implied, including but not limited to warranties
                of merchantability, fitness for a particular purpose, or
                non-infringement.
              </p>
              <p className={`${P} mb-4`}>
                Western Dental Academy does not warrant that the Site will be
                uninterrupted, error-free, or free of viruses or other harmful
                components. We reserve the right to modify, suspend, or
                discontinue the Site at any time without notice.
              </p>
              <p className={P}>
                To the fullest extent permitted by applicable law, Western
                Dental Academy shall not be liable for any direct, indirect,
                incidental, special, consequential, or punitive damages arising
                from your use of, or inability to use, the Site or its content
                — even if we have been advised of the possibility of such
                damages.
              </p>
            </div>

            {/* 06 — Third-Party Links */}
            <div>
              <p className={EYEBROW} style={{ color: "#4A9FD4", ...HEADING_FONT }}>06</p>
              <h2 className={H2} style={HEADING_FONT}>Third-Party Links</h2>
              <p className={`${P} mb-4`}>
                This Site may contain links to external websites operated by
                third parties. These links are provided for your convenience
                only. Western Dental Academy has no control over the content,
                privacy practices, or availability of any linked external site.
              </p>
              <p className={P}>
                The inclusion of any external link does not imply endorsement,
                approval, or recommendation by Western Dental Academy. We
                encourage you to review the terms of use and privacy policies of
                any third-party website you visit.
              </p>
            </div>

            {/* 07 — Changes to Terms */}
            <div>
              <p className={EYEBROW} style={{ color: "#4A9FD4", ...HEADING_FONT }}>07</p>
              <h2 className={H2} style={HEADING_FONT}>Changes to These Terms</h2>
              <p className={`${P} mb-4`}>
                Western Dental Academy reserves the right to revise these Terms
                of Use at any time without prior notice. Changes will take
                effect immediately upon being posted to this page. The
                &ldquo;Last Updated&rdquo; date at the bottom of this page
                reflects the most recent revision.
              </p>
              <p className={P}>
                Your continued use of the Site following the posting of any
                changes constitutes your acceptance of those changes. We
                recommend reviewing this page periodically to stay informed of
                any updates.
              </p>
            </div>

            {/* 08 — Governing Law */}
            <div>
              <p className={EYEBROW} style={{ color: "#4A9FD4", ...HEADING_FONT }}>08</p>
              <h2 className={H2} style={HEADING_FONT}>Governing Law</h2>
              <p className={`${P} mb-4`}>
                These Terms of Use and any disputes arising from your use of
                this Site shall be governed by and construed in accordance with
                the laws of the{" "}
                <span className="font-semibold text-[#2B303A]">
                  Province of Alberta
                </span>{" "}
                and the federal laws of{" "}
                <span className="font-semibold text-[#2B303A]">Canada</span>{" "}
                applicable therein, without regard to conflict of law principles.
              </p>
              <p className={P}>
                Any legal proceedings arising from or related to these terms
                shall be brought exclusively in the courts of competent
                jurisdiction located in Alberta, Canada, and you consent to the
                personal jurisdiction of such courts.
              </p>
            </div>

            {/* 09 — Contact */}
            <div>
              <p className={EYEBROW} style={{ color: "#4A9FD4", ...HEADING_FONT }}>09</p>
              <h2 className={H2} style={HEADING_FONT}>Questions About These Terms</h2>
              <p className={`${P} mb-5`}>
                If you have any questions about these Terms of Use or how they
                apply to your use of the Site, please contact us:
              </p>
              <div
                className="rounded-xl p-6 mb-6"
                style={{
                  backgroundColor: "#F4F7F9",
                  border: "1px solid rgba(30,53,96,0.07)",
                }}
              >
                <p className="text-sm leading-relaxed text-[#2B303A]/70 space-y-1">
                  <span
                    className="block font-bold text-[#1E3560]"
                    style={HEADING_FONT}
                  >
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
                <span className="font-semibold text-[#2B303A]/55">
                  {LAST_UPDATED}
                </span>
              </p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
