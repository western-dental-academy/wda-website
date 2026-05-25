"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  education: string;
  educationYear: string;
  experience: string;
  program: string;
  startDate: string;
  referral: string;
}

type Errors = Partial<Record<keyof FormData, string>>;

// ─── Constants ─────────────────────────────────────────────────────────────────

const INITIAL: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dob: "",
  education: "",
  educationYear: "",
  experience: "",
  program: "",
  startDate: "",
  referral: "",
};

const STEPS = [
  { n: 1, label: "Personal" },
  { n: 2, label: "Education" },
  { n: 3, label: "Programs" },
  { n: 4, label: "Review" },
];

const EDUCATION_OPTIONS = [
  "High School Diploma / GED",
  "Some College or University",
  "College Diploma or Certificate",
  "Bachelor's Degree",
  "Master's Degree or Higher",
];

const PROGRAM_OPTIONS = [
  "Dental Assisting Certificate",
  "Continuing Education",
  "Clinical Practicum",
  "Dental Office Administration",
];

const REFERRAL_OPTIONS = ["Google", "Social Media", "Friend or Family", "Other"];

const TODAY = new Date().toISOString().split("T")[0];
const MAX_DOB = new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000)
  .toISOString()
  .split("T")[0];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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

function ReviewSection({
  title,
  onEdit,
  toStep,
  children,
}: {
  title: string;
  onEdit: (s: number) => void;
  toStep: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-5 sm:p-6"
      style={{ backgroundColor: "#F4F7F9", border: "1px solid rgba(30,53,96,0.07)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{ color: "#4A9FD4", fontFamily: "var(--font-montserrat), sans-serif" }}
        >
          {title}
        </p>
        <button
          type="button"
          onClick={() => onEdit(toStep)}
          className="text-xs font-semibold transition-colors duration-200 hover:text-[#4A9FD4]"
          style={{ color: "rgba(30,53,96,0.45)" }}
          aria-label={`Edit ${title}`}
        >
          Edit
        </button>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">{children}</dl>
    </div>
  );
}

function ReviewField({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <dt
        className="text-[10px] font-semibold uppercase tracking-widest mb-0.5"
        style={{ color: "rgba(30,53,96,0.4)" }}
      >
        {label}
      </dt>
      <dd
        className="text-sm font-medium leading-snug"
        style={{ color: value ? "#1E3560" : "rgba(30,53,96,0.3)" }}
      >
        {value || "—"}
      </dd>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function ApplyForm() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Focus the step heading whenever the active step changes
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!submitted) {
      stepHeadingRef.current?.focus();
    }
  }, [step, submitted]);

  function set<K extends keyof FormData>(key: K, value: string) {
    setData((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const e: Errors = {};

    if (step === 1) {
      if (!data.firstName.trim()) e.firstName = "First name is required.";
      if (!data.lastName.trim()) e.lastName = "Last name is required.";
      if (!data.email.trim()) e.email = "Email address is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
        e.email = "Enter a valid email address.";
      if (!data.phone.trim()) e.phone = "Phone number is required.";
      if (!data.dob) e.dob = "Date of birth is required.";
    }

    if (step === 2) {
      if (!data.education) e.education = "Please select your education level.";
      if (!data.educationYear.trim()) e.educationYear = "Year completed is required.";
      else {
        const y = Number(data.educationYear);
        if (!Number.isInteger(y) || y < 1950 || y > new Date().getFullYear())
          e.educationYear = "Enter a valid year (e.g. 2018).";
      }
    }

    if (step === 3) {
      if (!data.program) e.program = "Please select a program.";
      if (!data.startDate) e.startDate = "Preferred start date is required.";
      if (!data.referral) e.referral = "Please let us know how you heard about us.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validate()) setStep((s) => Math.min(s + 1, 4));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 1));
    setErrors({});
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step < 4) {
      next();
      return;
    }
    // Step 4 — final submission
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setSubmitted(true);
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl p-10 sm:p-14 text-center"
        style={{
          backgroundColor: "#ffffff",
          border: "1.5px solid rgba(30,53,96,0.09)",
          boxShadow: "0 4px 24px rgba(30,53,96,0.06)",
        }}
      >
        <div
          className="w-16 h-16 rounded-full mx-auto mb-7 flex items-center justify-center"
          style={{ backgroundColor: "rgba(74,159,212,0.12)" }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4A9FD4"
            strokeWidth={2.25}
            className="w-8 h-8"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2
          className="text-2xl font-bold text-[#1E3560] mb-3"
          style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
        >
          Application Received
        </h2>
        <p className="text-sm leading-relaxed max-w-sm mx-auto mb-2" style={{ color: "rgba(43,48,58,0.7)" }}>
          Thank you, <strong className="text-[#1E3560]">{data.firstName}</strong>. Our
          admissions team will review your application and reach out to you at{" "}
          <strong className="text-[#1E3560]">{data.email}</strong> within one to two
          business days.
        </p>
        <p className="text-xs mb-10" style={{ color: "rgba(43,48,58,0.45)" }}>
          If you don&apos;t hear from us, check your spam folder or contact us directly.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="rounded-lg px-5 py-2.5 text-sm font-semibold border transition-colors duration-200 hover:border-[#1E3560] hover:text-[#1E3560]"
            style={{ borderColor: "rgba(30,53,96,0.2)", color: "rgba(30,53,96,0.55)" }}
          >
            Back to Home
          </Link>
          <Link
            href="/contact"
            className="rounded-lg px-5 py-2.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#CF6D17]"
            style={{ backgroundColor: "#E67E22" }}
          >
            Contact Us
          </Link>
        </div>
      </div>
    );
  }

  // ── Progress indicator ──────────────────────────────────────────────────────
  const fillWidth = `calc(${(step - 1) / 3} * (100% - 36px))`;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl p-7 sm:p-10"
      style={{
        backgroundColor: "#ffffff",
        border: "1.5px solid rgba(30,53,96,0.09)",
        boxShadow: "0 4px 24px rgba(30,53,96,0.06), 0 1px 4px rgba(30,53,96,0.04)",
      }}
    >
      {/* Visually hidden live region — announces step changes to screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        Step {step} of 4: {STEPS[step - 1].label}
      </div>

      {/* ── Progress bar ── */}
      <div className="relative mb-10">
        {/* Gray track */}
        <div
          className="absolute left-[18px] right-[18px] top-[18px] h-0.5"
          style={{ backgroundColor: "rgba(30,53,96,0.1)" }}
          aria-hidden
        />
        {/* Blue fill */}
        <div
          className="absolute left-[18px] top-[18px] h-0.5 transition-[width] duration-500 ease-out"
          style={{ width: fillWidth, backgroundColor: "#4A9FD4" }}
          aria-hidden
        />
        {/* Step circles */}
        <ol
          className="relative flex items-start justify-between"
          aria-label="Application steps"
        >
          {STEPS.map((s) => {
            const done = step > s.n;
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
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      className="w-4 h-4"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
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
        Step {step} of 4 &mdash; {STEPS[step - 1].label}
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
            Tell us a bit about yourself. Fields marked{" "}
            <span style={{ color: "#4A9FD4" }} aria-hidden>*</span>
            <span className="sr-only">with an asterisk</span> are required.
          </p>

          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <FieldLabel htmlFor="apply-firstName">First Name</FieldLabel>
                <input
                  id="apply-firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Jane"
                  value={data.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                  aria-required="true"
                  aria-invalid={!!errors.firstName || undefined}
                  aria-describedby={errors.firstName ? "err-firstName" : undefined}
                  className={`wda-input${errors.firstName ? " invalid" : ""}`}
                />
                <FieldError id="err-firstName" msg={errors.firstName} />
              </div>
              <div>
                <FieldLabel htmlFor="apply-lastName">Last Name</FieldLabel>
                <input
                  id="apply-lastName"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Smith"
                  value={data.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                  aria-required="true"
                  aria-invalid={!!errors.lastName || undefined}
                  aria-describedby={errors.lastName ? "err-lastName" : undefined}
                  className={`wda-input${errors.lastName ? " invalid" : ""}`}
                />
                <FieldError id="err-lastName" msg={errors.lastName} />
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="apply-email">Email Address</FieldLabel>
              <input
                id="apply-email"
                type="email"
                autoComplete="email"
                placeholder="jane@example.com"
                value={data.email}
                onChange={(e) => set("email", e.target.value)}
                aria-required="true"
                aria-invalid={!!errors.email || undefined}
                aria-describedby={errors.email ? "err-email" : undefined}
                className={`wda-input${errors.email ? " invalid" : ""}`}
              />
              <FieldError id="err-email" msg={errors.email} />
            </div>

            <div>
              <FieldLabel htmlFor="apply-phone">Phone Number</FieldLabel>
              <input
                id="apply-phone"
                type="tel"
                autoComplete="tel"
                placeholder="(780) 000-0000"
                value={data.phone}
                onChange={(e) => set("phone", e.target.value)}
                aria-required="true"
                aria-invalid={!!errors.phone || undefined}
                aria-describedby={errors.phone ? "err-phone" : undefined}
                className={`wda-input${errors.phone ? " invalid" : ""}`}
              />
              <FieldError id="err-phone" msg={errors.phone} />
            </div>

            <div>
              <FieldLabel htmlFor="apply-dob">Date of Birth</FieldLabel>
              <input
                id="apply-dob"
                type="date"
                max={MAX_DOB}
                value={data.dob}
                onChange={(e) => set("dob", e.target.value)}
                aria-required="true"
                aria-invalid={!!errors.dob || undefined}
                aria-describedby={
                  errors.dob ? "err-dob" : "hint-dob"
                }
                className={`wda-input${errors.dob ? " invalid" : ""}`}
              />
              <FieldError id="err-dob" msg={errors.dob} />
              <p id="hint-dob" className="mt-1.5 text-[11px]" style={{ color: "rgba(43,48,58,0.4)" }}>
                Applicants must be at least 18 years of age.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Education & Background ── */}
      {step === 2 && (
        <div>
          <h2
            ref={stepHeadingRef}
            tabIndex={-1}
            className="text-xl font-bold text-[#1E3560] mb-1 focus:outline-none"
            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            Education &amp; Background
          </h2>
          <p className="text-sm mb-8" style={{ color: "rgba(43,48,58,0.55)" }}>
            No prior dental or healthcare experience is required.
          </p>

          <div className="flex flex-col gap-5">
            <div>
              <FieldLabel htmlFor="apply-education">Highest Level of Education Completed</FieldLabel>
              <div className="relative">
                <select
                  id="apply-education"
                  value={data.education}
                  onChange={(e) => set("education", e.target.value)}
                  aria-required="true"
                  aria-invalid={!!errors.education || undefined}
                  aria-describedby={errors.education ? "err-education" : undefined}
                  className={`wda-input pr-10 cursor-pointer${errors.education ? " invalid" : ""}`}
                >
                  <option value="">Select education level</option>
                  {EDUCATION_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <Chevron />
              </div>
              <FieldError id="err-education" msg={errors.education} />
            </div>

            <div className="sm:max-w-[calc(50%-0.625rem)]">
              <FieldLabel htmlFor="apply-educationYear">Year Completed</FieldLabel>
              <input
                id="apply-educationYear"
                type="number"
                min="1950"
                max={new Date().getFullYear()}
                placeholder={`e.g. ${new Date().getFullYear() - 4}`}
                value={data.educationYear}
                onChange={(e) => set("educationYear", e.target.value)}
                aria-required="true"
                aria-invalid={!!errors.educationYear || undefined}
                aria-describedby={errors.educationYear ? "err-educationYear" : undefined}
                className={`wda-input${errors.educationYear ? " invalid" : ""}`}
              />
              <FieldError id="err-educationYear" msg={errors.educationYear} />
            </div>

            <div>
              <FieldLabel htmlFor="apply-experience" optional>
                Relevant Healthcare or Dental Experience
              </FieldLabel>
              <textarea
                id="apply-experience"
                rows={4}
                placeholder="Describe any dental assisting, healthcare, or customer service experience you have — or leave blank if none."
                value={data.experience}
                onChange={(e) => set("experience", e.target.value)}
                className="wda-input resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Program Selection ── */}
      {step === 3 && (
        <div>
          <h2
            ref={stepHeadingRef}
            tabIndex={-1}
            className="text-xl font-bold text-[#1E3560] mb-1 focus:outline-none"
            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            Program Selection
          </h2>
          <p className="text-sm mb-8" style={{ color: "rgba(43,48,58,0.55)" }}>
            Let us know which program you&apos;re interested in and when you&apos;d like to start.
          </p>

          <div className="flex flex-col gap-5">
            <div>
              <FieldLabel htmlFor="apply-program">Program of Interest</FieldLabel>
              <div className="relative">
                <select
                  id="apply-program"
                  value={data.program}
                  onChange={(e) => set("program", e.target.value)}
                  aria-required="true"
                  aria-invalid={!!errors.program || undefined}
                  aria-describedby={errors.program ? "err-program" : undefined}
                  className={`wda-input pr-10 cursor-pointer${errors.program ? " invalid" : ""}`}
                >
                  <option value="">Select a program</option>
                  {PROGRAM_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <Chevron />
              </div>
              <FieldError id="err-program" msg={errors.program} />
            </div>

            <div className="sm:max-w-[calc(50%-0.625rem)]">
              <FieldLabel htmlFor="apply-startDate">Preferred Start Date</FieldLabel>
              <input
                id="apply-startDate"
                type="date"
                min={TODAY}
                value={data.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                aria-required="true"
                aria-invalid={!!errors.startDate || undefined}
                aria-describedby={errors.startDate ? "err-startDate" : undefined}
                className={`wda-input${errors.startDate ? " invalid" : ""}`}
              />
              <FieldError id="err-startDate" msg={errors.startDate} />
            </div>

            <div>
              <FieldLabel htmlFor="apply-referral">How Did You Hear About Us?</FieldLabel>
              <div className="relative">
                <select
                  id="apply-referral"
                  value={data.referral}
                  onChange={(e) => set("referral", e.target.value)}
                  aria-required="true"
                  aria-invalid={!!errors.referral || undefined}
                  aria-describedby={errors.referral ? "err-referral" : undefined}
                  className={`wda-input pr-10 cursor-pointer${errors.referral ? " invalid" : ""}`}
                >
                  <option value="">Select an option</option>
                  {REFERRAL_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <Chevron />
              </div>
              <FieldError id="err-referral" msg={errors.referral} />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 4: Review & Submit ── */}
      {step === 4 && (
        <div>
          <h2
            ref={stepHeadingRef}
            tabIndex={-1}
            className="text-xl font-bold text-[#1E3560] mb-1 focus:outline-none"
            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            Review &amp; Submit
          </h2>
          <p className="text-sm mb-8" style={{ color: "rgba(43,48,58,0.55)" }}>
            Please review your information. Use the{" "}
            <span className="font-semibold text-[#1E3560]">Edit</span> buttons or{" "}
            <span className="font-semibold text-[#1E3560]">Back</span> to make changes before
            submitting.
          </p>

          <div className="flex flex-col gap-4">
            <ReviewSection title="Personal Information" onEdit={setStep} toStep={1}>
              <ReviewField label="First Name" value={data.firstName} />
              <ReviewField label="Last Name" value={data.lastName} />
              <ReviewField label="Email Address" value={data.email} />
              <ReviewField label="Phone Number" value={data.phone} />
              <ReviewField label="Date of Birth" value={formatDate(data.dob)} />
            </ReviewSection>

            <ReviewSection title="Education & Background" onEdit={setStep} toStep={2}>
              <ReviewField label="Highest Education" value={data.education} />
              <ReviewField label="Year Completed" value={data.educationYear} />
              {data.experience && (
                <ReviewField label="Experience" value={data.experience} wide />
              )}
            </ReviewSection>

            <ReviewSection title="Program Selection" onEdit={setStep} toStep={3}>
              <ReviewField label="Program" value={data.program} />
              <ReviewField label="Preferred Start Date" value={formatDate(data.startDate)} />
              <ReviewField label="How You Heard About Us" value={data.referral} />
            </ReviewSection>
          </div>

          <p
            className="text-xs mt-6 leading-relaxed"
            style={{ color: "rgba(43,48,58,0.45)" }}
          >
            By submitting this application you confirm that the information provided is
            accurate and consent to being contacted by Western Dental Academy&apos;s admissions
            team regarding your application.
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
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold border transition-colors duration-200 hover:border-[#1E3560] hover:text-[#1E3560] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ borderColor: "rgba(30,53,96,0.2)", color: "rgba(30,53,96,0.55)" }}
          >
            ← Back
          </button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#4A9FD4]"
            style={{ backgroundColor: "#1E3560" }}
          >
            Continue →
          </button>
        ) : (
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg px-7 py-2.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#CF6D17] disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#E67E22" }}
            aria-busy={submitting}
          >
            {submitting ? (
              <>
                <span
                  className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white shrink-0"
                  style={{ animation: "spin 0.75s linear infinite" }}
                  aria-hidden
                />
                Submitting…
              </>
            ) : (
              "Submit Application →"
            )}
          </button>
        )}
      </div>
    </form>
  );
}
