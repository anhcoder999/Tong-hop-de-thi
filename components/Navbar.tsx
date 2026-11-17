"use client";
import {useEffect, useState} from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {AnimatePresence, motion} from "framer-motion";
import {IconClose, IconSeal} from "@/components/Icons";
import {useAuth} from "@/lib/auth";
import {buttonTap, spring} from "@/lib/animations";
const KHOA_THEME = "dethi.theme";
function MatTroi() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6" />
    </svg>
  );
}
function MatTro() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M20 14.2A8.2 8.2 0 1 1 9.8 4a6.6 6.6 0 0 0 10.2 10.2Z" />
    </svg>
  );
}
function GachMenu() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
      <path d="M4 7h16M4 12h16M4 17h11" />
    </svg>
  );
}
export default function Navbar() {
  const {user, hoSo, isAdmin} = useAuth();
  const duong = usePathname();
  const [toi, setToi] = useState(false);
  const [mo, setMo] = useState(false);
  useEffect(() => {
    setToi(document.documentElement.classList.contains("dark"));
  }, []);
  useEffect(() => {
    setMo(false);
  }, [duong]);
  const doiTheme = () => {
    const dark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem(KHOA_THEME, dark ? "dark" : "light");
    } catch {
      setToi(dark);
    }
    setToi(dark);
  };
  const ten = hoSo?.ho_ten?.trim() || user?.email || "";
  const tu = ten.split(/\s+/).filter(Boolean);
  const vietTat = ten ? (tu.length > 1 ? `${tu[tu.length - 2][0] ?? ""}${tu[tu.length - 1][0] ?? ""}` : ten.slice(0, 2)).toUpperCase() : "?";
  const lienKet = [
    {href: "/", nhan: "Trang chủ", active: duong === "/" || duong.startsWith("/de")},
    ...(isAdmin ? [{href: "/admin", nhan: "Quản trị", active: duong.startsWith("/admin")}] : []),
    {href: user ? "/tai-khoan" : "/login", nhan: user ? "Tài khoản" : "Đăng nhập", active: duong.startsWith("/tai-khoan") || duong.startsWith("/login")}
  ];
  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-paper/92 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center border border-ink/45 bg-paper-light text-accent">
            <IconSeal className="h-5 w-5" />
          </span>
          <span className="truncate font-display text-xl font-bold tracking-tight text-ink">
            Đề<span className="text-accent">.</span>Thi
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <nav className="hidden items-center gap-5 sm:flex">
            {lienKet.map((l) => (
              <Link key={l.href} href={l.href} className={`relative pb-0.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${l.active ? "text-accent" : "text-ink-soft hover:text-ink"}`}>
                {l.nhan}
                {l.active && <span className="absolute inset-x-0 -bottom-0.5 h-[2px] rounded-full bg-accent" />}
              </Link>
            ))}
          </nav>
          <motion.button whileTap={buttonTap} type="button" onClick={doiTheme} aria-label={toi ? "Chuyển nền sáng" : "Chuyển nền tối"} title={toi ? "Nền sáng" : "Nền tối"} className="grid h-10 w-10 place-items-center border border-ink/45 bg-paper-light text-ink transition-colors hover:border-accent hover:text-accent">
            {toi ? <MatTroi /> : <MatTro />}
          </motion.button>
          <Link href={user ? "/tai-khoan" : "/login"} title={ten || "Tài khoản"} className="hidden h-10 min-w-10 place-items-center border border-ink bg-ink px-2.5 font-display text-sm font-bold text-paper-light transition-colors hover:border-accent hover:bg-accent sm:grid">
            {vietTat}
          </Link>
          <motion.button whileTap={buttonTap} type="button" onClick={() => setMo((v) => !v)} aria-label="Mở menu" aria-expanded={mo} className="grid h-10 w-10 place-items-center border border-ink/45 bg-paper-light text-ink transition-colors hover:border-accent hover:text-accent sm:hidden">
            {mo ? <IconClose className="h-4 w-4" /> : <GachMenu />}
          </motion.button>
        </div>
      </div>
      <AnimatePresence>
        {mo && (
          <motion.nav initial={{height: 0, opacity: 0}} animate={{height: "auto", opacity: 1}} exit={{height: 0, opacity: 0}} transition={spring} className="overflow-hidden border-t border-ink/20 bg-paper-light sm:hidden">
            <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-2">
              {lienKet.map((l) => (
                <Link key={l.href} href={l.href} className={`flex items-center justify-between border-b border-dashed border-ink/15 py-3 text-sm font-semibold uppercase tracking-[0.12em] transition-colors last:border-b-0 ${l.active ? "text-accent" : "text-ink-soft"}`}>
                  {l.nhan}
                  {l.active && <span className="h-1.5 w-1.5 rotate-45 bg-accent" />}
                </Link>
              ))}
              {user && (
                <p className="py-3 text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                  Đang đăng nhập: <span className="text-ink-soft">{ten}</span>
                </p>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}