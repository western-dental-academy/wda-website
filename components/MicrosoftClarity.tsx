"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "wda_cookie_consent";
const CONSENT_EVENT = "wda-consent-changed";
const SCRIPT_ID = "microsoft-clarity-script";

export default function MicrosoftClarity() {
  const [consented, setConsented] = useState(false);

  // Check consent on mount, then stay in sync if the user accepts mid-session
  useEffect(() => {
    function checkConsent() {
      setConsented(localStorage.getItem(STORAGE_KEY) === "accepted");
    }
    checkConsent();
    window.addEventListener(CONSENT_EVENT, checkConsent);
    return () => window.removeEventListener(CONSENT_EVENT, checkConsent);
  }, []);

  useEffect(() => {
    const clarityId = "ybgoq5pp4m";
    if (!consented || !clarityId) return;
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.innerHTML = `
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${clarityId}");
    `;
    document.head.appendChild(script);
  }, [consented]);

  return null;
}
