"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ACCOMMODATION_OPTIONS,
  addDays,
  bookingPrice,
  bookingWindow,
  edmontonToday,
  formatDateLong,
  formatTimeRange,
  isDateBookable,
  type InvigilationSettings,
  type Slot,
} from "@/lib/invigilation/settings";

type FieldKey =
  | "firstName" | "lastName" | "email" | "phone"
  | "institution" | "examName" | "examFormat"
  | "instructorName" | "instructorEmail" | "accommodationNotes"
  | "date" | "startTime" | "policyAgreed";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Field({
  htmlFor, label, error, hint, required, children,
}: {
  htmlFor: string; label: string; error?: string; hint?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1E3560]">
        {label}
        {required && (
          <>
            <span className="text-[#E67E22] ml-0.5" aria-hidden>*</span>
            <span className="sr-only"> (required)</span>
          </>
        )}
        {hint && <span className="ml-1.5 font-normal normal-case tracking-normal text-[#2B303A]/45">{hint}</span>}
      </label>
      {children}
      {error && <p id={`${htmlFor}-err`} className="text-xs text-red-500" role="alert">{error}</p>}
    </div>
  );
}

function StepHeading({ n, title, sub }: { n: number; title: string; sub?: string }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
        style={{ backgroundColor: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}
        aria-hidden
      >
        {n}
      </span>
      <div>
        <h2 className="text-lg font-semibold text-[#1E3560] leading-7" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
          {title}
        </h2>
        {sub && <p className="text-sm text-[#2B303A]/55 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const card = "rounded-2xl bg-white p-6 sm:p-8";
const cardStyle = { border: "1.5px solid rgba(30,53,96,0.09)", boxShadow: "0 4px 24px rgba(30,53,96,0.05)" };

export default function InvigilationBookingForm({
  settings,
  cancelled,
}: {
  settings: InvigilationSettings;
  cancelled?: boolean;
}) {
  const today = edmontonToday();
  const { minDate, maxDate } = bookingWindow(settings, today);

  const [duration, setDuration] = useState<1 | 2>(2);
  const [needsAccommodation, setNeedsAccommodation] = useState(false);
  const [accommodations, setAccommodations] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [pickedTime, setStartTime] = useState("");
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [month, setMonth] = useState(minDate.slice(0, 7));

  const [fields, setFields] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    institution: "", examName: "", examFormat: "" as "" | "computer" | "paper",
    accommodationNotes: "",
    instructorName: "", instructorEmail: "", instructorPhone: "",
    notes: "",
  });
  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(cancelled ? "Checkout was cancelled — your booking wasn't completed. You can try again below." : "");

  const exclusive = needsAccommodation && accommodations.length > 0;
  const price = bookingPrice(settings, needsAccommodation ? accommodations : []);

  // Load slots whenever the date changes
  useEffect(() => {
    if (!date) return;
    let cancelledReq = false;
    fetch(`/api/invigilation/availability?date=${date}`)
      .then(r => r.json())
      .then(data => {
        if (cancelledReq) return;
        if (data.error) throw new Error(data.error);
        setSlots(data.slots);
      })
      .catch(() => !cancelledReq && setSlotsError("Couldn't load times for this date. Please try again."))
      .finally(() => !cancelledReq && setSlotsLoading(false));
    return () => { cancelledReq = true; };
  }, [date]);

  const slotAvailable = (s: Slot) => (exclusive ? s.exclusive[duration] : s.shared[duration]);

  // A chosen time only counts while it still fits the length/accommodation choice
  const pickedSlot = slots?.find(x => x.start === pickedTime);
  const startTime = pickedSlot && slotAvailable(pickedSlot) ? pickedTime : "";

  // ── Calendar ─────────────────────────────────────────────
  const calendarDays = useMemo(() => {
    const first = `${month}-01`;
    const startDow = new Date(`${first}T12:00:00Z`).getUTCDay();
    const days: (string | null)[] = Array(startDow).fill(null);
    for (let d = first; d.startsWith(month); d = addDays(d, 1)) days.push(d);
    return days;
  }, [month]);

  const monthLabel = new Date(`${month}-01T12:00:00Z`).toLocaleDateString("en-CA", { timeZone: "UTC", month: "long", year: "numeric" });
  const shiftMonth = (delta: number) => {
    const d = new Date(`${month}-01T12:00:00Z`);
    d.setUTCMonth(d.getUTCMonth() + delta);
    setMonth(d.toISOString().slice(0, 7));
  };
  const canPrev = month > minDate.slice(0, 7);
  const canNext = month < maxDate.slice(0, 7);

  function set(key: keyof typeof fields, value: string) {
    setFields(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  function toggleAccommodation(value: string) {
    setAccommodations(prev => (prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]));
    setErrors(prev => ({ ...prev, accommodationNotes: undefined }));
  }

  function validate(): boolean {
    const e: Partial<Record<FieldKey, string>> = {};
    if (!date) e.date = "Please choose a date.";
    else if (!startTime) e.startTime = "Please choose a start time.";
    if (!fields.firstName.trim()) e.firstName = "First name is required.";
    if (!fields.lastName.trim()) e.lastName = "Last name is required.";
    if (!EMAIL_RE.test(fields.email.trim())) e.email = "Please enter a valid email address.";
    if (!fields.phone.trim()) e.phone = "Phone number is required.";
    if (!fields.institution.trim()) e.institution = "Institution is required.";
    if (!fields.examName.trim()) e.examName = "Exam name is required.";
    if (!fields.examFormat) e.examFormat = "Please choose the exam format.";
    if (!fields.instructorName.trim()) e.instructorName = "Instructor or exam centre contact is required.";
    if (!EMAIL_RE.test(fields.instructorEmail.trim())) e.instructorEmail = "Please enter a valid email address.";
    if (needsAccommodation && accommodations.includes("other") && !fields.accommodationNotes.trim()) {
      e.accommodationNotes = "Please describe the accommodation you need.";
    }
    if (!policyAgreed) e.policyAgreed = "Please confirm you have read the invigilation policies.";
    setErrors(e);
    const firstKey = Object.keys(e)[0];
    if (firstKey) {
      const el = document.getElementById(`inv-${firstKey}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/invigilation/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          date,
          startTime,
          durationHours: duration,
          accommodations: needsAccommodation ? accommodations : [],
          accommodationNotes: needsAccommodation ? fields.accommodationNotes : "",
          policyAgreed,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        if (res.status === 409) {
          setStartTime("");
          fetch(`/api/invigilation/availability?date=${date}`).then(r => r.json()).then(d => d.slots && setSlots(d.slots));
        }
        setSubmitting(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setSubmitError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (!settings.bookingsOpen) {
    return (
      <div className={card} style={cardStyle}>
        <p className="text-[#1E3560] font-semibold mb-2">Online booking is paused right now.</p>
        <p className="text-sm text-[#2B303A]/70">
          To book an exam, please email <a className="text-[#4A9FD4] font-semibold" href="mailto:info@westerndentalacademy.com">info@westerndentalacademy.com</a> or call 780-499-9153.
        </p>
      </div>
    );
  }

  const inputCls = (k: FieldKey) => `wda-input${errors[k] ? " invalid" : ""}`;
  const aria = (k: FieldKey) => ({
    "aria-invalid": !!errors[k] || undefined,
    "aria-describedby": errors[k] ? `inv-${k}-err` : undefined,
  });

  return (
    <form onSubmit={handleSubmit} noValidate className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
      <div className="space-y-6 min-w-0">
        {/* 1 — Session */}
        <div className={card} style={cardStyle}>
          <StepHeading n={1} title="Your session" sub={`$${settings.sessionPrice} per session, whether you book 1 or 2 hours.`} />
          <div className="grid grid-cols-2 gap-3 mb-6" role="radiogroup" aria-label="Session length">
            {([1, 2] as const).map(h => (
              <button
                key={h}
                type="button"
                role="radio"
                aria-checked={duration === h}
                onClick={() => setDuration(h)}
                className="rounded-xl px-4 py-3.5 text-left transition-all duration-200"
                style={{
                  border: duration === h ? "2px solid #4A9FD4" : "1.5px solid rgba(30,53,96,0.12)",
                  backgroundColor: duration === h ? "rgba(74,159,212,0.07)" : "#fff",
                }}
              >
                <span className="block text-sm font-bold text-[#1E3560]" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
                  {h} hour{h > 1 ? "s" : ""}
                </span>
                <span className="block text-xs text-[#2B303A]/55 mt-0.5">{h === 1 ? "Shorter quizzes and tests" : "Most midterms and finals"}</span>
              </button>
            ))}
          </div>

          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1E3560] mb-3">
              Do you need any accommodations?
            </legend>
            <div className="flex flex-wrap gap-3 mb-4">
              {[false, true].map(v => (
                <label
                  key={String(v)}
                  className="flex items-center gap-2 rounded-lg px-4 py-2.5 cursor-pointer text-sm transition-colors"
                  style={{
                    border: needsAccommodation === v ? "2px solid #4A9FD4" : "1.5px solid rgba(30,53,96,0.12)",
                    backgroundColor: needsAccommodation === v ? "rgba(74,159,212,0.07)" : "#fff",
                  }}
                >
                  <input
                    type="radio"
                    name="needsAccommodation"
                    checked={needsAccommodation === v}
                    onChange={() => setNeedsAccommodation(v)}
                    className="accent-[#4A9FD4]"
                  />
                  <span className="text-[#1E3560] font-semibold">{v ? "Yes" : "No"}</span>
                </label>
              ))}
            </div>
            {needsAccommodation && (
              <div className="rounded-xl p-4 space-y-4" style={{ backgroundColor: "#F4F7F9" }}>
                <p className="text-xs leading-relaxed text-[#2B303A]/70">
                  Students with accommodations write alone, so you&apos;ll have the room to yourself.
                  {settings.verbalReaderPrice > 0 && <> A verbal exam reader adds <strong>${settings.verbalReaderPrice}</strong>.</>}
                </p>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {ACCOMMODATION_OPTIONS.map(o => (
                    <label key={o.value} className="flex items-center gap-2.5 text-sm text-[#2B303A] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={accommodations.includes(o.value)}
                        onChange={() => toggleAccommodation(o.value)}
                        className="w-4 h-4 accent-[#4A9FD4]"
                      />
                      {o.label}
                      {o.value === "verbal-reader" && settings.verbalReaderPrice > 0 && (
                        <span className="text-xs text-[#E67E22] font-semibold">+${settings.verbalReaderPrice}</span>
                      )}
                    </label>
                  ))}
                </div>
                <Field
                  htmlFor="inv-accommodationNotes"
                  label="Details"
                  hint={accommodations.includes("other") ? undefined : "Optional"}
                  required={accommodations.includes("other")}
                  error={errors.accommodationNotes}
                >
                  <textarea
                    id="inv-accommodationNotes"
                    rows={2}
                    placeholder="e.g. time and a half, documentation from your institution…"
                    value={fields.accommodationNotes}
                    onChange={e => set("accommodationNotes", e.target.value)}
                    className={`${inputCls("accommodationNotes")} resize-none`}
                    {...aria("accommodationNotes")}
                  />
                </Field>
              </div>
            )}
          </fieldset>
        </div>

        {/* 2 — Date & time */}
        <div className={card} style={cardStyle}>
          <StepHeading
            n={2}
            title="Pick a date and time"
            sub={`Exams must be booked at least ${settings.minDaysNotice} days ahead. The earliest date is ${formatDateLong(minDate)}.`}
          />
          <div className="grid md:grid-cols-2 gap-6">
            <div id="inv-date">
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => shiftMonth(-1)}
                  disabled={!canPrev}
                  aria-label="Previous month"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#1E3560] hover:bg-[#F4F7F9] disabled:opacity-25 disabled:hover:bg-transparent"
                >
                  ‹
                </button>
                <p className="text-sm font-bold text-[#1E3560]" style={{ fontFamily: "var(--font-montserrat), sans-serif" }} aria-live="polite">
                  {monthLabel}
                </p>
                <button
                  type="button"
                  onClick={() => shiftMonth(1)}
                  disabled={!canNext}
                  aria-label="Next month"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#1E3560] hover:bg-[#F4F7F9] disabled:opacity-25 disabled:hover:bg-transparent"
                >
                  ›
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {WEEKDAYS.map(w => (
                  <span key={w} className="text-[0.65rem] font-semibold uppercase tracking-wider text-[#2B303A]/40 pb-1">{w}</span>
                ))}
                {calendarDays.map((d, i) => {
                  if (!d) return <span key={`b${i}`} />;
                  const bookable = isDateBookable(settings, d, today);
                  const selected = d === date;
                  return (
                    <button
                      key={d}
                      type="button"
                      disabled={!bookable}
                      onClick={() => {
                        if (d === date) return;
                        setDate(d);
                        setStartTime("");
                        setSlots(null);
                        setSlotsLoading(true);
                        setSlotsError("");
                        setErrors(prev => ({ ...prev, date: undefined, startTime: undefined }));
                      }}
                      aria-pressed={selected}
                      aria-label={formatDateLong(d) + (bookable ? "" : " (unavailable)")}
                      className="aspect-square rounded-lg text-sm transition-colors duration-150 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: selected ? "#1E3560" : bookable ? "rgba(74,159,212,0.08)" : "transparent",
                        color: selected ? "#fff" : bookable ? "#1E3560" : "rgba(43,48,58,0.25)",
                        fontWeight: bookable ? 600 : 400,
                      }}
                    >
                      {Number(d.slice(8))}
                    </button>
                  );
                })}
              </div>
              {errors.date && <p id="inv-date-err" className="text-xs text-red-500 mt-2" role="alert">{errors.date}</p>}
            </div>

            <div id="inv-startTime">
              {!date ? (
                <div className="h-full min-h-[200px] rounded-xl flex items-center justify-center text-center px-6 text-sm text-[#2B303A]/45" style={{ backgroundColor: "#F4F7F9" }}>
                  Choose a highlighted date to see available start times.
                </div>
              ) : (
                <>
                  <p className="text-sm font-semibold text-[#1E3560] mb-3">{formatDateLong(date)}</p>
                  {slotsLoading && <p className="text-sm text-[#2B303A]/50">Loading times…</p>}
                  {slotsError && <p className="text-sm text-red-500">{slotsError}</p>}
                  {slots && !slotsLoading && (() => {
                    const open = slots.filter(slotAvailable);
                    if (!open.length) {
                      return (
                        <p className="text-sm text-[#2B303A]/60">
                          No {duration}-hour {exclusive ? "private " : ""}times left on this day. Try {duration === 2 ? "a 1-hour session or " : ""}another date.
                        </p>
                      );
                    }
                    return (
                      <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1" role="radiogroup" aria-label="Start time">
                        {slots.map(s => {
                          const ok = slotAvailable(s);
                          if (!ok) return null;
                          const selected = s.start === startTime;
                          return (
                            <button
                              key={s.start}
                              type="button"
                              role="radio"
                              aria-checked={selected}
                              onClick={() => { setStartTime(s.start); setErrors(prev => ({ ...prev, startTime: undefined })); }}
                              className="flex items-center justify-between rounded-lg px-4 py-2.5 text-sm transition-colors duration-150"
                              style={{
                                border: selected ? "2px solid #4A9FD4" : "1.5px solid rgba(30,53,96,0.12)",
                                backgroundColor: selected ? "rgba(74,159,212,0.08)" : "#fff",
                              }}
                            >
                              <span className="font-semibold text-[#1E3560]">{formatTimeRange(s.start, duration)}</span>
                              <span className="text-xs text-[#2B303A]/50">
                                {exclusive ? "Private room" : `${s.seatsLeft} seat${s.seatsLeft === 1 ? "" : "s"} left`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
                  {errors.startTime && <p id="inv-startTime-err" className="text-xs text-red-500 mt-2" role="alert">{errors.startTime}</p>}
                </>
              )}
            </div>
          </div>
        </div>

        {/* 3 — Student */}
        <div className={card} style={cardStyle}>
          <StepHeading n={3} title="Your details" />
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field htmlFor="inv-firstName" label="First Name" required error={errors.firstName}>
                <input id="inv-firstName" type="text" autoComplete="given-name" value={fields.firstName} onChange={e => set("firstName", e.target.value)} className={inputCls("firstName")} {...aria("firstName")} />
              </Field>
              <Field htmlFor="inv-lastName" label="Last Name" required error={errors.lastName}>
                <input id="inv-lastName" type="text" autoComplete="family-name" value={fields.lastName} onChange={e => set("lastName", e.target.value)} className={inputCls("lastName")} {...aria("lastName")} />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field htmlFor="inv-email" label="Email" required error={errors.email}>
                <input id="inv-email" type="email" autoComplete="email" value={fields.email} onChange={e => set("email", e.target.value)} className={inputCls("email")} {...aria("email")} />
              </Field>
              <Field htmlFor="inv-phone" label="Phone" required error={errors.phone}>
                <input id="inv-phone" type="tel" autoComplete="tel" placeholder="(780) 000-0000" value={fields.phone} onChange={e => set("phone", e.target.value)} className={inputCls("phone")} {...aria("phone")} />
              </Field>
            </div>
          </div>
        </div>

        {/* 4 — Exam & instructor */}
        <div className={card} style={cardStyle}>
          <StepHeading n={4} title="Exam and instructor" sub="We'll email your instructor or exam centre to request the exam materials." />
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field htmlFor="inv-institution" label="Institution / Exam Provider" required error={errors.institution}>
                <input id="inv-institution" type="text" placeholder="e.g. Athabasca University" value={fields.institution} onChange={e => set("institution", e.target.value)} className={inputCls("institution")} {...aria("institution")} />
              </Field>
              <Field htmlFor="inv-examName" label="Course / Exam Name" required error={errors.examName}>
                <input id="inv-examName" type="text" placeholder="e.g. BIOL 230 Final" value={fields.examName} onChange={e => set("examName", e.target.value)} className={inputCls("examName")} {...aria("examName")} />
              </Field>
            </div>
            <Field htmlFor="inv-examFormat" label="Exam Format" required error={errors.examFormat}>
              <select id="inv-examFormat" value={fields.examFormat} onChange={e => set("examFormat", e.target.value)} className={inputCls("examFormat")} {...aria("examFormat")}>
                <option value="">Select…</option>
                <option value="computer">Computer-based (bring your own device; backups available)</option>
                <option value="paper">Paper</option>
              </select>
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field htmlFor="inv-instructorName" label="Instructor / Exam Centre Contact" required error={errors.instructorName}>
                <input id="inv-instructorName" type="text" value={fields.instructorName} onChange={e => set("instructorName", e.target.value)} className={inputCls("instructorName")} {...aria("instructorName")} />
              </Field>
              <Field htmlFor="inv-instructorEmail" label="Instructor Email" required error={errors.instructorEmail}>
                <input id="inv-instructorEmail" type="email" value={fields.instructorEmail} onChange={e => set("instructorEmail", e.target.value)} className={inputCls("instructorEmail")} {...aria("instructorEmail")} />
              </Field>
            </div>
            <Field htmlFor="inv-instructorPhone" label="Instructor Phone" hint="Optional">
              <input id="inv-instructorPhone" type="tel" value={fields.instructorPhone} onChange={e => set("instructorPhone", e.target.value)} className="wda-input sm:max-w-[280px]" />
            </Field>
            <Field htmlFor="inv-notes" label="Anything else we should know?" hint="Optional">
              <textarea id="inv-notes" rows={3} value={fields.notes} onChange={e => set("notes", e.target.value)} className="wda-input resize-none" />
            </Field>
          </div>
        </div>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-28">
        <div className={card} style={cardStyle}>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#4A9FD4] mb-4" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
            Booking Summary
          </p>
          <dl className="space-y-2.5 text-sm mb-5">
            <div className="flex justify-between gap-3">
              <dt className="text-[#2B303A]/55">Date</dt>
              <dd className="text-right font-semibold text-[#1E3560]">{date ? formatDateLong(date) : "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[#2B303A]/55">Time</dt>
              <dd className="text-right font-semibold text-[#1E3560]">{startTime ? formatTimeRange(startTime, duration) : `— (${duration} hr)`}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[#2B303A]/55">Room</dt>
              <dd className="text-right font-semibold text-[#1E3560]">{exclusive ? "Private" : `Shared (up to ${settings.maxStudentsPerHour})`}</dd>
            </div>
          </dl>
          <div className="border-t pt-4 space-y-2 text-sm" style={{ borderColor: "rgba(30,53,96,0.08)" }}>
            <div className="flex justify-between"><span className="text-[#2B303A]/65">Invigilation</span><span>${settings.sessionPrice.toFixed(2)}</span></div>
            {needsAccommodation && accommodations.includes("verbal-reader") && settings.verbalReaderPrice > 0 && (
              <div className="flex justify-between"><span className="text-[#2B303A]/65">Verbal exam reader</span><span>${settings.verbalReaderPrice.toFixed(2)}</span></div>
            )}
            <div className="flex justify-between font-bold text-[#1E3560] pt-1">
              <span>Total</span><span>${price.toFixed(2)} CAD</span>
            </div>
            <p className="text-xs text-[#2B303A]/45">Plus card processing fee (3.3% + $0.30) at checkout.</p>
          </div>

          <label className="flex items-start gap-2.5 mt-5 text-xs leading-relaxed text-[#2B303A]/75 cursor-pointer" id="inv-policyAgreed">
            <input
              type="checkbox"
              checked={policyAgreed}
              onChange={e => { setPolicyAgreed(e.target.checked); setErrors(prev => ({ ...prev, policyAgreed: undefined })); }}
              className="mt-0.5 w-4 h-4 accent-[#4A9FD4] shrink-0"
            />
            <span>
              I&apos;ve read the <a href="#policies" className="font-semibold text-[#4A9FD4] hover:text-[#1E3560]">invigilation policies</a> and
              will ask my instructor to send the exam materials at least 48 hours before my exam.
            </span>
          </label>
          {errors.policyAgreed && <p className="text-xs text-red-500 mt-1.5" role="alert">{errors.policyAgreed}</p>}

          {submitError && (
            <p className="mt-4 rounded-lg px-3 py-2.5 text-xs" role="alert" style={{ backgroundColor: "rgba(239,68,68,0.07)", color: "#b91c1c" }}>
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
            className="mt-5 w-full rounded-lg px-6 py-3.5 text-sm font-bold text-white transition-colors duration-200 bg-[#E67E22] hover:bg-[#CF6D17] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white shrink-0" style={{ animation: "spin 0.75s linear infinite" }} aria-hidden />
                Starting checkout…
              </>
            ) : (
              "Continue to Payment"
            )}
          </button>
          <p className="text-[0.7rem] text-center text-[#2B303A]/40 mt-3">Secure checkout by Stripe</p>
        </div>
      </aside>
    </form>
  );
}
