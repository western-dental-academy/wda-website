import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "National Practical Evaluation Guided Practice Workshop",
  description:
    "An 8-hour hands-on workshop to prepare dental assisting candidates for the NDAEB Clinical Practice Evaluation. Covers all nine CPE clinical skills, infection prevention, ergonomics, and exam strategies.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
