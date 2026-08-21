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
    question: "How do I register for a workshop or course?",
    answer:
      "Browse our Professional Development page to find available workshops and courses. Click Register on any offering to complete your registration and payment online.",
  },
  {
    _id: "p-reg-2",
    category: "Registration",
    order: 2,
    question: "What is your refund policy?",
    answer:
      "Refunds are available up to 48 hours before the workshop or course start date. Please contact info@westerndentalacademy.com to request a refund.",
  },
  {
    _id: "p-reg-3",
    category: "Registration",
    order: 3,
    question: "How many spots are available per workshop?",
    answer:
      "Workshop capacity varies by offering. The Ergonomics in Dentistry workshop is capped at 20 participants to ensure a quality experience. Register early to secure your spot.",
  },
  {
    _id: "p-reg-4",
    category: "Registration",
    order: 4,
    question: "Can I transfer my registration to another date?",
    answer:
      "Yes — contact us at info@westerndentalacademy.com at least 48 hours in advance and we will do our best to accommodate a date transfer.",
  },
  // Workshops
  {
    _id: "p-wsh-1",
    category: "Workshops",
    order: 1,
    question: "What workshops does WDA currently offer?",
    answer:
      "WDA currently offers the Ergonomics in Dentistry: Move Well, Breathe Well, Practice Longer workshop. Additional workshops are in development. Sign up for our newsletter to be notified of new offerings.",
  },
  {
    _id: "p-wsh-2",
    category: "Workshops",
    order: 2,
    question: "What should I bring to a workshop?",
    answer:
      "Requirements vary by workshop. The Ergonomics in Dentistry workshop requires a water bottle, yoga mat, and comfortable clothing. Check individual workshop listings for specific requirements.",
  },
  {
    _id: "p-wsh-3",
    category: "Workshops",
    order: 3,
    question: "Do workshops count toward my CADA CCP submission?",
    answer:
      "Yes — our workshops are designed to support your annual CADA Continuing Competence Program (CCP) submission. Each participant receives a certificate of attendance along with structured learning objectives to document in their CCP.",
  },
  {
    _id: "p-wsh-4",
    category: "Workshops",
    order: 4,
    question: "Where are workshops held?",
    answer:
      "Workshops are held at our facility in Sherwood Park, Alberta. Free parking is available on site.",
  },
  // Guest Speakers
  {
    _id: "p-gs-1",
    category: "Guest Speakers",
    order: 1,
    question: "What are guest speaker events?",
    answer:
      "WDA hosts guest speaker events featuring dental industry professionals sharing expertise on relevant topics. These events are open to all dental healthcare professionals and are a great way to earn CCP learning hours.",
  },
  {
    _id: "p-gs-2",
    category: "Guest Speakers",
    order: 2,
    question: "How do I find out about upcoming guest speakers?",
    answer:
      "Sign up for our newsletter at the bottom of any page to stay updated on upcoming guest speaker events and announcements.",
  },
  {
    _id: "p-gs-3",
    category: "Guest Speakers",
    order: 3,
    question: "Is there a cost for guest speaker events?",
    answer:
      "Guest speaker event pricing varies. Some events may be complimentary. Check our Professional Development page for current listings and pricing.",
  },
  // Courses
  {
    _id: "p-crs-1",
    category: "Courses",
    order: 1,
    question: "What online courses does WDA offer?",
    answer:
      "WDA is currently developing non-credit online professional development courses for dental healthcare professionals. Sign up for our newsletter to be notified when courses launch.",
  },
  {
    _id: "p-crs-2",
    category: "Courses",
    order: 2,
    question: "Will online courses count toward my CADA CCP?",
    answer:
      "Our courses are being designed to align with CADA CCP learning goals so participants can incorporate them into their annual submission.",
  },
  // National Board Preparation
  {
    _id: "p-nbp-1",
    category: "National Board Preparation",
    order: 1,
    question: "What is the National Practical Evaluation Guided Practice Workshop?",
    answer:
      "This is an 8-hour hands-on workshop designed to prepare dental assisting candidates for the NDAEB Clinical Practice Evaluation (CPE). It covers all nine clinical skills assessed during the CPE through simulated exercises, guided practice, and mock evaluations.",
  },
  {
    _id: "p-nbp-2",
    category: "National Board Preparation",
    order: 2,
    question: "Who should attend the National Board Prep workshop?",
    answer:
      "This workshop is ideal for graduates of non-registered dental assisting programs, internationally educated dental assistants seeking NDAEB certification, and candidates seeking structured preparation before their scheduled CPE.",
  },
  {
    _id: "p-nbp-3",
    category: "National Board Preparation",
    order: 3,
    question: "What is the prerequisite for the National Board Prep workshop?",
    answer:
      "Participants must have completed dental assisting education and be eligible for the NDAEB Clinical Practice Evaluation.",
  },
  // General
  {
    _id: "p-gen-1",
    category: "General",
    order: 1,
    question: "Where is WDA located?",
    answer:
      "Western Dental Academy is located in Sherwood Park, Alberta (Edmonton area). Free parking is available at our facility.",
  },
  {
    _id: "p-gen-2",
    category: "General",
    order: 2,
    question: "How do I contact WDA?",
    answer:
      "You can reach us at info@westerndentalacademy.com or through the contact form on our website. We respond to all inquiries within one business day.",
  },
  {
    _id: "p-gen-3",
    category: "General",
    order: 3,
    question: "Does WDA offer group rates for dental practices?",
    answer:
      "Yes — we welcome dental practice teams. Contact us at info@westerndentalacademy.com to discuss group registration options for your clinic.",
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
            Browse common questions about our professional development opportunities, registration, and fees. Can&apos;t find what you&apos;re looking for?{" "}
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
