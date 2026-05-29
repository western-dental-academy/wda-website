"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export default function ComingSoonContent() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [videoError, setVideoError] = useState(false);
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "loading" | "success">("idle");
  const [fieldError, setFieldError] = useState("");

  useEffect(() => {
    setParticles(
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 2,
        duration: Math.random() * 8 + 6,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.4 + 0.08,
      }))
    );
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setFieldError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError("Please enter a valid email address.");
      return;
    }
    setFieldError("");
    setEmailStatus("loading");
    // Wire to a real endpoint (e.g. Mailchimp, ConvertKit) when ready
    await new Promise((r) => setTimeout(r, 900));
    setEmailStatus("success");
  }

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#1E3560" }}
    >
      {/* Dot-grid texture */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden
      />

      {/* Ambient radial glow — centre */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 640,
          height: 400,
          background:
            "radial-gradient(ellipse, rgba(74,159,212,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        aria-hidden
      />

      {/* Floating particles — generated client-side to avoid SSR mismatch */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full block"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              backgroundColor: "#4A9FD4",
              opacity: p.opacity,
            }}
            animate={{
              y: [0, -28, 0],
              opacity: [p.opacity, p.opacity * 0.3, p.opacity],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-lg mx-auto px-6 text-center py-16">

        {/* Logo / video */}
        <motion.div
          className="relative mx-auto mb-10 flex items-center justify-center"
          style={{ width: 300, height: 150 }}
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Pulsing glow behind logo */}
          <motion.span
            className="absolute block rounded-full pointer-events-none"
            style={{
              width: 260,
              height: 130,
              background:
                "radial-gradient(ellipse, rgba(74,159,212,0.28) 0%, transparent 68%)",
              filter: "blur(22px)",
            }}
            animate={{ scale: [1, 1.18, 1], opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          />

          {videoError ? (
            <Image
              src="/wda-logo-inverted.svg"
              alt="Western Dental Academy"
              width={240}
              height={96}
              priority
              className="relative z-10"
            />
          ) : (
            <video
              autoPlay
              loop
              muted
              playsInline
              onError={() => setVideoError(true)}
              className="relative z-10 w-full h-full object-contain"
              aria-label="Western Dental Academy logo"
            >
              <source
                src="/assets/WDA%20Logo%20Hyper%20Realistic.webm"
                type="video/webm"
              />
            </video>
          )}
        </motion.div>

        {/* Eyebrow */}
        <motion.p
          className="text-[0.65rem] font-bold uppercase tracking-[0.28em] mb-5"
          style={{
            color: "#4A9FD4",
            fontFamily: "var(--font-montserrat), sans-serif",
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3 }}
        >
          Coming Soon
        </motion.p>

        {/* Headline */}
        <motion.h1
          className="text-3xl sm:text-[2.4rem] font-bold text-white mb-4 leading-tight"
          style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.42 }}
        >
          Something Great Is Coming
        </motion.h1>

        {/* Subheading */}
        <motion.p
          className="text-sm sm:text-[0.95rem] leading-relaxed mb-10 max-w-sm mx-auto"
          style={{ color: "rgba(255,255,255,0.58)" }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.56 }}
        >
          Western Dental Academy&apos;s new website is under construction.
          We&apos;ll be back soon.
        </motion.p>

        {/* Email notify form */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <AnimatePresence mode="wait">
            {emailStatus === "success" ? (
              <motion.div
                key="success"
                role="status"
                aria-live="polite"
                className="flex flex-col items-center gap-2 py-3"
                initial={{ opacity: 0, scale: 0.93 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-1"
                  style={{ backgroundColor: "rgba(74,159,212,0.15)" }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#4A9FD4"
                    strokeWidth={2.25}
                    className="w-5 h-5"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                </div>
                <p
                  className="text-sm font-semibold text-white"
                  style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
                >
                  You&apos;re on the list!
                </p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.48)" }}>
                  We&apos;ll notify you when we launch.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                noValidate
                className="flex flex-col sm:flex-row gap-3"
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
              >
                <div className="flex-1 min-w-0">
                  <label htmlFor="cs-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="cs-email"
                    type="email"
                    autoComplete="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldError) setFieldError("");
                    }}
                    disabled={emailStatus === "loading"}
                    aria-required="true"
                    aria-invalid={!!fieldError || undefined}
                    aria-describedby={fieldError ? "cs-email-err" : undefined}
                    className="w-full rounded-lg px-4 py-3 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.08)",
                      border: fieldError
                        ? "1.5px solid rgba(255,130,130,0.7)"
                        : "1.5px solid rgba(255,255,255,0.18)",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={emailStatus === "loading"}
                  className="shrink-0 rounded-lg px-6 py-3 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#CF6D17] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#E67E22" }}
                >
                  {emailStatus === "loading" ? (
                    <>
                      <span
                        className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white shrink-0"
                        style={{ animation: "spin 0.75s linear infinite" }}
                        aria-hidden
                      />
                      Saving…
                    </>
                  ) : (
                    "Notify Me"
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {fieldError && (
            <p
              id="cs-email-err"
              className="mt-2 text-xs text-left"
              style={{ color: "rgba(255,160,160,0.9)" }}
              role="alert"
            >
              {fieldError}
            </p>
          )}
        </motion.div>

        {/* Divider */}
        <motion.div
          className="my-9 border-t"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          aria-hidden
        />

        {/* Contact info */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-5 text-sm mb-8"
          style={{ color: "rgba(255,255,255,0.55)" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 1.0 }}
        >
          <a
            href="tel:+17800000000"
            className="flex items-center gap-2 transition-colors duration-200 hover:text-white"
          >
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4 shrink-0"
              aria-hidden
            >
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            (780) 000-0000
          </a>

          <span
            className="hidden sm:block w-px h-3.5 self-center"
            style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
            aria-hidden
          />

          <a
            href="mailto:info@westerndentalacademy.com"
            className="flex items-center gap-2 transition-colors duration-200 hover:text-white"
          >
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4 shrink-0"
              aria-hidden
            >
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            info@westerndentalacademy.com
          </a>
        </motion.div>

        {/* Social icons */}
        <motion.div
          className="flex items-center justify-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 1.1 }}
        >
          {/* Instagram */}
          <a
            href="https://instagram.com/westerndentalacademy"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Western Dental Academy on Instagram – opens in new tab"
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 text-white/55 hover:text-white bg-white/[0.08] hover:bg-white/[0.14]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              className="w-[17px] h-[17px]"
              aria-hidden
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
            </svg>
          </a>

          {/* Facebook */}
          <a
            href="https://facebook.com/westerndentalacademy"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Western Dental Academy on Facebook – opens in new tab"
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 text-white/55 hover:text-white bg-white/[0.08] hover:bg-white/[0.14]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-[17px] h-[17px]"
              aria-hidden
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>

          {/* LinkedIn */}
          <a
            href="https://linkedin.com/company/western-dental-academy"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Western Dental Academy on LinkedIn – opens in new tab"
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 text-white/55 hover:text-white bg-white/[0.08] hover:bg-white/[0.14]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-[17px] h-[17px]"
              aria-hidden
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
        </motion.div>

      </div>

      {/* Input placeholder colour (dark background variant) */}
      <style>{`
        #cs-email::placeholder { color: rgba(255,255,255,0.32); }
      `}</style>
    </div>
  );
}
