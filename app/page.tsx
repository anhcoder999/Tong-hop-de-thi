"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { IconClose, IconSearch, IconSeal, InkLine } from "@/components/Icons";
import InkDraw from "@/components/InkDraw";
import DeCard from "@/components/DeCard";
import EmptyState from "@/components/EmptyState";
import { DeCardSkeleton } from "@/components/Skeleton";
import { DS_DE, DS_TAB, type Tab } from "@/lib/data";
import { buttonTap, EASE, fadeInUp, spring, staggerContainer } from "@/lib/animations";
import { useHoverCapable } from "@/lib/useHover";
const khongDau = (s: string) =>
  s.normalize("NFD").replace(/[̀ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
export default function TrangChu() {
  const [tuKhoa, setTuKhoa] = useState("");
  const [tab, setTab] = useState<Tab>("Tất cả");
  const [dangTai, setDangTai] = useState(true);
  const hover = useHoverCapable();
  useEffect(() => {
    const t = setTimeout(() => setDangTai(false), 500);
    return () => clearTimeout(t);
  }, []);
  const demTheoMon = useMemo(() => {
    const m = new Map<string, number>();
    DS_DE.forEach((d) => m.set(d.mon, (m.get(d.mon) ?? 0) + 1));
    return m;
  }, []);
  const ketQua = useMemo(() => {
    const tu = khongDau(tuKhoa.trim());
    return DS_DE.filter((d) => (tab === "Tất cả" || d.mon === tab) && khongDau(d.ten).includes(tu));
  }, [tab, tuKhoa]);
  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl px-4 pb-16 pt-8 sm:pt-12">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.header variants={fadeInUp} className="w-full border-b-2 border-ink pb-6">
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
            Kho đề Toán, Văn, Anh, Sử, Địa, KTPL chọn lọc. Xem PDF trực tiếp, tải về ôn luyện ngay trên điện thoại.
          </p>
          <motion.span
            variants={fadeInUp}
            className="mt-4 inline-flex -rotate-1 items-center gap-1.5 border border-accent/70 bg-accent-wash px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-deep"
          >
            <IconSeal className="h-3.5 w-3.5" />
            Lưu hành miễn phí
          </motion.span>
        </motion.header>
        <motion.div variants={fadeInUp} className="group relative mt-8 max-w-xl">
          <IconSearch className="pointer-events-none absolute left-1 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint transition-colors group-focus-within:text-accent" />
          <input
            type="text"
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
            placeholder="Tìm đề theo tên... (gõ không dấu cũng được)"
            aria-label="Tìm đề theo tên"
            className="w-full border-b-2 border-ink/40 bg-transparent py-3 pl-7 pr-8 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent"
          />
          <span className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-accent transition-transform duration-300 group-focus-within:scale-x-100" />
          {tuKhoa && (
            <motion.button
              whileTap={buttonTap}
              onClick={() => setTuKhoa("")}
              aria-label="Xóa từ khóa"
              className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-ink-faint transition-colors hover:text-accent"
            >
              <IconClose className="h-4 w-4" />
            </motion.button>
          )}
        </motion.div>
        <motion.div variants={fadeInUp} className="-mx-4 mt-8 overflow-x-auto px-4 no-scrollbar">
          <div className="flex w-max min-w-full gap-6 border-b border-ink/20">
            {DS_TAB.map((t) => {
              const active = tab === t;
              const soDe = t === "Tất cả" ? DS_DE.length : demTheoMon.get(t) ?? 0;
              return (
                <motion.button
                  key={t}
                  whileTap={buttonTap}
                  whileHover={hover ? { y: -1 } : undefined}
                  transition={spring}
                  onClick={() => setTab(t)}
                  className={`relative whitespace-nowrap pb-2 text-sm font-semibold uppercase tracking-[0.12em] transition-colors ${
                    active ? "text-accent" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {t}
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
        </motion.div>
      </motion.div>
      <p className="mt-6 text-xs uppercase tracking-[0.18em] text-ink-soft">
        Mục lục ·{" "}
        <motion.b
          key={dangTai ? "load" : ketQua.length}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="inline-block text-ink"
        >
          {dangTai ? "..." : ketQua.length}
        </motion.b>{" "}
        đề
      </p>
      {dangTai ? (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <DeCardSkeleton key={i} />
          ))}
        </div>
      ) : ketQua.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            onReset={() => {
              setTuKhoa("");
              setTab("Tất cả");
            }}
          />
        </div>
      ) : (
        <motion.div
          key={tab}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {ketQua.map((d) => (
            <DeCard key={d.id} de={d} />
          ))}
        </motion.div>
      )}
    </div>
  );
}