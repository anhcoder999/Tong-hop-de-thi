"use client";
import {useEffect, useState} from "react";
import Image from "next/image";
import {AnimatePresence, motion} from "framer-motion";
import {IconArrowRight, IconClose, IconExternal, IconSeal} from "@/components/Icons";
import InkDraw from "@/components/InkDraw";
import {useAuth} from "@/lib/auth";
import {supabase} from "@/lib/supabase";
import {buttonTap} from "@/lib/animations";
type TB = {id: string; noi_dung: string; url_anh: string};
const GIAY_O = {backgroundImage: "linear-gradient(rgba(31,26,20,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(31,26,20,0.045) 1px, transparent 1px)", backgroundSize: "22px 22px"};
const vaoNhanh = {
  hidden: {opacity: 0, y: 16},
  visible: {opacity: 1, y: 0, transition: {type: "spring", stiffness: 420, damping: 30, mass: 0.6}}
};
const nhomVao = {hidden: {}, visible: {transition: {staggerChildren: 0.05, delayChildren: 0.1}}};
function DaiPhongBi() {
  return (
    <div className="flex h-2 w-full gap-[3px] overflow-hidden bg-paper-light">
      {Array.from({length: 28}).map((_, i) => (
        <span key={i} className={`h-full flex-1 -skew-x-12 ${i % 2 === 0 ? "bg-accent" : "bg-ink"}`} />
      ))}
    </div>
  );
}
function DauBuuDien() {
  return (
    <motion.svg initial={{opacity: 0, scale: 1.7, rotate: 26}} animate={{opacity: 0.85, scale: 1, rotate: 12}} transition={{type: "spring", stiffness: 300, damping: 20, delay: 0.3}} viewBox="0 0 120 120" className="pointer-events-none absolute right-3 top-9 h-20 w-20 text-ink-faint">
      <defs>
        <path id="dethi-vong" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
      </defs>
      <circle cx="60" cy="60" r="48" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="60" cy="60" r="30" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
      <text fontSize="9" letterSpacing="2.5" fill="currentColor">
        <textPath href="#dethi-vong">KHO ĐỀ THI THPT • ANH LUSILFER • 2026 •</textPath>
      </text>
      <text x="60" y="65" textAnchor="middle" fontSize="15" fontWeight="bold" fill="currentColor" fontFamily="serif">2026</text>
    </motion.svg>
  );
}
export default function ThongBaoPopup() {
  const {user, loading} = useAuth();
  const uid = user?.id;
  const [man, setMan] = useState<"chao" | "tb" | "dong">("dong");
  const [tb, setTb] = useState<TB | null>(null);
  const [loiAnh, setLoiAnh] = useState(false);
  useEffect(() => {
    if (loading) return;
    if (!uid) {
      setMan("dong");
      return;
    }
    let alive = true;
    const daChao = localStorage.getItem(`dethi.chao.daxem.${uid}`) === "1";
    supabase.from("thong_bao").select("id,noi_dung,url_anh").order("created_at", {ascending: false}).limit(1).maybeSingle().then(({data}) => {
      if (!alive) return;
      const t = (data as TB | null) ?? null;
      setTb(t);
      if (!daChao) setMan("chao");
      else setMan(t ? "tb" : "dong");
    });
    return () => {
      alive = false;
    };
  }, [uid, loading]);
  const dongChao = () => {
    if (uid) localStorage.setItem(`dethi.chao.daxem.${uid}`, "1");
    setMan(tb ? "tb" : "dong");
  };
  const dongTb = () => setMan("dong");
  const dong = man === "chao" ? dongChao : dongTb;
  return (
    <AnimatePresence>
      {man !== "dong" && (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} transition={{duration: 0.22, ease: "easeOut"}} onClick={dong} className="fixed inset-0 z-[90] grid place-items-center bg-ink/70 p-4">
          <motion.div initial={{opacity: 0, scale: 0.82, y: 30, rotate: -2}} animate={{opacity: 1, scale: 1, y: 0, rotate: 0}} exit={{opacity: 0, scale: 0.9, y: 18, transition: {duration: 0.18, ease: "easeIn"}}} transition={{type: "spring", stiffness: 380, damping: 26, mass: 0.8}} onClick={(e) => e.stopPropagation()} className="viewer-scroll relative max-h-[88vh] w-full max-w-md overflow-y-auto border-2 border-ink bg-paper-light shadow-lift">
            <DaiPhongBi />
            <div className="relative p-6 sm:p-7" style={GIAY_O}>
              <span className="pointer-events-none absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-ink/50" />
              <span className="pointer-events-none absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-ink/50" />
              <span className="pointer-events-none absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-ink/50" />
              <span className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-ink/50" />
              <motion.button whileTap={buttonTap} type="button" onClick={dong} aria-label="Đóng" className="absolute right-3 top-3 z-10 border border-ink/40 bg-paper-light p-1.5 text-ink-soft transition-colors hover:border-accent hover:text-accent">
                <IconClose className="h-4 w-4" />
              </motion.button>
              {man === "chao" ? (
                <motion.div variants={nhomVao} initial="hidden" animate="visible" className="flex flex-col items-center text-center">
                  <DauBuuDien />
                  <motion.div variants={vaoNhanh} className="flex w-full items-center gap-2 pr-8 text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-soft">
                    <span className="h-px flex-1 bg-ink/25" />
                    <IconSeal className="h-3 w-3 text-accent" />
                    <span>Thiệp chào mừng</span>
                    <span className="h-px flex-1 bg-ink/25" />
                  </motion.div>
                  <motion.div variants={vaoNhanh} className="relative mt-6 -rotate-2 border-2 border-ink bg-paper-light p-1.5 shadow-stamp">
                    <span className="absolute -top-2.5 left-3 h-5 w-14 -rotate-6 border border-ink/10 bg-accent-wash/90" />
                    <span className="absolute -top-2.5 right-3 h-5 w-14 rotate-3 border border-ink/10 bg-accent-wash/90" />
                    <span className="block h-28 w-28 overflow-hidden bg-paper">
                      {loiAnh ? <span className="grid h-full w-full place-items-center font-display text-3xl font-bold text-accent">AL</span> : <Image src="/avatar.jpg" alt="Anh Lusilfer" width={112} height={112} priority className="h-full w-full object-cover" onError={() => setLoiAnh(true)} />}
                    </span>
                    <motion.span initial={{opacity: 0, scale: 1.8, rotate: 20}} animate={{opacity: 1, scale: 1, rotate: 6}} transition={{type: "spring", stiffness: 340, damping: 18, delay: 0.45}} className="absolute -bottom-3 -right-3 border-2 border-accent bg-paper-light px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-accent shadow-stamp">Admin</motion.span>
                  </motion.div>
                  <motion.h2 variants={vaoNhanh} className="mt-5 font-display text-3xl font-bold tracking-tight text-ink">Anh Lusilfer</motion.h2>
                  <motion.span variants={vaoNhanh} className="mt-1 block h-2 w-44 text-accent">
                    <InkDraw className="h-2 w-full" />
                  </motion.span>
                  <motion.p variants={vaoNhanh} className="mt-2 text-[10px] uppercase tracking-[0.22em] text-ink-faint">Quản trị viên · Kho đề THPT</motion.p>
                  <motion.p variants={vaoNhanh} className="mt-4 font-display text-sm italic leading-relaxed text-ink-soft">
                    Chào mừng cậu đến với kho đề thi THPT. Chúc cậu ôn luyện hiệu quả, giữ vững phong độ và đạt điểm cao trong kì thi sắp tới.
                  </motion.p>
                  <motion.div variants={vaoNhanh} className="mt-4 flex w-full items-center gap-2">
                    <span className="flex-1 border-t border-dashed border-ink/30" />
                    <span className="h-1.5 w-1.5 rotate-45 bg-accent" />
                    <span className="flex-1 border-t border-dashed border-ink/30" />
                  </motion.div>
                  <motion.div variants={vaoNhanh} className="mt-4 flex w-full items-center justify-between gap-3 border border-ink/25 bg-paper px-3 py-2">
                    <span className="text-[10px] uppercase tracking-[0.16em] text-ink-faint">Hồ sơ quản trị viên</span>
                    <a href="https://anhcoder999.github.io/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 border border-accent bg-accent-wash px-2.5 py-1 text-xs font-bold text-accent-deep underline decoration-wavy underline-offset-4 transition-colors hover:bg-accent hover:text-paper-light">
                      Link
                      <IconExternal className="h-3 w-3" />
                    </a>
                  </motion.div>
                  <motion.button variants={vaoNhanh} whileTap={buttonTap} type="button" onClick={dongChao} className="nut-quet nut-nhan group mt-5 flex w-full items-center justify-center gap-2 border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors hover:border-accent hover:bg-accent">
                    Vào kho đề
                    <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </motion.button>
                  <motion.p variants={vaoNhanh} className="mt-2 text-[10px] text-ink-faint">Thiệp chỉ hiện một lần. Thông báo quản trị sẽ hiện mỗi lần vào kho.</motion.p>
                </motion.div>
              ) : tb ? (
                <motion.div variants={nhomVao} initial="hidden" animate="visible">
                  <motion.span variants={vaoNhanh} className="inline-flex -rotate-1 items-center gap-1.5 border border-accent/70 bg-accent-wash px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                    <IconSeal className="h-3 w-3" />
                    Thông báo quản trị
                  </motion.span>
                  {tb.url_anh && (
                    <motion.div variants={vaoNhanh} className="mt-3 overflow-hidden border border-ink/25">
                      <Image src={tb.url_anh} alt="Ảnh thông báo" width={800} height={600} className="h-auto w-full object-cover" />
                    </motion.div>
                  )}
                  {tb.noi_dung && <motion.p variants={vaoNhanh} className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">{tb.noi_dung}</motion.p>}
                  <motion.button variants={vaoNhanh} whileTap={buttonTap} type="button" onClick={dongTb} className="nut-nhan mt-4 w-full border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors hover:border-accent hover:bg-accent">Đã đọc</motion.button>
                </motion.div>
              ) : null}
            </div>
            <DaiPhongBi />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}