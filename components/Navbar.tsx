"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Professional Development", href: "/professional-development" },
  { label: "National Board Guided Practice", href: "/national-board-guided-practice" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll(); // sync with actual scroll position on mount
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // When mobile menu opens, prevent body scroll
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm"
          : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      {/* ── Desktop nav ─────────────────────────────────────────────────── */}
      <nav
        aria-label="Primary navigation"
        className="max-w-6xl mx-auto px-6 py-1 flex items-center justify-between"
      >
        {/* Logo */}
        <Link
          href="/"
          aria-label="Western Dental Academy – Home"
          className="shrink-0"
        >
          <motion.div
            className="inline-flex"
            whileHover={{ scale: 1.04, transition: { duration: 0.2, ease: "easeOut" } }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Western Dental Academy Logo - Alternate.svg"
              alt=""
              style={{ height: '56px', width: 'auto' }}
              className="shrink-0"
            />
          </motion.div>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-6">
          <ul className="flex items-center gap-5" role="list">
            {navLinks.map(({ label, href }) => {
              const active = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`relative text-sm font-semibold tracking-wide transition-colors duration-200 after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-[#4A9FD4] after:transition-transform after:duration-200 hover:text-[#4A9FD4] hover:after:scale-x-100 ${
                      active
                        ? "text-[#4A9FD4] after:scale-x-100"
                        : "text-[#1E3560]"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/portal"
              aria-label="Student Login"
              className="flex items-center gap-1.5 rounded-lg border border-[#1E3560]/20 px-3.5 py-2 text-sm font-semibold text-[#1E3560]/65 transition-colors duration-200 hover:border-[#1E3560]/45 hover:text-[#1E3560] whitespace-nowrap"
            >
              <Lock className="w-3.5 h-3.5 shrink-0" strokeWidth={2} aria-hidden />
              Student Login
            </Link>

            <div className="w-px h-5 bg-[#1E3560]/15 shrink-0" aria-hidden />

            <Link
              href="/register"
              className="rounded-lg bg-[#E67E22] px-4 py-2 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#CF6D17] whitespace-nowrap"
            >
              Enroll
            </Link>
          </div>
        </div>

        {/* Hamburger button */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="lg:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-md transition-colors hover:bg-[#F4F7F9]"
        >
          <span
            className={`block h-0.5 w-5 rounded-full bg-[#1E3560] transition-all duration-300 ${
              menuOpen ? "translate-y-2 rotate-45" : ""
            }`}
            aria-hidden
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-[#1E3560] transition-all duration-300 ${
              menuOpen ? "opacity-0 scale-x-0" : ""
            }`}
            aria-hidden
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-[#1E3560] transition-all duration-300 ${
              menuOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
            aria-hidden
          />
        </button>
      </nav>

      {/* ── Mobile menu ─────────────────────────────────────────────────── */}
      <div
        id="mobile-menu"
        aria-hidden={!menuOpen}
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-[30rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav aria-label="Mobile navigation">
          <div className="bg-white/95 backdrop-blur-md border-t border-[#F4F7F9] px-6 py-4 flex flex-col gap-1">
            {navLinks.map(({ label, href }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  tabIndex={menuOpen ? 0 : -1}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-lg px-4 py-3 text-sm font-semibold tracking-wide transition-colors duration-200 ${
                    active
                      ? "bg-[#F4F7F9] text-[#4A9FD4]"
                      : "text-[#1E3560] hover:bg-[#F4F7F9] hover:text-[#4A9FD4]"
                  }`}
                >
                  {label}
                </Link>
              );
            })}

            {/* Separator */}
            <div className="my-2 border-t border-[#1E3560]/8" aria-hidden />

            {/* Student Login */}
            <Link
              href="/portal"
              tabIndex={menuOpen ? 0 : -1}
              aria-label="Student Login"
              className="flex items-center justify-center gap-2 rounded-lg border border-[#1E3560]/20 px-5 py-3 text-sm font-semibold text-[#1E3560]/65 transition-colors duration-200 hover:border-[#1E3560]/40 hover:text-[#1E3560]"
            >
              <Lock className="w-4 h-4 shrink-0" strokeWidth={2} aria-hidden />
              Student Login
            </Link>

            <Link
              href="/register"
              tabIndex={menuOpen ? 0 : -1}
              className="rounded-lg bg-[#E67E22] px-5 py-3 text-center text-sm font-bold text-white transition-colors duration-200 hover:bg-[#CF6D17]"
            >
              Enroll
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
