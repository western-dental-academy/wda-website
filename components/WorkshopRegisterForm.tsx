"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface RegistrantForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dentalBackground: string;
  cadaNumber: string;
  pronouns: string;
  customPronouns: string;
  mediaConsent: boolean;
  feedbackShareConsent: boolean;
  workshop: string;
  workshopDateId: string;
  dietaryRestrictions: string;
}

interface WorkshopDate {
  id: string;
  workshop: string;
  date: string;
  capacity: number;
  registered: number;
  isFull: boolean;
  category: string;
  hasVirtualOption?: boolean;
  virtualPrice?: number;
  includesFood?: boolean;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const WORKSHOP_PRICES: Record<string, number> = {
  "Ergonomics in Healthcare: Hands, Feet, and Spine": 40,
  "Ergonomics in Healthcare: Hips and Hamstrings": 40,
  "Ergonomics in Healthcare: Neck and Shoulders": 40,
  "National Board Guided Practice Workshop": 750,
  "Renewal Wellness": 129,
};

const WORKSHOP_OPTIONS = Object.keys(WORKSHOP_PRICES).map(label => ({
  label,
  price: WORKSHOP_PRICES[label],
}));

const PRONOUNS_OPTIONS = [
  "She/Her", "He/Him", "They/Them", "She/They", "He/They",
  "Prefer not to say", "Prefer to self-describe",
] as const;

const INITIAL_FORM: RegistrantForm = {
  firstName: "", lastName: "", email: "", phone: "",
  dentalBackground: "", cadaNumber: "",
  pronouns: "", customPronouns: "",
  mediaConsent: false, feedbackShareConsent: false,
  workshop: "", workshopDateId: "", dietaryRestrictions: "",
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatLong(iso: string): string {
  return new Date(iso).toLocaleString("en-CA", {
    timeZone: "America/Edmonton",
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

function formatShort(iso: string): string {
  const date = new Date(iso).toLocaleDateString("en-CA", {
    timeZone: "America/Edmonton", month: "short", day: "numeric", year: "numeric",
  });
  const time = new Date(iso).toLocaleTimeString("en-CA", {
    timeZone: "America/Edmonton", hour: "numeric", minute: "2-digit",
  }).replace("a.m.", "AM").replace("p.m.", "PM");
  return `${date} — ${time}`;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function FieldLabel({ htmlFor, children, optional }: { htmlFor: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold mb-2" style={{ color: "#1E3560" }}>
      {children}
      {optional
        ? <span className="ml-1.5 font-normal" style={{ color: "rgba(43,48,58,0.45)" }}>(optional)</span>
        : <><span className="ml-0.5" style={{ color: "#4A9FD4" }} aria-hidden>*</span><span className="sr-only"> (required)</span></>
      }
    </label>
  );
}

function FieldError({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return <p id={id} className="mt-1.5 text-xs font-medium" style={{ color: "#dc2626" }} role="alert">{msg}</p>;
}

const Chevron = () => (
  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "rgba(30,53,96,0.4)" }} aria-hidden>
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" clipRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06z" />
    </svg>
  </span>
);

function Spinner() {
  return (
    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white shrink-0" style={{ animation: "spin 0.75s linear infinite" }} aria-hidden />
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

function WorkshopRegisterFormInner() {
  const searchParams = useSearchParams();
  const preselectedOffering = searchParams.get("offering");
  const preselectedDateId = searchParams.get("dateId");
  const preselectedDelivery = searchParams.get("delivery") as 'in-person' | 'virtual' | null;

  const [form, setForm] = useState<RegistrantForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [eligibilityConfirmed, setEligibilityConfirmed] = useState(false);
  const [checkingCapacity, setCheckingCapacity] = useState(false);
  const [capacityError, setCapacityError] = useState("");
  const [waitlistMode, setWaitlistMode] = useState(false);
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [waitlistError, setWaitlistError] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [workshopDates, setWorkshopDates] = useState<WorkshopDate[]>([]);
  const [datesLoading, setDatesLoading] = useState(true);
  const [datesError, setDatesError] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'in-person' | 'virtual'>('in-person');

  useEffect(() => {
    if (didAutoselect.current) return;
    setDeliveryMethod('in-person');
  }, [form.workshopDateId]);

  useEffect(() => {
    fetch("/api/workshops/dates")
      .then(r => r.json())
      .then((dates: WorkshopDate[]) => setWorkshopDates(Array.isArray(dates) ? dates : []))
      .catch(() => setDatesError(true))
      .finally(() => setDatesLoading(false));
  }, []);

  const didAutoselect = useRef(false);
  useEffect(() => {
    if (didAutoselect.current || !preselectedOffering || datesLoading) return;
    const match = WORKSHOP_OPTIONS.find(o => o.label === preselectedOffering);
    if (!match) return;
    didAutoselect.current = true;
    setSelectedCategory("event");
    const now = new Date();
    const candidateDates = workshopDates.filter(d =>
      d.workshop === preselectedOffering &&
      (d.category === "workshop" || d.category === "guest-speaker") &&
      new Date(d.date) > now
    );
    const targeted = preselectedDateId
      ? candidateDates.find(d => d.id === preselectedDateId)
      : null;
    const firstAvailable = candidateDates
      .filter(d => !d.isFull)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    const selectedDate = targeted ?? firstAvailable;
    setForm(f => ({ ...f, workshop: preselectedOffering, workshopDateId: selectedDate?.id ?? "" }));
    if (preselectedDelivery === 'virtual' && selectedDate?.hasVirtualOption) {
      setDeliveryMethod('virtual');
    } else if (preselectedDelivery === 'in-person') {
      setDeliveryMethod('in-person');
    }
  }, [workshopDates, datesLoading, preselectedOffering, preselectedDateId, preselectedDelivery]);

  function setField<K extends keyof RegistrantForm>(key: K, value: RegistrantForm[K]) {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined as unknown as string }));
    if (capacityError) setCapacityError("");
    if (waitlistMode) setWaitlistMode(false);
  }

  // ── Derived values ──────────────────────────────────────────────────────────

  const workshopsForCategory = selectedCategory
    ? WORKSHOP_OPTIONS.filter(opt =>
        workshopDates.some(d => {
          const catMatch = selectedCategory === 'event'
            ? (d.category === 'workshop' || d.category === 'guest-speaker')
            : d.category === selectedCategory;
          return catMatch && d.workshop === opt.label;
        })
      )
    : [];

  const availableDates = workshopDates.filter(d => {
    const catMatch = selectedCategory === 'event'
      ? (d.category === 'workshop' || d.category === 'guest-speaker')
      : d.category === selectedCategory;
    return d.workshop === form.workshop && catMatch;
  });

  const hasDates = availableDates.length > 0;
  const isNationalBoard = form.workshop.includes("National Board");
  const selectedDateObj = workshopDates.find(d => d.id === form.workshopDateId);

  // ── Validate ────────────────────────────────────────────────────────────────

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.firstName.trim())        e.firstName        = "First name is required.";
    if (!form.lastName.trim())         e.lastName         = "Last name is required.";
    if (!form.email.trim())            e.email            = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (!form.dentalBackground.trim()) e.dentalBackground = "Please briefly describe your dental background.";
    if (!form.workshop)                e.workshop         = "Please select a workshop.";
    if (form.workshop && hasDates && !form.workshopDateId) e.workshopDateId = "Please select a date.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Register ────────────────────────────────────────────────────────────────

  async function handleRegister() {
    if (!selectedCategory) { setCategoryError("Please select a category."); return; }
    setCategoryError("");
    if (!validate()) return;
    if (isNationalBoard && !eligibilityConfirmed) {
      setErrors(e => ({ ...e, eligibility: "Please confirm your eligibility to continue." }));
      return;
    }

    // Capacity check
    if (form.workshopDateId) {
      setCheckingCapacity(true);
      setCapacityError("");
      setWaitlistMode(false);
      try {
        const res = await fetch(`/api/workshops/check-capacity?workshopDateId=${form.workshopDateId}&deliveryMethod=${deliveryMethod}`);
        const data = await res.json();
        const { available, unlimited } = data as { available: number | null; unlimited: boolean };
        if (!unlimited && (available ?? 0) <= 0) {
          setWaitlistMode(true);
          setCheckingCapacity(false);
          return;
        }
      } catch {
        // Server will recheck at checkout
      } finally {
        setCheckingCapacity(false);
      }
    }

    // Build payload
    const basePrice = WORKSHOP_PRICES[form.workshop] ?? 0;
    const price = deliveryMethod === 'virtual' && selectedDateObj?.virtualPrice != null
      ? selectedDateObj.virtualPrice
      : basePrice;
    const pronounsResolved = form.pronouns === "Prefer to self-describe"
      ? form.customPronouns.trim()
      : form.pronouns;

    const item = {
      id: Math.random().toString(36).slice(2, 9),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      workshopDateId: form.workshopDateId,
      workshopName: form.workshop,
      workshopDate: selectedDateObj ? formatShort(selectedDateObj.date) : "TBD",
      workshopDateISO: selectedDateObj?.date ?? "",
      workshopDateFormatted: selectedDateObj ? formatLong(selectedDateObj.date) : "Contact us for available dates",
      price,
      dentalBackground: form.dentalBackground.trim(),
      cadaNumber: form.cadaNumber.trim() || undefined,
      pronouns: pronounsResolved || undefined,
      mediaConsent: form.mediaConsent,
      feedbackShareConsent: form.feedbackShareConsent,
      isPrimary: true,
      deliveryMethod,
      dietaryRestrictions: (deliveryMethod === 'in-person' && selectedDateObj?.includesFood && form.dietaryRestrictions.trim())
        ? form.dietaryRestrictions.trim()
        : undefined,
    };

    // Submit to checkout
    setRedirecting(true);
    setCheckoutError("");
    try {
      const res = await fetch("/api/workshops/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [item] }),
      });
      const result = await res.json();
      if (res.status === 409) {
        setCheckoutError(result.message ?? "A registration already exists for this email and date.");
        setRedirecting(false);
        return;
      }
      if (!res.ok || !result.url) throw new Error(result.error ?? "Something went wrong.");
      window.location.href = result.url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setRedirecting(false);
    }
  }

  // ── Waitlist ────────────────────────────────────────────────────────────────

  async function handleWaitlist() {
    setWaitlistSubmitting(true);
    setWaitlistError("");
    try {
      const res = await fetch("/api/workshops/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          workshop: form.workshop,
          workshopDateId: form.workshopDateId,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Something went wrong.");
      setWaitlistSuccess(true);
      setTimeout(() => {
        setForm(INITIAL_FORM);
        setSelectedCategory("");
        setWaitlistMode(false);
        setWaitlistSuccess(false);
      }, 3000);
    } catch (err) {
      setWaitlistError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setWaitlistSubmitting(false);
    }
  }

  // ─── JSX ─────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className="rounded-2xl p-7 sm:p-9"
        style={{
          backgroundColor: "#ffffff",
          border: "1.5px solid rgba(30,53,96,0.09)",
          boxShadow: "0 4px 24px rgba(30,53,96,0.06), 0 1px 4px rgba(30,53,96,0.04)",
        }}
      >
        {/* Form header */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-1" style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}>
            Your Details
          </h2>
          <p className="text-sm" style={{ color: "rgba(43,48,58,0.55)" }}>
            Fill in your information and select an event. You'll be taken to secure checkout after submitting.
          </p>
        </div>

        <div className="flex flex-col gap-5">

          {/* ── Event selection ─────────────────────────────────────────────── */}
          <div className="pb-5 border-b" style={{ borderColor: "rgba(30,53,96,0.08)" }}>
            <p className="text-xs font-bold mb-4 uppercase tracking-[0.12em]" style={{ color: "rgba(30,53,96,0.4)", fontFamily: "var(--font-montserrat), sans-serif" }}>
              Event Selection
            </p>

            {/* Category */}
            <div className="mb-5">
              <p className="block text-xs font-semibold mb-3" style={{ color: "#1E3560" }}>
                Category<span className="ml-0.5" style={{ color: "#4A9FD4" }} aria-hidden>*</span>
              </p>
              {categoryError && (
                <p className="text-xs font-medium mb-3" style={{ color: "#dc2626" }} role="alert">{categoryError}</p>
              )}
              <div className="relative">
                <select
                  id="reg-category"
                  value={selectedCategory}
                  onChange={e => {
                    const val = e.target.value;
                    if (selectedCategory !== val) {
                      setSelectedCategory(val);
                      setField("workshop", "");
                      setField("workshopDateId", "");
                      setCategoryError("");
                      setErrors(prev => ({ ...prev, workshop: undefined as unknown as string, workshopDateId: undefined as unknown as string }));
                      setCapacityError("");
                      setWaitlistMode(false);
                    }
                  }}
                  className="wda-input pr-10 cursor-pointer"
                >
                  <option value="">Select a category</option>
                  <option value="event">Events</option>
                  <option value="course">Courses</option>
                </select>
                <Chevron />
              </div>
            </div>

            {/* Offering dropdown */}
            {selectedCategory && (
              <div className="mb-5">
                <FieldLabel htmlFor="reg-workshop">Offering</FieldLabel>
                <div className="relative">
                  <select
                    id="reg-workshop" value={form.workshop}
                    onChange={e => {
                      setField("workshop", e.target.value);
                      setField("workshopDateId", "");
                      setCapacityError("");
                      setWaitlistMode(false);
                    }}
                    aria-required="true" aria-invalid={!!errors.workshop || undefined}
                    aria-describedby={errors.workshop ? "err-workshop" : undefined}
                    className={`wda-input pr-10 cursor-pointer${errors.workshop ? " invalid" : ""}`}
                  >
                    <option value="">Select an offering</option>
                    {workshopsForCategory.length > 0
                      ? workshopsForCategory.map(o => {
                          const displayPrice =
                            deliveryMethod === 'virtual' &&
                            o.label === form.workshop &&
                            selectedDateObj?.virtualPrice != null
                              ? selectedDateObj.virtualPrice
                              : o.price;
                          return (
                            <option key={o.label} value={o.label}>{o.label} — ${displayPrice} CAD</option>
                          );
                        })
                      : <option disabled value="">No offerings available in this category</option>
                    }
                  </select>
                  <Chevron />
                </div>
                <FieldError id="err-workshop" msg={errors.workshop} />
              </div>
            )}

            {/* Date selection */}
            {selectedCategory && form.workshop && (
              datesLoading ? (
                <p className="text-xs" style={{ color: "rgba(43,48,58,0.4)" }}>Loading available dates…</p>
              ) : datesError ? (
                <p className="text-xs" style={{ color: "rgba(43,48,58,0.5)" }}>Could not load dates. Contact us to confirm availability.</p>
              ) : hasDates ? (
                <div>
                  <FieldLabel htmlFor="reg-date">Offering Date</FieldLabel>
                  <div className="relative">
                    <select
                      id="reg-date" value={form.workshopDateId}
                      onChange={e => {
                        setField("workshopDateId", e.target.value);
                        setCapacityError("");
                        setWaitlistMode(false);
                      }}
                      aria-required="true" aria-invalid={!!errors.workshopDateId || undefined}
                      aria-describedby={errors.workshopDateId ? "err-date" : undefined}
                      className={`wda-input pr-10 cursor-pointer${errors.workshopDateId ? " invalid" : ""}`}
                    >
                      <option value="">Select a date</option>
                      {availableDates.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.isFull
                            ? `${formatLong(d.date)} — Full (Join Waitlist)`
                            : formatLong(d.date)
                          }
                        </option>
                      ))}
                    </select>
                    <Chevron />
                  </div>
                  <FieldError id="err-date" msg={errors.workshopDateId} />
                </div>
              ) : (
                <p className="text-sm" style={{ color: "rgba(43,48,58,0.6)" }}>
                  Contact us for available dates — we&apos;ll confirm scheduling by email after registration.
                </p>
              )
            )}

            {/* Delivery method toggle */}
            {form.workshopDateId && selectedDateObj?.hasVirtualOption && (
              <div className="mt-5">
                <p className="block text-xs font-semibold mb-3" style={{ color: "#1E3560" }}>
                  Attendance Format<span className="ml-0.5" style={{ color: "#4A9FD4" }} aria-hidden>*</span>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {(["in-person", "virtual"] as const).map(method => {
                    const selected = deliveryMethod === method;
                    const isVirtual = method === "virtual";
                    const price = isVirtual && selectedDateObj.virtualPrice != null
                      ? selectedDateObj.virtualPrice
                      : WORKSHOP_PRICES[form.workshop] ?? 0;
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setDeliveryMethod(method)}
                        className="flex flex-col items-center gap-1.5 py-4 px-3 rounded-xl text-center transition-all duration-200"
                        style={{
                          backgroundColor: selected ? (isVirtual ? "rgba(55,138,221,0.08)" : "rgba(30,53,96,0.06)") : "#ffffff",
                          border: `2px solid ${selected ? (isVirtual ? "#378ADD" : "#1E3560") : "rgba(30,53,96,0.12)"}`,
                        }}
                      >
                        <span className="text-xl" aria-hidden>{isVirtual ? "💻" : "🏛️"}</span>
                        <span className="text-xs font-bold leading-tight" style={{ color: selected ? (isVirtual ? "#378ADD" : "#1E3560") : "rgba(30,53,96,0.45)" }}>
                          {isVirtual ? "Virtual" : "In-Person"}
                        </span>
                        <span className="text-[10px]" style={{ color: "rgba(43,48,58,0.5)" }}>${price} CAD</span>
                      </button>
                    );
                  })}
                </div>
                {deliveryMethod === "virtual" && (
                  <p className="mt-2 text-xs" style={{ color: "rgba(43,48,58,0.5)" }}>
                    A Teams meeting link will be emailed to you after registration is confirmed.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── Personal details ─────────────────────────────────────────────── */}
          <div className="pt-1">
            <p className="text-xs font-bold mb-4 uppercase tracking-[0.12em]" style={{ color: "rgba(30,53,96,0.4)", fontFamily: "var(--font-montserrat), sans-serif" }}>
              Your Information
            </p>

            {/* Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div>
                <FieldLabel htmlFor="reg-firstName">First Name</FieldLabel>
                <input
                  id="reg-firstName" type="text" autoComplete="given-name" placeholder="Jane"
                  value={form.firstName} onChange={e => setField("firstName", e.target.value)}
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
                  value={form.lastName} onChange={e => setField("lastName", e.target.value)}
                  aria-required="true" aria-invalid={!!errors.lastName || undefined}
                  aria-describedby={errors.lastName ? "err-lastName" : undefined}
                  className={`wda-input${errors.lastName ? " invalid" : ""}`}
                />
                <FieldError id="err-lastName" msg={errors.lastName} />
              </div>
            </div>

            {/* Email */}
            <div className="mb-5">
              <FieldLabel htmlFor="reg-email">Email Address</FieldLabel>
              <input
                id="reg-email" type="email" autoComplete="email" placeholder="jane@example.com"
                value={form.email} onChange={e => setField("email", e.target.value)}
                aria-required="true" aria-invalid={!!errors.email || undefined}
                aria-describedby={errors.email ? "err-email" : undefined}
                className={`wda-input${errors.email ? " invalid" : ""}`}
              />
              <FieldError id="err-email" msg={errors.email} />
            </div>

            {/* Phone */}
            <div className="mb-5">
              <FieldLabel htmlFor="reg-phone" optional>Phone Number</FieldLabel>
              <input
                id="reg-phone" type="tel" autoComplete="tel" placeholder="(780) 000-0000"
                value={form.phone} onChange={e => setField("phone", e.target.value)}
                className="wda-input"
              />
            </div>

            {/* Pronouns */}
            <div className="mb-5">
              <FieldLabel htmlFor="reg-pronouns" optional>Pronouns</FieldLabel>
              <div className="relative">
                <select
                  id="reg-pronouns"
                  value={form.pronouns}
                  onChange={e => { setField("pronouns", e.target.value); setField("customPronouns", ""); }}
                  className="wda-input pr-10 cursor-pointer"
                >
                  <option value="">Pronouns (optional)</option>
                  {PRONOUNS_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <Chevron />
              </div>
              {form.pronouns === "Prefer to self-describe" && (
                <input
                  type="text" placeholder="Enter your pronouns" value={form.customPronouns}
                  onChange={e => setField("customPronouns", e.target.value)}
                  className="wda-input mt-2" autoFocus
                />
              )}
            </div>

            {/* Dental background */}
            <div className="mb-5">
              <FieldLabel htmlFor="reg-dentalBackground">Previous Dental Background / Education</FieldLabel>
              <textarea
                id="reg-dentalBackground" rows={3}
                placeholder="Please briefly describe your dental background or education (e.g. dental assisting graduate, RDA, dental hygienist, etc.)"
                value={form.dentalBackground} onChange={e => setField("dentalBackground", e.target.value)}
                aria-required="true" aria-invalid={!!errors.dentalBackground || undefined}
                aria-describedby={errors.dentalBackground ? "err-dentalBackground" : undefined}
                className={`wda-input resize-none${errors.dentalBackground ? " invalid" : ""}`}
              />
              <FieldError id="err-dentalBackground" msg={errors.dentalBackground} />
            </div>

            {/* CADA number */}
            <div className="mb-5">
              <FieldLabel htmlFor="reg-cadaNumber" optional>
                CADA Membership Number{" "}
                <span className="font-normal" style={{ color: "rgba(43,48,58,0.38)", fontSize: "0.65rem" }}>
                  (not needed for National Board Guided Practice Workshop)
                </span>
              </FieldLabel>
              <input
                id="reg-cadaNumber" type="text" placeholder="e.g. RDA12345"
                value={form.cadaNumber} onChange={e => setField("cadaNumber", e.target.value)}
                className="wda-input"
              />
              <p className="mt-1.5 text-xs" style={{ color: "rgba(43,48,58,0.45)" }}>
                If you are a CADA member, enter your membership number to have it included on your certificate of attendance.
              </p>
            </div>

            {/* Dietary restrictions — in-person + food only */}
            {form.workshopDateId && selectedDateObj?.includesFood && deliveryMethod === "in-person" && (
              <div className="mb-5">
                <FieldLabel htmlFor="reg-dietaryRestrictions" optional>
                  Dietary Restrictions or Food Allergies
                </FieldLabel>
                <textarea
                  id="reg-dietaryRestrictions"
                  rows={2}
                  placeholder="e.g. vegetarian, gluten-free, nut allergy (optional)"
                  value={form.dietaryRestrictions}
                  onChange={e => setField("dietaryRestrictions", e.target.value)}
                  className="wda-input resize-none"
                />
              </div>
            )}

            {/* National Board eligibility */}
            {form.workshop && isNationalBoard && (
              <div className="mb-5 p-4 rounded-lg" style={{ backgroundColor: "rgba(55,138,221,0.08)", border: "1.5px solid rgba(55,138,221,0.3)" }}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox" checked={eligibilityConfirmed}
                    onChange={e => setEligibilityConfirmed(e.target.checked)}
                    className="mt-1 shrink-0"
                  />
                  <span className="text-sm" style={{ color: "#1E3560" }}>
                    I confirm that I meet the eligibility requirements set by the NDAEB to register for the NDAEB Clinical Practice Evaluation (CPE).{" "}
                    <a href="https://ndaeb.ca/graduates-of-non-registered-programs/eligibility-application-for-graduates-of-non-registered-programs/" target="_blank" rel="noopener noreferrer" style={{ color: "#378ADD" }}>
                      View eligibility requirements
                    </a>.
                  </span>
                </label>
                {errors.eligibility && (
                  <p className="mt-2 text-xs font-medium" style={{ color: "#dc2626" }}>{errors.eligibility}</p>
                )}
              </div>
            )}

            {/* Media consent */}
            <label className="flex items-start gap-3 cursor-pointer mb-4">
              <input
                type="checkbox" checked={form.mediaConsent}
                onChange={e => setField("mediaConsent", e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 accent-[#E67E22] cursor-pointer"
              />
              <span className="text-sm" style={{ color: "rgba(43,48,58,0.65)" }}>
                I consent to WDA&apos;s media policy. Western Dental Academy may use photographs or video
                recordings taken during events for promotional, educational, and social media purposes.{" "}
                <span style={{ color: "rgba(43,48,58,0.45)" }}>(Optional)</span>
              </span>
            </label>

            {/* Feedback share consent */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox" checked={form.feedbackShareConsent}
                onChange={e => setField("feedbackShareConsent", e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 accent-[#E67E22] cursor-pointer"
              />
              <span className="text-sm" style={{ color: "rgba(43,48,58,0.65)" }}>
                I consent to my feedback being shared publicly (e.g. on the WDA website or social media),
                without personal identifiers.{" "}
                <span style={{ color: "rgba(43,48,58,0.45)" }}>(Optional)</span>
              </span>
            </label>
          </div>

          {/* Capacity error */}
          {capacityError && (
            <div className="rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", color: "#dc2626" }} role="alert">
              {capacityError}
            </div>
          )}

          {/* Waitlist prompt */}
          {waitlistMode && !waitlistSuccess && deliveryMethod !== "virtual" && (
            <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(230,126,34,0.06)", border: "1.5px solid rgba(230,126,34,0.25)" }}>
              <p className="text-sm font-semibold mb-1" style={{ color: "#92400e" }}>
                This workshop date is currently full.
              </p>
              <p className="text-sm mb-4" style={{ color: "rgba(146,64,14,0.75)" }}>
                Would you like to join the waitlist? We&apos;ll notify you if a spot opens up.
              </p>
              {waitlistError && (
                <p className="mb-3 text-xs font-medium" style={{ color: "#dc2626" }}>{waitlistError}</p>
              )}
              <div className="flex gap-3 flex-wrap">
                <button
                  type="button" onClick={handleWaitlist} disabled={waitlistSubmitting}
                  className="rounded-lg px-5 py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-70"
                  style={{ backgroundColor: "#E67E22" }}
                >
                  {waitlistSubmitting ? <span className="flex items-center gap-2"><Spinner />Adding…</span> : "Join Waitlist"}
                </button>
                <button
                  type="button"
                  onClick={() => { setField("workshopDateId", ""); setWaitlistMode(false); }}
                  className="rounded-lg px-5 py-2.5 text-sm font-semibold border transition-colors hover:border-[#1E3560] hover:text-[#1E3560]"
                  style={{ borderColor: "rgba(30,53,96,0.2)", color: "rgba(30,53,96,0.55)" }}
                >
                  Select a Different Date
                </button>
              </div>
            </div>
          )}

          {waitlistSuccess && (
            <div className="rounded-xl px-5 py-4 flex items-start gap-3" style={{ backgroundColor: "rgba(34,197,94,0.07)", border: "1.5px solid rgba(34,197,94,0.25)" }} role="status">
              <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={2.5} className="w-5 h-5 shrink-0 mt-0.5" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-bold" style={{ color: "#15803d" }}>You&apos;re on the waitlist!</p>
                <p className="text-sm" style={{ color: "rgba(21,128,61,0.8)" }}>
                  We&apos;ll reach out to <span className="font-semibold">{form.email}</span> if a spot opens up.
                </p>
              </div>
            </div>
          )}

          {/* Checkout error */}
          {checkoutError && (
            <div className="rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", color: "#dc2626" }} role="alert">
              {checkoutError}
            </div>
          )}

          {/* Register Now button */}
          {!waitlistMode && !waitlistSuccess && (
            <div className="pt-2 border-t" style={{ borderColor: "rgba(30,53,96,0.08)" }}>
              <button
                type="button"
                onClick={handleRegister}
                disabled={redirecting || checkingCapacity}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-colors disabled:opacity-70"
                style={{ backgroundColor: "#E67E22" }}
                aria-busy={redirecting || checkingCapacity}
              >
                {redirecting ? (
                  <><Spinner />Redirecting to checkout…</>
                ) : checkingCapacity ? (
                  <><Spinner />Checking availability…</>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    Register Now →
                  </>
                )}
              </button>
              <p className="mt-3 text-[10px] text-center" style={{ color: "rgba(43,48,58,0.4)" }}>
                Secure checkout via Stripe. A confirmation email will be sent to you after payment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WorkshopRegisterForm() {
  return (
    <Suspense fallback={null}>
      <WorkshopRegisterFormInner />
    </Suspense>
  );
}
