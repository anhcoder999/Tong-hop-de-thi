"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { IconArrowRight, IconCalendar, MonIcon } from "@/components/Icons";
import { formatDungLuong, formatNgay, type DeThi } from "@/lib/data";
import { buttonTap, cardHover, fadeInUp, stampIn, tapCard } from "@/lib/animations";
import { useHoverCapable } from "@/lib/useHover";
export default function DeCard({ de }: { de: DeThi }) {
  const hover = useHoverCapable();
  return (
    <motion.article
      variants={{ ...fadeInUp, ...cardHover }}
      whileHover={hover ? "hover" : undefined}
      whileTap={tapCard}
      className="sheet group relative flex flex-col p-5 pl-8 shadow-paper transition-colors duration-300 hover:border-accent/60"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-11 w-11 place-items-center border border-ink/30 bg-paper text-ink transition-all duration-300 group-hover:-rotate-3 group-hover:border-accent group-hover:text-accent">
          <MonIcon mon={de.mon} className="h-6 w-6" />
        </span>
        <motion.span variants={stampIn} className="border border-accent/70 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
          {de.mon}
        </motion.span>
      </div>
      <h3 className="mt-4 line-clamp-2 min-h-[3.2rem] font-display text-lg font-bold leading-snug text-ink">{de.ten}</h3>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-[0.12em] text-ink-faint">
        <span className="flex items-center gap-1.5">
          <IconCalendar className="h-3.5 w-3.5" />
          {formatNgay(de.ngay)}
        </span>
        <span className="border border-ink/25 px-1.5 py-0.5 text-[10px] font-semibold text-ink-soft">{de.loai === "docx" ? "DOCX" : "PDF"}</span>
        <span className="text-[10px]">{formatDungLuong(de.kichThuoc)}</span>
      </div>
      <Link href={`/de/${de.id}`} className="mt-4 block">
        <motion.span whileTap={buttonTap} className="flex items-center justify-between gap-2 border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors duration-300 active:border-accent active:bg-accent group-hover:border-accent group-hover:bg-accent">
          Xem đề
          <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </motion.span>
      </Link>
    </motion.article>
  );
}