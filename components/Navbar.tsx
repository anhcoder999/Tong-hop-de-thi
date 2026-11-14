"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { buttonTap, spring } from "@/lib/animations";
const LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/admin", label: "Admin" },
];
export default function Navbar() {
  const duongDan = usePathname();
  const [cuon, setCuon] = useState(false);
  // Cuộn quá 8px thì bật kính mờ + đổ bóng, listener passive cho mượt mobile
  useEffect(() => {
    const onScroll = () => setCuon(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        cuon ? "border-b border-slate-200/70 bg-white/70 shadow-soft backdrop-blur-xl" : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <motion.span
            whileTap={buttonTap}
            className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-white shadow-lift"
          >
            <GraduationCap size={18} />
          </motion.span>
          <span className="text-[15px] font-bold tracking-tight sm:text-base">
            Tổng Hợp <span className="text-gradient">Đề Thi</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {LINKS.map(({ href, label }) => {
            // Trang xem đề /de/... vẫn tính là đang ở khu Trang chủ
            const dangChon = href === "/" ? duongDan === "/" || duongDan.startsWith("/de") : duongDan.startsWith(href);
            return (
              <motion.div key={href} whileTap={buttonTap}>
                <Link
                  href={href}
                  className={`relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                    dangChon ? "text-brand-700" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {label}
                  {/* Gạch chân dùng chung layoutId để trượt giữa 2 mục menu */}
                  {dangChon && (
                    <motion.span
                      layoutId="nav-underline"
                      transition={spring}
                      className="absolute inset-x-3 bottom-0.5 h-0.5 rounded-full bg-brand-gradient"
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>
    </header>
  );
}