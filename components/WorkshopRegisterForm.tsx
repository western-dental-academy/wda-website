"use client";

import { useState, useRef, useEffect } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cadaNumber: string;
  workshop: string;
  preferredDate: string;
  workshopDateId: string;
  questions: string;
}

type Errors = Partial<Record<keyof FormData, string>>;

interface WorkshopDate {
  id: string;
  workshop: string;
  date: string;
  capacity: number;
  registered: number;
  isFull: boolean;
  category: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const INITIAL: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  cadaNumber: "",
  workshop: "",
  preferredDate: "Contact us for available dates",
  workshopDateId: "",
  questions: "",
};

const STEPS = [
  { n: 1, label: "Personal" },
  { n: 2, label: "Offering" },
  { n: 3, label: "Payment" },
];

const WORKSHOP_OPTIONS = [
  { label: "Ergonomics in Dentistry: Hands and Spine", price: 40 },
  { label: "Ergonomics in Dentistry: Hips and Hamstrings", price: 40 },
  { label: "Ergonomics in Dentistry: Neck and Shoulders", price: 40 },
  { label: "National Board Guided Practice Workshop", price: 600 },
];

const CATEGORIES = [
  { value: "workshop",       label: "Workshops",      emoji: "🎓" },
  { value: "course",         label: "Courses",         emoji: "📚" },
  { value: "guest-speaker",  label: "Guest Speakers",  emoji: "🎤" },
  { value: "board-exam-prep", label: "Practical Exam Prep", emoji: "📋" },
] as const;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function calcFee(amountInCents: number): number {
  return Math.round((amountInCents + 30) / (1 - 0.033) - amountInCents);
}

