"use client";

import { useState, type FormEvent } from "react";
import {
  TUTORING_AREAS,
  TUTORING_FORMATS,
  TUTORING_HOURLY_RATE,
  TUTORING_SERVICES,
  type TutoringService,
} from "@/lib/tutoring/shared";

type Status = "idle" | "loading" | "success" | "error";

function Label({ htmlFor, children, optional }: { htmlFor?: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold mb-2" style={{ color: "#1E3560" }}>
      {children}
      {optional ? (
        <span className="ml-1.5 font-normal" style={{ color: "rgba(43,48,58,0.45)" }}>(optional)</span>
      ) : (
        <span className="ml-0.5" style={{ color: "#4A9FD4" }}>*</span>
      )}
    </label>
  );
}

function Legend({ children }: { children: React.ReactNode }) {
  return (
    <legend className="text-[10px] font-bold tracking-[0.2em] uppercase mb-5 w-full" style={{ color: "#4A9FD4" }}>
      {children}
    </legend>
  );
}

export default function TutoringInquiryForm({ initialService }: { initialService?: TutoringService }) {
  const [service, setService] = useState<TutoringService | "">(initialService ?? "");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [school, setSchool] = useState("");
  const [stage, setStage] = useState("");
  const [areas, setAreas] = useState<string[]>([]);
  const [otherArea, setOtherArea] = useState("");
  const [details, setDetails] = useState("");
  const [format, setFormat] = useState<string>("either");
  const [availability, setAvailability] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const loading = status === "loading";

  function toggleArea(a: string) {
    setAreas(prev => (prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!service) return setError("Please choose tutoring or coaching.");
    if (!firstName.trim() || !lastName.trim()) return setError("Please enter your first and last name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Please enter a valid email address.");
    if (areas.length === 0 && !otherArea.trim() && !details.trim()) {
      return setError("Please tell us which areas you would like help with.");
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/tutoring/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service, firstName, lastName, email, phone, school, stage,
          areas, otherArea, details, format, availability, website,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
      document.getElementById("inquire")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center text-center py-14 px-6">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(74,159,212,0.12)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#4A9FD4" strokeWidth={2.5} aria-hidden className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-3" style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}>
          Inquiry received
        </h3>
        <p className="text-sm leading-relaxed max-w-sm" style={{ color: "#2B303A" }}>
          Thanks, {firstName.trim()}. We&apos;ll match you with the right instructor and be in touch within two
          business days to set up a time. We&apos;ve sent a copy to {email.trim()}. No payment is needed until your
          session is arranged.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Honeypot */}
      <div aria-hidden className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <label htmlFor="tutoring-website">Website</label>
        <input id="tutoring-website" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} />
      </div>

      <fieldset className="mb-8 border-none p-0">
        <Legend>What are you looking for?</Legend>
        <div className="grid sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Service">
          {TUTORING_SERVICES.map(s => {
            const on = service === s.value;
            return (
              <label
                key={s.value}
                className="cursor-pointer rounded-xl p-4 transition-all duration-150"
                style={{
                  border: on ? "1.5px solid #4A9FD4" : "1.5px solid rgba(30,53,96,0.12)",
                  backgroundColor: on ? "rgba(74,159,212,0.08)" : "#ffffff",
                }}
              >
                <input
                  type="radio"
                  name="service"
                  value={s.value}
                  checked={on}
                  onChange={() => setService(s.value)}
                  className="sr-only"
                  disabled={loading}
                />
                <span className="block text-sm font-bold" style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}>
                  {s.short}
                </span>
                <span className="block text-xs mt-1" style={{ color: "rgba(43,48,58,0.6)" }}>{s.audience}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mb-8 border-none p-0">
        <Legend>Your information</Legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          <div>
            <Label htmlFor="t-first">First Name</Label>
            <input id="t-first" className="wda-input" value={firstName} onChange={e => setFirstName(e.target.value)} disabled={loading} autoComplete="given-name" required />
          </div>
          <div>
            <Label htmlFor="t-last">Last Name</Label>
            <input id="t-last" className="wda-input" value={lastName} onChange={e => setLastName(e.target.value)} disabled={loading} autoComplete="family-name" required />
          </div>
          <div>
            <Label htmlFor="t-email">Email Address</Label>
            <input id="t-email" type="email" className="wda-input" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} autoComplete="email" required />
          </div>
          <div>
            <Label htmlFor="t-phone" optional>Phone Number</Label>
            <input id="t-phone" type="tel" className="wda-input" placeholder="(780) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} disabled={loading} autoComplete="tel" />
          </div>
          <div>
            <Label htmlFor="t-school" optional>School or Where You Trained</Label>
            <input id="t-school" className="wda-input" value={school} onChange={e => setSchool(e.target.value)} disabled={loading} />
          </div>
          <div>
            <Label htmlFor="t-stage" optional>Where You Are Now</Label>
            <input id="t-stage" className="wda-input" placeholder="e.g. second term, graduated June 2026" value={stage} onChange={e => setStage(e.target.value)} disabled={loading} />
          </div>
        </div>
      </fieldset>

      <fieldset className="mb-8 border-none p-0">
        <Legend>What would you like help with?</Legend>
        <p className="text-xs mb-4" style={{ color: "rgba(43,48,58,0.6)" }}>
          Choose any that apply. This helps us match you with the right instructor.
        </p>
        <div className="flex flex-wrap gap-2 mb-5">
          {TUTORING_AREAS.map(a => {
            const on = areas.includes(a);
            return (
              <button
                key={a}
                type="button"
                aria-pressed={on}
                onClick={() => toggleArea(a)}
                disabled={loading}
                className="rounded-full px-3.5 py-2 text-xs font-semibold transition-all duration-150"
                style={{
                  border: on ? "1.5px solid #4A9FD4" : "1.5px solid rgba(30,53,96,0.14)",
                  backgroundColor: on ? "#4A9FD4" : "#ffffff",
                  color: on ? "#ffffff" : "#1E3560",
                }}
              >
                {a}
              </button>
            );
          })}
        </div>
        <div className="mb-5">
          <Label htmlFor="t-other" optional>Something else</Label>
          <input id="t-other" className="wda-input" placeholder="e.g. charting, oral pathology" value={otherArea} onChange={e => setOtherArea(e.target.value)} disabled={loading} />
        </div>
        <div>
          <Label htmlFor="t-details" optional>Tell us a little more</Label>
          <textarea
            id="t-details"
            className="wda-input resize-none"
            rows={4}
            placeholder="e.g. I need help with anatomy before my next exam, and with study skills."
            value={details}
            onChange={e => setDetails(e.target.value)}
            disabled={loading}
          />
        </div>
      </fieldset>

      <fieldset className="mb-8 border-none p-0">
        <Legend>How and when</Legend>
        <div className="flex flex-wrap gap-2 mb-5" role="radiogroup" aria-label="Preferred format">
          {TUTORING_FORMATS.map(f => {
            const on = format === f.value;
            return (
              <label
                key={f.value}
                className="cursor-pointer rounded-lg px-4 py-2.5 text-xs font-semibold transition-all duration-150"
                style={{
                  border: on ? "1.5px solid #1E3560" : "1.5px solid rgba(30,53,96,0.14)",
                  backgroundColor: on ? "#1E3560" : "#ffffff",
                  color: on ? "#ffffff" : "#1E3560",
                }}
              >
                <input type="radio" name="format" value={f.value} checked={on} onChange={() => setFormat(f.value)} className="sr-only" disabled={loading} />
                {f.label}
              </label>
            );
          })}
        </div>
        <div>
          <Label htmlFor="t-avail" optional>Your availability</Label>
          <textarea
            id="t-avail"
            className="wda-input resize-none"
            rows={2}
            placeholder="e.g. weekday evenings, Saturday mornings"
            value={availability}
            onChange={e => setAvailability(e.target.value)}
            disabled={loading}
          />
        </div>
      </fieldset>

      {error && (
        <p className="text-xs font-medium mb-5 px-4 py-3 rounded-lg" style={{ backgroundColor: "rgba(220,38,38,0.07)", color: "rgb(185,28,28)" }} role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg py-3.5 text-sm font-bold text-white transition-all duration-200 flex items-center justify-center gap-2.5 bg-[#4A9FD4] hover:bg-[#1E3560] disabled:bg-[#1E3560] disabled:cursor-not-allowed"
      >
        {loading ? "Sending…" : "Send My Inquiry"}
      </button>
      <p className="text-xs mt-4 text-center" style={{ color: "rgba(43,48,58,0.5)" }}>
        No payment today. Once we&apos;ve matched you with an instructor and agreed on a time, we&apos;ll email you a
        secure payment link (${TUTORING_HOURLY_RATE}/hour).
      </p>
    </form>
  );
}
