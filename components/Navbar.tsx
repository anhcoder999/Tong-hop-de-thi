"use client";
import {useEffect, useRef, useState} from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {AnimatePresence, motion, useScroll, useSpring} from "framer-motion";
import {IconCheck, IconClose, IconEye, IconFile, IconSeal} from "@/components/Icons";
import {useAuth} from "@/lib/auth";
import {buttonTap, spring} from "@/lib/animations";
const KHOA_THEME = "dethi.theme";
const STYLE_ID = "vt-kieu";
function IconNha() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1Z" />
    </svg>
  );
}
function IconBut() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h16M6.5 16.5l9-9a2.1 2.1 0 0 1 3 3l-9 9H6.5Z" />
      <path d="M13.5 6.5l3 3" />
    </svg>
  );
}
function IconNguoi() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8.5" r="3.6" />
      <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
    </svg>
  );
}
function IconKhi() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.5 19 6v5.4c0 4.2-2.8 7.6-7 9.1-4.2-1.5-7-4.9-7-9.1V6Z" />
      <path d="m9.2 12 2 2 3.6-3.8" />
    </svg>
  );
}
function MatTroi() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.8v2M12 19.2v2M2.8 12h2M19.2 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
    </svg>
  );
}
function MatTro() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 14.2A8.2 8.2 0 1 1 9.8 4a6.6 6.6 0 0 0 10.2 10.2Z" />
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
  const menuRef = useRef<HTMLDivElement>(null);
  const {scrollYProgress} = useScroll();
  const tienTrinh = useSpring(scrollYProgress, {stiffness: 180, damping: 32, mass: 0.4});
  const [toi, setToi] = useState(false);
  const [moMenu, setMoMenu] = useState(false);
  const [dac, setDac] = useState(false);
  useEffect(() => {
    setToi(document.documentElement.classList.contains("dark"));
    const cuon = () => setDac(window.scrollY > 8);
    cuon();
    window.addEventListener("scroll", cuon, {passive: true});
    return () => window.removeEventListener("scroll", cuon);
  }, []);
  useEffect(() => {
    setMoMenu(false);
  }, [duong]);
  useEffect(() => {
    if (!moMenu) return;
    const ngoai = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMoMenu(false);
    };
    const phim = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoMenu(false);
    };
    document.addEventListener("mousedown", ngoai);
    document.addEventListener("keydown", phim);
    return () => {
      document.removeEventListener("mousedown", ngoai);
      document.removeEventListener("keydown", phim);
    };
  }, [moMenu]);
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
  const chinh = [
    {href: "/", nhan: "Trang chủ", Icon: IconNha, active: duong === "/"},
    {href: "/kho-de", nhan: "Kho đề", Icon: IconFile, active: duong.startsWith("/kho-de") || duong.startsWith("/de/")},
    {href: "/thi-thu", nhan: "Thi thử", Icon: IconBut, active: duong.startsWith("/thi-thu")}
  ];
  const taiKhoanActive = duong.startsWith("/tai-khoan") || duong.startsWith("/login");
  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300 ${dac ? "border-b border-ink/10 bg-paper-light/85 shadow-paper backdrop-blur-xl" : "border-b border-transparent bg-paper-light/60 backdrop-blur-md"}`}>
        <div className="mx-auto flex h-[65px] w-full max-w-6xl items-center justify-between gap-3 px-4">
          <Link href="/" className="group flex min-w-0 items-center gap-2.5" aria-label="Đề.Thi — trang chủ">
            <motion.span whileHover={{rotate: -6, scale: 1.05}} transition={spring} className="grid h-9 w-9 shrink-0 place-items-center rounded-field bg-accent text-paper-light shadow-stamp">
              <IconSeal className="h-[18px] w-[18px]" />
            </motion.span>
            <span className="truncate font-display text-lg font-bold tracking-tight text-ink">
              Đề<span className="text-accent">.</span>Thi
            </span>
          </Link>
          <nav className="hidden items-center gap-1 rounded-full border border-ink/10 bg-paper/70 p-1 md:flex">
            {chinh.map((l) => (
              <Link key={l.href} href={l.href} className={`relative rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${l.active ? "text-accent-deep dark:text-accent" : "text-ink-soft hover:text-ink"}`}>
                {l.active && <motion.span layoutId="nav-pill" transition={spring} className="absolute inset-0 rounded-full bg-accent-wash" />}
                <span className="relative flex items-center gap-1.5">
                  <l.Icon />
                  {l.nhan}
                </span>
              </Link>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <motion.button ref={nutRef} whileTap={buttonTap} type="button" onClick={doiTheme} aria-label={toi ? "Chuyển nền sáng" : "Chuyển nền tối"} title={toi ? "Nền sáng" : "Nền tối"} className="grid h-10 w-10 place-items-center rounded-field border border-ink/10 bg-paper-light text-ink-soft transition-colors hover:border-accent/40 hover:text-accent">
              <motion.span key={toi ? "sang" : "toi"} initial={{rotate: -110, opacity: 0, scale: 0.5}} animate={{rotate: 0, opacity: 1, scale: 1}} transition={spring}>
                {toi ? <MatTroi /> : <MatTro />}
              </motion.span>
            </motion.button>
            {user ? (
              <div ref={menuRef} className="relative">
                <motion.button whileTap={buttonTap} type="button" onClick={() => setMoMenu((v) => !v)} aria-expanded={moMenu} aria-haspopup="menu" title={ten} className={`flex h-10 items-center gap-2 rounded-field border px-2.5 transition-colors ${moMenu ? "border-accent/50 bg-accent-wash" : "border-ink/10 bg-paper-light hover:border-accent/40"}`}>
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-[11px] font-bold text-paper-light">{vietTat}</span>
                  <span className="hidden max-w-[8rem] truncate text-[13px] font-semibold text-ink sm:block">{ten.split(/\s+/).slice(-2).join(" ")}</span>
                </motion.button>
                <AnimatePresence>
                  {moMenu && (
                    <motion.div role="menu" initial={{opacity: 0, y: -8, scale: 0.97}} animate={{opacity: 1, y: 0, scale: 1}} exit={{opacity: 0, y: -6, scale: 0.98}} transition={{duration: 0.18, ease: [0.22, 1, 0.36, 1]}} className="absolute right-0 top-[52px] w-64 overflow-hidden rounded-card border border-ink/10 bg-paper-light p-1.5 shadow-lift">
                      <div className="px-3 py-2.5">
                        <p className="truncate text-sm font-semibold text-ink">{ten}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-faint">
                          {isAdmin ? <><IconKhi />Quản trị viên</> : <>Thành viên</>}
                        </p>
                      </div>
                      <div className="my-1 h-px bg-ink/10" />
                      <Link role="menuitem" href="/tai-khoan" className="flex items-center gap-2.5 rounded-field px-3 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink">
                        <IconNguoi />
                        Tài khoản của cậu
                      </Link>
                      <Link role="menuitem" href="/thi-thu" className="flex items-center gap-2.5 rounded-field px-3 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink md:hidden">
                        <IconBut />
                        Phòng thi thử
                      </Link>
                      {isAdmin && (
                        <>
                          <div className="my-1 h-px bg-ink/10" />
                          <Link role="menuitem" href="/admin" className="flex items-center gap-2.5 rounded-field px-3 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent-wash">
                            <IconKhi />
                            Trang quản trị
                          </Link>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login">
                <motion.span whileTap={buttonTap} className="nut-nhan flex h-10 items-center gap-2 rounded-field bg-accent px-4 text-[13px] font-semibold text-paper-light transition-colors hover:bg-accent-deep">
                  <IconNguoi />
                  Đăng nhập
                </motion.span>
              </Link>
            )}
          </div>
        </div>
        <motion.div style={{scaleX: tienTrinh}} className="h-[2px] origin-left transform-gpu bg-gradient-to-r from-accent via-info to-grape" />
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-paper-light/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-4">
          {[...chinh, {href: user ? "/tai-khoan" : "/login", nhan: user ? "Tài khoản" : "Đăng nhập", Icon: IconNguoi, active: taiKhoanActive}].map((l) => (
            <Link key={l.href} href={l.href} className={`relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors ${l.active ? "text-accent" : "text-ink-faint"}`}>
              {l.active && <motion.span layoutId="tab-pill" transition={spring} className="absolute inset-x-4 top-1 h-8 rounded-full bg-accent-wash" />}
              <span className="relative"><l.Icon /></span>
              <span className="relative">{l.nhan}</span>
            </Link>
          ))}
        </div>
      </nav>
      {isAdmin && duong.startsWith("/admin") && (
        <div className="fixed right-4 top-[78px] z-40 hidden items-center gap-1.5 rounded-full border border-accent/30 bg-accent-wash px-3 py-1.5 text-[11px] font-semibold text-accent-deep shadow-paper dark:text-accent md:flex">
          <IconCheck className="h-3.5 w-3.5" />
          Chế độ quản trị
        </div>
      )}
    </>
  );
}