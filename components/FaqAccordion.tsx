"use client";

import { useState } from "react";
import type { FaqItem, FaqCategory } from "@/types/faqItem";

const CATEGORY_ORDER: FaqCategory[] = [
  "Registration",
  "Workshops",
  "Cost",
  "Career",
  "General",
];

const CATEGORY_LABELS: Record<FaqCategory, string> = {
  Registration: "Registration",
  Workshops: "Workshops",
  Cost: "Cost & Payment",
  Career: "Professional Development",
  General: "General",
};

interface Props {
  items: FaqItem[];
}

export default function FaqAccordion({ items }: Props) {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setOpenMap((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const grouped = CATEGORY_ORDER.reduce<Record<string, FaqItem[]>>(
    (acc, cat) => {
      const catItems = items.filter((i) => i.category === cat);
      if (catItems.length > 0) acc[cat] = catItems;
      return acc;
    },
    {}
  );

  if (Object.keys(grouped).length === 0) {
    return (
      <div className="text-center py-20">
        <p
          className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#4A9FD4] mb-4"
          style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
        >
          Coming Soon
        </p>
        <h2
          className="text-2xl font-bold text-[#1E3560] mb-3"
          style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
        >
          No questions yet
        </h2>
        <p className="text-[#2B303A]/60 max-w-sm mx-auto">
          We&apos;re compiling the most common questions from prospective
          students. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-14">
      {(Object.entries(grouped) as [FaqCategory, FaqItem[]][]).map(
        ([category, catItems]) => (
          <section key={category} aria-labelledby={`cat-${category}`}>
            {/* Category heading */}
            <div className="flex items-center gap-4 mb-6">
              <h2
                id={`cat-${category}`}
                className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#4A9FD4] shrink-0"
                style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                {CATEGORY_LABELS[category]}
              </h2>
              <div
                className="flex-1 h-px"
                style={{ backgroundColor: "rgba(30,53,96,0.1)" }}
                aria-hidden
              />
            </div>

            {/* Items */}
            <div className="flex flex-col gap-2">
              {catItems.map((item) => {
                const isOpen = !!openMap[item._id];
                return (
                  <div
                    key={item._id}
                    className="rounded-xl overflow-hidden"
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1.5px solid rgba(30,53,96,0.08)",
                      boxShadow: isOpen
                        ? "0 4px 20px rgba(30,53,96,0.07)"
                        : "0 1px 4px rgba(30,53,96,0.04)",
                      transition: "box-shadow 0.25s ease",
                    }}
                  >
                    {/* Question button */}
                    <button
                      id={`faq-question-${item._id}`}
                      type="button"
                      onClick={() => toggle(item._id)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${item._id}`}
                      className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                      style={{ backgroundColor: "transparent" }}
                    >
                      <span
                        className="text-sm font-semibold leading-snug"
                        style={{
                          color: isOpen ? "#4A9FD4" : "#1E3560",
                          fontFamily: "var(--font-montserrat), sans-serif",
                          transition: "color 0.2s ease",
                        }}
                      >
                        {item.question}
                      </span>

                      {/* Chevron */}
                      <span
                        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300"
                        style={{
                          backgroundColor: isOpen
                            ? "#4A9FD4"
                            : "rgba(30,53,96,0.07)",
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                        aria-hidden
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={isOpen ? "#ffffff" : "#1E3560"}
                          strokeWidth={2.25}
                          className="w-3.5 h-3.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                          />
                        </svg>
                      </span>
                    </button>

                    {/* Answer — CSS grid expand trick */}
                    <div
                      id={`faq-answer-${item._id}`}
                      role="region"
                      aria-labelledby={`faq-question-${item._id}`}
                      style={{
                        display: "grid",
                        gridTemplateRows: isOpen ? "1fr" : "0fr",
                        transition: "grid-template-rows 0.28s ease",
                      }}
                    >
                      <div style={{ overflow: "hidden" }}>
                        <div
                          className="px-6 pb-5 text-sm leading-relaxed"
                          style={{ color: "rgba(43,48,58,0.75)" }}
                        >
                          {item.answer}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )
      )}
    </div>
  );
}
