"use client";
import {useEffect, useState} from "react";
import Image from "next/image";
import {AnimatePresence, motion} from "framer-motion";
import {IconClose, IconSeal} from "@/components/Icons";
import {useAuth} from "@/lib/auth";
import {supabase} from "@/lib/supabase";
import {buttonTap, spring} from "@/lib/animations";
type TB = {id: string; noi_dung: string; url_anh: string};
const KHOA_DA_XEM = "dethi.tb.daxem";
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
    setMan("chao");
    supabase.from("thong_bao").select("id,noi_dung,url_anh").order("created_at", {ascending: false}).limit(1).maybeSingle().then(({data}) => {
      if (alive) setTb(data as TB | null);
    });
    return () => {
      alive = false;
    };
  }, [uid, loading]);
  const dongChao = () => {
    if (tb && localStorage.getItem(KHOA_DA_XEM) !== tb.id) setMan("tb");
    else setMan("dong");
  };
  const dongTb = () => {
    if (tb) localStorage.setItem(KHOA_DA_XEM, tb.id);
    setMan("dong");
  };
  return (
    <AnimatePresence>
      {man !== "dong" && (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 z-[90] grid place-items-center bg-ink/50 p-4 backdrop-blur-sm">
          <motion.div initial={{y: 24, scale: 0.96, opacity: 0}} animate={{y: 0, scale: 1, opacity: 1}} exit={{y: 12, opacity: 0}} transition={spring} className="sheet relative max-h-[85vh] w-full max-w-md overflow-y-auto border-2 border-ink bg-paper-light p-6 shadow-lift">
            <button type="button" onClick={man === "chao" ? dongChao : dongTb} aria-label="Đóng" className="absolute right-3 top-3 border border-ink/40 p-1.5 text-ink-soft transition-colors hover:border-accent hover:text-accent">
              <IconClose className="h-4 w-4" />
            </button>
            {man === "chao" ? (
              <div className="flex flex-col items-center text-center">
                <span className="-rotate-2 border border-accent/70 bg-accent-wash px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">Thiệp chào mừng</span>
                <span className="mt-4 grid h-24 w-24 place-items-center overflow-hidden rounded-full border-2 border-ink bg-paper shadow-stamp">
                  {loiAnh ? <span className="font-display text-2xl font-bold text-accent">AL</span> : <Image src="/avatar.jpg" alt="Anh Lusilfer" width={96} height={96} priority className="h-full w-full object-cover" onError={() => setLoiAnh(true)} />}
                </span>
                <h2 className="mt-3 font-display text-2xl font-bold text-ink">Anh Lusilfer</h2>
                <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-ink-faint">Quản trị viên kho đề</p>
                <p className="mt-3 text-sm text-ink-soft">Chào mừng cậu đến với kho đề thi THPT. Chúc cậu ôn luyện hiệu quả và đạt điểm cao trong kì thi sắp tới.</p>
                <a href="https://anhcoder999.github.io/" target="_blank" rel="noopener noreferrer" className="mt-3 border border-accent bg-accent-wash px-3 py-1 text-sm font-semibold text-accent-deep underline decoration-wavy underline-offset-4 transition-colors hover:bg-accent hover:text-paper-light">Link</a>
                <motion.button whileTap={buttonTap} type="button" onClick={dongChao} className="mt-5 w-full border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors hover:border-accent hover:bg-accent">Vào kho đề</motion.button>
              </div>
            ) : tb ? (
              <div>
                <span className="inline-flex -rotate-1 items-center gap-1.5 border border-accent/70 bg-accent-wash px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                  <IconSeal className="h-3 w-3" />
                  Thông báo quản trị
                </span>
                {tb.url_anh && <Image src={tb.url_anh} alt="Ảnh thông báo" width={800} height={600} className="mt-3 h-auto w-full border border-ink/25 object-cover" />}
                {tb.noi_dung && <p className="mt-3 whitespace-pre-wrap text-sm text-ink-soft">{tb.noi_dung}</p>}
                <motion.button whileTap={buttonTap} type="button" onClick={dongTb} className="mt-4 w-full border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors hover:border-accent hover:bg-accent">Đã đọc</motion.button>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}