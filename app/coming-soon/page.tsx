import type { Metadata } from "next";
import ComingSoonContent from "@/components/ComingSoonContent";

export const metadata: Metadata = {
  title: "Coming Soon | Western Dental Academy",
  description:
    "Western Dental Academy's new website is under construction. We'll be back soon.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ComingSoonPage() {
  return <ComingSoonContent />;
}
