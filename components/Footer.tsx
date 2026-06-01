import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

const programLinks = [
  { label: "Dental Assisting Certificate", href: "/programs" },
  { label: "Continuing Education", href: "/programs" },
  { label: "Clinical Practicum", href: "/programs" },
  { label: "Dental Office Administration", href: "/programs" },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden>
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "X (Twitter)",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

const contactItems = [
  {
    icon: MapPin,
    label: "Address",
    value: "150 Chippewa Road, Suite 258, Sherwood Park, AB",
    href: undefined,
  },
  {
    icon: Phone,
    label: "Phone",
    value: "(780) 000-0000",
    href: "tel:+17800000000",
  },
  {
    icon: Mail,
    label: "Email",
    value: "info@westerndentalacademy.com",
    href: "mailto:info@westerndentalacademy.com",
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Mon – Fri, 8:00 am – 5:00 pm",
    href: undefined,
  },
];

const HEADING =
  "text-[0.68rem] font-bold uppercase tracking-[0.18em] mb-4 text-[#4A9FD4]";
const LINK =
  "text-sm text-white/65 hover:text-white transition-colors duration-200";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: "#1E3560" }}>
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* ── Brand column ───────────────────────────── */}
          <div className="flex flex-col gap-4">

            {/* Logo lockup */}
            <Link href="/" className="flex items-center gap-3 self-start">
              <Image
                src="/wda-logo-inverted-notext.svg"
                alt=""
                width={56}
                height={56}
                className="h-14 w-auto object-contain"
              />
              <div className="w-px h-10 bg-white/20" aria-hidden />
              <div
                className="flex flex-col leading-none gap-1.5"
                style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                <span className="text-[1rem] font-semibold tracking-[0.08em] uppercase text-white/80">
                  Western Dental
                </span>
                <span className="text-[1rem] font-bold tracking-[0.08em] uppercase text-[#4A9FD4]">
                  Academy
                </span>
              </div>
            </Link>

            {/* Tagline */}
            <p className="text-sm leading-relaxed max-w-xs text-white/60">
              Training the next generation of dental professionals through
              hands-on clinical education, modern technology, and a commitment
              to compassionate patient care.
            </p>

            {/* Social icons */}
            <ul className="flex items-center gap-2">
              {socialLinks.map(({ icon, label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    aria-label={label}
                    className="flex items-center justify-center w-9 h-9 rounded-lg text-white/50 bg-white/[0.08] hover:bg-[#4A9FD4] hover:text-white transition-colors duration-200"
                  >
                    {icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Three nav columns ──────────────────────── */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 lg:col-span-2">

            {/* Navigate */}
            <div>
              <p
                className={HEADING}
                style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                Navigate
              </p>
              <ul className="space-y-2">
                {navLinks.map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className={LINK}>
                      {label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/apply"
                    className="text-sm font-bold text-[#E67E22] hover:text-[#F39C52] transition-colors duration-200"
                  >
                    Enroll Now →
                  </Link>
                </li>
              </ul>
            </div>

            {/* Programs */}
            <div>
              <p
                className={HEADING}
                style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                Programs
              </p>
              <ul className="space-y-2">
                {programLinks.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className={LINK}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p
                className={HEADING}
                style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                Contact Us
              </p>
              <ul className="space-y-3">
                {contactItems.map(({ icon: Icon, label, value, href }) => (
                  <li key={label} className="flex items-start gap-2.5">
                    <Icon
                      className="w-4 h-4 shrink-0 mt-0.5 text-[#4A9FD4]"
                      strokeWidth={1.75}
                    />
                    {href ? (
                      <a href={href} className={LINK}>
                        {value}
                      </a>
                    ) : (
                      <span className="text-sm text-white/65">{value}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* ── Bottom bar ─────────────────────────────── */}
        <div
          className="mt-10 pt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          <p className="text-xs text-white/40">
            © {year} Western Dental Academy. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {[
              { label: "Privacy Policy", href: "/privacy-policy" },
              { label: "Terms of Use", href: "/terms-of-use" },
              { label: "Accessibility", href: "/accessibility" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-xs text-white/40 hover:text-white/75 transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
