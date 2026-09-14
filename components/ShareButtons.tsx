"use client";

import { useState } from "react";

export interface ShareButtonsProps {
  url: string;
  title: string;
  imageUrl?: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [igCopied, setIgCopied] = useState(false);

  const encoded = encodeURIComponent(url);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // fallback: select text from a temp input
      const el = document.createElement("input");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  }

  async function handleInstagram() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("input");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setIgCopied(true);
    setTimeout(() => setIgCopied(false), 4000);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {/* LinkedIn */}
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share "${title}" on LinkedIn`}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-85"
          style={{ backgroundColor: "#0A66C2" }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden>
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          LinkedIn
        </a>

        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share "${title}" on Facebook`}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-85"
          style={{ backgroundColor: "#1877F2" }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden>
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </a>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          aria-label="Copy link to clipboard"
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-85"
          style={{ backgroundColor: "#0D3B6E" }}
        >
          {linkCopied ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 shrink-0" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
              </svg>
              Copy Link
            </>
          )}
        </button>

        {/* Instagram */}
        <div className="relative">
          <button
            onClick={handleInstagram}
            aria-label="Share to Instagram Story"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-85"
            style={{ background: "linear-gradient(135deg, #833ab4, #fd1d1d, #E1306C)" }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden>
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
            </svg>
            Instagram
          </button>

          {igCopied && (
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-xl px-4 py-3 text-xs text-white shadow-lg z-10"
              style={{ backgroundColor: "#1E3560" }}
              role="status"
            >
              <p className="font-semibold mb-1">Link copied!</p>
              <p style={{ color: "rgba(255,255,255,0.75)" }}>
                Open Instagram, create a Story, and paste the link using the Link sticker.
              </p>
              {/* Arrow */}
              <span
                className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"
                style={{ borderTopColor: "#1E3560" }}
                aria-hidden
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
