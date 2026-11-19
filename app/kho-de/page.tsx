"use client";
import {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import Link from "next/link";
import {motion} from "framer-motion";
import {IconArrowRight, IconClose, IconRefresh, IconSearch, IconSort} from "@/components/Icons";
import DeCard from "@/components/DeCard";
import EmptyState from "@/components/EmptyState";
import {DeCardSkeleton} from "@/components/Skeleton";
import {DS_MON, khongDau, laNhom, MON_DAY_DU, monTrongLoc, NHOM_MON, type DeThi, type Loc} from "@/lib/data";
import {buttonTap, EASE, fadeInUp, spring, staggerContainer} from "@/lib/animations";
import {useAuth} from "@/lib/auth";
import {layDanhSach} from "@/lib/deThi";
type SapXep = "moi" | "cu" | "ten";
export default function TrangKhoDe() {
  const {isAdmin} = useAuth();
  const viTriRef = useRef(0);
  const [ds, setDs] = useState<DeThi[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");
  const [loc, setLoc] = useState<Loc>("Tất cả");
  const [sapXep, setSapXep] = useState<SapXep>("moi");
  const tai = useCallback(async () => {
    setDangTai(true);
    setLoi("");
    try {
      setDs(await layDanhSach());
    } catch (e) {
      setLoi(e instanceof Error ? e.message : "Không tải được kho đề.");
    } finally {
      setDangTai(false);
    }
  }, []);
  useEffect(() => {
    const m = new URLSearchParams(window.location.search).get("mon");
    if (m && (DS_MON as string[]).includes(m)) setLoc(m as Loc);
    void tai();
  }, [tai]);
  const doiLoc = (v: Loc) => {
    viTriRef.current = window.scrollY;
    setLoc(v);
  };
  const doiSapXep = (v: SapXep) => {
    viTriRef.current = window.scrollY;
    setSapXep(v);
  };
  useLayoutEffect(() => {
    if (viTriRef.current > 0) {
      window.scrollTo({top: viTriRef.current, behavior: "instant"});
      viTriRef.current = 0;
    }
  }, [loc, sapXep]);
  const demTheoMon = useMemo(() => {
    const m = new Map<string, number>();
    ds.forEach((d) => m.set(d.mon, (m.get(d.mon) ?? 0) + 1));
    return m;
  }, [ds]);
  const demNhom = useCallback((mon: string[]) => mon.reduce((s, m) => s + (demTheoMon.get(m) ?? 0), 0), [demTheoMon]);
  const ketQua = useMemo(() => {
    const tu = khongDau(tuKhoa);
    const trongLoc = monTrongLoc(loc);
    const arr = ds.filter((d) => trongLoc.includes(d.mon) && (!tu || khongDau(d.ten).includes(tu)));
    if (sapXep === "moi") arr.sort((a, b) => b.ngay.localeCompare(a.ngay));
    if (sapXep === "cu") arr.sort((a, b) => a.ngay.localeCompare(b.ngay));
    if (sapXep === "ten") arr.sort((a, b) => a.ten.localeCompare(b.ten, "vi"));
    const ghim = arr.filter((d) => d.ghimAt).sort((a, b) => String(a.ghimAt).localeCompare(String(b.ghimAt)));
    return [...ghim, ...arr.filter((d) => !d.ghimAt)];
  }, [ds, loc, tuKhoa, sapXep]);
  const nhanLoc = loc === "Tất cả" ? "toàn kho" : laNhom(loc) ? `nhóm ${NHOM_MON.find((n) => n.id === loc)?.ten ?? ""}` : MON_DAY_DU[loc];
  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl px-4 pb-24 pt-10 sm:pt-14">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.header variants={fadeInUp} className="flex flex-wrap items-end justify-between gap-5">
          <div className="min-w-0">
            <nav className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
              <Link href="/" className="transition-colors hover:text-accent">Trang chủ</Link>
              <IconArrowRight className="h-3 w-3" />
              Kho đề
            </nav>
            <h1 className="mt-2.5 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Kho đề <span className="bg-gradient-to-r from-accent to-info bg-clip-text text-transparent">THPT</span>
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-soft">Chọn môn, tìm theo tên nếu nhớ mang máng. Đề ghim nằm đầu, đáp án mở riêng trong trang xem đề.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-ink/10 bg-paper-light px-4 py-2 shadow-paper">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="text-[12px] font-semibold text-ink-soft">{dangTai ? "đang tải..." : `${ds.length} đề trong kho`}</span>
          </div>
        </motion.header>
        <motion.div variants={fadeInUp} className="group relative mt-7">
          <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-faint transition-colors group-focus-within:text-accent" />
          <input
            type="text"
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
            placeholder="Tìm đề theo tên... gõ không dấu cũng được"
            aria-label="Tìm đề theo tên"
            className="w-full rounded-field border border-ink/10 bg-paper-light py-3.5 pl-12 pr-11 text-sm text-ink shadow-paper outline-none transition-[border-color,box-shadow] placeholder:text-ink-faint focus:border-accent/50 focus:shadow-stamp"
          />
          {tuKhoa && (
            <motion.button whileTap={buttonTap} onClick={() => setTuKhoa("")} aria-label="Xóa từ khóa" className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-ink-faint transition-colors hover:bg-paper-deep hover:text-ink">
              <IconClose className="h-3.5 w-3.5" />
            </motion.button>
          )}
        </motion.div>
      </motion.div>
      <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{duration: 0.35, ease: EASE, delay: 0.1}} className="sticky top-[66px] z-30 -mx-4 mt-5 border-b border-ink/8 bg-paper/90 px-4 py-3 backdrop-blur-xl">
        <div className="relative">
          <div className="no-scrollbar overflow-x-auto">
            <div className="flex w-max min-w-full items-center gap-2">
              <motion.button whileTap={buttonTap} onClick={() => doiLoc("Tất cả")} className={`relative shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${loc === "Tất cả" ? "text-accent-deep dark:text-accent" : "text-ink-soft hover:text-ink"}`}>
                {loc === "Tất cả" && <motion.span layoutId="loc-pill" transition={spring} className="absolute inset-0 rounded-full bg-accent-wash" />}
                <span className="relative">Tất cả <span className="ml-1 text-[11px] opacity-70">{ds.length}</span></span>
              </motion.button>
              {NHOM_MON.map((n) => (
                <div key={n.id} className="flex shrink-0 items-center gap-2 border-l border-ink/10 pl-3">
                  <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">{n.ten} · {demNhom(n.mon)}</span>
                  {n.mon.map((m) => {
                    const active = loc === m;
                    const soDe = demTheoMon.get(m) ?? 0;
                    return (
                      <motion.button key={m} whileTap={buttonTap} onClick={() => doiLoc(m)} title={MON_DAY_DU[m]} className={`relative shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors ${active ? "text-accent-deep dark:text-accent" : soDe === 0 ? "text-ink-faint/70 hover:text-ink-soft" : "text-ink-soft hover:text-ink"}`}>
                        {active && <motion.span layoutId="loc-pill" transition={spring} className="absolute inset-0 rounded-full bg-accent-wash" />}
                        <span className="relative">{m} <span className="ml-0.5 text-[11px] opacity-70">{soDe}</span></span>
                      </motion.button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-paper to-transparent" />
        </div>
      </motion.div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12px] font-medium text-ink-soft">
          Mục lục {nhanLoc} ·{" "}
          <motion.b key={dangTai ? "load" : ketQua.length} initial={{y: 6, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{duration: 0.22, ease: EASE}} className="inline-block font-bold text-ink">
            {dangTai ? "..." : ketQua.length}
          </motion.b>{" "}
          đề
        </p>
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <IconSort className="pointer-events-none absolute left-3 h-4 w-4 text-ink-faint" />
            <select value={sapXep} onChange={(e) => doiSapXep(e.target.value as SapXep)} aria-label="Sắp xếp" className="appearance-none rounded-field border border-ink/10 bg-paper-light py-2 pl-9 pr-8 text-[12px] font-semibold text-ink-soft outline-none transition-colors focus:border-accent/50">
              <option value="moi">Mới nhất</option>
              <option value="cu">Cũ nhất</option>
              <option value="ten">Theo tên</option>
            </select>
          </div>
          <motion.button whileTap={buttonTap} type="button" onClick={() => void tai()} aria-label="Tải lại" className="grid h-9 w-9 place-items-center rounded-field border border-ink/10 bg-paper-light text-ink-soft transition-colors hover:border-accent/40 hover:text-accent">
            <IconRefresh className={`h-4 w-4 ${dangTai ? "animate-spin" : ""}`} />
          </motion.button>
        </div>
      </div>
      {loi ? (
        <div className="mt-5 rounded-card border border-danger/30 bg-danger/8 p-5">
          <p className="font-display text-base font-semibold text-danger">Không tải được kho đề</p>
          <p className="mt-1 text-sm text-ink-soft">{loi}</p>
          <motion.button whileTap={buttonTap} type="button" onClick={() => void tai()} className="nut-nhan mt-4 rounded-field bg-danger px-4 py-2.5 text-[13px] font-semibold text-paper-light">Thử lại</motion.button>
        </div>
      ) : dangTai ? (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({length: 6}).map((_, i) => <DeCardSkeleton key={i} />)}
        </div>
      ) : ds.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            kieu="kho"
            tieuDe="Kho đề đang trống"
            moTa={isAdmin ? "Chưa có đề nào trong kho. Vào trang quản trị để tải đề đầu tiên lên." : "Người quản lý chưa tải đề nào lên. Hãy quay lại sau nhé."}
            ctaHref={isAdmin ? "/admin" : undefined}
            ctaLabel={isAdmin ? "Tải đề đầu tiên" : undefined}
          />
        </div>
      ) : ketQua.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            moTa={`Chưa có đề nào khớp ${nhanLoc}. Thử môn khác hoặc xóa từ khóa.`}
            onReset={() => {
              setTuKhoa("");
              doiLoc("Tất cả");
            }}
          />
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ketQua.map((d) => <DeCard key={d.id} de={d} />)}
        </motion.div>
      )}
    </div>
  );
}