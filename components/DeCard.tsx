"use client";
import Link from "next/link";
import {motion, useMotionTemplate, useMotionValue, useSpring} from "framer-motion";
import {IconArrowRight, IconCalendar, IconCheck, IconDownload, IconEye, MonIcon} from "@/components/Icons";
import {formatDungLuong, formatNgay, MON_DAY_DU, tenNhom, type DeThi} from "@/lib/data";
import {buttonTap, cardHover, fadeInUp, stampIn, tapCard} from "@/lib/animations";
import {useHoverCapable} from "@/lib/useHover";
import {useDanhDau} from "@/lib/useDanhDau";
function SaoNho({day}: {day: boolean}) {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill={day ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M12 3.4l2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8Z" />
    </svg>
  );
}
export default function DeCard({de}: {de: DeThi & {saoTB?: number; saoDem?: number}}) {
  const hover = useHoverCapable();
  const {da, dao} = useDanhDau();
  const daDoc = da(de.id);
  const sao = de.saoDem ? (de.saoTB ?? 0) : 0;
  const rx = useSpring(useMotionValue(0), {stiffness: 260, damping: 24, mass: 0.6});
  const ry = useSpring(useMotionValue(0), {stiffness: 260, damping: 24, mass: 0.6});
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const anhSang = useMotionTemplate`radial-gradient(220px circle at ${mx}% ${my}%, rgb(255 255 255 / 0.16), transparent 62%)`;
  const nghieng = (e: React.PointerEvent<HTMLElement>) => {
    if (!hover) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    rx.set(-py * 4);
    ry.set(px * 5);
    mx.set((px + 0.5) * 100);
    my.set((py + 0.5) * 100);
  };
  const thang = () => {
    rx.set(0);
    ry.set(0);
  };
  return (
    <motion.article
      variants={{...fadeInUp, ...cardHover}}
      whileHover={hover ? "hover" : undefined}
      whileTap={tapCard}
      onPointerMove={nghieng}
      onPointerLeave={thang}
      style={{rotateX: rx, rotateY: ry, transformPerspective: 900}}
      className={`sheet group relative flex flex-col p-5 pl-8 shadow-paper transition-colors duration-300 hover:border-accent/60 ${de.ghimAt ? "border-accent/70 bg-accent-wash/30" : ""}`}
    >
      {hover && <motion.div aria-hidden style={{background: anhSang}} className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />}
      <div className="flex items-start justify-between gap-3">
        <span title={MON_DAY_DU[de.mon]} className="grid h-11 w-11 place-items-center border border-ink/30 bg-paper text-ink transition-all duration-300 group-hover:-rotate-3 group-hover:border-accent group-hover:text-accent">
          <MonIcon mon={de.mon} className="h-6 w-6" />
        </span>
        <div className="flex flex-col items-end gap-1">
          {de.ghimAt && (
            <motion.span variants={stampIn} className="-rotate-2 border border-ink bg-ink px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-paper-light">Ghim</motion.span>
          )}
          <motion.span variants={stampIn} title={MON_DAY_DU[de.mon]} className="border border-accent/70 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">{de.mon}</motion.span>
          <span className="text-[9px] uppercase tracking-[0.16em] text-ink-faint">{tenNhom(de.mon)}</span>
        </div>
      </div>
      <h3 className="mt-4 line-clamp-2 min-h-[3.2rem] font-display text-lg font-bold leading-snug text-ink">{de.ten}</h3>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-[0.12em] text-ink-faint">
        <span className="flex items-center gap-1.5">
          <IconCalendar className="h-3.5 w-3.5" />
          {formatNgay(de.ngay)}
        </span>
        <span className="border border-ink/25 px-1.5 py-0.5 text-[10px] font-semibold text-ink-soft">PDF</span>
        <span className="text-[10px]">{formatDungLuong(de.kichThuoc)}</span>
        {de.dapAnDuongDan && <span className="border border-ok/60 px-1.5 py-0.5 text-[10px] font-semibold text-ok">Đáp án</span>}
      </div>
      <div className="mt-2 flex items-center gap-3 text-[11px] uppercase tracking-[0.1em] text-ink-faint">
        <span className="flex items-center gap-1" title="Lượt xem">
          <IconEye className="h-3.5 w-3.5" />
          {de.luotXem ?? 0}
        </span>
        <span className="flex items-center gap-1" title="Lượt tải">
          <IconDownload className="h-3.5 w-3.5" />
          {de.luotTai ?? 0}
        </span>
        <motion.span key={sao} initial={{scale: 0.7, opacity: 0}} animate={{scale: 1, opacity: 1}} className={`flex items-center gap-1 ${sao ? "text-warn" : "text-ink-faint"}`} title={sao ? `${sao}/5 từ ${de.saoDem} lượt đánh giá` : "Chưa có đánh giá"}>
          <SaoNho day={!!sao} />
          {sao ? `${sao.toFixed(1)} (${de.saoDem})` : "Chưa chấm"}
        </motion.span>
        <button type="button" onClick={() => dao(de.id)} aria-pressed={daDoc} className={`ml-auto flex items-center gap-1 border px-2 py-0.5 text-[10px] font-semibold transition-colors ${daDoc ? "border-ok bg-ok/15 text-ok" : "border-ink/30 text-ink-faint hover:border-ok hover:text-ok"}`}>
          <IconCheck className="h-3 w-3" />
          {daDoc ? "Đã đọc" : "Đánh dấu"}
        </button>
      </div>
      <Link href={`/de/${de.id}`} className="mt-4 block">
        <motion.span whileTap={buttonTap} className="nut-quet nut-nhan flex items-center justify-between gap-2 border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors duration-300 active:border-accent active:bg-accent group-hover:border-accent group-hover:bg-accent">
          Xem đề
          <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </motion.span>
      </Link>
    </motion.article>
  );
}