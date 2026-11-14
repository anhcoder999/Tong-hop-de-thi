"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { IconSeal, InkLine } from "@/components/Icons";
import { buttonTap, spring } from "@/lib/animations";
import { useHoverCapable } from "@/lib/useHover";
import { useAuth } from "@/lib/auth";
const chuDau = (s: string) => {
  const w = s.trim().split(/\s+/).filter(Boolean);
  if (w.length === 0) return "DT";
  return w.slice(-2).map((x) => x[0]?.toUpperCase() ?? "").join("") || "DT";
};
export default function Navbar() {
  const duongDan = usePathname();
  const hover = useHoverCapable();
  const { user, hoSo, isAdmin, loading, signOut } = useAuth();
  const [cuon, setCuon] = useState(false);
  useEffect(() => {
    const f = () => setCuon(window.scrollY > 8);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  const dangChon = (href: string) =>
    href === "/" ? duongDan === "/" || duongDan.startsWith("/de") : duongDan.startsWith(href);
  const links = [
    { href: "/", label: "Trang chủ", hien: true },
    { href: "/admin", label: "Quản trị", hien: isAdmin },
    { href: "/tai-khoan", label: "Tài khoản", hien: !!user },
  ].filter((l) => l.hien);
  const tenChip = hoSo?.ho_ten?.trim() || user?.email?.split("@")[0] || "DT";
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
        <nav className="hidden min-w-0 items-center gap-5 sm:flex">
          {links.map(({ href, label }) => (
            <motion.div key={href} whileTap={buttonTap} whileHover={hover ? { y: -1 } : undefined} transition={spring}>
              <Link
                href={href}
                className={`relative whitespace-nowrap pb-1 text-sm font-semibold uppercase tracking-[0.12em] transition-colors ${
                  dangChon(href) ? "text-accent" : "text-ink-soft hover:text-ink"
                }`}
              >
                {label}
                {dangChon(href) && (
                  <motion.span layoutId="nav-ink-d" transition={spring} className="absolute inset-x-0 -bottom-0.5 text-accent">
                    <InkLine className="h-1.5 w-full" />
                  </motion.span>
                )}
              </Link>
            </motion.div>
          ))}
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
                  className={`relative whitespace-nowrap pb-1 text-sm font-semibold uppercase tracking-[0.12em] transition-colors ${
                    dangChon("/login") ? "text-accent" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  Đăng nhập
                  {dangChon("/login") && (
                    <motion.span layoutId="nav-ink-d" transition={spring} className="absolute inset-x-0 -bottom-0.5 text-accent">
                      <InkLine className="h-1.5 w-full" />
                    </motion.span>
                  )}
                </Link>
              )}
            </motion.div>
          )}
        </nav>
        <nav className="flex min-w-0 items-center gap-3 sm:hidden">
          {isAdmin && (
            <motion.div whileTap={buttonTap}>
              <Link
                href="/admin"
                className={`relative whitespace-nowrap pb-1 text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
                  dangChon("/admin") ? "text-accent" : "text-ink-soft"
                }`}
              >
                Quản trị
                {dangChon("/admin") && (
                  <motion.span layoutId="nav-ink-m" transition={spring} className="absolute inset-x-0 -bottom-0.5 text-accent">
                    <InkLine className="h-1.5 w-full" />
                  </motion.span>
                )}
              </Link>
            </motion.div>
          )}
          {!loading &&
            (user ? (
              <motion.div whileTap={buttonTap}>
                <Link
                  href="/tai-khoan"
                  aria-label="Trang cá nhân"
                  className={`grid h-9 w-9 place-items-center border font-display text-xs font-bold transition-colors ${
                    dangChon("/tai-khoan") ? "border-accent bg-accent-wash text-accent" : "border-ink/40 bg-paper-light text-ink"
                  }`}
                >
                  {chuDau(tenChip)}
                </Link>
              </motion.div>
            ) : (
              <motion.div whileTap={buttonTap}>
                <Link
                  href="/login"
                  className={`relative whitespace-nowrap pb-1 text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
                    dangChon("/login") ? "text-accent" : "text-ink-soft"
                  }`}
                >
                  Đăng nhập
                  {dangChon("/login") && (
                    <motion.span layoutId="nav-ink-m" transition={spring} className="absolute inset-x-0 -bottom-0.5 text-accent">
                      <InkLine className="h-1.5 w-full" />
                    </motion.span>
                  )}
                </Link>
              </motion.div>
            ))}
        </nav>
      </div>
    </header>
  );
}