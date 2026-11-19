"use client";
import Link from "next/link";
import {motion} from "framer-motion";
import {IconArrowRight, IconCalendar, IconCheck, IconDownload, IconEye, MonIcon} from "@/components/Icons";
import {formatDungLuong, formatNgay, MON_DAY_DU, NHOM_MON, tenNhom, type DeThi, type NhomMon} from "@/lib/data";
import {buttonTap, fadeInUp} from "@/lib/animations";
import {useDanhDau} from "@/lib/useDanhDau";
const TONE: Record<NhomMon, string> = {
  "bat-buoc": "bg-accent text-paper-light",
  "tu-nhien": "bg-info text-paper-light",
  "xa-hoi": "bg-ok text-paper-light",
  "ung-dung": "bg-warn text-paper-light",
  khac: "bg-grape text-paper-light"
};
function SaoNho({day}: {day: boolean}) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" fill={day ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M12 3.6l2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8Z" />
    </svg>
  );
}
export default function DeCard({de}: {de: DeThi & {saoTB?: number; saoDem?: number}}) {
  const {da, dao} = useDanhDau();
  const daDoc = da(de.id);
  const sao = de.saoDem ? (de.saoTB ?? 0) : 0;
  const nhom = (NHOM_MON.find((n) => (n.mon as string[]).includes(de.mon))?.id ?? "khac") as NhomMon;
  return (
    <motion.article variants={fadeInUp} whileHover={{y: -4}} transition={{type: "spring", stiffness: 340, damping: 24, mass: 0.55}} className="group flex h-full flex-col rounded-card border-2 border-ink bg-paper-light p-5 shadow-paper transition-shadow duration-300 hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <span title={MON_DAY_DU[de.mon]} className={`grid h-10 w-10 shrink-0 place-items-center rounded-field ${TONE[nhom]}`}>
          <MonIcon mon={de.mon} className="h-5 w-5" />
        </span>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {de.ghimAt && <span className="-skew-x-6 border-2 border-ink bg-mark px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-markink">Ghim</span>}
          <span className="rounded-field border-2 border-ink/15 px-2 py-0.5 text-[11px] font-bold text-ink-soft">{de.mon}</span>
        </div>
      </div>
      <h3 className="mt-4 line-clamp-2 min-h-[2.9rem] font-display text-[17px] font-bold leading-snug tracking-tight text-ink">
        <span className="bg-gradient-to-r from-mark to-mark bg-[length:0%_45%] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 ease-chuan group-hover:bg-[length:100%_45%]">{de.ten}</span>
      </h3>
      <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-faint">{tenNhom(de.mon)}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] font-medium text-ink-faint">
        <span className="flex items-center gap-1.5"><IconCalendar className="h-3.5 w-3.5" />{formatNgay(de.ngay)}</span>
        <span className="font-mono">{formatDungLuong(de.kichThuoc)}</span>
        {de.dapAnDuongDan && <span className="flex items-center gap-1 rounded-field bg-ok/15 px-2 py-0.5 text-[11px] font-bold text-ok"><IconCheck className="h-3 w-3" />Đáp án</span>}
      </div>
      <div className="mt-auto flex items-center gap-3 border-t-2 border-dashed border-ink/15 pt-3 text-[12px] font-semibold text-ink-faint">
        <span className="flex items-center gap-1.5" title="Lượt xem"><IconEye className="h-3.5 w-3.5" />{de.luotXem ?? 0}</span>
        <span className="flex items-center gap-1.5" title="Lượt tải"><IconDownload className="h-3.5 w-3.5" />{de.luotTai ?? 0}</span>
        <span className={`flex items-center gap-1.5 ${sao ? "text-warn" : ""}`} title={sao ? `${sao}/5 từ ${de.saoDem} lượt` : "Chưa có đánh giá"}>
          <SaoNho day={!!sao} />
          {sao ? sao.toFixed(1) : "—"}
        </span>
        <motion.button whileTap={buttonTap} type="button" onClick={() => dao(de.id)} aria-pressed={daDoc} className={`ml-auto flex items-center gap-1.5 rounded-field border-2 px-2 py-0.5 text-[11px] font-bold transition-colors ${daDoc ? "border-ok bg-ok/15 text-ok" : "border-ink/15 text-ink-faint hover:border-ink hover:text-ink"}`}>
          <IconCheck className="h-3 w-3" />
          {daDoc ? "Đã đọc" : "Đánh dấu"}
        </motion.button>
      </div>
      <Link href={`/de/${de.id}`} className="mt-4 block">
        <motion.span whileTap={buttonTap} className="nut-quet nut-nhan flex items-center justify-between gap-2 rounded-field border-2 border-ink bg-ink px-4 py-3 text-sm font-bold text-paper-light transition-colors duration-300 group-hover:bg-accent">
          Xem đề
          <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </motion.span>
      </Link>
    </motion.article>
  );
}