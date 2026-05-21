"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Status = "idle" | "loading" | "success" | "error";

interface FormData {
  name: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const TOPICS = [
  "General Inquiry",
  "Program Information",
  "Admissions & Enrollment",
  "Book a Campus Tour",
  "Continuing Education",
  "Other",
];

const EMPTY: FormData = {
  name: "",
  email: "",
  phone: "",
  topic: "",
  message: "",
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function Label({
  htmlFor,
  children,
  optional,
}: {
  htmlFor: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-semibold mb-2"
      style={{ color: "#1E3560" }}
    >
      {children}
      {optional ? (
        <span
          className="ml-1.5 font-normal"
          style={{ color: "rgba(43,48,58,0.45)" }}
        >
          (optional)
        </span>
      ) : (
        <span className="ml-0.5" style={{ color: "#4A9FD4" }}>
          *
        </span>
      )}
    </label>
  );
}

// ─── Success state ─────────────────────────────────────────────────────────────

function SuccessMessage({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center text-center py-14 px-6">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: "rgba(74,159,212,0.12)" }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4A9FD4"
          strokeWidth={2.5}
          aria-hidden
          className="w-7 h-7"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m4.5 12.75 6 6 9-13.5"
          />
        </svg>
      </div>
      <h3
        className="text-xl font-bold mb-3"
        style={{
          color: "#1E3560",
          fontFamily: "var(--font-montserrat), sans-serif",
        }}
      >
        Message Received
      </h3>
      <p
        className="text-sm leading-relaxed mb-8 max-w-xs"
        style={{ color: "#2B303A" }}
      >
        Thanks for reaching out. A member of the WDA team will get back to you
        within one business day.
      </p>
      <button
        onClick={onReset}
        className="text-sm font-bold transition-colors duration-200 hover:opacity-75"
        style={{ color: "#4A9FD4" }}
      >
        Send another message
      </button>
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function ContactForm() {
  const [data, setData] = useState<FormData>(EMPTY);
  const [status, setStatus] = useState<Status>("idle");

  function field(key: keyof FormData) {
    return (
      e: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => setData((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    // ── Activate when a real endpoint exists ────────────────────────────────
    // try {
    //   const res = await fetch("/api/contact", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(data),
    //   });
    //   if (!res.ok) throw new Error();
    //   setStatus("success");
    // } catch {
    //   setStatus("error");
    // }
    // ────────────────────────────────────────────────────────────────────────

    // Simulated success — remove once real endpoint is wired
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("success");
  }

  if (status === "success") {
    return (
      <SuccessMessage
        onReset={() => {
          setData(EMPTY);
          setStatus("idle");
        }}
      />
    );
  }

  const loading = status === "loading";

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* ── Your information ── */}
      <fieldset className="mb-8 border-none p-0">
        <legend
          className="text-[10px] font-bold tracking-[0.2em] uppercase mb-5 w-full"
          style={{ color: "#4A9FD4" }}
        >
          Your Information
        </legend>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <input
              id="name"
              type="text"
              className="wda-input"
              placeholder="Jane Smith"
              value={data.name}
              onChange={field("name")}
              required
              disabled={loading}
              autoComplete="name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <input
              id="email"
              type="email"
              className="wda-input"
              placeholder="jane@example.com"
              value={data.email}
              onChange={field("email")}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>
        </div>

        <div className="sm:max-w-[calc(50%-0.625rem)]">
          <Label htmlFor="phone" optional>
            Phone Number
          </Label>
          <input
            id="phone"
            type="tel"
            className="wda-input"
            placeholder="(780) 000-0000"
            value={data.phone}
            onChange={field("phone")}
            disabled={loading}
            autoComplete="tel"
          />
        </div>
      </fieldset>

      {/* ── Your inquiry ── */}
      <fieldset className="mb-8 border-none p-0">
        <legend
          className="text-[10px] font-bold tracking-[0.2em] uppercase mb-5 w-full"
          style={{ color: "#4A9FD4" }}
        >
          Your Inquiry
        </legend>

        <div className="mb-5">
          <Label htmlFor="topic" optional>
            Topic
          </Label>
          <div className="relative">
            <select
              id="topic"
              className="wda-input pr-10 cursor-pointer"
              value={data.topic}
              onChange={field("topic")}
              disabled={loading}
            >
              <option value="">Select a topic…</option>
              {TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {/* Custom chevron */}
            <span
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
              style={{ color: "rgba(30,53,96,0.4)" }}
            >
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </div>
        </div>

        <div>
          <Label htmlFor="message">Message</Label>
          <textarea
            id="message"
            className="wda-input resize-none"
            rows={5}
            placeholder="How can we help you? Feel free to share as much or as little as you'd like."
            value={data.message}
            onChange={field("message")}
            required
            disabled={loading}
          />
        </div>
      </fieldset>

      {/* Error banner */}
      {status === "error" && (
        <p
          className="text-xs font-medium mb-5 px-4 py-3 rounded-lg"
          style={{
            backgroundColor: "rgba(220,38,38,0.07)",
            color: "rgb(185,28,28)",
          }}
          role="alert"
        >
          Something went wrong — please try again or email us directly at{" "}
          <a
            href="mailto:info@westerndentalacademy.com"
            className="underline font-semibold"
          >
            info@westerndentalacademy.com
          </a>
          .
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg py-3.5 text-sm font-bold text-white transition-all duration-200 flex items-center justify-center gap-2.5 hover:scale-[1.01] disabled:scale-100 disabled:cursor-not-allowed"
        style={{ backgroundColor: "#4A9FD4" }}
      >
        {loading ? (
          <>
            <span
              className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white shrink-0"
              style={{ animation: "spin 0.75s linear infinite" }}
              aria-hidden
            />
            Sending…
          </>
        ) : (
          "Send Message"
        )}
      </button>

      <p
        className="text-xs mt-4 text-center"
        style={{ color: "rgba(43,48,58,0.45)" }}
      >
        We respond to all inquiries within one business day.
      </p>
    </form>
  );
}
