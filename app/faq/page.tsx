import type { Metadata } from "next";
import Link from "next/link";
import { sanityFetch, SanityLive } from "@/sanity/lib/live";
import { FAQ_ITEMS_QUERY } from "@/sanity/lib/queries";
import type { FaqItem } from "@/types/faqItem";
import FaqAccordion from "@/components/FaqAccordion";
import { ElegantShape } from "@/components/ui/elegant-shapes";
import { FloatingPaths } from "@/components/ui/background-paths";

// ─── Placeholder data (shown until Sanity content is published) ───────────────

const PLACEHOLDER_FAQ_ITEMS: FaqItem[] = [
  // Admissions
  {
    _id: "p-adm-1",
    category: "Admissions",
    order: 1,
    question: "What are the requirements to enroll in the Dental Assisting program?",
    answer:
      "Applicants must have a high school diploma or equivalent (Alberta Grade 12 or GED). No prior dental experience is required — we welcome students from all backgrounds who have a passion for healthcare.",
  },
  {
    _id: "p-adm-2",
    category: "Admissions",
    order: 2,
    question: "How do I apply to Western Dental Academy?",
    answer:
      "You can apply by filling out our online application form or by contacting us directly at our Edmonton campus. Our admissions team will guide you through the process and answer any questions.",
  },
  {
    _id: "p-adm-3",
    category: "Admissions",
    order: 3,
    question: "Is there an age requirement to enroll?",
    answer: "Students must be at least 18 years of age at the time of enrollment.",
  },
  // Programs
  {
    _id: "p-prg-1",
    category: "Programs",
    order: 1,
    question: "How long is the Dental Assisting program?",
    answer:
      "Our Dental Assisting program is designed to be completed in a condensed, focused timeframe so you can enter the workforce quickly. Contact us for current program duration and upcoming start dates.",
  },
  {
    _id: "p-prg-2",
    category: "Programs",
    order: 2,
    question: "Is the training hands-on or mostly online?",
    answer:
      "Western Dental Academy emphasizes hands-on, real-world training. Students work in our state-of-the-art on-site clinic using modern dental equipment alongside experienced dental professionals.",
  },
  {
    _id: "p-prg-3",
    category: "Programs",
    order: 3,
    question: "Do you offer continuing education for working dental professionals?",
    answer:
      "Yes — we offer continuing education courses designed for practicing dental teams looking to expand their skills and stay current with modern techniques and technology.",
  },
  // Cost
  {
    _id: "p-cst-1",
    category: "Cost",
    order: 1,
    question: "How much does the Dental Assisting program cost?",
    answer:
      "Program tuition varies depending on the course. Contact our admissions team for current pricing, payment plan options, and any available financial assistance.",
  },
  {
    _id: "p-cst-2",
    category: "Cost",
    order: 2,
    question: "Are payment plans available?",
    answer:
      "Yes, we offer flexible payment options to help make your education accessible. Reach out to our admissions team to discuss what works best for your situation.",
  },
  {
    _id: "p-cst-3",
    category: "Cost",
    order: 3,
    question: "Is financial aid available?",
    answer:
      "We encourage students to explore Alberta Student Aid and other funding options. Our admissions team can point you in the right direction.",
  },
  // Career
  {
    _id: "p-car-1",
    category: "Career",
    order: 1,
    question: "What career opportunities are available after graduation?",
    answer:
      "Graduates are prepared to work in general dental practices, specialist offices, orthodontic clinics, pediatric dentistry, and more across Alberta and Canada.",
  },
  {
    _id: "p-car-2",
    category: "Career",
    order: 2,
    question: "Will I be job-ready when I graduate?",
    answer:
      "Yes — our curriculum is built around clinical readiness. You'll graduate with hands-on experience and the practical skills employers are looking for from day one.",
  },
  {
    _id: "p-car-3",
    category: "Career",
    order: 3,
    question: "Do you help with job placement after graduation?",
    answer:
      "We support our graduates in their career journey and maintain connections with dental practices in the Edmonton area. Contact us to learn more about our graduate support resources.",
  },
  // General
  {
    _id: "p-gen-1",
    category: "General",
    order: 1,
    question: "Where is Western Dental Academy located?",
    answer:
      "We are located in Edmonton, Alberta. Contact us for our full address and directions.",
  },
  {
    _id: "p-gen-2",
    category: "General",
    order: 2,
    question: "How do I get in touch with the admissions team?",
    answer:
      "You can reach us through the contact form on our website, by phone, or by email. We typically respond within one business day.",
  },
  {
    _id: "p-gen-3",
    category: "General",
    order: 3,
    question: "Do you offer in-person campus tours?",
    answer:
      "Yes — we encourage prospective students to visit our facility and see our clinic firsthand. Book a campus tour through our contact page.",
  },
];

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to the most common questions about Western Dental Academy — admissions, programs, tuition, and career outcomes.",
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
            Browse common questions about admissions, programs, tuition, and
            career outcomes. Can&apos;t find what you&apos;re looking for?{" "}
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
        {/* Floating shapes — adapted for light background */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <ElegantShape delay={0.2} width={440} height={105} rotate={10} gradient="from-[#4A9FD4]/[0.07]" className="left-[-8%] top-[10%]" />
          <ElegantShape delay={0.4} width={300} height={75} rotate={-12} gradient="from-[#1E3560]/[0.05]" className="right-[-4%] bottom-[12%]" />
          <ElegantShape delay={0.5} width={180} height={52} rotate={20} gradient="from-[#4A9FD4]/[0.05]" className="right-[15%] top-[8%]" />
          <ElegantShape delay={0.3} width={150} height={44} rotate={-18} gradient="from-[#1E3560]/[0.04]" className="left-[20%] bottom-[8%]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6">
          <FaqAccordion items={items ?? []} />
        </div>
      </section>

      {/* ── CTA strip ────────────────────────────────── */}
      <section className="relative overflow-hidden py-16" style={{ backgroundColor: "#1E3560" }}>
        {/* Floating shapes */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <ElegantShape delay={0.2} width={400} height={95} rotate={11} gradient="from-[#4A9FD4]/[0.12]" className="left-[-7%] top-[5%]" />
          <ElegantShape delay={0.4} width={300} height={75} rotate={-13} gradient="from-[#4A9FD4]/[0.09]" className="right-[-4%] bottom-[5%]" />
          <ElegantShape delay={0.5} width={175} height={50} rotate={21} gradient="from-[#E67E22]/[0.08]" className="right-[20%] top-[5%]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6">
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
        </div>
      </section>
    </>
  );
}
