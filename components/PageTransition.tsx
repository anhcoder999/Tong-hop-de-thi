"use client";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";
// Key theo đường dẫn: mỗi lần đổi route, main remount và chạy lại fade + trượt lên 20px
export default function PageTransition({ children }: { children: ReactNode }) {
  const duongDan = usePathname();
  return (
    <motion.main key={duongDan} variants={fadeInUp} initial="hidden" animate="visible" className="flex-1">
      {children}
    </motion.main>
  );
}