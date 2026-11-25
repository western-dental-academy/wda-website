import type { Metadata } from "next";
import { rewardReferrer } from "@/lib/referrals";
import Link from "next/link";
import { getCheckoutSession, runFulfilmentOnce } from "@/lib/payments/checkout";
import { fulfilWorkshopCheckout, sendRegistrationFollowUps, sanity, type RegistrationRecord } from "@/lib/workshops/fulfil";
import PaymentPending from "@/components/PaymentPending";

export const metadata: Metadata = {
  title: "Registration Confirmed",
  description: "Your workshop registration is confirmed. See you soon at Western Dental Academy.",
};


export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; id?: string; ids?: string; gift_redeemed?: string }>;
}) {
  const { session_id: sessionId, id: legacyId, ids: idsRaw, gift_redeemed: giftRedeemed } = await searchParams;

  // Support both new multi-registrant (?ids=) and legacy single-registrant (?id=)
  const ids = idsRaw
    ? idsRaw.split(",").filter(Boolean)
    : legacyId
    ? [legacyId]
    : [];

  const isLegacy = !!legacyId && !idsRaw;

  let registrations: RegistrationRecord[] = [];
  let confirmed = false;
  let pending = false;

  // Gift-covered free checkout: already marked paid + redeemed in checkout route
  if (giftRedeemed === '1' && ids.length > 0 && !sessionId) {
    try {
      const idList = ids.map(id => `"${id}"`).join(",");
      registrations = await sanity.fetch<RegistrationRecord[]>(
        `*[_id in [${idList}]]{ _id, firstName, lastName, email, workshop, workshopDateId, stripePaymentStatus, preferredDate, deliveryMethod, newsletterOptIn, confirmationSentAt }`,
      );
      confirmed = true;

      // Fully gift-covered checkouts skip Stripe, so send the follow-ups here.
      // confirmationSentAt stops a page refresh from sending them twice.
      const giftPaid = registrations.length > 0 && registrations.every(r => r.stripePaymentStatus === "paid");
      if (giftPaid && !registrations.some(r => r.confirmationSentAt)) {
        const sentAt = new Date().toISOString();
        await Promise.all(registrations.map(r => sanity.patch(r._id).set({ confirmationSentAt: sentAt }).commit()));
        await sendRegistrationFollowUps(registrations, 0, true);
        for (const r of registrations) await rewardReferrer(r._id);
      }
    } catch (err) {
      console.error("Gift-redeemed fetch error:", err);
      confirmed = true;
    }
  } else if (sessionId && ids.length > 0) {
    try {
      const session = await getCheckoutSession(sessionId);
      if (session) {
        const result = await runFulfilmentOnce(session, () => fulfilWorkshopCheckout(session, ids, isLegacy));
        registrations = result.registrations;
        confirmed = result.confirmed;
        // Clover reports payment by webhook, which can land a few seconds after the redirect
        if (!confirmed && session.provider === "clover") pending = true;
      }
    } catch (err) {
      console.error("Workshop success page error:", err);
      confirmed = true; // the payment page only sends people here after payment
    }
  }

  if (pending) return <PaymentPending />;


  const primary = registrations[0];

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
          {/* Icon */}
          <div className="w-16 h-16 rounded-full mx-auto mb-7 flex items-center justify-center" style={{ backgroundColor: "rgba(74,159,212,0.12)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#4A9FD4" strokeWidth={2.25} className="w-8 h-8" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <h1
            className="text-2xl font-bold text-center mb-3"
            style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            {confirmed ? "Registration Complete!" : "Thank You!"}
          </h1>

          {confirmed && primary && (
            <p className="text-center text-sm mb-6" style={{ color: "rgba(43,48,58,0.65)" }}>
              Thank you, <strong style={{ color: "#1E3560" }}>{primary.firstName}</strong>.{" "}
              Your payment has been received and your spot is confirmed.
            </p>
          )}

          {/* Registrant list */}
          {registrations.length > 0 && (
            <div className="mb-6 rounded-xl overflow-hidden" style={{ border: "1.5px solid rgba(30,53,96,0.09)" }}>
              <div className="px-5 py-3" style={{ backgroundColor: "#1E3560" }}>
                <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: "#4A9FD4", fontFamily: "var(--font-montserrat), sans-serif" }}>
                  Your Registration
                </p>
              </div>
              <div className="divide-y" style={{ borderColor: "rgba(30,53,96,0.07)" }}>
                {registrations.map(r => (
                  <div key={r._id} className="px-5 py-4">
                    <p className="text-sm font-semibold mb-0.5" style={{ color: "#1E3560" }}>
                      {r.firstName} {r.lastName}
                    </p>
                    <p className="text-xs" style={{ color: "rgba(43,48,58,0.55)" }}>{r.workshop}</p>
                    {r.preferredDate && (
                      <p className="text-xs mt-0.5" style={{ color: "rgba(43,48,58,0.4)" }}>{r.preferredDate}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Spam notice */}
          <div
            className="mb-8 rounded-lg px-4 py-3 text-sm"
            style={{ backgroundColor: "rgba(230,126,34,0.08)", border: "1px solid rgba(230,126,34,0.2)" }}
          >
            <p style={{ color: "#1E3560" }}>
              <strong>📬 Check your junk/spam folder</strong> — confirmation emails sometimes end up
              there. Add <strong>info@westerndentalacademy.com</strong> to your contacts.
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
