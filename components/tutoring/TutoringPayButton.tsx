"use client";

import { useState } from "react";

export default function TutoringPayButton({ id, token, label }: { id: string; token: string; label: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tutoring/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error ?? "Could not start checkout. Please try again.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={pay}
        disabled={loading}
        className="w-full rounded-lg py-3.5 text-sm font-bold text-white transition-colors duration-200 bg-[#4A9FD4] hover:bg-[#1E3560] disabled:bg-[#1E3560] disabled:cursor-not-allowed"
      >
        {loading ? "Opening secure checkout…" : label}
      </button>
      {error && (
        <p className="text-xs font-medium mt-4 px-4 py-3 rounded-lg" style={{ backgroundColor: "rgba(220,38,38,0.07)", color: "rgb(185,28,28)" }} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
