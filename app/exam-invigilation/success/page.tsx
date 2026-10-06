import type { Metadata } from "next";
import Link from "next/link";
import { confirmInvigilationBooking } from "@/lib/invigilation/confirm";
import { materialsDeadline, type InvigilationBookingRecord } from "@/lib/invigilation/emails";
import { formatDateLong, formatTimeRange } from "@/lib/invigilation/settings";

export const metadata: Metadata = {
  title: "Exam Booking Confirmed",
  description: "Your exam invigilation booking at Western Dental Academy is confirmed.",
  robots: { index: false },
};

export default async function InvigilationSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; id?: string }>;
}) {
  const { session_id: sessionId, id } = await searchParams;

  let booking: InvigilationBookingRecord | null = null;
  if (sessionId && id) {
    try {
      booking = await confirmInvigilationBooking(sessionId, id);
    } catch (err) {
      console.error("Invigilation success page error:", err);
    }
  }

  return (
    <section className="py-24" style={{ backgroundColor: "#F4F7F9" }}>
      <div className="max-w-2xl mx-auto px-6">
        <div
          className="rounded-2xl p-10 sm:p-14"
          style={{
            backgroundColor: "#ffffff",
            border: "1.5px solid rgba(30,53,96,0.09)",
            boxShadow: "0 4px 24px rgba(30,53,96,0.06)",
          }}
        >
          <div className="w-16 h-16 rounded-full mx-auto mb-7 flex items-center justify-center" style={{ backgroundColor: "rgba(74,159,212,0.12)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#4A9FD4" strokeWidth={2.25} className="w-8 h-8" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <h1
            className="text-2xl font-bold text-center mb-3"
            style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            {booking ? "Your Exam Is Booked!" : "Thank You!"}
          </h1>

          {booking ? (
            <>
              <p className="text-center text-sm mb-6" style={{ color: "rgba(43,48,58,0.65)" }}>
                Thank you, <strong style={{ color: "#1E3560" }}>{booking.firstName}</strong>. Your payment has been
                received and your seat is reserved.
              </p>

              <div className="mb-6 rounded-xl overflow-hidden" style={{ border: "1.5px solid rgba(30,53,96,0.09)" }}>
                <div className="px-5 py-3" style={{ backgroundColor: "#1E3560" }}>
                  <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: "#4A9FD4", fontFamily: "var(--font-montserrat), sans-serif" }}>
                    Your Booking
                  </p>
                </div>
                <div className="px-5 py-4 space-y-1">
                  <p className="text-sm font-semibold" style={{ color: "#1E3560" }}>{formatDateLong(booking.date)}</p>
                  <p className="text-sm" style={{ color: "rgba(43,48,58,0.7)" }}>
                    {formatTimeRange(booking.startTime, booking.durationHours)} ({booking.durationHours} hr)
                  </p>
                  {booking.examName && (
                    <p className="text-xs" style={{ color: "rgba(43,48,58,0.5)" }}>
                      {booking.examName}{booking.institution ? ` · ${booking.institution}` : ""}
                    </p>
                  )}
                </div>
              </div>

              <div
                className="mb-6 rounded-lg px-4 py-3 text-sm leading-relaxed"
                style={{ backgroundColor: "rgba(74,159,212,0.08)", border: "1px solid rgba(74,159,212,0.25)", color: "#1E3560" }}
              >
                <strong>Next step:</strong> your instructor or exam centre needs to send us the exam password (or a paper
                copy), the list of allowed items, and a contact for exam day by{" "}
                <strong>{materialsDeadline(booking)}</strong>. We&apos;ve emailed them the details too.
              </div>
            </>
          ) : (
            <p className="text-center text-sm mb-6" style={{ color: "rgba(43,48,58,0.65)" }}>
              If you completed payment, your confirmation email is on its way. If you don&apos;t receive it, please call
              780-499-9153 or email info@westerndentalacademy.com.
            </p>
          )}

          <div
            className="mb-8 rounded-lg px-4 py-3 text-sm"
            style={{ backgroundColor: "rgba(230,126,34,0.08)", border: "1px solid rgba(230,126,34,0.2)" }}
          >
            <p style={{ color: "#1E3560" }}>
              <strong>📬 Check your junk/spam folder</strong> — confirmation emails sometimes end up there. Bring your
              confirmation email and photo ID on exam day.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/"
              className="rounded-lg px-5 py-2.5 text-sm font-semibold border transition-colors hover:border-[#1E3560] hover:text-[#1E3560]"
              style={{ borderColor: "rgba(30,53,96,0.2)", color: "rgba(30,53,96,0.55)" }}
            >
              Back to Home
            </Link>
            <Link
              href="/contact"
              className="rounded-lg px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#CF6D17]"
              style={{ backgroundColor: "#E67E22" }}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
