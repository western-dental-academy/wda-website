import type { Metadata } from "next";
import Link from "next/link";
import WorkshopRegisterForm from "@/components/WorkshopRegisterForm";
import { FloatingPaths } from "@/components/ui/background-paths";

export const metadata: Metadata = {
  title: "Register for Professional Development",
  description:
    "Register for a professional development workshop or course at Western Dental Academy. Secure checkout via Stripe.",
};

export default function RegisterPage() {
  return (
    <>
      {/* ── Page hero ──────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: "#1E3560" }}
      >
        {/* Dot-grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #4A9FD4 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Radial accent */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(74,159,212,0.13) 0%, transparent 70%)",
          }}
        />
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />

        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-20">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-10">
            <ol className="flex items-center gap-2 text-xs font-semibold">
              <li>
                <Link
                  href="/"
                  className="transition-colors duration-200 hover:text-white"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  Home
                </Link>
              </li>
              <li style={{ color: "rgba(255,255,255,0.25)" }} aria-hidden>/</li>
              <li>
                <Link
                  href="/professional-development"
                  className="transition-colors duration-200 hover:text-white"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  Professional Development
                </Link>
              </li>
              <li style={{ color: "rgba(255,255,255,0.25)" }} aria-hidden>/</li>
              <li style={{ color: "rgba(255,255,255,0.7)" }}>Register</li>
            </ol>
          </nav>

          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7"
            style={{
              backgroundColor: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.13)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: "#E67E22" }}
            />
            <span
              className="text-xs font-semibold tracking-[0.18em] uppercase"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Workshop Registration
            </span>
          </div>

          <h1
            className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5 max-w-2xl"
            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            Register for{" "}
            <span style={{ color: "#4A9FD4" }}>Professional Development.</span>
          </h1>

          <p
            className="text-lg leading-relaxed max-w-xl mb-8"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            Register one or more attendees in a single transaction. Add each person
            to your cart, then proceed to secure checkout — everyone gets their
            own confirmation email.
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-6">
            {[
              { value: "1 cart", label: "Per group" },
              { value: "~3 min", label: "To complete" },
              { value: "Instant", label: "Confirmation" },
            ].map(({ value, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <span className="text-lg font-bold" style={{ color: "#4A9FD4" }}>
                  {value}
                </span>
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="absolute bottom-0 inset-x-0 h-px"
          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          aria-hidden
        />
      </section>

      {/* ── Form ───────────────────────────────────── */}
      <section className="py-16" style={{ backgroundColor: "#F4F7F9" }}>
        <div className="max-w-5xl mx-auto px-6">
          <WorkshopRegisterForm />

          <p
            className="text-xs text-center mt-6 leading-relaxed"
            style={{ color: "rgba(43,48,58,0.45)" }}
          >
            Questions before registering?{" "}
            <Link
              href="/professional-development"
              className="font-semibold hover:text-[#1E3560] transition-colors"
              style={{ color: "#4A9FD4" }}
            >
              View all workshops
            </Link>{" "}
            or{" "}
            <Link
              href="/contact"
              className="font-semibold hover:text-[#1E3560] transition-colors"
              style={{ color: "#4A9FD4" }}
            >
              contact us directly
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
