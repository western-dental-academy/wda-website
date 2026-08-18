"use client";

import { useState, useRef, useEffect } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  workshop: string;
  preferredDate: string;
  questions: string;
}

type Errors = Partial<Record<keyof FormData, string>>;

// ─── Constants ─────────────────────────────────────────────────────────────────

const INITIAL: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  workshop: "",
  preferredDate: "Contact us for available dates",
  questions: "",
};

const STEPS = [
  { n: 1, label: "Personal" },
  { n: 2, label: "Workshop" },
  { n: 3, label: "Payment" },
];

const WORKSHOP_OPTIONS = [
  { label: "NDAB Skills Refresher Workshop",         price: 299 },
  { label: "Dental Practice Software Masterclass",   price: 249 },
  { label: "Front Office Excellence Workshop",       price: 199 },
  { label: "Ergonomics & Career Longevity Workshop", price: 199 },
  { label: "Inventory & Supply Management Workshop", price: 199 },
];

const DATE_OPTIONS = ["Contact us for available dates"];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function calcFee(amountInCents: number): number {
  return Math.round((amountInCents + 30) / (1 - 0.029) - amountInCents);
}

function fmtCAD(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function FieldLabel({
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
        <span className="ml-1.5 font-normal" style={{ color: "rgba(43,48,58,0.45)" }}>
          (optional)
        </span>
      ) : (
        <>
          <span className="ml-0.5" style={{ color: "#4A9FD4" }} aria-hidden>*</span>
          <span className="sr-only"> (required)</span>
        </>
      )}
    </label>
  );
}

function FieldError({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <p id={id} className="mt-1.5 text-xs font-medium" style={{ color: "#dc2626" }} role="alert">
      {msg}
    </p>
  );
}

const Chevron = () => (
  <span
    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
    style={{ color: "rgba(30,53,96,0.4)" }}
    aria-hidden
  >
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06z"
      />
    </svg>
  </span>
);

// ─── Main component ────────────────────────────────────────────────────────────

