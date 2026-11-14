"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { IconSeal, InkLine } from "@/components/Icons";
import { buttonTap, spring } from "@/lib/animations";
const LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/admin", label: "Quản trị" },
];
export default function Navbar() {
  const duongDan = usePathname();
  const [cuon, setCuon] = useState(false);
  useEffect(() => {
    const f = () => setCuon(window.scrollY > 8);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        cuon ? "border-ink/20 bg-paper/90 shadow-paper backdrop-blur-md" : "border-ink/10 bg-paper/60 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <motion.span whileTap={buttonTap} className="grid h-9 w-9 place-items-center border border-ink/40 bg-paper-light text-ink">
            <IconSeal className="h-5 w-5" />
          </motion.span>
          <span className="font-display text-lg font-bold tracking-tight text-ink">
            Đề<span className="text-accent">.</span>Thi
          </span>
        </Link>
        <nav className="flex items-center gap-5">
          {LINKS.map(({ href, label }) => {
            const active = href === "/" ? duongDan === "/" || duongDan.startsWith("/de") : duongDan.startsWith(href);
            return (
              <motion.div key={href} whileTap={buttonTap}>
                <Link
                  href={href}
                  className={`relative pb-1 text-sm font-semibold uppercase tracking-[0.12em] transition-colors ${
                    active ? "text-accent" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {label}
                  {active && (
                    <motion.span layoutId="nav-ink" transition={spring} className="absolute inset-x-0 -bottom-0.5 text-accent">
                      <InkLine className="h-1.5 w-full" />
                    </motion.span>
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