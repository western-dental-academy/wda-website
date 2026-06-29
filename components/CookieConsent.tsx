"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GoogleAnalytics } from "@next/third-parties/google";

const STORAGE_KEY = "wda_cookie_consent";
const CONSENT_EVENT = "wda-consent-changed";

export default function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [consent, setConsent] = useState<"accepted" | "declined" | null>(null);
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setMounted(true);
    if (stored === "accepted" || stored === "declined") {
      setConsent(stored);
    } else {
      // Delay so the slide-up animation plays after initial paint
      const t = setTimeout(() => setBannerVisible(true), 350);
      return () => clearTimeout(t);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    window.dispatchEvent(new Event(CONSENT_EVENT));
    setBannerVisible(false);
    // Wait for slide-down before removing from DOM
    setTimeout(() => setConsent("accepted"), 480);
  }

  function handleDecline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    setBannerVisible(false);
    setTimeout(() => setConsent("declined"), 480);
  }

  // Render nothing until hydrated — prevents SSR/client mismatch
  if (!mounted) return null;

  return (
    <>
      {/* Load GA only after explicit acceptance */}
      {consent === "accepted" && process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}

      {/* Banner — kept in DOM while animating out, removed once consent is set */}
      {consent === null && (
        <div
          role="dialog"
          aria-label="Cookie preferences"
          aria-live="polite"
          className={`fixed bottom-0 inset-x-0 z-[100] bg-white transition-transform duration-500 ease-out ${
            bannerVisible ? "translate-y-0" : "translate-y-full"
          }`}
          style={{
            borderTop: "1px solid rgba(30,53,96,0.1)",
            boxShadow: "0 -4px 32px rgba(0,0,0,0.09)",
          }}
        >
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-10">

            {/* Cookie icon + text */}
            <div className="flex items-start gap-3.5 flex-1 min-w-0">
              <span className="text-lg shrink-0 mt-0.5" aria-hidden>
                🍪
              </span>
              <div>
                <p
                  className="text-sm font-bold text-[#1E3560] mb-0.5"
                  style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
                >
                  We use cookies
                </p>
                <p className="text-xs leading-relaxed text-[#2B303A]/60">
                  This site uses cookies to improve your experience and measure
                  site usage via analytics tools. No personal data is sold.{" "}
                  <Link
                    href="/privacy-policy"
                    className="underline underline-offset-2 text-[#4A9FD4] hover:text-[#1E3560] transition-colors duration-200"
                  >
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 shrink-0 sm:ml-auto">
              <button
                onClick={handleDecline}
                className="rounded-lg border border-[#1E3560]/25 px-5 py-2 text-sm font-semibold text-[#1E3560] transition-colors duration-200 hover:border-[#1E3560]/50 hover:bg-[#F4F7F9]"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="rounded-lg px-5 py-2 text-sm font-bold text-white transition-colors duration-200 bg-[#E67E22] hover:bg-[#CF6D17]"
              >
                Accept All
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
