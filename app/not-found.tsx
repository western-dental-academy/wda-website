import Image from "next/image";
import Link from "next/link";
import { Home, GraduationCap, MessageCircle } from "lucide-react";

const cards = [
  {
    icon: Home,
    title: "Homepage",
    description: "Head back to the start and explore everything WDA has to offer.",
    href: "/",
  },
  {
    icon: GraduationCap,
    title: "Our Programs",
    description: "Browse dental assisting programs, tuition info, and upcoming start dates.",
    href: "/programs",
  },
  {
    icon: MessageCircle,
    title: "Contact Us",
    description: "Our team is happy to help point you in the right direction.",
    href: "/contact",
  },
];

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center">

      {/* Logo */}
      <Link href="/" aria-label="Western Dental Academy — Home" className="mb-10 opacity-80 hover:opacity-100 transition-opacity duration-200">
        <Image
          src="/Western Dental Academy Logo - Updated.svg"
          alt="Western Dental Academy Logo"
          width={1000}
          height={1000}
          className="h-16 w-auto object-contain"
        />
      </Link>

      {/* 404 */}
      <p
        className="text-[6rem] sm:text-[8rem] font-bold leading-none select-none mb-2"
        style={{
          fontFamily: "var(--font-montserrat), sans-serif",
          color: "#1E3560",
          letterSpacing: "-0.04em",
          opacity: 0.12,
        }}
        aria-hidden
      >
        404
      </p>

      {/* Headline + subheading */}
      <h1
        className="text-2xl sm:text-3xl font-bold text-[#1E3560] mb-3 -mt-4"
        style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
      >
        Looks Like This Page Is Missing
      </h1>
      <p className="text-sm leading-relaxed text-[#2B303A]/55 max-w-sm mb-14">
        The page you&apos;re looking for may have moved or doesn&apos;t exist.
        Here are a few places that might help.
      </p>

      {/* Navigation cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-12">
        {cards.map(({ icon: Icon, title, description, href }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-xl p-6 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            style={{
              backgroundColor: "#F4F7F9",
              border: "1px solid rgba(30,53,96,0.07)",
            }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 transition-colors duration-200 group-hover:bg-[#4A9FD4]"
              style={{ backgroundColor: "rgba(74,159,212,0.1)" }}
            >
              <Icon
                className="w-4 h-4 transition-colors duration-200 group-hover:text-white text-[#4A9FD4]"
                strokeWidth={1.75}
              />
            </div>
            <p
              className="text-sm font-bold text-[#1E3560] mb-1.5"
              style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              {title}
            </p>
            <p className="text-xs leading-relaxed text-[#2B303A]/55">{description}</p>
          </Link>
        ))}
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link
          href="/"
          className="rounded-lg px-7 py-3 text-sm font-bold text-white transition-colors duration-200 bg-[#4A9FD4] hover:bg-[#1E3560]"
        >
          Back to Homepage
        </Link>
        <Link
          href="/contact"
          className="text-sm font-semibold text-[#2B303A]/50 hover:text-[#1E3560] transition-colors duration-200"
        >
          Contact Us →
        </Link>
      </div>

    </div>
  );
}
