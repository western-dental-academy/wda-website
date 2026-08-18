import type { Metadata } from "next";
import Link from "next/link";
import { sanityFetch, SanityLive } from "@/sanity/lib/live";
import { FAQ_ITEMS_QUERY } from "@/sanity/lib/queries";
import type { FaqItem } from "@/types/faqItem";
import FaqAccordion from "@/components/FaqAccordion";
import AnimateIn from "@/components/AnimateIn";
import { FloatingPaths } from "@/components/ui/background-paths";

// ─── Placeholder data (shown until Sanity content is published) ───────────────

const PLACEHOLDER_FAQ_ITEMS: FaqItem[] = [
  // Registration
  {
    _id: "p-reg-1",
    category: "Registration",
    order: 1,
    question: "What do I need to register for a WDA workshop?",
    answer:
      "No prior dental experience is required. Our workshops are open to dental professionals at all stages, as well as individuals exploring a career in the dental field. Registration is completed online in a few simple steps.",
  },
  {
    _id: "p-reg-2",
    category: "Registration",
    order: 2,
    question: "How do I register for a workshop?",
    answer:
      "Visit our Workshops page to browse available sessions and click Register to complete your registration online. You can also contact our team directly and we'll walk you through the process.",
  },
  {
    _id: "p-reg-3",
    category: "Registration",
    order: 3,
    question: "Is there an age requirement to attend a workshop?",
    answer: "Participants must be at least 18 years of age at the time of the workshop.",
  },
  // Workshops
  {
    _id: "p-wsh-1",
    category: "Workshops",
    order: 1,
    question: "How long do WDA workshops run?",
    answer:
      "Workshop duration varies by course — from single-day intensives to multi-day sessions. Each workshop listing includes a duration overview. Contact us for current scheduling and upcoming dates.",
  },
  {
    _id: "p-wsh-2",
    category: "Workshops",
    order: 2,
    question: "Are workshops hands-on or online?",
    answer:
      "Western Dental Academy prioritises hands-on, practical training. Participants work in our modern on-site facility using professional-grade dental equipment alongside experienced practitioners. Some workshops may include distance delivery components — check individual workshop descriptions for details.",
  },
  {
    _id: "p-wsh-3",
    category: "Workshops",
    order: 3,
    question: "Do you offer workshops for working dental professionals?",
    answer:
      "Yes — our professional development workshops are designed for dental teams at all experience levels, from those new to the field to seasoned practitioners looking to sharpen specific skills or meet continuing competency requirements.",
  },
  // Cost
  {
    _id: "p-cst-1",
    category: "Cost",
    order: 1,
    question: "How much do WDA workshops cost?",
    answer:
      "Workshop fees vary by course. Contact our team for current pricing and registration details. Payment is processed securely online at the time of registration.",
  },
  {
    _id: "p-cst-2",
    category: "Cost",
    order: 2,
    question: "Are payment plans available?",
    answer:
      "Yes, we offer flexible payment options to help make professional development accessible. Reach out to our team to discuss what works best for your situation.",
  },
  {
    _id: "p-cst-3",
    category: "Cost",
    order: 3,
    question: "Can workshop hours be applied toward CADA CCP requirements?",
    answer:
      "WDA workshops provide a Certificate of Attendance that participants may submit as part of their Continuing Competency Programme (CCP) hours documentation with CADA. We encourage participants to verify current CADA requirements directly, as eligibility is determined by CADA.",
  },
  // Career
  {
    _id: "p-car-1",
    category: "Career",
    order: 1,
    question: "How can WDA workshops support my dental career?",
    answer:
      "Our workshops provide practical, skills-based training to help dental professionals expand their capabilities, stay current with modern techniques, and demonstrate continued professional development. They are designed to complement existing credentials, not replace formal registration or licensing pathways.",
  },
  {
    _id: "p-car-2",
    category: "Career",
    order: 2,
    question: "Will I gain practical skills through WDA workshops?",
    answer:
      "Yes — WDA training is built around real-world application. You'll practise in our on-site clinic environment with modern equipment, guided by experienced dental professionals, so that new skills translate directly to your work.",
  },
  {
    _id: "p-car-3",
    category: "Career",
    order: 3,
    question: "Do WDA workshops lead to provincial registration or licensing?",
    answer:
      "WDA workshops issue a Certificate of Attendance, not a provincial credential. Becoming a registered dental assistant in Alberta requires meeting CADA's registration requirements independently. WDA workshops can support your professional development and contribute to CCP documentation, but do not grant registration or licensing on their own.",
  },
  // General
  {
    _id: "p-gen-1",
    category: "General",
    order: 1,
    question: "Where is Western Dental Academy located?",
    answer:
      "We are located at 150 Chippewa Road, Suite 258, Sherwood Park, AB (within the Edmonton metropolitan area). Book a campus tour through our contact page.",
  },
  {
    _id: "p-gen-2",
    category: "General",
    order: 2,
    question: "How do I get in touch with the WDA team?",
    answer:
      "You can reach us through the contact form on our website, by phone, or by email. We typically respond within one business day.",
  },
  {
    _id: "p-gen-3",
    category: "General",
    order: 3,
    question: "Do you offer in-person campus tours?",
    answer:
      "Yes — we welcome visitors to our facility. Come see our clinic and training spaces firsthand. Book a campus tour through our contact page.",
  },
];

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to the most common questions about Western Dental Academy — workshop registration, fees, professional development, and CADA CCP support.",
};

