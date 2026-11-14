"use client";
import { motion } from "framer-motion";
import { EASE } from "@/lib/animations";
export default function InkDraw({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 8" preserveAspectRatio="none" fill="none" aria-hidden="true" className={className ?? "h-2 w-full"}>
      <motion.path
        d="M2 5C20 2 38 7 58 4S96 6 118 3"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}
      />
    </svg>
  );
}