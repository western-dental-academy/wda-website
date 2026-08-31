import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";
import SiteShell from "@/components/SiteShell";
import CookieConsent from "@/components/CookieConsent";
import MicrosoftClarity from "@/components/MicrosoftClarity";
import { SanityLive } from "@/sanity/lib/live";
import RecaptchaProvider from '@/components/RecaptchaProvider'
import NextTopLoader from 'nextjs-toploader'

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-montserrat",
  display: "optional",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-open-sans",
  display: "optional",
});

export const metadata: Metadata = {
  title: {
    default: "Western Dental Academy | Dental Professional Development Edmonton",
    template: "%s | Western Dental Academy",
  },
  description:
    "Western Dental Academy trains the next generation of dental professionals through hands-on clinical training and modern curriculum in Edmonton, Alberta.",
  manifest: "/site.webmanifest",
  verification: {
    google: "W0YHDjTkJHZIJUqWXgaikKh6KxGXCA29j1mg1hnNNFM",
  },
  icons: {
    icon: [
      {
        url: "/Western Dental Academy Logo- Inverted-Icon Only-Updated.svg",
        type: "image/svg+xml",
      },
    ],
  },
  openGraph: {
    title: "Western Dental Academy",
    description: "Dental professional development in Edmonton, Alberta.",
    url: "https://westerndentalacademy.com",
    siteName: "Western Dental Academy",
    images: [
      {
        url: "/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Western Dental Academy",
      },
    ],
    locale: "en_CA",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

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
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Western Dental Academy",
            "url": "https://westerndentalacademy.com",
            "logo": "https://westerndentalacademy.com/Western Dental Academy Logo - Alternate.svg",
            "description": "Western Dental Academy offers professional development opportunities for dental professionals in Edmonton, Alberta including workshops, guest speakers, and courses.",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "150 Chippewa Road, Suite 258",
              "addressLocality": "Sherwood Park",
              "addressRegion": "AB",
              "addressCountry": "CA"
            },
            "email": "info@westerndentalacademy.com",
            "sameAs": [
              "https://www.instagram.com/westerndentalacademy/",
              "https://www.facebook.com/profile.php?id=61591275340547",
              "https://www.linkedin.com/company/western-dental-academy/"
            ]
          }) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Western Dental Academy",
            "url": "https://westerndentalacademy.com",
            "description": "Professional development for dental professionals in Edmonton Area, Alberta. Workshops, courses, guest speakers, and practical exam preparation.",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "150 Chippewa Road, Suite 258",
              "addressLocality": "Sherwood Park",
              "addressRegion": "AB",
              "postalCode": "T8H 0P6",
              "addressCountry": "CA"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 53.5355,
              "longitude": -113.3048
            },
            "email": "info@westerndentalacademy.com",
            "priceRange": "$$",
            "areaServed": "Edmonton Area, Alberta"
          }) }}
        />
        <NextTopLoader color="#E67E22" height={3} showSpinner={false} />
        <RecaptchaProvider>
          <ClerkProvider>
            <SiteShell>{children}</SiteShell>
            <SanityLive />
            <CookieConsent />
            <MicrosoftClarity />
          </ClerkProvider>
        </RecaptchaProvider>
      </body>
    </html>
  );
}