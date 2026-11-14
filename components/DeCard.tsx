"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { IconArrowRight, IconCalendar, MonIcon } from "@/components/Icons";
import { formatNgay, type DeThi } from "@/lib/data";
import { buttonTap, cardHover, fadeInUp } from "@/lib/animations";
export default function DeCard({ de }: { de: DeThi }) {
  return (
    <motion.article
      variants={{ ...fadeInUp, ...cardHover }}
      whileHover="hover"
      className="sheet group relative flex flex-col p-5 pl-8 shadow-paper transition-colors duration-300 hover:border-accent/60"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-11 w-11 place-items-center border border-ink/30 bg-paper text-ink transition-colors duration-300 group-hover:border-accent group-hover:text-accent">
          <MonIcon mon={de.mon} className="h-6 w-6" />
        </span>
        <span className="-rotate-2 border border-accent/70 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
          {de.mon}
        </span>
      </div>
      <h3 className="mt-4 line-clamp-2 min-h-[3.2rem] font-display text-lg font-bold leading-snug text-ink">{de.ten}</h3>
      <p className="mt-2 flex items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-ink-faint">
        <IconCalendar className="h-3.5 w-3.5" />
        {formatNgay(de.ngay)}
      </p>
      <Link href={`/de/${de.id}`} className="mt-4 block">
        <motion.span
          whileTap={buttonTap}
          className="flex items-center justify-between gap-2 border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors duration-300 group-hover:border-accent group-hover:bg-accent"
        >
          Xem đề
          <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </motion.span>
      </Link>
    </motion.article>
  );
}