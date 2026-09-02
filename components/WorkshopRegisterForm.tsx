"use client";

import { useState, useEffect } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  workshopDateId: string;
  workshopName: string;
  workshopDate: string;          // short formatted (for cart display)
  workshopDateISO: string;       // ISO for server
  workshopDateFormatted: string; // long formatted (for Sanity/emails)
  price: number;
  dentalBackground: string;
  cadaNumber?: string;
  pronouns?: string;
  mediaConsent?: boolean;
  isPrimary: boolean;
}

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
  workshop: string;
  workshopDateId: string;
}

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

const WORKSHOP_PRICES: Record<string, number> = {
  "Ergonomics in Dentistry: Hands and Spine": 40,
  "Ergonomics in Dentistry: Hips and Hamstrings": 40,
  "Ergonomics in Dentistry: Neck and Shoulders": 40,
  "National Board Guided Practice Workshop": 600,
};

const WORKSHOP_OPTIONS = Object.keys(WORKSHOP_PRICES).map(label => ({
  label,
  price: WORKSHOP_PRICES[label],
}));

const CATEGORIES = [
  { value: "workshop",        label: "Workshops",         emoji: "🎓" },
  { value: "course",          label: "Courses",           emoji: "📚" },
  { value: "guest-speaker",   label: "Guest Speakers",    emoji: "🎤" },
  { value: "board-exam-prep", label: "Practical Exam Prep", emoji: "📋" },
] as const;

const PRONOUNS_OPTIONS = [
  "She/Her", "He/Him", "They/Them", "She/They", "He/They",
  "Prefer not to say", "Prefer to self-describe",
] as const;