export default function WorkshopRegisterForm() {
  const [step, setStep]       = useState(1);
  const [data, setData]       = useState<FormData>(INITIAL);
  const [errors, setErrors]   = useState<Errors>({});
  const [redirecting, setRedirecting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    stepHeadingRef.current?.focus();
  }, [step]);

  function set<K extends keyof FormData>(key: K, value: string) {
    setData((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const e: Errors = {};

    if (step === 1) {
      if (!data.firstName.trim()) e.firstName = "First name is required.";
      if (!data.lastName.trim())  e.lastName  = "Last name is required.";
      if (!data.email.trim())     e.email     = "Email address is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
        e.email = "Enter a valid email address.";
      if (!data.phone.trim()) e.phone = "Phone number is required.";
    }

    if (step === 2) {
      if (!data.workshop) e.workshop = "Please select a workshop.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validate()) setStep((s) => Math.min(s + 1, 3));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 1));
    setErrors({});
    setCheckoutError("");
  }

  async function handleCheckout() {
    setRedirecting(true);
    setCheckoutError("");
    try {
      const res = await fetch("/api/workshops/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok || !result.url) throw new Error(result.error ?? "Something went wrong.");
      window.location.href = result.url;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setCheckoutError(message);
      setRedirecting(false);
    }
  }

  // Derived price values for step 3
  const selectedWorkshop = WORKSHOP_OPTIONS.find((w) => w.label === data.workshop);
  const amountCents  = (selectedWorkshop?.price ?? 0) * 100;
  const feeCents     = amountCents > 0 ? calcFee(amountCents) : 0;
  const totalCents   = amountCents + feeCents;

  // Progress bar
  const fillWidth = `calc(${(step - 1) / 2} * (100% - 36px))`;

  return (
    <div
      className="rounded-2xl p-7 sm:p-10"
      style={{
        backgroundColor: "#ffffff",
        border: "1.5px solid rgba(30,53,96,0.09)",
        boxShadow: "0 4px 24px rgba(30,53,96,0.06), 0 1px 4px rgba(30,53,96,0.04)",
      }}
    >
      {/* Visually hidden live region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        Step {step} of 3: {STEPS[step - 1].label}
      </div>

      {/* ── Progress bar ── */}
      <div className="relative mb-10">
        <div
          className="absolute left-[18px] right-[18px] top-[18px] h-0.5"
          style={{ backgroundColor: "rgba(30,53,96,0.1)" }}
          aria-hidden
        />
        <div
          className="absolute left-[18px] top-[18px] h-0.5 transition-[width] duration-500 ease-out"
          style={{ width: fillWidth, backgroundColor: "#4A9FD4" }}
          aria-hidden
        />
        <ol className="relative flex items-start justify-between" aria-label="Registration steps">
          {STEPS.map((s) => {
            const done   = step > s.n;
            const active = step === s.n;
            return (
              <li key={s.n} className="flex flex-col items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                  style={{
                    backgroundColor: done ? "#4A9FD4" : active ? "#1E3560" : "#F4F7F9",
                    color: done || active ? "#ffffff" : "rgba(30,53,96,0.35)",
                    border: active || done ? "none" : "1.5px solid rgba(30,53,96,0.15)",
                  }}
                  aria-current={active ? "step" : undefined}
                  aria-label={`Step ${s.n}: ${s.label}${done ? " – completed" : active ? " – current" : ""}`}
                >
                  {done ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    s.n
                  )}
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.14em] hidden sm:block"
                  style={{
                    color: step >= s.n ? "#1E3560" : "rgba(30,53,96,0.32)",
                    fontFamily: "var(--font-montserrat), sans-serif",
                    transition: "color 0.3s ease",
                  }}
                  aria-hidden
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Mobile step counter */}
      <p
        className="sm:hidden text-[10px] font-bold uppercase tracking-[0.18em] mb-6"
        style={{ color: "#4A9FD4", fontFamily: "var(--font-montserrat), sans-serif" }}
        aria-hidden
      >
        Step {step} of 3 &mdash; {STEPS[step - 1].label}
      </p>

      {/* ── Step 1: Personal Information ── */}
      {step === 1 && (
        <div>
          <h2
            ref={stepHeadingRef}
            tabIndex={-1}
            className="text-xl font-bold text-[#1E3560] mb-1 focus:outline-none"
            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            Personal Information
          </h2>
          <p className="text-sm mb-8" style={{ color: "rgba(43,48,58,0.55)" }}>
            Tell us how to reach you. Fields marked{" "}
            <span style={{ color: "#4A9FD4" }} aria-hidden>*</span>
            <span className="sr-only">with an asterisk</span> are required.
          </p>

          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <FieldLabel htmlFor="reg-firstName">First Name</FieldLabel>
                <input
                  id="reg-firstName" type="text" autoComplete="given-name" placeholder="Jane"
                  value={data.firstName} onChange={(e) => set("firstName", e.target.value)}
                  aria-required="true" aria-invalid={!!errors.firstName || undefined}
                  aria-describedby={errors.firstName ? "err-firstName" : undefined}
                  className={`wda-input${errors.firstName ? " invalid" : ""}`}
                />
                <FieldError id="err-firstName" msg={errors.firstName} />
              </div>
              <div>
                <FieldLabel htmlFor="reg-lastName">Last Name</FieldLabel>
                <input
                  id="reg-lastName" type="text" autoComplete="family-name" placeholder="Smith"
                  value={data.lastName} onChange={(e) => set("lastName", e.target.value)}
                  aria-required="true" aria-invalid={!!errors.lastName || undefined}
                  aria-describedby={errors.lastName ? "err-lastName" : undefined}
                  className={`wda-input${errors.lastName ? " invalid" : ""}`}
                />
                <FieldError id="err-lastName" msg={errors.lastName} />
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="reg-email">Email Address</FieldLabel>
              <input
                id="reg-email" type="email" autoComplete="email" placeholder="jane@example.com"
                value={data.email} onChange={(e) => set("email", e.target.value)}
                aria-required="true" aria-invalid={!!errors.email || undefined}
                aria-describedby={errors.email ? "err-email" : undefined}
                className={`wda-input${errors.email ? " invalid" : ""}`}
              />
              <FieldError id="err-email" msg={errors.email} />
            </div>

            <div>
              <FieldLabel htmlFor="reg-phone">Phone Number</FieldLabel>
              <input
                id="reg-phone" type="tel" autoComplete="tel" placeholder="(780) 000-0000"
                value={data.phone} onChange={(e) => set("phone", e.target.value)}
                aria-required="true" aria-invalid={!!errors.phone || undefined}
                aria-describedby={errors.phone ? "err-phone" : undefined}
                className={`wda-input${errors.phone ? " invalid" : ""}`}
              />
              <FieldError id="err-phone" msg={errors.phone} />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Workshop Selection ── */}
      {step === 2 && (
        <div>
          <h2
            ref={stepHeadingRef} tabIndex={-1}
            className="text-xl font-bold text-[#1E3560] mb-1 focus:outline-none"
            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            Workshop Selection
          </h2>
          <p className="text-sm mb-8" style={{ color: "rgba(43,48,58,0.55)" }}>
            Choose your workshop and let us know if you have any questions.
          </p>

          <div className="flex flex-col gap-5">
            <div>
              <FieldLabel htmlFor="reg-workshop">Workshop</FieldLabel>
              <div className="relative">
                <select
                  id="reg-workshop" value={data.workshop}
                  onChange={(e) => set("workshop", e.target.value)}
                  aria-required="true" aria-invalid={!!errors.workshop || undefined}
                  aria-describedby={errors.workshop ? "err-workshop" : undefined}
                  className={`wda-input pr-10 cursor-pointer${errors.workshop ? " invalid" : ""}`}
                >
                  <option value="">Select a workshop</option>
                  {WORKSHOP_OPTIONS.map((o) => (
                    <option key={o.label} value={o.label}>
                      {o.label} — ${o.price} CAD
                    </option>
                  ))}
                </select>
                <Chevron />
              </div>
              <FieldError id="err-workshop" msg={errors.workshop} />
            </div>

            <div>
              <FieldLabel htmlFor="reg-date">Preferred Date</FieldLabel>
              <div className="relative">
                <select
                  id="reg-date" value={data.preferredDate}
                  onChange={(e) => set("preferredDate", e.target.value)}
                  className="wda-input pr-10 cursor-pointer"
                >
                  {DATE_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
                <Chevron />
              </div>
              <p className="mt-1.5 text-[11px]" style={{ color: "rgba(43,48,58,0.4)" }}>
                We will confirm your workshop date by email after registration.
              </p>
            </div>

            <div>
              <FieldLabel htmlFor="reg-questions" optional>
                Questions or Special Requests
              </FieldLabel>
              <textarea
                id="reg-questions" rows={4}
                placeholder="Any questions about the workshop, accessibility needs, or other requests?"
                value={data.questions}
                onChange={(e) => set("questions", e.target.value)}
                className="wda-input resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Payment ── */}
      {step === 3 && (
        <div>
          <h2
            ref={stepHeadingRef} tabIndex={-1}
            className="text-xl font-bold text-[#1E3560] mb-1 focus:outline-none"
            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            Payment
          </h2>
          <p className="text-sm mb-8" style={{ color: "rgba(43,48,58,0.55)" }}>
            Review your order and proceed to secure checkout. Payment is processed by Stripe.
          </p>

          {/* Order summary card */}
          <div
            className="rounded-xl overflow-hidden mb-6"
            style={{
              border: "1px solid rgba(30,53,96,0.1)",
              boxShadow: "0 2px 12px rgba(30,53,96,0.06)",
            }}
          >
            {/* Header */}
            <div className="px-6 py-4" style={{ backgroundColor: "#1E3560" }}>
              <p
                className="text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ color: "#4A9FD4", fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                Order Summary
              </p>
            </div>

            {/* Registrant */}
            <div
              className="px-6 py-4"
              style={{ backgroundColor: "#F4F7F9", borderBottom: "1px solid rgba(30,53,96,0.08)" }}
            >
              <p className="text-xs font-semibold mb-0.5" style={{ color: "rgba(30,53,96,0.45)" }}>
                Registrant
              </p>
              <p className="text-sm font-semibold" style={{ color: "#1E3560" }}>
                {data.firstName} {data.lastName}
              </p>
              <p className="text-xs" style={{ color: "rgba(43,48,58,0.55)" }}>{data.email}</p>
            </div>

            {/* Line items */}
            <div className="bg-white">
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: "1px solid rgba(30,53,96,0.06)" }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#1E3560" }}>
                    {data.workshop}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(43,48,58,0.45)" }}>
                    Western Dental Academy — Workshop Registration
                  </p>
                </div>
                <p className="text-sm font-bold shrink-0 ml-4" style={{ color: "#1E3560" }}>
                  {fmtCAD(amountCents)}
                </p>
              </div>
              <div
                className="flex items-center justify-between px-6 py-3"
                style={{ borderBottom: "1px solid rgba(30,53,96,0.06)" }}
              >
                <p className="text-xs" style={{ color: "rgba(43,48,58,0.5)" }}>
                  Payment processing fee (2.9% + $0.30)
                </p>
                <p className="text-xs shrink-0 ml-4" style={{ color: "rgba(43,48,58,0.5)" }}>
                  {fmtCAD(feeCents)}
                </p>
              </div>
              <div className="flex items-center justify-between px-6 py-4">
                <p
                  className="text-sm font-bold uppercase tracking-wide"
                  style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}
                >
                  Total
                </p>
                <p className="text-lg font-bold" style={{ color: "#1E3560" }}>
                  {fmtCAD(totalCents)} CAD
                </p>
              </div>
            </div>
          </div>

          {checkoutError && (
            <div
              className="mb-5 rounded-lg px-4 py-3 text-sm"
              style={{
                backgroundColor: "rgba(220,38,38,0.06)",
                border: "1px solid rgba(220,38,38,0.2)",
                color: "#dc2626",
              }}
              role="alert"
            >
              {checkoutError}
            </div>
          )}

          <p className="text-xs leading-relaxed" style={{ color: "rgba(43,48,58,0.45)" }}>
            You will be redirected to Stripe&apos;s secure checkout. After payment, you&apos;ll
            receive a confirmation email at{" "}
            <span className="font-semibold text-[#1E3560]">{data.email}</span>.
          </p>
        </div>
      )}

      {/* ── Navigation ── */}
      <div
        className="flex items-center justify-between mt-8 pt-6"
        style={{ borderTop: "1px solid rgba(30,53,96,0.08)" }}
      >
        {step > 1 ? (
          <button
            type="button"
            onClick={back}
            disabled={redirecting}
            className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold border transition-colors duration-200 hover:border-[#1E3560] hover:text-[#1E3560] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ borderColor: "rgba(30,53,96,0.2)", color: "rgba(30,53,96,0.55)" }}
          >
            ← Back
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={next}
            className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#4A9FD4]"
            style={{ backgroundColor: "#1E3560" }}
          >
            Continue →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCheckout}
            disabled={redirecting}
            className="flex items-center gap-2 rounded-lg px-7 py-2.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#CF6D17] disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#E67E22" }}
            aria-busy={redirecting}
          >
            {redirecting ? (
              <>
                <span
                  className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white shrink-0"
                  style={{ animation: "spin 0.75s linear infinite" }}
                  aria-hidden
                />
                Redirecting…
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                Proceed to Checkout →
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