export default async function FaqPage() {
  const { data: sanityItems } = (await sanityFetch({
    query: FAQ_ITEMS_QUERY,
  })) as { data: FaqItem[] };

  // Fall back to placeholder content until Sanity items are published
  const items = sanityItems?.length ? sanityItems : PLACEHOLDER_FAQ_ITEMS;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: (items ?? []).map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <SanityLive />

      {/* JSON-LD structured data for Google rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Page header ──────────────────────────────── */}
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
              <li style={{ color: "rgba(255,255,255,0.7)" }}>FAQ</li>
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
              Frequently Asked Questions
            </span>
          </div>

          <h1
            className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5 max-w-2xl"
            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            Your Questions,{" "}
            <span style={{ color: "#4A9FD4" }}>Answered.</span>
          </h1>

          <p
            className="text-lg leading-relaxed max-w-xl"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            Browse common questions about our workshops, registration, fees,
            and professional development opportunities. Can&apos;t find what you&apos;re looking for?{" "}
            <Link
              href="/contact"
              className="font-semibold underline underline-offset-2 transition-colors hover:text-white"
              style={{ color: "#4A9FD4" }}
            >
              Contact us
            </Link>
            .
          </p>
        </div>

        <div
          className="absolute bottom-0 inset-x-0 h-px"
          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          aria-hidden
        />
      </section>

      {/* ── Accordion ────────────────────────────────── */}
      <section className="relative overflow-hidden py-20" style={{ backgroundColor: "#F4F7F9" }}>
        {/* Streaming lines background */}
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
        <div className="relative max-w-3xl mx-auto px-6">
          <AnimateIn>
            <FaqAccordion items={items ?? []} />
          </AnimateIn>
        </div>
      </section>

      {/* ── CTA strip ────────────────────────────────── */}
      <section className="relative overflow-hidden py-16" style={{ backgroundColor: "#1E3560" }}>
        {/* Streaming lines background */}
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
        <div className="relative max-w-6xl mx-auto px-6">
          <AnimateIn>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h2
                  className="text-xl font-bold text-white mb-1"
                  style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
                >
                  Still have questions?
                </h2>
                <p className="text-sm text-white/60">
                  Our admissions team is happy to walk you through anything.
                </p>
              </div>
              <Link
                href="/contact"
                className="shrink-0 inline-block rounded-lg bg-[#E67E22] px-7 py-3.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#CF6D17]"
              >
                Get in Touch
              </Link>
            </div>
          </AnimateIn>
        </div>
      </section>
    </>
  );
}
