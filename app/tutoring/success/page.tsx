import type { Metadata } from "next";
import Link from "next/link";
import Wes from "@/components/Wes";
import PaymentPending from "@/components/PaymentPending";
import { getCheckoutSession } from "@/lib/payments/checkout";
import { serviceTitle } from "@/lib/tutoring/shared";
import { confirmTutoringPayment, type TutoringInquiryRecord } from "@/lib/tutoring/server";

export const metadata: Metadata = {
  title: "Payment Received",
  robots: { index: false },
};

export default async function TutoringSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; id?: string }>;
}) {
  const { session_id: sessionId, id } = await searchParams;

  let inquiry: TutoringInquiryRecord | null = null;
  let pending = false;
  if (sessionId && id) {
    try {
      inquiry = await confirmTutoringPayment(sessionId, id);
      if (!inquiry) {
        // Clover reports payment by webhook, which can land a few seconds after the redirect
        const session = await getCheckoutSession(sessionId);
        pending = session?.provider === "clover" && !session.paid;
      }
    } catch (err) {
      console.error("Tutoring success page error:", err);
    }
  }
  if (pending) return <PaymentPending />;

  return (
    <section className="py-24" style={{ backgroundColor: "#F4F7F9" }}>
      <div className="max-w-xl mx-auto px-6">
        <div
          className="rounded-2xl p-10 sm:p-14 bg-white text-center"
          style={{ border: "1.5px solid rgba(30,53,96,0.09)", boxShadow: "0 4px 24px rgba(30,53,96,0.06)" }}
        >
          <Wes pose="thumbs-up" size={140} className="mx-auto mb-4 -mt-4" />
          <h1 className="text-2xl font-bold mb-3 text-[#1E3560]" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
            {inquiry ? "You're all set!" : "Thank you!"}
          </h1>
          <p className="text-sm leading-relaxed text-[#2B303A]/70 mb-6">
            {inquiry ? (
              <>
                Thanks, <strong className="text-[#1E3560]">{inquiry.firstName}</strong>. Your payment for{" "}
                {serviceTitle(inquiry.service)} has been received. A receipt is on its way to {inquiry.email}.
              </>
            ) : (
              <>If your payment went through, you&apos;ll receive a receipt by email shortly.</>
            )}
          </p>
          {inquiry?.sessionDetails && (
            <p className="text-sm rounded-xl px-5 py-4 mb-6 text-left whitespace-pre-wrap" style={{ backgroundColor: "#F4F7F9", color: "#1E3560" }}>
              {inquiry.sessionDetails}
            </p>
          )}
          <p className="text-xs text-[#2B303A]/50">
            Questions? Call <a href="tel:5872691644" className="font-semibold text-[#4A9FD4]">587-269-1644</a>.{" "}
            <Link href="/" className="font-semibold text-[#4A9FD4]">Back to home</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
