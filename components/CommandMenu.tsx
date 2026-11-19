"use client";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {AnimatePresence, motion} from "framer-motion";
import {IconArrowRight, IconClose, IconFile, IconSearch, MonIcon} from "@/components/Icons";
import {khongDau, MON_DAY_DU, type DeThi} from "@/lib/data";
import {layDanhSach} from "@/lib/deThi";
import {spring} from "@/lib/animations";
type Muc = {id: string; nhan: string; phu: string; href: string; mon?: string};
const LOI_TAT: Muc[] = [
  {id: "tt-kho", nhan: "Mở kho đề", phu: "Toàn bộ đề PDF và đáp án", href: "/kho-de"},
  {id: "tt-thi", nhan: "Vào phòng thi thử", phu: "Đếm ngược, chấm tự động", href: "/thi-thu"},
  {id: "tt-tk", nhan: "Tài khoản của cậu", phu: "Lịch sử thi và hồ sơ", href: "/tai-khoan"}
];
export default function CommandMenu() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mo, setMo] = useState(false);
  const [tu, setTu] = useState("");
  const [ds, setDs] = useState<DeThi[]>([]);
  const [daTai, setDaTai] = useState(false);
  const [chon, setChon] = useState(0);
  const tai = useCallback(async () => {
    if (daTai) return;
    setDaTai(true);
    try {
      setDs(await layDanhSach());
    } catch {
      setDs([]);
    }
  }, [daTai]);
  useEffect(() => {
    const phim = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setMo((v) => !v);
      }
      if (e.key === "Escape") setMo(false);
    };
    const moLenh = () => setMo(true);
    window.addEventListener("keydown", phim);
    window.addEventListener("mo-lenh", moLenh);
    return () => {
      window.removeEventListener("keydown", phim);
      window.removeEventListener("mo-lenh", moLenh);
    };
  }, []);
  useEffect(() => {
    if (!mo) return;
    void tai();
    setTu("");
    setChon(0);
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [mo, tai]);
  const ketQua = useMemo<Muc[]>(() => {
    const q = khongDau(tu);
    const de = ds.filter((d) => !q || khongDau(d.ten).includes(q) || khongDau(d.mon).includes(q)).slice(0, 7).map((d) => ({id: d.id, nhan: d.ten, phu: `${MON_DAY_DU[d.mon]}${d.dapAnDuongDan ? " · có đáp án" : ""}`, href: `/de/${d.id}`, mon: d.mon}));
    const tat = LOI_TAT.filter((l) => !q || khongDau(l.nhan).includes(q));
    return [...de, ...tat];
  }, [ds, tu]);
  useEffect(() => {
    setChon(0);
  }, [tu]);
  const di = (href: string) => {
    setMo(false);
    router.push(href);
  };
  const phimTrong = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setChon((c) => Math.min(ketQua.length - 1, c + 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setChon((c) => Math.max(0, c - 1));
    }
    if (e.key === "Enter" && ketQua[chon]) {
      e.preventDefault();
      di(ketQua[chon].href);
    }
  };
  return (
    <AnimatePresence>
      {mo && (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} transition={{duration: 0.16}} onClick={() => setMo(false)} className="fixed inset-0 z-[96] flex items-start justify-center bg-ink/60 p-4 pt-[12vh] backdrop-blur-sm">
          <motion.div initial={{opacity: 0, y: -14, scale: 0.97}} animate={{opacity: 1, y: 0, scale: 1}} exit={{opacity: 0, y: -10, scale: 0.98}} transition={spring} onClick={(e) => e.stopPropagation()} className="w-full max-w-xl overflow-hidden rounded-panel border-2 border-ink bg-paper-light shadow-lift">
            <div className="flex items-center gap-3 border-b-2 border-ink px-4 py-3.5">
              <IconSearch className="h-[18px] w-[18px] shrink-0 text-accent" />
              <input ref={inputRef} value={tu} onChange={(e) => setTu(e.target.value)} onKeyDown={phimTrong} placeholder="Tìm đề, mở nhanh trang..." aria-label="Tìm nhanh" className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-faint" />
              <button type="button" onClick={() => setMo(false)} aria-label="Đóng" className="grid h-7 w-7 shrink-0 place-items-center rounded-field border border-ink/20 text-ink-faint transition-colors hover:border-accent hover:text-accent">
                <IconClose className="h-3.5 w-3.5" />
              </button>
            </div>
            <ul className="viewer-scroll max-h-[52vh] overflow-y-auto p-2">
              {ketQua.length === 0 && <li className="px-3 py-6 text-center text-sm text-ink-faint">Không thấy gì khớp. Thử từ ngắn hơn hoặc bỏ dấu.</li>}
              {ketQua.map((m, i) => (
                <li key={m.id}>
                  <button type="button" onMouseEnter={() => setChon(i)} onClick={() => di(m.href)} className={`flex w-full items-center gap-3 rounded-field px-3 py-2.5 text-left transition-colors ${i === chon ? "bg-mark text-markink" : "text-ink hover:bg-paper-deep"}`}>
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-field border ${i === chon ? "border-markink/25 bg-markink/10" : "border-ink/15 bg-paper"}`}>
                      {m.mon ? <MonIcon mon={m.mon as never} className="h-4 w-4" /> : <IconFile className="h-4 w-4" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{m.nhan}</span>
                      <span className={`block truncate text-[11px] ${i === chon ? "text-markink/70" : "text-ink-faint"}`}>{m.phu}</span>
                    </span>
                    <IconArrowRight className="h-4 w-4 shrink-0 opacity-60" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between gap-3 border-t border-ink/12 bg-paper px-4 py-2.5 text-[11px] text-ink-faint">
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-ink/20 px-1.5 py-0.5 font-mono">↑</kbd>
                <kbd className="rounded border border-ink/20 px-1.5 py-0.5 font-mono">↓</kbd>
                chọn
                <kbd className="ml-1 rounded border border-ink/20 px-1.5 py-0.5 font-mono">↵</kbd>
                mở
              </span>
              <span className="font-mono">{ketQua.length} kết quả</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}