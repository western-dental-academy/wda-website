"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'

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
  rdaNumber: string;
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
  rdaNumber: "",
};

const STEPS = [
  { n: 1, label: "Personal"  },
  { n: 2, label: "Education" },
  { n: 3, label: "Programs"  },
  { n: 4, label: "Documents" },
  { n: 5, label: "Review"    },
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

const TODAY   = new Date().toISOString().split("T")[0];
const MAX_DOB = new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000)
  .toISOString()
  .split("T")[0];

const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

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
  const [step, setStep]             = useState(1);
  const [data, setData]             = useState<FormData>(INITIAL);
  const [errors, setErrors]         = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  // Transcript upload state
  const [transcriptFile,       setTranscriptFile]       = useState<File | null>(null);
  const [transcriptPreviewUrl, setTranscriptPreviewUrl] = useState<string | null>(null);
  const [transcriptAssetId,    setTranscriptAssetId]    = useState<string | null>(null);
  const [uploading,            setUploading]            = useState(false);
  const [uploadError,          setUploadError]          = useState('');

  const { executeRecaptcha } = useGoogleReCaptcha();

  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!submitted) stepHeadingRef.current?.focus();
  }, [step, submitted]);

  // Clean up blob URL on unmount or when preview changes
  useEffect(() => {
    return () => {
      if (transcriptPreviewUrl) URL.revokeObjectURL(transcriptPreviewUrl);
    };
  }, [transcriptPreviewUrl]);

  function set<K extends keyof FormData>(key: K, value: string) {
    setData((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Revoke previous preview
    if (transcriptPreviewUrl) URL.revokeObjectURL(transcriptPreviewUrl);
    setTranscriptAssetId(null);
    setUploadError('');

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File is too large. Maximum size is 10 MB.');
      return;
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setUploadError('Invalid file type. Please upload a PDF, JPG, or PNG.');
      return;
    }

    setTranscriptFile(file);
    if (file.type.startsWith('image/')) {
      setTranscriptPreviewUrl(URL.createObjectURL(file));
    } else {
      setTranscriptPreviewUrl(null);
    }
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
      if (!data.dob)          e.dob   = "Date of birth is required.";
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
      if (!data.program)   e.program  = "Please select a program.";
      if (!data.startDate) e.startDate = "Preferred start date is required.";
      if (!data.referral)  e.referral  = "Please let us know how you heard about us.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validate()) setStep((s) => Math.min(s + 1, 5));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 1));
    setErrors({});
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (step < 4) { next(); return; }

    // Step 4 → 5: upload transcript then advance
    if (step === 4) {
      if (!transcriptFile) return;
      // Already uploaded (e.g. user went back and didn't change file)
      if (transcriptAssetId) { setStep(5); return; }

      setUploading(true);
      setUploadError('');
      try {
        const fd = new FormData();
        fd.append('file', transcriptFile);
        const res = await fetch('/api/students/upload-transcript', { method: 'POST', body: fd });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Upload failed');
        setTranscriptAssetId(result.assetId);
        setStep(5);
      } catch (err: any) {
        setUploadError(err.message ?? 'Upload failed. Please try again.');
      } finally {
        setUploading(false);
      }
      return;
    }

    // Step 5 — final submission
    setSubmitting(true);
    try {
      let recaptchaToken = '';
      if (executeRecaptcha) {
        recaptchaToken = await executeRecaptcha('apply_form');
      }
      const res = await fetch('/api/students/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, recaptchaToken, transcriptAssetId }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      setSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      setErrors({ email: 'Something went wrong. Please try again or contact us directly.' });
    } finally {
      setSubmitting(false);
    }
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
        <div
          className="mt-4 mb-8 rounded-lg px-4 py-3 text-sm text-left"
          style={{ backgroundColor: 'rgba(230,126,34,0.08)', border: '1px solid rgba(230,126,34,0.2)' }}
        >
          <p style={{ color: '#1E3560' }}>
            <strong>📬 Check your junk/spam folder</strong> — our emails sometimes end up there.
            Add <strong>info@westerndentalacademy.com</strong> to your contacts to ensure you receive all communications from us.
          </p>
        </div>
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
  const fillWidth = `calc(${(step - 1) / 4} * (100% - 36px))`;

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
      {/* Visually hidden live region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        Step {step} of 5: {STEPS[step - 1].label}
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
        <ol className="relative flex items-start justify-between" aria-label="Application steps">
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
        Step {step} of 5 &mdash; {STEPS[step - 1].label}
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
                  id="apply-firstName" type="text" autoComplete="given-name" placeholder="Jane"
                  value={data.firstName} onChange={(e) => set("firstName", e.target.value)}
                  aria-required="true" aria-invalid={!!errors.firstName || undefined}
                  aria-describedby={errors.firstName ? "err-firstName" : undefined}
                  className={`wda-input${errors.firstName ? " invalid" : ""}`}
                />
                <FieldError id="err-firstName" msg={errors.firstName} />
              </div>
              <div>
                <FieldLabel htmlFor="apply-lastName">Last Name</FieldLabel>
                <input
                  id="apply-lastName" type="text" autoComplete="family-name" placeholder="Smith"
                  value={data.lastName} onChange={(e) => set("lastName", e.target.value)}
                  aria-required="true" aria-invalid={!!errors.lastName || undefined}
                  aria-describedby={errors.lastName ? "err-lastName" : undefined}
                  className={`wda-input${errors.lastName ? " invalid" : ""}`}
                />
                <FieldError id="err-lastName" msg={errors.lastName} />
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="apply-email">Email Address</FieldLabel>
              <input
                id="apply-email" type="email" autoComplete="email" placeholder="jane@example.com"
                value={data.email} onChange={(e) => set("email", e.target.value)}
                aria-required="true" aria-invalid={!!errors.email || undefined}
                aria-describedby={errors.email ? "err-email" : undefined}
                className={`wda-input${errors.email ? " invalid" : ""}`}
              />
              <FieldError id="err-email" msg={errors.email} />
            </div>

            <div>
              <FieldLabel htmlFor="apply-phone">Phone Number</FieldLabel>
              <input
                id="apply-phone" type="tel" autoComplete="tel" placeholder="(780) 000-0000"
                value={data.phone} onChange={(e) => set("phone", e.target.value)}
                aria-required="true" aria-invalid={!!errors.phone || undefined}
                aria-describedby={errors.phone ? "err-phone" : undefined}
                className={`wda-input${errors.phone ? " invalid" : ""}`}
              />
              <FieldError id="err-phone" msg={errors.phone} />
            </div>

            <div>
              <FieldLabel htmlFor="apply-dob">Date of Birth</FieldLabel>
              <input
                id="apply-dob" type="date" max={MAX_DOB}
                value={data.dob} onChange={(e) => set("dob", e.target.value)}
                aria-required="true" aria-invalid={!!errors.dob || undefined}
                aria-describedby={errors.dob ? "err-dob" : "hint-dob"}
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
            ref={stepHeadingRef} tabIndex={-1}
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
                  id="apply-education" value={data.education}
                  onChange={(e) => set("education", e.target.value)}
                  aria-required="true" aria-invalid={!!errors.education || undefined}
                  aria-describedby={errors.education ? "err-education" : undefined}
                  className={`wda-input pr-10 cursor-pointer${errors.education ? " invalid" : ""}`}
                >
                  <option value="">Select education level</option>
                  {EDUCATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <Chevron />
              </div>
              <FieldError id="err-education" msg={errors.education} />
            </div>

            <div className="sm:max-w-[calc(50%-0.625rem)]">
              <FieldLabel htmlFor="apply-educationYear">Year Completed</FieldLabel>
              <input
                id="apply-educationYear" type="number" min="1950" max={new Date().getFullYear()}
                placeholder={`e.g. ${new Date().getFullYear() - 4}`}
                value={data.educationYear} onChange={(e) => set("educationYear", e.target.value)}
                aria-required="true" aria-invalid={!!errors.educationYear || undefined}
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
                id="apply-experience" rows={4}
                placeholder="Describe any dental assisting, healthcare, or customer service experience you have — or leave blank if none."
                value={data.experience} onChange={(e) => set("experience", e.target.value)}
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
            ref={stepHeadingRef} tabIndex={-1}
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
                  id="apply-program" value={data.program}
                  onChange={(e) => {
                    set("program", e.target.value);
                    if (e.target.value !== "Continuing Education") set("rdaNumber", "");
                  }}
                  aria-required="true" aria-invalid={!!errors.program || undefined}
                  aria-describedby={errors.program ? "err-program" : undefined}
                  className={`wda-input pr-10 cursor-pointer${errors.program ? " invalid" : ""}`}
                >
                  <option value="">Select a program</option>
                  {PROGRAM_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <Chevron />
              </div>
              <FieldError id="err-program" msg={errors.program} />

              {/* RDA Number — slides in when Continuing Education is selected */}
              <div
                aria-hidden={data.program !== "Continuing Education"}
                style={{
                  display: "grid",
                  gridTemplateRows: data.program === "Continuing Education" ? "1fr" : "0fr",
                  opacity: data.program === "Continuing Education" ? 1 : 0,
                  transition: "grid-template-rows 280ms ease-out, opacity 220ms ease-out",
                }}
              >
                <div style={{ overflow: "hidden" }}>
                  <div className="pt-5">
                    <FieldLabel htmlFor="apply-rdaNumber" optional>RDA Number</FieldLabel>
                    <input
                      id="apply-rdaNumber"
                      type="text"
                      placeholder="e.g. RDA-12345"
                      value={data.rdaNumber}
                      onChange={(e) => set("rdaNumber", e.target.value)}
                      tabIndex={data.program === "Continuing Education" ? 0 : -1}
                      className="wda-input"
                    />
                    <p className="mt-1.5 text-[11px]" style={{ color: "rgba(43,48,58,0.4)" }}>
                      If you are a Registered Dental Assistant, please enter your RDA number.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sm:max-w-[calc(50%-0.625rem)]">
              <FieldLabel htmlFor="apply-startDate">Preferred Start Date</FieldLabel>
              <input
                id="apply-startDate" type="date" min={TODAY}
                value={data.startDate} onChange={(e) => set("startDate", e.target.value)}
                aria-required="true" aria-invalid={!!errors.startDate || undefined}
                aria-describedby={errors.startDate ? "err-startDate" : undefined}
                className={`wda-input${errors.startDate ? " invalid" : ""}`}
              />
              <FieldError id="err-startDate" msg={errors.startDate} />
            </div>

            <div>
              <FieldLabel htmlFor="apply-referral">How Did You Hear About Us?</FieldLabel>
              <div className="relative">
                <select
                  id="apply-referral" value={data.referral}
                  onChange={(e) => set("referral", e.target.value)}
                  aria-required="true" aria-invalid={!!errors.referral || undefined}
                  aria-describedby={errors.referral ? "err-referral" : undefined}
                  className={`wda-input pr-10 cursor-pointer${errors.referral ? " invalid" : ""}`}
                >
                  <option value="">Select an option</option>
                  {REFERRAL_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <Chevron />
              </div>
              <FieldError id="err-referral" msg={errors.referral} />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 4: Documents ── */}
      {step === 4 && (
        <div>
          <h2
            ref={stepHeadingRef} tabIndex={-1}
            className="text-xl font-bold text-[#1E3560] mb-1 focus:outline-none"
            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            Documents
          </h2>
          <p className="text-sm mb-8" style={{ color: "rgba(43,48,58,0.55)" }}>
            Please upload your most recent high school transcript or equivalent before submitting your application.
          </p>

          <div>
            <FieldLabel htmlFor="apply-transcript">High School Transcript</FieldLabel>
            <p className="text-xs mb-4" style={{ color: "rgba(43,48,58,0.5)" }}>
              Please upload your most recent high school transcript or equivalent. Accepted formats: PDF, JPG, PNG (max 10MB)
            </p>

            {!transcriptFile ? (
              /* Upload zone */
              <label
                htmlFor="apply-transcript"
                className="flex flex-col items-center justify-center gap-3 w-full rounded-xl border-2 border-dashed cursor-pointer p-10 transition-colors duration-200 hover:border-[#4A9FD4]"
                style={{ borderColor: "rgba(30,53,96,0.2)", backgroundColor: "#F4F7F9" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10" style={{ color: "rgba(30,53,96,0.3)" }} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-sm font-semibold" style={{ color: "#1E3560" }}>
                  Click to choose file
                </span>
                <span className="text-xs" style={{ color: "rgba(43,48,58,0.4)" }}>
                  PDF, JPG, or PNG — max 10 MB
                </span>
                <input
                  id="apply-transcript"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  onChange={handleFileChange}
                  className="sr-only"
                  aria-required="true"
                />
              </label>
            ) : (
              /* File selected */
              <div className="flex flex-col gap-4">
                <div
                  className="flex items-center gap-3 rounded-xl p-4"
                  style={{ backgroundColor: "#F4F7F9", border: "1.5px solid rgba(30,53,96,0.1)" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 shrink-0" style={{ color: "#378ADD" }} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#1E3560" }}>
                      {transcriptFile.name}
                    </p>
                    <p className="text-xs" style={{ color: "rgba(43,48,58,0.45)" }}>
                      {(transcriptFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <label htmlFor="apply-transcript-change" className="text-xs font-semibold cursor-pointer shrink-0" style={{ color: "#4A9FD4" }}>
                    Change
                    <input
                      id="apply-transcript-change"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                </div>

                {/* Image preview */}
                {transcriptPreviewUrl && (
                  <img
                    src={transcriptPreviewUrl}
                    alt="Transcript preview"
                    className="rounded-lg max-h-48 object-contain"
                    style={{ border: "1px solid rgba(30,53,96,0.08)" }}
                  />
                )}
              </div>
            )}

            {uploadError && (
              <p className="mt-3 text-xs font-medium" style={{ color: "#dc2626" }} role="alert">
                {uploadError}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Step 5: Review & Submit ── */}
      {step === 5 && (
        <div>
          <h2
            ref={stepHeadingRef} tabIndex={-1}
            className="text-xl font-bold text-[#1E3560] mb-1 focus:outline-none"
            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            Review &amp; Submit
          </h2>
          <p className="text-sm mb-8" style={{ color: "rgba(43,48,58,0.55)" }}>
            Please review your information. Use the{" "}
            <span className="font-semibold text-[#1E3560]">Edit</span> buttons or{" "}
            <span className="font-semibold text-[#1E3560]">Back</span> to make changes before submitting.
          </p>

          <div className="flex flex-col gap-4">
            <ReviewSection title="Personal Information" onEdit={setStep} toStep={1}>
              <ReviewField label="First Name"    value={data.firstName}      />
              <ReviewField label="Last Name"     value={data.lastName}       />
              <ReviewField label="Email Address" value={data.email}          />
              <ReviewField label="Phone Number"  value={data.phone}          />
              <ReviewField label="Date of Birth" value={formatDate(data.dob)} />
            </ReviewSection>

            <ReviewSection title="Education & Background" onEdit={setStep} toStep={2}>
              <ReviewField label="Highest Education" value={data.education}     />
              <ReviewField label="Year Completed"    value={data.educationYear} />
              {data.experience && (
                <ReviewField label="Experience" value={data.experience} wide />
              )}
            </ReviewSection>

            <ReviewSection title="Program Selection" onEdit={setStep} toStep={3}>
              <ReviewField label="Program"               value={data.program}              />
              <ReviewField label="Preferred Start Date"  value={formatDate(data.startDate)} />
              <ReviewField label="How You Heard About Us" value={data.referral}            />
              {data.rdaNumber && (
                <ReviewField label="RDA Number" value={data.rdaNumber} />
              )}
            </ReviewSection>

            <ReviewSection title="Documents" onEdit={setStep} toStep={4}>
              <ReviewField
                label="High School Transcript"
                value={transcriptFile?.name ?? "—"}
                wide
              />
            </ReviewSection>
          </div>

          <p className="text-xs mt-6 leading-relaxed" style={{ color: "rgba(43,48,58,0.45)" }}>
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
            disabled={submitting || uploading}
            className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold border transition-colors duration-200 hover:border-[#1E3560] hover:text-[#1E3560] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ borderColor: "rgba(30,53,96,0.2)", color: "rgba(30,53,96,0.55)" }}
          >
            ← Back
          </button>
        ) : (
          <div />
        )}

        {step < 5 ? (
          <button
            type="submit"
            disabled={(step === 4 && !transcriptFile) || uploading}
            className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#4A9FD4] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#1E3560" }}
          >
            {uploading ? (
              <>
                <span
                  className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white shrink-0"
                  style={{ animation: "spin 0.75s linear infinite" }}
                  aria-hidden
                />
                Uploading…
              </>
            ) : (
              "Continue →"
            )}
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