const INITIAL_FORM: RegistrantForm = {
  firstName: "", lastName: "", email: "", phone: "",
  dentalBackground: "", cadaNumber: "",
  pronouns: "", customPronouns: "", mediaConsent: false,
  workshop: "", workshopDateId: "",
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function calcFee(subtotalCents: number): number {
  return Math.round((subtotalCents + 30) / (1 - 0.033) - subtotalCents);
}

function fmtCAD(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

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

// ─── Cart Panel ─────────────────────────────────────────────────────────────────

function CartPanel({
  cart,
  onRemove,
  onCheckout,
  redirecting,
  checkoutError,
}: {
  cart: CartItem[];
  onRemove: (id: string) => void;
  onCheckout: () => void;
  redirecting: boolean;
  checkoutError: string;
}) {
  const subtotalCents = cart.reduce((s, i) => s + i.price * 100, 0);
  const feeCents = subtotalCents > 0 ? calcFee(subtotalCents) : 0;
  const totalCents = subtotalCents + feeCents;

  return (
    <div
      className="rounded-2xl overflow-hidden lg:sticky lg:top-8"
      style={{ backgroundColor: "#fff", border: "1.5px solid rgba(30,53,96,0.09)", boxShadow: "0 4px 24px rgba(30,53,96,0.06)" }}
    >
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ backgroundColor: "#1E3560" }}>
        <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "#4A9FD4", fontFamily: "var(--font-montserrat), sans-serif" }}>
          Registration Cart
        </p>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(74,159,212,0.2)", color: "#4A9FD4" }}>
          {cart.length} {cart.length === 1 ? "person" : "people"}
        </span>
      </div>

      {/* Items */}
      <div className="divide-y" style={{ borderColor: "rgba(30,53,96,0.07)" }}>
        {cart.map((item) => (
          <div key={item.id} className="px-5 py-4 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold truncate" style={{ color: "#1E3560" }}>
                  {item.firstName} {item.lastName}
                </p>
                {item.isPrimary && (
                  <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(230,126,34,0.1)", color: "#E67E22" }}>
                    Primary
                  </span>
                )}
              </div>
              <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(43,48,58,0.55)" }}>{item.workshopName}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(43,48,58,0.4)" }}>{item.workshopDate}</p>
            </div>
            <div className="flex items-start gap-2 shrink-0">
              <p className="text-sm font-bold" style={{ color: "#1E3560" }}>${item.price}</p>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="rounded-md p-1 transition-colors hover:bg-red-50"
                aria-label={`Remove ${item.firstName} ${item.lastName} from cart`}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5" style={{ color: "rgba(220,38,38,0.5)" }}>
                  <path fillRule="evenodd" clipRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zm-.75 4.5c.184 0 .368.006.55.017L9.25 16H7.596a1.25 1.25 0 01-1.247-1.15L5.513 4.898c.343-.03.688-.054 1.035-.073a.75.75 0 10.452-1.424zm1.5 0c.34.012.675.032 1.007.059a.75.75 0 10.451 1.424A40.507 40.507 0 0011.25 6.5H9.5v-.017zm-.75 1.518L9.75 16h.5l.75-10.017zm2.25-.001V16h1.154a1.25 1.25 0 001.247-1.15L14.487 4.898c-.343-.03-.688-.054-1.035-.073a.75.75 0 11-.452-1.424z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="px-5 py-4 border-t" style={{ borderColor: "rgba(30,53,96,0.08)", backgroundColor: "#F4F7F9" }}>
        <div className="flex justify-between text-xs mb-1.5" style={{ color: "rgba(43,48,58,0.55)" }}>
          <span>Subtotal</span>
          <span>{fmtCAD(subtotalCents)}</span>
        </div>
        <div className="flex justify-between text-xs mb-3" style={{ color: "rgba(43,48,58,0.55)" }}>
          <span>Processing fee (3.3% + $0.30)</span>
          <span>{fmtCAD(feeCents)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold" style={{ color: "#1E3560" }}>
          <span>Total</span>
          <span>{fmtCAD(totalCents)} CAD</span>
        </div>
      </div>

      {/* Checkout button */}
      <div className="px-5 pb-5">
        {checkoutError && (
          <p className="mb-3 text-xs rounded-lg px-3 py-2.5" style={{ backgroundColor: "rgba(220,38,38,0.07)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.2)" }}>
            {checkoutError}
          </p>
        )}
        <button
          type="button"
          onClick={onCheckout}
          disabled={redirecting}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-colors disabled:opacity-70"
          style={{ backgroundColor: "#1E3560" }}
          aria-busy={redirecting}
        >
          {redirecting ? (
            <><Spinner />Redirecting…</>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Proceed to Checkout →
            </>
          )}
        </button>
        <p className="mt-3 text-[10px] text-center" style={{ color: "rgba(43,48,58,0.4)" }}>
          Secure checkout via Stripe. Confirmation emails sent to all registrants.
        </p>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function WorkshopRegisterForm() {
  const [cart, setCart] = useState<CartItem[]>([]);
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

  const isPrimary = cart.length === 0;

  useEffect(() => {
    fetch("/api/workshops/dates")
      .then(r => r.json())
      .then((dates: WorkshopDate[]) => setWorkshopDates(Array.isArray(dates) ? dates : []))
      .catch(() => setDatesError(true))
      .finally(() => setDatesLoading(false));
  }, []);

  function setField<K extends keyof RegistrantForm>(key: K, value: RegistrantForm[K]) {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined as unknown as string }));
    if (capacityError) setCapacityError("");
    if (waitlistMode) setWaitlistMode(false);
  }

  // ── Derived workshop/date values ────────────────────────────────────────────

  const workshopsForCategory = selectedCategory
    ? selectedCategory === "board-exam-prep"
      ? WORKSHOP_OPTIONS.filter(opt =>
          opt.label === "National Board Guided Practice Workshop" &&
          workshopDates.some(d => d.workshop === opt.label)
        )
      : WORKSHOP_OPTIONS.filter(opt =>
          workshopDates.some(d => d.category === selectedCategory && d.workshop === opt.label)
        )
    : [];

  const availableDates = workshopDates.filter(
    selectedCategory === "board-exam-prep"
      ? (d) => d.workshop === form.workshop
      : (d) => d.workshop === form.workshop && d.category === selectedCategory
  );

  const hasDates = availableDates.length > 0;
  const isNationalBoard = form.workshop.includes("National Board");
  const selectedDateObj = workshopDates.find(d => d.id === form.workshopDateId);

  // ── Validate form ───────────────────────────────────────────────────────────

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.firstName.trim())       e.firstName = "First name is required.";
    if (!form.lastName.trim())        e.lastName  = "Last name is required.";
    if (!form.email.trim())           e.email     = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (isPrimary && !form.phone.trim()) e.phone = "Phone number is required.";
    if (!form.dentalBackground.trim()) e.dentalBackground = "Please briefly describe your dental background.";
    if (!form.workshop)               e.workshop = "Please select a workshop.";
    if (form.workshop && hasDates && !form.workshopDateId) e.workshopDateId = "Please select a date.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Add to cart ─────────────────────────────────────────────────────────────

  async function handleAddToCart() {
    if (!selectedCategory) { setCategoryError("Please select a category."); return; }
    setCategoryError("");

    if (!validate()) return;

    if (isNationalBoard && !eligibilityConfirmed) {
      setErrors(e => ({ ...e, eligibility: "Please confirm your eligibility to continue." }));
      return;
    }

    if (!form.workshopDateId) {
      // No specific date — add directly (contact-us-for-dates workshop)
      addItemToCart();
      return;
    }

    // Capacity check
    setCheckingCapacity(true);
    setCapacityError("");
    setWaitlistMode(false);
    try {
      const res = await fetch(`/api/workshops/check-capacity?workshopDateId=${form.workshopDateId}`);
      const data = await res.json();
      const { available } = data as { available: number };
      const cartCountForDate = cart.filter(c => c.workshopDateId === form.workshopDateId).length;
      if (available - cartCountForDate <= 0) {
        setWaitlistMode(true);
        return;
      }
    } catch {
      // Capacity check failed — server will recheck at checkout
    } finally {
      setCheckingCapacity(false);
    }

    addItemToCart();
  }

  function addItemToCart() {
    const price = WORKSHOP_PRICES[form.workshop] ?? 0;
    const pronounsResolved = form.pronouns === "Prefer to self-describe"
      ? form.customPronouns.trim()
      : form.pronouns;

    const item: CartItem = {
      id: Math.random().toString(36).slice(2, 9),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: isPrimary ? form.phone.trim() || undefined : undefined,
      workshopDateId: form.workshopDateId,
      workshopName: form.workshop,
      workshopDate: selectedDateObj ? formatShort(selectedDateObj.date) : "TBD",
      workshopDateISO: selectedDateObj?.date ?? "",
      workshopDateFormatted: selectedDateObj ? formatLong(selectedDateObj.date) : "Contact us for available dates",
      price,
      dentalBackground: form.dentalBackground.trim(),
      cadaNumber: form.cadaNumber.trim() || undefined,
      pronouns: isPrimary && pronounsResolved ? pronounsResolved : undefined,
      mediaConsent: isPrimary ? form.mediaConsent : undefined,
      isPrimary,
    };

    setCart(c => [...c, item]);
    setForm(INITIAL_FORM);
    setSelectedCategory("");
    setEligibilityConfirmed(false);
    setErrors({});
    setCategoryError("");
    setCapacityError("");
    setWaitlistMode(false);
    setWaitlistSuccess(false);
    setWaitlistError("");
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

  // ── Checkout ────────────────────────────────────────────────────────────────

  async function handleCheckout() {
    if (cart.length === 0) return;
    setRedirecting(true);
    setCheckoutError("");
    try {
      const res = await fetch("/api/workshops/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart }),
      });
      const result = await res.json();
      if (!res.ok || !result.url) throw new Error(result.error ?? "Something went wrong.");
      window.location.href = result.url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setRedirecting(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="lg:flex lg:gap-8 lg:items-start">
      {/* ── Registrant Form ── */}
      <div className="flex-1 min-w-0">
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
            {isPrimary ? (
              <>
                <div
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-4 text-[10px] font-bold uppercase tracking-[0.15em]"
                  style={{ backgroundColor: "rgba(230,126,34,0.1)", color: "#E67E22" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#E67E22" }} />
                  Primary Registrant
                </div>
                <h2 className="text-xl font-bold mb-1" style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}>
                  Your Details
                </h2>
                <p className="text-sm" style={{ color: "rgba(43,48,58,0.55)" }}>
                  Fill in your details, select a workshop, and add yourself to the cart.
                  You can then add more attendees before checking out.
                </p>
              </>
            ) : (
              <>
                <div
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-4 text-[10px] font-bold uppercase tracking-[0.15em]"
                  style={{ backgroundColor: "rgba(74,159,212,0.1)", color: "#4A9FD4" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#4A9FD4" }} />
                  Additional Attendee
                </div>
                <h2 className="text-xl font-bold mb-1" style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}>
                  Add Another Attendee
                </h2>
                <p className="text-sm" style={{ color: "rgba(43,48,58,0.55)" }}>
                  Add another person to this registration. Each attendee can select a different workshop.
                </p>
              </>
            )}
          </div>

          <div className="flex flex-col gap-5">
            {/* Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
            <div>
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

            {/* Phone — primary only */}
            {isPrimary && (
              <div>
                <FieldLabel htmlFor="reg-phone">Phone Number</FieldLabel>
                <input
                  id="reg-phone" type="tel" autoComplete="tel" placeholder="(780) 000-0000"
                  value={form.phone} onChange={e => setField("phone", e.target.value)}
                  aria-required="true" aria-invalid={!!errors.phone || undefined}
                  aria-describedby={errors.phone ? "err-phone" : undefined}
                  className={`wda-input${errors.phone ? " invalid" : ""}`}
                />
                <FieldError id="err-phone" msg={errors.phone} />
              </div>
            )}

            {/* Pronouns — primary only */}
            {isPrimary && (
              <div>
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
            )}

            {/* Dental background */}
            <div>
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
            <div>
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

            {/* ── Workshop selection ── */}
            <div className="pt-2 border-t" style={{ borderColor: "rgba(30,53,96,0.08)" }}>
              <p className="text-xs font-bold mb-4 uppercase tracking-[0.12em]" style={{ color: "rgba(30,53,96,0.4)", fontFamily: "var(--font-montserrat), sans-serif" }}>
                Workshop Selection
              </p>

              {/* Category */}
              <div className="mb-5">
                <p className="block text-xs font-semibold mb-3" style={{ color: "#1E3560" }}>
                  Category<span className="ml-0.5" style={{ color: "#4A9FD4" }} aria-hidden>*</span>
                </p>
                {categoryError && (
                  <p className="text-xs font-medium mb-3" style={{ color: "#dc2626" }} role="alert">{categoryError}</p>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CATEGORIES.map(cat => {
                    const sel = selectedCategory === cat.value;
                    return (
                      <button
                        key={cat.value} type="button"
                        onClick={() => {
                          if (selectedCategory !== cat.value) {
                            setSelectedCategory(cat.value);
                            setField("workshop", "");
                            setField("workshopDateId", "");
                            setCategoryError("");
                            setErrors(e => ({ ...e, workshop: undefined as unknown as string, workshopDateId: undefined as unknown as string }));
                            setCapacityError("");
                            setWaitlistMode(false);
                          }
                        }}
                        className="flex flex-col items-center gap-2 py-4 px-2 rounded-xl text-center transition-all duration-200"
                        style={{
                          backgroundColor: sel ? "rgba(30,53,96,0.06)" : "#ffffff",
                          border: `2px solid ${sel ? "#1E3560" : "rgba(30,53,96,0.12)"}`,
                        }}
                      >
                        <span className="text-2xl" aria-hidden>{cat.emoji}</span>
                        <span className="text-xs font-bold leading-tight" style={{ color: sel ? "#1E3560" : "rgba(30,53,96,0.45)" }}>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Workshop dropdown */}
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
                        ? workshopsForCategory.map(o => (
                            <option key={o.label} value={o.label}>{o.label} — ${o.price} CAD</option>
                          ))
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
                        {availableDates.map(d => {
                          const cartCount = cart.filter(c => c.workshopDateId === d.id).length;
                          const effectiveRegistered = d.registered + cartCount;
                          const isFull = effectiveRegistered >= d.capacity;
                          return (
                            <option key={d.id} value={d.id}>
                              {isFull
                                ? `${formatLong(d.date)} — Full (Join Waitlist)`
                                : `${formatLong(d.date)} (${effectiveRegistered}/${d.capacity} registered)`
                              }
                            </option>
                          );
                        })}
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

              {/* National Board eligibility */}
              {selectedCategory && form.workshop && isNationalBoard && (
                <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: "rgba(55,138,221,0.08)", border: "1.5px solid rgba(55,138,221,0.3)" }}>
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
            </div>

            {/* Media consent — primary only */}
            {isPrimary && (
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox" checked={form.mediaConsent}
                  onChange={e => setField("mediaConsent", e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 accent-[#E67E22] cursor-pointer"
                />
                <span className="text-sm" style={{ color: "rgba(43,48,58,0.65)" }}>
                  I confirm all attendees in this registration consent to WDA&apos;s media policy.
                  Western Dental Academy may use photographs or video recordings taken during events
                  for promotional, educational, and social media purposes.{" "}
                  <span style={{ color: "rgba(43,48,58,0.45)" }}>(Optional)</span>
                </span>
              </label>
            )}

            {/* Capacity error / waitlist prompt */}
            {capacityError && (
              <div className="rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", color: "#dc2626" }} role="alert">
                {capacityError}
              </div>
            )}

            {waitlistMode && !waitlistSuccess && (
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

            {/* Add to cart button */}
            {!waitlistMode && !waitlistSuccess && (
              <div className="pt-2 border-t" style={{ borderColor: "rgba(30,53,96,0.08)" }}>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={checkingCapacity}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-colors disabled:opacity-70"
                  style={{ backgroundColor: "#E67E22" }}
                  aria-busy={checkingCapacity}
                >
                  {checkingCapacity ? (
                    <><Spinner />Checking availability…</>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 shrink-0" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>
                {cart.length > 0 && (
                  <p className="mt-3 text-xs text-center" style={{ color: "rgba(43,48,58,0.45)" }}>
                    Ready to pay? Proceed to checkout from the cart panel →
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Cart Panel ── */}
      {cart.length > 0 && (
        <div className="lg:w-[360px] shrink-0 mt-6 lg:mt-0">
          <CartPanel
            cart={cart}
            onRemove={id => setCart(c => c.filter(item => item.id !== id).map((item, i) => ({ ...item, isPrimary: i === 0 })))}
            onCheckout={handleCheckout}
            redirecting={redirecting}
            checkoutError={checkoutError}
          />
        </div>
      )}
    </div>
  );
}
