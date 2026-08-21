"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE = "cubic-bezier(0.23, 0.86, 0.39, 0.96)";

export function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.06]",
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}) {
  return (
    // Entrance: CSS animation with fill-mode:both so opacity:0 applies before
    // JS loads — prevents the Framer Motion v12 SSR flash.
    // Dynamic rotate values are passed via CSS custom properties.
    <div
      className={cn("absolute pointer-events-none", className)}
      style={{
        "--shape-r": `${rotate}deg`,
        "--shape-r-from": `${rotate - 15}deg`,
        animationName: "elegantShapeIn",
        animationDuration: "2.4s",
        animationDelay: `${delay}s`,
        animationTimingFunction: EASE,
        animationFillMode: "both",
      } as CSSProperties}
    >
      {/* Float loop — infinite, no initial prop, safe to keep as Framer Motion */}
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{ width, height }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "border border-white/[0.08]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.04)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.06),transparent_70%)]"
          )}
        />
      </motion.div>
    </div>
  );
}
