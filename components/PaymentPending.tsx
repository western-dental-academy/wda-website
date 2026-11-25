// Shown on a success page when the card payment went through on Clover's page
// but Clover's webhook hasn't reached the site yet (usually a few seconds).
// The page refreshes itself every 3 seconds until the payment is confirmed.
export default function PaymentPending() {
  return (
    <section className="py-24" style={{ backgroundColor: "#F4F7F9" }}>
      <meta httpEquiv="refresh" content="3" />
      <div className="max-w-md mx-auto px-6">
        <div
          className="rounded-2xl p-10 sm:p-14 bg-white text-center"
          style={{ border: "1.5px solid rgba(30,53,96,0.09)", boxShadow: "0 4px 24px rgba(30,53,96,0.06)" }}
        >
          <div
            className="w-12 h-12 rounded-full mx-auto mb-6 border-4 animate-spin"
            style={{ borderColor: "rgba(74,159,212,0.25)", borderTopColor: "#4A9FD4" }}
            aria-hidden
          />
          <h1
            className="text-2xl font-bold mb-3"
            style={{ color: "#1E3560", fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            Confirming your payment…
          </h1>
          <p className="text-sm" style={{ color: "rgba(43,48,58,0.65)" }} role="status">
            This usually takes a few seconds. Please keep this page open. You&apos;ll also get a confirmation
            email once it&apos;s done.
          </p>
          <p className="text-xs mt-6" style={{ color: "rgba(43,48,58,0.5)" }}>
            Still waiting after a minute? Email{" "}
            <a href="mailto:info@westerndentalacademy.com" style={{ color: "#378ADD" }}>info@westerndentalacademy.com</a>{" "}
            or call 780-307-3275.
          </p>
        </div>
      </div>
    </section>
  );
}