function fmtCAD(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatWorkshopDate(iso: string): string {
  const d = new Date(iso);
  const datePart = d.toLocaleDateString("en-CA", {
    timeZone: "America/Edmonton",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timePart = d
    .toLocaleTimeString("en-CA", {
      timeZone: "America/Edmonton",
      hour: "numeric",
      minute: "2-digit",
    })
    .replace("a.m.", "AM")
    .replace("p.m.", "PM");
  return `${datePart} — ${timePart}`;
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
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);
  const [waitlistSuccess,    setWaitlistSuccess]    = useState(false);
  const [waitlistError,      setWaitlistError]      = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [eligibilityConfirmed, setEligibilityConfirmed] = useState(false);

  // Workshop dates fetched from API
  const [workshopDates, setWorkshopDates] = useState<WorkshopDate[]>([]);
  const [datesLoading, setDatesLoading]   = useState(true);
  const [datesError, setDatesError]       = useState(false);

  const stepHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    stepHeadingRef.current?.focus();
  }, [step]);

  // Fetch available dates on mount
  useEffect(() => {
    fetch("/api/workshops/dates")
      .then((r) => r.json())
      .then((dates: WorkshopDate[]) => {
        setWorkshopDates(Array.isArray(dates) ? dates : []);
      })
      .catch(() => setDatesError(true))
      .finally(() => setDatesLoading(false));
  }, []);

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
      if (!selectedCategory) {
        setCategoryError("Please select a category to continue.");
        setErrors({});
        return false;
      }
      setCategoryError("");
      if (!data.workshop) e.workshop = "Please select a workshop.";
      if (data.workshop) {
        const hasDates = workshopDates.some(
          (d) => d.workshop === data.workshop && d.category === selectedCategory
        );
        if (hasDates && !data.workshopDateId) {
          e.workshopDateId = "Please select a date.";
        }
      }
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
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          cadaNumber: data.cadaNumber.trim() || undefined,
          workshop: data.workshop,
          preferredDate: data.preferredDate,
          workshopDateId: data.workshopDateId || undefined,
          questions: data.questions,
        }),
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

  async function handleWaitlist() {
    setWaitlistSubmitting(true);
    setWaitlistError("");
    try {
      const res = await fetch("/api/workshops/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName:      data.firstName,
          lastName:       data.lastName,
          email:          data.email,
          phone:          data.phone,
          workshop:       data.workshop,
          workshopDateId: data.workshopDateId,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Something went wrong.");
      setWaitlistSuccess(true);
    } catch (err: unknown) {
      setWaitlistError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setWaitlistSubmitting(false);
    }
  }

  // Derived price values for step 3
  const selectedDate     = workshopDates.find((d) => d.id === data.workshopDateId);
  const isDateFull       = selectedDate?.isFull ?? false;
  const selectedWorkshop = WORKSHOP_OPTIONS.find((w) => w.label === data.workshop);
  const amountCents  = (selectedWorkshop?.price ?? 0) * 100;
  const feeCents     = amountCents > 0 ? calcFee(amountCents) : 0;
  const totalCents   = amountCents + feeCents;

  // Workshops available in the selected category
  const workshopsForCategory = selectedCategory
    ? selectedCategory === 'board-exam-prep'
      ? WORKSHOP_OPTIONS.filter((opt) =>
          opt.label === 'National Board Guided Practice Workshop' &&
          workshopDates.some((d) => d.workshop === opt.label)
        )
      : WORKSHOP_OPTIONS.filter((opt) =>
          workshopDates.some(
            (d) => d.category === selectedCategory && d.workshop === opt.label
          )
        )
    : [];

  // Dates available for the selected workshop + category
  const availableDates = workshopDates.filter(
    selectedCategory === 'board-exam-prep'
      ? (d) => d.workshop === data.workshop
      : (d) => d.workshop === data.workshop && d.category === selectedCategory
  );
  const hasDates = availableDates.length > 0;
  const isNationalBoard = data.workshop.includes('National Board');

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

            <div>
              <FieldLabel htmlFor="reg-cadaNumber" optional>
                CADA Membership Number
              </FieldLabel>
              <input
                id="reg-cadaNumber" type="text" placeholder="e.g. RDA12345"
                value={data.cadaNumber} onChange={(e) => set("cadaNumber", e.target.value)}
                className="wda-input"
              />
              <p className="mt-1.5 text-xs" style={{ color: "rgba(43,48,58,0.45)" }}>
                If you are a CADA member, enter your membership number to have it included on your certificate of attendance.
              </p>
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
            Offering Selection
          </h2>
          <p className="text-sm mb-8" style={{ color: "rgba(43,48,58,0.55)" }}>
            Choose your offering and let us know if you have any questions.
          </p>

          <div className="flex flex-col gap-5">
            {/* Category selector */}
            <div>
              <p className="block text-xs font-semibold mb-3" style={{ color: "#1E3560" }}>
                Category
                <span className="ml-0.5" style={{ color: "#4A9FD4" }} aria-hidden>*</span>
              </p>
              {categoryError && (
                <p className="text-xs font-medium mb-3" style={{ color: "#dc2626" }} role="alert">
                  {categoryError}
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => {
                        if (selectedCategory !== cat.value) {
                          setSelectedCategory(cat.value);
                          set("workshop", "");
                          set("workshopDateId", "");
                          set("preferredDate", "Contact us for available dates");
                          setCategoryError("");
                          setErrors((e) => ({ ...e, workshop: undefined, workshopDateId: undefined }));
                        }
                      }}
                      className="flex flex-col items-center gap-2 py-4 px-2 rounded-xl text-center transition-all duration-200"
                      style={{
                        backgroundColor: isSelected ? "rgba(30,53,96,0.06)" : "#ffffff",
                        border: `2px solid ${isSelected ? "#1E3560" : "rgba(30,53,96,0.12)"}`,
                      }}
                    >
                      <span className="text-2xl" aria-hidden>{cat.emoji}</span>
                      <span
                        className="text-xs font-bold leading-tight"
                        style={{ color: isSelected ? "#1E3560" : "rgba(30,53,96,0.45)" }}
                      >
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Workshop dropdown — only shown after category selected */}
            {selectedCategory && (
            <div>
              <FieldLabel htmlFor="reg-workshop">Offering</FieldLabel>
              <div className="relative">
                <select
                  id="reg-workshop" value={data.workshop}
                  onChange={(e) => {
                    set("workshop", e.target.value);
                    set("workshopDateId", "");
                    set("preferredDate", "Contact us for available dates");
                  }}
                  aria-required="true" aria-invalid={!!errors.workshop || undefined}
                  aria-describedby={errors.workshop ? "err-workshop" : undefined}
                  className={`wda-input pr-10 cursor-pointer${errors.workshop ? " invalid" : ""}`}
                >
                  <option value="">Select an offering</option>
                  {workshopsForCategory.length > 0 ? (
                    workshopsForCategory.map((o) => (
                      <option key={o.label} value={o.label}>
                        {o.label} — ${o.price} CAD
                      </option>
                    ))
                  ) : (
                    <option disabled value="">No offerings available in this category</option>
                  )}
                </select>
                <Chevron />
              </div>
              <FieldError id="err-workshop" msg={errors.workshop} />
            </div>
            )}

            {/* Date selection — dynamic based on available dates */}
            {selectedCategory && data.workshop && (
              datesLoading ? (
                <p className="text-xs" style={{ color: "rgba(43,48,58,0.4)" }}>
                  Loading available dates…
                </p>
              ) : datesError ? (
                <p className="text-xs" style={{ color: "rgba(43,48,58,0.5)" }}>
                  Could not load dates. Contact us to confirm availability.
                </p>
              ) : hasDates ? (
                <div>
                  <FieldLabel htmlFor="reg-date">Offering Date</FieldLabel>
                  <div className="relative">
                    <select
                      id="reg-date"
                      value={data.workshopDateId}
                      onChange={(e) => {
                        const selected = availableDates.find((d) => d.id === e.target.value);
                        set("workshopDateId", e.target.value);
                        set(
                          "preferredDate",
                          selected ? formatWorkshopDate(selected.date) : "Contact us for available dates",
                        );
                      }}
                      aria-required="true"
                      aria-invalid={!!errors.workshopDateId || undefined}
                      aria-describedby={errors.workshopDateId ? "err-date" : undefined}
                      className={`wda-input pr-10 cursor-pointer${errors.workshopDateId ? " invalid" : ""}`}
                    >
                      <option value="">Select a date</option>
                      {availableDates.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.isFull
                            ? `${formatWorkshopDate(d.date)} — Full (Join Waitlist)`
                            : `${formatWorkshopDate(d.date)} (${d.registered}/${d.capacity} registered)`}
                        </option>
                      ))}
                    </select>
                    <Chevron />
                  </div>
                  <FieldError id="err-date" msg={errors.workshopDateId} />
                </div>
              ) : (
                <div>
                  <p
                    className="text-[11px] font-semibold uppercase tracking-wide mb-1"
                    style={{ color: "rgba(30,53,96,0.45)" }}
                  >
                    Preferred Date
                  </p>
                  <p className="text-sm" style={{ color: "rgba(43,48,58,0.6)" }}>
                    Contact us for available dates — we'll confirm scheduling by email after registration.
                  </p>
                </div>
              )
            )}

            {/* National Board eligibility confirmation */}
            {selectedCategory && data.workshop && isNationalBoard && (
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(55,138,221,0.08)', border: '1.5px solid rgba(55,138,221,0.3)' }}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={eligibilityConfirmed}
                    onChange={(e) => setEligibilityConfirmed(e.target.checked)}
                    className="mt-1 shrink-0"
                  />
                  <span className="text-sm" style={{ color: '#1E3560' }}>
                    I confirm that I meet the eligibility requirements set by the NDAEB to register for the NDAEB Clinical Practice Evaluation (CPE).{" "}
                    <a
                      href="https://ndaeb.ca/graduates-of-non-registered-programs/eligibility-application-for-graduates-of-non-registered-programs/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#378ADD' }}
                    >
                      View eligibility requirements
                    </a>.
                  </span>
                </label>
              </div>
            )}

            {/* Questions */}
            <div>
              <FieldLabel htmlFor="reg-questions" optional>
                Questions or Special Requests
              </FieldLabel>
              <textarea
                id="reg-questions" rows={4}
                placeholder="Any questions about the offering, accessibility needs, or other requests?"
                value={data.questions}
                onChange={(e) => set("questions", e.target.value)}
                className="wda-input resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Payment / Waitlist ── */}
      {step === 3 && (
        <div>
          <h2
            ref={stepHeadingRef} tabIndex={-1}
            className="text-xl font-bold text-[#1E3560] mb-1 focus:outline-none"
            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            {isDateFull ? "Join the Waitlist" : "Payment"}
          </h2>
          <p className="text-sm mb-8" style={{ color: "rgba(43,48,58,0.55)" }}>
            {isDateFull
              ? "This date is currently full. We'll contact you if a spot becomes available."
              : "Review your order and proceed to secure checkout. Payment is processed by Stripe."}
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

            {/* Date if selected */}
            {data.workshopDateId && data.preferredDate !== "Contact us for available dates" && (
              <div
                className="px-6 py-3"
                style={{ backgroundColor: "#F4F7F9", borderBottom: "1px solid rgba(30,53,96,0.08)" }}
              >
                <p className="text-xs font-semibold mb-0.5" style={{ color: "rgba(30,53,96,0.45)" }}>
                  Date
                </p>
                <p className="text-sm" style={{ color: "#1E3560" }}>{data.preferredDate}</p>
              </div>
            )}

            {/* Line items — payment only */}
            {!isDateFull && (
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
                    Payment processing fee (3.3% + $0.30)
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
            )}
          </div>

          {/* Waitlist error */}
          {isDateFull && waitlistError && (
            <div
              className="mb-5 rounded-lg px-4 py-3 text-sm"
              style={{
                backgroundColor: "rgba(220,38,38,0.06)",
                border: "1px solid rgba(220,38,38,0.2)",
                color: "#dc2626",
              }}
              role="alert"
            >
              {waitlistError}
            </div>
          )}

          {/* Checkout error */}
          {!isDateFull && checkoutError && (
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

          {!isDateFull && (
            <p className="text-xs leading-relaxed" style={{ color: "rgba(43,48,58,0.45)" }}>
              You will be redirected to Stripe&apos;s secure checkout. After payment, you&apos;ll
              receive a confirmation email at{" "}
              <span className="font-semibold text-[#1E3560]">{data.email}</span>.
            </p>
          )}
        </div>
      )}

      {/* ── Navigation ── */}
      {/* Hide nav entirely on waitlist success */}
      {!(step === 3 && isDateFull && waitlistSuccess) && (
        <div
          className="flex items-center justify-between mt-8 pt-6"
          style={{ borderTop: "1px solid rgba(30,53,96,0.08)" }}
        >
          {step > 1 ? (
            <button
              type="button"
              onClick={back}
              disabled={redirecting || waitlistSubmitting}
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
              disabled={step === 2 && isNationalBoard && !eligibilityConfirmed}
              className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#4A9FD4] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#1E3560" }}
            >
              Continue →
            </button>
          ) : isDateFull ? (
            <button
              type="button"
              onClick={handleWaitlist}
              disabled={waitlistSubmitting}
              className="flex items-center gap-2 rounded-lg px-7 py-2.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#CF6D17] disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#E67E22" }}
            >
              {waitlistSubmitting ? (
                <>
                  <span
                    className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white shrink-0"
                    style={{ animation: "spin 0.75s linear infinite" }}
                    aria-hidden
                  />
                  Submitting…
                </>
              ) : (
                "Add to Waitlist"
              )}
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
      )}

      {/* Waitlist success */}
      {step === 3 && isDateFull && waitlistSuccess && (
        <div
          className="mt-8 rounded-xl px-6 py-5 flex items-start gap-4"
          style={{ backgroundColor: 'rgba(34,197,94,0.07)', border: '1.5px solid rgba(34,197,94,0.25)' }}
          role="status"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={2.5} className="w-6 h-6 shrink-0 mt-0.5" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-bold mb-1" style={{ color: '#15803d' }}>You&apos;re on the waitlist!</p>
            <p className="text-sm" style={{ color: 'rgba(21,128,61,0.8)' }}>
              We&apos;ll reach out to <span className="font-semibold">{data.email}</span> if a spot opens up.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
