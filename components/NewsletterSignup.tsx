"use client";

import { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [fieldError, setFieldError] = useState("");

  function validate(): boolean {
    if (!email.trim()) {
      setFieldError("Please enter your email address.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError("Please enter a valid email address.");
      return false;
    }
    setFieldError("");
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("loading");
    // Simulated submission — wire to a real endpoint (e.g. Mailchimp, ConvertKit) when ready
    await new Promise((r) => setTimeout(r, 900));
    setStatus("success");
  }

  return (
    <section
      className="py-16"
      style={{
        backgroundColor: "#1E3560",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="max-w-2xl mx-auto px-6">

        {status === "success" ? (
          /* ── Success state ── */
          <div className="text-center py-4">
            <div
              className="w-12 h-12 rounded-full mx-auto mb-5 flex items-center justify-center"
              style={{ backgroundColor: "rgba(74,159,212,0.15)" }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4A9FD4"
                strokeWidth={2.25}
                className="w-6 h-6"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2
              className="text-xl font-bold text-white mb-2"
              style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              You&apos;re on the list!
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              Thanks for subscribing. We&apos;ll be in touch with program updates,
              upcoming start dates, and dental industry news.
            </p>
          </div>
        ) : (
          /* ── Form state ── */
          <div className="text-center">
            {/* Eyebrow */}
            <p
              className="text-[0.68rem] font-bold uppercase tracking-[0.22em] mb-4"
              style={{ color: "#4A9FD4", fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              Stay Informed
            </p>

            {/* Headline */}
            <h2
              className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight"
              style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              Stay Updated on Programs &amp; News
            </h2>

            {/* Subheading */}
            <p
              className="text-sm leading-relaxed max-w-md mx-auto mb-8"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              Receive updates on new programs, upcoming start dates, and dental
              industry news from the WDA team — straight to your inbox.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 min-w-0">
                  <label htmlFor="newsletter-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    autoComplete="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldError) setFieldError("");
                    }}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    disabled={status === "loading"}
                    className="w-full rounded-lg px-4 py-3 text-sm text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: inputFocused
                        ? "rgba(255,255,255,0.12)"
                        : "rgba(255,255,255,0.08)",
                      border: fieldError
                        ? "1.5px solid rgba(255,130,130,0.7)"
                        : inputFocused
                        ? "1.5px solid #4A9FD4"
                        : "1.5px solid rgba(255,255,255,0.18)",
                      boxShadow: inputFocused
                        ? "0 0 0 3px rgba(74,159,212,0.2)"
                        : "none",
                      outline: "none",
                    }}
                    // Inline placeholder color is set via CSS class below
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="shrink-0 rounded-lg px-6 py-3 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#CF6D17] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#E67E22" }}
                >
                  {status === "loading" ? (
                    <>
                      <span
                        className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white shrink-0"
                        style={{ animation: "spin 0.75s linear infinite" }}
                        aria-hidden
                      />
                      Subscribing…
                    </>
                  ) : (
                    "Subscribe"
                  )}
                </button>
              </div>

              {/* Inline field error */}
              {fieldError && (
                <p
                  className="mt-2 text-xs text-left"
                  style={{ color: "rgba(255,160,160,0.9)" }}
                  role="alert"
                >
                  {fieldError}
                </p>
              )}
            </form>

            {/* Disclaimer */}
            <p
              className="mt-4 text-xs"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              No spam. Unsubscribe anytime.
            </p>
          </div>
        )}

      </div>

      {/* Placeholder input text colour — targets the input inside this section */}
      <style>{`
        #newsletter-email::placeholder { color: rgba(255,255,255,0.35); }
      `}</style>
    </section>
  );
}
