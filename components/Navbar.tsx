"use client";
import {useEffect, useRef, useState} from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {AnimatePresence, motion, useScroll, useSpring} from "framer-motion";
import {IconClose, IconFile, IconSeal} from "@/components/Icons";
import {useAuth} from "@/lib/auth";
import {buttonTap, spring} from "@/lib/animations";
const KHOA_THEME = "dethi.theme";
const STYLE_ID = "vt-kieu";
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
function IconButThi() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h16M6.5 16.5l9-9a2.1 2.1 0 0 1 3 3l-9 9H6.5Z" />
      <path d="M13.5 6.5l3 3" />
    </svg>
  );
}
function datKieu(huong: "mo" | "dong", x: number, y: number, r: number) {
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  const nen = "::view-transition-group(root){animation:none!important}::view-transition-image-pair(root){isolation:auto!important}::view-transition-old(root){animation:none!important;mix-blend-mode:normal!important}::view-transition-new(root){animation:none!important;mix-blend-mode:normal!important}";
  el.textContent = huong === "mo"
    ? `${nen}@keyframes vtMo{from{clip-path:circle(0px at ${x}px ${y}px)}to{clip-path:circle(${r}px at ${x}px ${y}px)}}::view-transition-old(root){z-index:1!important}::view-transition-new(root){animation:vtMo 0.5s linear forwards!important;z-index:2!important}`
    : `${nen}@keyframes vtDong{from{clip-path:circle(${r}px at ${x}px ${y}px)}to{clip-path:circle(0px at ${x}px ${y}px)}}::view-transition-new(root){z-index:1!important}::view-transition-old(root){animation:vtDong 0.5s linear forwards!important;z-index:2!important}`;
}
export default function Navbar() {
  const {user, hoSo, isAdmin} = useAuth();
  const duong = usePathname();
  const nutRef = useRef<HTMLButtonElement>(null);
  const {scrollYProgress} = useScroll();
  const tienTrinh = useSpring(scrollYProgress, {stiffness: 170, damping: 30, mass: 0.4});
  const [toi, setToi] = useState(false);
  const [mo, setMo] = useState(false);
  useEffect(() => {
    setToi(document.documentElement.classList.contains("dark"));
  }, []);
  useEffect(() => {
    setMo(false);
  }, [duong]);
  const tamNut = () => {
    const r = nutRef.current?.getBoundingClientRect();
    const x = r ? r.left + r.width / 2 : window.innerWidth / 2;
    const y = r ? r.top + r.height / 2 : 0;
    return {x, y, ban: Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))};
  };
  const doiTheme = () => {
    const root = document.documentElement;
    const dark = !root.classList.contains("dark");
    const ap = () => {
      root.classList.toggle("dark", dark);
      try {
        localStorage.setItem(KHOA_THEME, dark ? "dark" : "light");
      } catch {
        setToi(dark);
      }
      setToi(dark);
    };
    const vt = document as Document & {startViewTransition?: (cb: () => void) => {finished: Promise<void>}};
    if (vt.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t0 = tamNut();
      datKieu(dark ? "mo" : "dong", t0.x, t0.y, t0.ban);
      root.classList.add("vt-dang-chuyen");
      const tr = vt.startViewTransition(() => {
        ap();
        if (dark) {
          const t1 = tamNut();
          datKieu("mo", t1.x, t1.y, t1.ban);
        }
      });
      const don = () => root.classList.remove("vt-dang-chuyen");
      void tr.finished.then(don, don);
    } else ap();
  };
  const ten = hoSo?.ho_ten?.trim() || user?.email || "";
  const tu = ten.split(/\s+/).filter(Boolean);
  const vietTat = ten ? (tu.length > 1 ? `${tu[tu.length - 2][0] ?? ""}${tu[tu.length - 1][0] ?? ""}` : ten.slice(0, 2)).toUpperCase() : "?";
  const khoDangMo = duong.startsWith("/kho-de") || duong.startsWith("/de/");
  const thiDangMo = duong.startsWith("/thi-thu");
  const lienKet = [
    {href: "/", nhan: "Trang chủ", active: duong === "/"},
    {href: "/kho-de", nhan: "Kho đề", active: khoDangMo},
    {href: "/thi-thu", nhan: "Thi thử", active: thiDangMo},
    ...(isAdmin ? [{href: "/admin", nhan: "Quản trị", active: duong.startsWith("/admin")}] : []),
    {href: user ? "/tai-khoan" : "/login", nhan: user ? "Tài khoản" : "Đăng nhập", active: duong.startsWith("/tai-khoan") || duong.startsWith("/login")}
  ];
  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-paper">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <motion.span whileHover={{rotate: -8, scale: 1.06}} transition={spring} className="grid h-10 w-10 shrink-0 place-items-center border border-ink/45 bg-paper-light text-accent">
            <IconSeal className="h-5 w-5" />
          </motion.span>
          <span className="truncate font-display text-xl font-bold tracking-tight text-ink">
            Đề<span className="text-accent">.</span>Thi
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <nav className="hidden items-center gap-4 md:flex">
            {lienKet.map((l) => (
              <Link key={l.href} href={l.href} className={`group relative pb-0.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${l.active ? "text-accent" : "text-ink-soft hover:text-ink"}`}>
                {l.nhan}
                <span className={`absolute inset-x-0 -bottom-0.5 h-[2px] origin-left rounded-full bg-accent transition-transform duration-300 ease-out ${l.active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
              </Link>
            ))}
          </nav>
          <Link href="/kho-de" aria-label="Kho đề" title="Kho đề" className={`grid h-10 w-10 place-items-center border transition-colors md:hidden ${khoDangMo ? "border-accent bg-accent-wash text-accent" : "border-ink/45 bg-paper-light text-ink hover:border-accent hover:text-accent"}`}>
            <IconFile className="h-4 w-4" />
          </Link>
          <Link href="/thi-thu" aria-label="Thi thử" title="Thi thử" className={`grid h-10 w-10 place-items-center border transition-colors md:hidden ${thiDangMo ? "border-accent bg-accent-wash text-accent" : "border-ink/45 bg-paper-light text-ink hover:border-accent hover:text-accent"}`}>
            <IconButThi />
          </Link>
          <motion.button ref={nutRef} whileTap={buttonTap} type="button" onClick={doiTheme} aria-label={toi ? "Chuyển nền sáng" : "Chuyển nền tối"} title={toi ? "Nền sáng" : "Nền tối"} className="grid h-10 w-10 place-items-center border border-ink/45 bg-paper-light text-ink transition-colors hover:border-accent hover:text-accent">
            <motion.span key={toi ? "sang" : "toi"} initial={{rotate: -120, opacity: 0, scale: 0.4}} animate={{rotate: 0, opacity: 1, scale: 1}} transition={{type: "spring", stiffness: 380, damping: 24, mass: 0.6}}>
              {toi ? <MatTroi /> : <MatTro />}
            </motion.span>
          </motion.button>
          <Link href={user ? "/tai-khoan" : "/login"} title={ten || "Tài khoản"} className="hidden h-10 min-w-10 place-items-center border border-ink bg-ink px-2.5 font-display text-sm font-bold text-paper-light transition-colors hover:border-accent hover:bg-accent md:grid">
            {vietTat}
          </Link>
          <motion.button whileTap={buttonTap} type="button" onClick={() => setMo((v) => !v)} aria-label="Mở menu" aria-expanded={mo} className="grid h-10 w-10 place-items-center border border-ink/45 bg-paper-light text-ink transition-colors hover:border-accent hover:text-accent md:hidden">
            {mo ? <IconClose className="h-4 w-4" /> : <GachMenu />}
          </motion.button>
        </div>
      </div>
      <motion.div style={{scaleX: tienTrinh}} className="absolute inset-x-0 bottom-0 h-[2px] origin-left transform-gpu bg-gradient-to-r from-accent via-warn to-info" />
      <AnimatePresence>
        {mo && (
          <motion.nav initial={{height: 0, opacity: 0}} animate={{height: "auto", opacity: 1}} exit={{height: 0, opacity: 0}} transition={spring} className="overflow-hidden border-t border-ink/20 bg-paper-light md:hidden">
            <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-2">
              {lienKet.map((l, i) => (
                <motion.div key={l.href} initial={{opacity: 0, x: -14}} animate={{opacity: 1, x: 0}} transition={{...spring, delay: i * 0.05}}>
                  <Link href={l.href} className={`flex items-center justify-between border-b border-dashed border-ink/15 py-3 text-sm font-semibold uppercase tracking-[0.12em] transition-colors last:border-b-0 ${l.active ? "text-accent" : "text-ink-soft"}`}>
                    {l.nhan}
                    {l.active && <span className="h-1.5 w-1.5 rotate-45 bg-accent" />}
                  </Link>
                </motion.div>
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