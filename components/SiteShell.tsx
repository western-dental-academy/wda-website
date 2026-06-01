"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const STANDALONE_ROUTES = ["/coming-soon"];

export default function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const standalone = STANDALONE_ROUTES.includes(pathname);

  if (standalone) {
    return <main id="main-content" className="flex-1">{children}</main>;
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-[#1E3560] focus:shadow-lg focus:ring-2 focus:ring-[#4A9FD4]"
      >
        Skip to main content
      </a>
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          id="main-content"
          className="flex-1 pt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </>
  );
}
