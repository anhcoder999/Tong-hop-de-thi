"use client";
import {useCallback, useEffect, useMemo, useState} from "react";
import {motion, useScroll, useTransform} from "framer-motion";
import {IconClose, IconRefresh, IconSearch, IconSeal, IconSort, InkLine} from "@/components/Icons";
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
export default function TrangChu() {
  const {isAdmin} = useAuth();
  const hover = useHoverCapable();
  const {scrollY} = useScroll();
  const yDau = useTransform(scrollY, [0, 320], [0, -46]);
  const moDau = useTransform(scrollY, [0, 280], [1, 0.35]);
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
    void tai();
  }, [tai]);
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
    <div className="mx-auto w-full min-w-0 max-w-6xl px-4 pb-16 pt-8 sm:pt-12">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.header variants={fadeInUp} style={{y: yDau, opacity: moDau}} className="relative w-full border-b-2 border-ink pb-6">
          <span aria-hidden className="xoay-cham absolute -right-1 -top-3 hidden h-20 w-20 place-items-center rounded-full border border-dashed border-accent/50 text-accent sm:grid">
            <IconSeal className="h-6 w-6" />
          </span>
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-ink-soft">
            <span>Kì thi tốt nghiệp THPT</span>
            <span>Năm 2026</span>
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight text-ink sm:text-6xl">
            Tổng hợp{" "}
            <span className="relative inline-block text-accent">
              đề thi
              <span className="absolute inset-x-0 -bottom-1 text-accent">
                <InkDraw className="h-2 w-full" />
              </span>
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-sm text-ink-soft sm:text-base">
            Kho đề 12 môn xếp theo từng nhóm, kèm đáp án riêng. Xem PDF trực tiếp, ghim trang, ghi chú và tải về ôn luyện ngay trên điện thoại.
          </p>
          <motion.span variants={fadeInUp} className="lac-nhe mt-4 inline-flex -rotate-1 items-center gap-1.5 border border-accent/70 bg-accent-wash px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-deep">
            <IconSeal className="h-3.5 w-3.5" />
            Lưu hành miễn phí
          </motion.span>
        </motion.header>
        <motion.div variants={fadeInUp} className="no-scrollbar mt-6 overflow-hidden border-y border-dashed border-ink/25 py-2">
          <div className="chay-doc flex w-max gap-8 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-faint">
            {[...DS_MON, ...DS_MON].map((m, i) => (
              <span key={`${m}-${i}`} className="flex items-center gap-2">
                <span className="h-1 w-1 rotate-45 bg-accent/70" />
                {MON_DAY_DU[m]}
              </span>
            ))}
          </div>
        </motion.div>
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
        <motion.div variants={fadeInUp} className="-mx-4 mt-8 overflow-x-auto px-4 no-scrollbar">
          <div className="flex w-max min-w-full items-stretch border-b border-ink/20">
            <div className="flex flex-col justify-end gap-1.5 pr-4">
              <span className="text-[10px] uppercase tracking-[0.18em] text-ink-faint">Toàn kho</span>
              <motion.button
                whileTap={buttonTap}
                whileHover={hover ? {y: -1} : undefined}
                transition={spring}
                onClick={() => setLoc("Tất cả")}
                className={`relative whitespace-nowrap pb-2 text-sm font-semibold uppercase tracking-[0.12em] transition-colors ${loc === "Tất cả" ? "text-accent" : "text-ink-soft hover:text-ink"}`}
              >
                Tất cả
                <sup className="ml-1 text-[10px] text-ink-faint">{ds.length}</sup>
                {loc === "Tất cả" && (
                  <motion.span layoutId="tab-ink" transition={spring} className="absolute inset-x-0 -bottom-px text-accent">
                    <InkLine className="h-1.5 w-full" />
                  </motion.span>
                )}
              </motion.button>
            </div>
            {NHOM_MON.map((n) => {
              const nhomDangChon = loc === n.id;
              const trongNhom = !laNhom(loc) && loc !== "Tất cả" && n.mon.includes(loc);
              return (
                <div key={n.id} className="flex flex-col justify-end gap-1.5 border-l border-dashed border-ink/25 px-4">
                  <motion.button
                    whileTap={buttonTap}
                    onClick={() => setLoc(n.id)}
                    title={`Xem cả nhóm ${n.ten}`}
                    className={`relative whitespace-nowrap pb-0.5 text-left text-[10px] uppercase tracking-[0.18em] transition-colors ${nhomDangChon ? "text-accent" : trongNhom ? "text-ink" : "text-ink-faint hover:text-ink-soft"}`}
                  >
                    {n.ten}
                    <sup className="ml-1 text-[9px]">{demNhom(n.mon)}</sup>
                    {nhomDangChon && (
                      <motion.span layoutId="nhom-ink" transition={spring} className="absolute inset-x-0 -bottom-0.5 text-accent">
                        <InkLine className="h-1 w-full" />
                      </motion.span>
                    )}
                  </motion.button>
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
                          onClick={() => setLoc(m)}
                          title={MON_DAY_DU[m]}
                          className={`relative whitespace-nowrap pb-2 text-sm font-semibold uppercase tracking-[0.12em] transition-colors ${active ? "text-accent" : soDe === 0 ? "text-ink-faint/70 hover:text-ink-soft" : "text-ink-soft hover:text-ink"}`}
                        >
                          {m}
                          <sup className="ml-1 text-[10px] text-ink-faint">{soDe}</sup>
                          {active && (
                            <motion.span layoutId="tab-ink" transition={spring} className="absolute inset-x-0 -bottom-px text-accent">
                              <InkLine className="h-1.5 w-full" />
                            </motion.span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
      <motion.div initial={{opacity: 0, y: 14}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: "-40px"}} transition={{duration: 0.4, ease: EASE}} className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">
          Mục lục {nhanLoc} ·{" "}
          <motion.b key={dangTai ? "load" : ketQua.length} initial={{y: 8, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{duration: 0.3, ease: EASE}} className="inline-block text-ink">
            {dangTai ? "..." : ketQua.length}
          </motion.b>{" "}
          đề
        </p>
        <div className="flex items-center gap-2">
          <IconSort className="h-4 w-4 text-ink-faint" />
          <select value={sapXep} onChange={(e) => setSapXep(e.target.value as SapXep)} aria-label="Sắp xếp" className="border border-ink/30 bg-paper-light px-2.5 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft outline-none transition-colors focus:border-accent">
            <option value="moi">Mới nhất</option>
            <option value="cu">Cũ nhất</option>
            <option value="ten">Theo tên</option>
          </select>
          <motion.button whileTap={buttonTap} type="button" onClick={() => void tai()} aria-label="Tải lại" className="border border-ink/30 bg-paper-light p-2 text-ink-soft transition-colors active:bg-accent-wash hover:border-accent hover:text-accent">
            <IconRefresh className={`h-4 w-4 ${dangTai ? "animate-spin" : ""}`} />
          </motion.button>
        </div>
      </motion.div>
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
            moTa={`Chưa có đề nào khớp ${nhanLoc}. Thử nhóm khác hoặc xóa từ khóa.`}
            onReset={() => {
              setTuKhoa("");
              setLoc("Tất cả");
            }}
          />
        </div>
      ) : (
        <motion.div key={`${loc}-${sapXep}`} variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{once: true, margin: "-60px"}} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ketQua.map((d) => (
            <DeCard key={d.id} de={d} />
          ))}
        </motion.div>
      )}
    </div>
  );
}