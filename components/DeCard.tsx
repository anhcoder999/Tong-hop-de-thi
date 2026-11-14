"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  CalendarDays,
  FileText,
  Globe2,
  Landmark,
  Languages,
  Scale,
  type LucideIcon,
} from "lucide-react";
import { formatNgay, type DeThi, type Mon } from "@/lib/data";
import { buttonTap, cardHover, fadeInUp } from "@/lib/animations";
// Mỗi môn một icon lucide riêng + tông màu pastel nhẹ để quét mắt nhanh
const MON_STYLE: Record<Mon, { icon: LucideIcon; mau: string }> = {
  Toán: { icon: Calculator, mau: "bg-blue-50 text-blue-600" },
  Văn: { icon: BookOpen, mau: "bg-rose-50 text-rose-600" },
  Anh: { icon: Languages, mau: "bg-emerald-50 text-emerald-600" },
  Sử: { icon: Landmark, mau: "bg-amber-50 text-amber-600" },
  Địa: { icon: Globe2, mau: "bg-cyan-50 text-cyan-600" },
  KTPL: { icon: Scale, mau: "bg-violet-50 text-violet-600" },
};
export default function DeCard({ de }: { de: DeThi }) {
  const { icon: Icon, mau } = MON_STYLE[de.mon];
  return (
    // Gộp variants: hidden/visible nhận stagger từ grid cha, hover tự scale 1.02 + glow
    <motion.article
      variants={{ ...fadeInUp, ...cardHover }}
      whileHover="hover"
      className="group glass rounded-xl p-5 shadow-soft transition-colors duration-300 hover:border-brand-300"
    >
      <div className="flex items-center justify-between">
        <span className={`grid h-11 w-11 place-items-center rounded-xl ${mau}`}>
          <Icon size={22} strokeWidth={1.8} />
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">{de.mon}</span>
      </div>
      <h3 className="mt-4 line-clamp-2 min-h-[2.75rem] text-[15px] font-semibold leading-snug text-slate-800">{de.ten}</h3>
      <p className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-400">
        <CalendarDays size={13} />
        {formatNgay(de.ngay)}
      </p>
      <Link href={`/de/${de.id}`} className="mt-4 block">
        <motion.span
          whileTap={buttonTap}
          className="flex items-center justify-center gap-2 rounded-2xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-shadow duration-300 group-hover:shadow-lift"
        >
          <FileText size={16} />
          Xem đề
          <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </motion.span>
      </Link>
    </motion.article>
  );
}
