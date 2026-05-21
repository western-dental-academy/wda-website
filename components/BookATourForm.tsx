"use client";

import { useState } from "react";

type RequiredField = "firstName" | "lastName" | "email" | "phone" | "date" | "time" | "attendees";

const TIME_OPTIONS = [
  { value: "morning", label: "Morning (9:00 am – 12:00 pm)" },
  { value: "afternoon", label: "Afternoon (12:00 pm – 3:00 pm)" },
  { value: "late_afternoon", label: "Late Afternoon (3:00 pm – 5:00 pm)" },
];

function Field({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1E3560]">
        {label}
        {required && <span className="text-[#E67E22] ml-0.5">*</span>}
        {hint && (
          <span className="ml-1.5 font-normal normal-case tracking-normal text-[#2B303A]/45">
            {hint}
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function BookATourForm() {
  const [fields, setFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    attendees: "1",
    questions: "",
  });
  const [errors, setErrors] = useState<Partial<Record<RequiredField, string>>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  function set(key: string, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<Record<RequiredField, string>> = {};
    if (!fields.firstName.trim()) e.firstName = "First name is required.";
    if (!fields.lastName.trim()) e.lastName = "Last name is required.";
    if (!fields.email.trim()) {
      e.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
      e.email = "Please enter a valid email address.";
    }
    if (!fields.phone.trim()) e.phone = "Phone number is required.";
    if (!fields.date) {
      e.date = "Please select a preferred tour date.";
    } else if (fields.date < minDate) {
      e.date = "Please select a future date.";
    }
    if (!fields.time) e.time = "Please select a preferred time slot.";
    if (!fields.attendees || Number(fields.attendees) < 1) {
      e.attendees = "At least 1 attendee is required.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 1000));
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="py-14 text-center">
        <div
          className="w-14 h-14 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ backgroundColor: "rgba(74,159,212,0.1)" }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4A9FD4"
            strokeWidth={2.25}
            className="w-7 h-7"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3
          className="text-xl font-bold text-[#1E3560] mb-2"
          style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
        >
          Tour Request Received
        </h3>
        <p className="text-sm leading-relaxed text-[#2B303A]/65 max-w-sm mx-auto mb-8">
          Thanks, {fields.firstName}! We&apos;ll confirm your visit details at{" "}
          <span className="font-semibold text-[#2B303A]">{fields.email}</span> within
          one business day.
        </p>
        <button
          onClick={() => {
            setStatus("idle");
            setFields({
              firstName: "",
              lastName: "",
              email: "",
              phone: "",
              date: "",
              time: "",
              attendees: "1",
              questions: "",
            });
          }}
          className="text-sm font-semibold text-[#4A9FD4] hover:text-[#1E3560] transition-colors duration-200"
        >
          Book another tour →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Names */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="First Name" error={errors.firstName} required>
          <input
            type="text"
            placeholder="Jane"
            value={fields.firstName}
            onChange={(e) => set("firstName", e.target.value)}
            className={`wda-input${errors.firstName ? " invalid" : ""}`}
          />
        </Field>
        <Field label="Last Name" error={errors.lastName} required>
          <input
            type="text"
            placeholder="Smith"
            value={fields.lastName}
            onChange={(e) => set("lastName", e.target.value)}
            className={`wda-input${errors.lastName ? " invalid" : ""}`}
          />
        </Field>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Email Address" error={errors.email} required>
          <input
            type="email"
            autoComplete="email"
            placeholder="jane@example.com"
            value={fields.email}
            onChange={(e) => set("email", e.target.value)}
            className={`wda-input${errors.email ? " invalid" : ""}`}
          />
        </Field>
        <Field label="Phone Number" error={errors.phone} required>
          <input
            type="tel"
            autoComplete="tel"
            placeholder="(780) 000-0000"
            value={fields.phone}
            onChange={(e) => set("phone", e.target.value)}
            className={`wda-input${errors.phone ? " invalid" : ""}`}
          />
        </Field>
      </div>

      {/* Date + Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Preferred Tour Date" error={errors.date} required>
          <input
            type="date"
            min={minDate}
            value={fields.date}
            onChange={(e) => set("date", e.target.value)}
            className={`wda-input${errors.date ? " invalid" : ""}`}
          />
        </Field>
        <Field label="Preferred Tour Time" error={errors.time} required>
          <select
            value={fields.time}
            onChange={(e) => set("time", e.target.value)}
            className={`wda-input${errors.time ? " invalid" : ""}`}
          >
            <option value="">Select a time slot…</option>
            {TIME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Attendees */}
      <Field label="Number of Attendees" error={errors.attendees} required>
        <input
          type="number"
          min={1}
          max={10}
          value={fields.attendees}
          onChange={(e) => set("attendees", e.target.value)}
          className={`wda-input${errors.attendees ? " invalid" : ""} sm:max-w-[200px]`}
        />
      </Field>

      {/* Questions */}
      <Field label="Questions or Special Requests" hint="Optional">
        <textarea
          placeholder="Anything you'd like us to know before your visit…"
          rows={4}
          value={fields.questions}
          onChange={(e) => set("questions", e.target.value)}
          className="wda-input resize-none"
        />
      </Field>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg px-8 py-3.5 text-sm font-bold text-white transition-colors duration-200 bg-[#E67E22] hover:bg-[#CF6D17] disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2.5"
        >
          {status === "loading" ? (
            <>
              <span
                className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white shrink-0"
                style={{ animation: "spin 0.75s linear infinite" }}
                aria-hidden
              />
              Submitting…
            </>
          ) : (
            "Book My Tour"
          )}
        </button>
      </div>
    </form>
  );
}
