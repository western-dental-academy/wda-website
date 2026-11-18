import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SHOW_NDAEB_CONTENT } from "@/lib/featureFlags";

export const metadata: Metadata = SHOW_NDAEB_CONTENT
  ? {
      title: "National Practical Evaluation Guided Practice Workshop",
      description:
        "An 8-hour hands-on workshop to prepare dental assisting candidates for the NDAEB Clinical Practice Evaluation. Covers all nine CPE clinical skills, infection prevention, ergonomics, and exam strategies.",
    }
  : { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  if (!SHOW_NDAEB_CONTENT) notFound();
  return <>{children}</>;
}
