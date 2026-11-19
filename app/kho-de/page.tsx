"use client";
import {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import Link from "next/link";
import {motion} from "framer-motion";
import {IconArrowRight, IconClose, IconRefresh, IconSearch, IconSeal, IconSort, InkLine} from "@/components/Icons";
import InkDraw from "@/components/InkDraw";
import DeCard from "@/components/DeCard";
import EmptyState from "@/components/EmptyState";
import {DeCardSkeleton} from "@/components/Skeleton";
import {DS_MON, khongDau, laNhom, MON_DAY_DU, monTrongLoc, NHOM_MON, type DeThi, type Loc} from "@/lib/data";
import {buttonTap, EASE, fadeInUp, spring, staggerContainer} from "@/lib/animations";
import {useHoverCapable} from "@/lib/useHover";
import {useAuth} from "@/lib/auth";
import {layDanhSach} from "@/lib/deThi";
type SapXep = "moi" | "cu" | "ten";
function GachMuc({active}: {active: boolean}) {
  if (!active) return null;
  return (
    <motion.span initial={{scaleX: 0, opacity: 0}} animate={{scaleX: 1, opacity: 1}} transition={{duration: 0.26, ease: EASE}} style={{transformOrigin: "left center"}} className="absolute inset-x-0 -bottom-px text-accent">
      <InkLine className="h-1.5 w-full" />
    </motion.span>
  );
}
export default function TrangKhoDe() {
  const {isAdmin} = useAuth();
  const hover = useHoverCapable();
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
    const thuong = arr.filter((d) => !d.ghimAt);
    return [...ghim, ...thuong];
  }, [ds, loc, tuKhoa, sapXep]);
  const nhanLoc = loc === "Tất cả" ? "toàn kho" : laNhom(loc) ? `nhóm ${NHOM_MON.find((n) => n.id === loc)?.ten ?? ""}` : MON_DAY_DU[loc];
  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl px-4 pb-16 pt-8 sm:pt-10">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.header variants={fadeInUp} className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-5">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-ink-faint">
              <Link href="/" className="underline-offset-4 transition-colors hover:text-accent hover:underline hover:decoration-wavy">Trang chủ</Link>
              <IconArrowRight className="h-3 w-3" />
              Mục lục
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Kho đề{" "}
              <span className="relative inline-block text-accent">
                THPT
                <span className="absolute inset-x-0 -bottom-1 text-accent">
                  <InkDraw className="h-2 w-full" />
                </span>
              </span>
            </h1>
          </div>
          <p className="max-w-sm text-xs leading-relaxed text-ink-soft">
            Chọn môn ở dải bên dưới, tìm theo tên nếu nhớ mang máng. Đề ghim nằm đầu, đáp án mở riêng trong trang xem đề.
          </p>
        </motion.header>
        <motion.div variants={fadeInUp} className="group relative mt-6 max-w-xl">
          <IconSearch className="pointer-events-none absolute left-1 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint transition-colors group-focus-within:text-accent" />
          <input
            type="text"
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
            placeholder="Tìm đề theo tên... (gõ không dấu cũng được)"
            aria-label="Tìm đề theo tên"
            className="w-full border-b-2 border-ink/40 bg-transparent py-3 pl-7 pr-8 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent"
          />
          <span className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out group-focus-within:scale-x-100" />
          {tuKhoa && (
            <motion.button whileTap={buttonTap} onClick={() => setTuKhoa("")} aria-label="Xóa từ khóa" className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-ink-faint transition-colors hover:text-accent">
              <IconClose className="h-4 w-4" />
            </motion.button>
          )}
        </motion.div>
      </motion.div>
      <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{duration: 0.35, ease: EASE, delay: 0.12}} className="sticky top-[66px] z-40 -mx-4 mt-7 border-b border-ink/20 bg-paper px-4">
        <div className="relative">
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex w-max min-w-full items-stretch">
              <div className="flex flex-col justify-end gap-1.5 pr-4">
                <span className="text-[10px] uppercase tracking-[0.18em] text-ink-faint">Toàn kho</span>
                <motion.button
                  whileTap={buttonTap}
                  whileHover={hover ? {y: -1} : undefined}
                  transition={spring}
                  onClick={() => doiLoc("Tất cả")}
                  className={`nut-nhan relative whitespace-nowrap pb-2 text-sm font-semibold uppercase tracking-[0.12em] transition-colors ${loc === "Tất cả" ? "text-accent" : "text-ink-soft hover:text-ink"}`}
                >
                  Tất cả
                  <sup className="ml-1 text-[10px] text-ink-faint">{ds.length}</sup>
                  <GachMuc active={loc === "Tất cả"} />
                </motion.button>
              </div>
              {NHOM_MON.map((n) => {
                const trongNhom = !laNhom(loc) && loc !== "Tất cả" && n.mon.includes(loc);
                return (
                  <div key={n.id} className="flex flex-col justify-end gap-1.5 border-l border-dashed border-ink/25 px-4">
                    <span className={`whitespace-nowrap pb-0.5 text-left text-[10px] uppercase tracking-[0.18em] ${trongNhom ? "text-ink" : "text-ink-faint"}`}>
                      {n.ten}
                      <sup className="ml-1 text-[9px]">{demNhom(n.mon)}</sup>
                    </span>
                    <div className="flex gap-4">
                      {n.mon.map((m) => {
                        const active = loc === m;
                        const soDe = demTheoMon.get(m) ?? 0;
                        return (
                          <motion.button
                            key={m}
                            whileTap={buttonTap}
                            whileHover={hover ? {y: -1} : undefined}
                            transition={spring}
                            onClick={() => doiLoc(m)}
                            title={MON_DAY_DU[m]}
                            className={`nut-nhan relative whitespace-nowrap pb-2 text-sm font-semibold uppercase tracking-[0.12em] transition-colors ${active ? "text-accent" : soDe === 0 ? "text-ink-faint/70 hover:text-ink-soft" : "text-ink-soft hover:text-ink"}`}
                          >
                            {m}
                            <sup className="ml-1 text-[10px] text-ink-faint">{soDe}</sup>
                            <GachMuc active={active} />
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-paper to-transparent" />
          <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-paper to-transparent" />
        </div>
      </motion.div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ink-soft">
          <IconSeal className="h-3.5 w-3.5 text-accent" />
          Mục lục {nhanLoc} ·{" "}
          <motion.b key={dangTai ? "load" : ketQua.length} initial={{y: 8, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{duration: 0.25, ease: EASE}} className="inline-block text-ink">
            {dangTai ? "..." : ketQua.length}
          </motion.b>{" "}
          đề
        </p>
        <div className="flex items-center gap-2">
          <IconSort className="h-4 w-4 text-ink-faint" />
          <select value={sapXep} onChange={(e) => doiSapXep(e.target.value as SapXep)} aria-label="Sắp xếp" className="border border-ink/30 bg-paper-light px-2.5 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft outline-none transition-colors focus:border-accent">
            <option value="moi">Mới nhất</option>
            <option value="cu">Cũ nhất</option>
            <option value="ten">Theo tên</option>
          </select>
          <motion.button whileTap={buttonTap} type="button" onClick={() => void tai()} aria-label="Tải lại" className="border border-ink/30 bg-paper-light p-2 text-ink-soft transition-colors active:bg-accent-wash hover:border-accent hover:text-accent">
            <IconRefresh className={`h-4 w-4 ${dangTai ? "animate-spin" : ""}`} />
          </motion.button>
        </div>
      </div>
      {loi ? (
        <div className="mt-4 flex flex-col items-start gap-3 border border-accent/50 bg-accent-wash p-5 text-sm text-accent-deep">
          <p className="font-semibold">Không tải được kho đề</p>
          <p className="text-xs">{loi}</p>
          <motion.button whileTap={buttonTap} type="button" onClick={() => void tai()} className="nut-nhan border border-accent bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-paper-light">
            Thử lại
          </motion.button>
        </div>
      ) : dangTai ? (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({length: 6}).map((_, i) => (
            <DeCardSkeleton key={i} />
          ))}
        </div>
      ) : ds.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            kieu="kho"
            tieuDe="Kho đề đang trống"
            moTa={isAdmin ? "Chưa có đề nào trong kho. Vào trang quản trị để tải đề đầu tiên lên." : "Người quản lý chưa tải đề nào lên. Hãy quay lại sau nhé."}
            ctaHref={isAdmin ? "/admin" : undefined}
            ctaLabel={isAdmin ? "Tải đề đầu tiên" : undefined}
          />
        </div>
      ) : ketQua.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            moTa={`Chưa có đề nào khớp ${nhanLoc}. Thử môn khác hoặc xóa từ khóa.`}
            onReset={() => {
              setTuKhoa("");
              doiLoc("Tất cả");
            }}
          />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ketQua.map((d, i) => (
            <motion.div key={d.id} initial={{opacity: 0, y: 14, scale: 0.98}} animate={{opacity: 1, y: 0, scale: 1}} transition={{duration: 0.26, ease: EASE, delay: Math.min(i * 0.03, 0.18)}} className="min-w-0">
              <DeCard de={d} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}