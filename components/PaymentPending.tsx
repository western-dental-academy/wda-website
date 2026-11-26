"use client";

// Shown on a success page when the card payment went through on Clover's page
// but Clover's webhook hasn't reached the site yet (usually a few seconds).
// Refreshes every 3 seconds for about 30 seconds, then stops and tells the
// customer their payment was received and the confirmation will follow by email.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const POLL_MS = 3000;
const GIVE_UP_MS = 30000;

export default function PaymentPending() {
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const started = Date.now();
    const id = setInterval(() => {
      if (Date.now() - started >= GIVE_UP_MS) {
        setTimedOut(true);
        clearInterval(id);
        return;
      }
      router.refresh();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [router]);

  return (
    <section className="py-24" style={{ backgroundColor: "#F4F7F9" }}>
      <div className="max-w-md mx-auto px-6">
        <div
          className="rounded-2xl p-10 sm:p-14 bg-white text-center"
          style={{ border: "1.5px solid rgba(30,53,96,0.09)", boxShadow: "0 4px 24px rgba(30,53,96,0.06)" }}
        >
          {timedOut ? (
            <div
              className="w-14 h-14 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ backgroundColor: "rgba(74,159,212,0.12)" }}
              aria-hidden
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#4A9FD4" strokeWidth={2.25} className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
          ) : (
            <div
              className="w-12 h-12 rounded-full mx-auto mb-6 border-4 animate-spin"
              style={{ borderColor: "rgba(74,159,212,0.25)", borderTopColor: "#4A9FD4" }}
              aria-hidden
            />
          )}
          <h1
            className="text-2xl font-bold mb-3"
            style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            {timedOut ? "Payment received" : "Confirming your payment…"}
          </h1>
          <p className="text-sm" style={{ color: "rgba(43,48,58,0.65)" }} role="status">
            {timedOut
              ? "Thank you. We're finishing your order now, and your confirmation email will arrive shortly. You don't need to pay again, and you can close this page."
              : "This usually takes a few seconds. Please keep this page open."}
          </p>
          <p className="text-xs mt-6" style={{ color: "rgba(43,48,58,0.5)" }}>
            No email within an hour? Contact{" "}
            <a href="mailto:info@westerndentalacademy.com" style={{ color: "#378ADD" }}>info@westerndentalacademy.com</a>{" "}
            or call 780-307-3275.
          </p>
        </div>
      </div>
    </section>
  );
}
