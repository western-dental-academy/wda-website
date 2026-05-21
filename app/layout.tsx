import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import { SanityLive } from "@/sanity/lib/live";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-open-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Western Dental Academy | Dental Assistant Training Edmonton",
    template: "%s | Western Dental Academy",
  },
  description:
    "Western Dental Academy trains the next generation of dental professionals through hands-on clinical training and modern curriculum in Edmonton, Alberta.",
  icons: {
    icon: "/wda-logo-notext.svg",
  },
  openGraph: {
    title: "Western Dental Academy",
    description: "Dental assistant training in Edmonton, Alberta.",
    url: "https://westerndentalacademy.com",
    siteName: "Western Dental Academy",
    images: [{ url: "/og-image.jpg" }],
    locale: "en_CA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${openSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pt-20">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <SanityLive />
        <CookieConsent />
      </body>
    </html>
  );
}
