"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { IconSeal, InkLine } from "@/components/Icons";
import { buttonTap, spring } from "@/lib/animations";
import { useHoverCapable } from "@/lib/useHover";
import { useAuth } from "@/lib/auth";
export default function Navbar() {
  const duongDan = usePathname();
  const hover = useHoverCapable();
  const { user, isAdmin, loading, signOut } = useAuth();
  const [cuon, setCuon] = useState(false);
  useEffect(() => {
    const f = () => setCuon(window.scrollY > 8);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  const links = isAdmin
    ? [
        { href: "/", label: "Trang chủ" },
        { href: "/admin", label: "Quản trị" },
      ]
    : [{ href: "/", label: "Trang chủ" }];
  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        cuon ? "border-ink/20 bg-paper/90 shadow-paper backdrop-blur-md" : "border-ink/10 bg-paper/60 backdrop-blur-sm"
      }`}
    >
      <div className={`mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 transition-all duration-300 ${cuon ? "h-14" : "h-16"}`}>
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <motion.span
            initial={{ scale: 1.35, rotate: -14, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={spring}
            whileTap={buttonTap}
            className="grid h-9 w-9 place-items-center border border-ink/40 bg-paper-light text-ink"
          >
            <IconSeal className="h-5 w-5" />
          </motion.span>
          <span className="font-display text-lg font-bold tracking-tight text-ink">
            Đề<span className="text-accent">.</span>Thi
          </span>
        </Link>
        <nav className="flex min-w-0 items-center gap-4 sm:gap-5">
          {links.map(({ href, label }) => {
            const active = href === "/" ? duongDan === "/" || duongDan.startsWith("/de") : duongDan.startsWith(href);
            return (
              <motion.div key={href} whileTap={buttonTap} whileHover={hover ? { y: -1 } : undefined} transition={spring}>
                <Link
                  href={href}
                  className={`relative whitespace-nowrap pb-1 text-xs font-semibold uppercase tracking-[0.12em] transition-colors sm:text-sm ${
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
          {!loading && (
            <motion.div whileTap={buttonTap} whileHover={hover ? { y: -1 } : undefined} transition={spring}>
              {user ? (
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="whitespace-nowrap border border-ink/40 bg-paper-light px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft transition-colors active:bg-paper-deep hover:bg-paper"
                >
                  Thoát
                </button>
              ) : (
                <Link
                  href="/login"
                  className={`relative whitespace-nowrap pb-1 text-xs font-semibold uppercase tracking-[0.12em] transition-colors sm:text-sm ${
                    duongDan.startsWith("/login") ? "text-accent" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  Đăng nhập
                  {duongDan.startsWith("/login") && (
                    <motion.span layoutId="nav-ink" transition={spring} className="absolute inset-x-0 -bottom-0.5 text-accent">
                      <InkLine className="h-1.5 w-full" />
                    </motion.span>
                  )}
                </Link>
              )}
            </motion.div>
          )}
        </nav>
      </div>
    </header>
  );
}