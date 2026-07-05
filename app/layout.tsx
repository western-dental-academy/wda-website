import {ClerkProvider} from "@clerk/nextjs";
import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";
import SiteShell from "@/components/SiteShell";
import CookieConsent from "@/components/CookieConsent";
import MicrosoftClarity from "@/components/MicrosoftClarity";
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
    description: "Dental assistant training in Edmonton, Alberta.",
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
        <ClerkProvider>
          <SiteShell>{children}</SiteShell>
          <SanityLive />
          <CookieConsent />
          <MicrosoftClarity />
        </ClerkProvider>
      </body>
    </html>
  );
}