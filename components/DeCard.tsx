"use client";
import Link from "next/link";
import {motion} from "framer-motion";
import {IconArrowRight, IconCalendar, IconCheck, IconDownload, IconEye, MonIcon} from "@/components/Icons";
import {formatDungLuong, formatNgay, MON_DAY_DU, tenNhom, type DeThi, type NhomMon} from "@/lib/data";
import {NHOM_MON} from "@/lib/data";
import {buttonTap, fadeInUp} from "@/lib/animations";
import {useDanhDau} from "@/lib/useDanhDau";
const TONE: Record<NhomMon, string> = {
  "bat-buoc": "bg-accent-wash text-accent",
  "tu-nhien": "bg-info/12 text-info",
  "xa-hoi": "bg-ok/12 text-ok",
  "ung-dung": "bg-warn/14 text-warn",
  khac: "bg-grape/12 text-grape"
};
function SaoNho({day}: {day: boolean}) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" fill={day ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
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
    <motion.article variants={fadeInUp} whileHover={{y: -3}} transition={{type: "spring", stiffness: 320, damping: 26, mass: 0.6}} className="group flex h-full flex-col rounded-card border border-ink/10 bg-paper-light p-5 shadow-paper transition-[border-color,box-shadow] duration-300 hover:border-accent/35 hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <span title={MON_DAY_DU[de.mon]} className={`grid h-11 w-11 shrink-0 place-items-center rounded-field ${TONE[nhom]}`}>
          <MonIcon mon={de.mon} className="h-5 w-5" />
        </span>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {de.ghimAt && <span className="rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-paper-light">Ghim</span>}
          <span className="rounded-full border border-ink/12 px-2.5 py-1 text-[11px] font-semibold text-ink-soft">{de.mon}</span>
        </div>
      </div>
      <h3 className="mt-4 line-clamp-2 min-h-[2.9rem] font-display text-[17px] font-semibold leading-snug tracking-tight text-ink">{de.ten}</h3>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-faint">{tenNhom(de.mon)}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-ink-faint">
        <span className="flex items-center gap-1.5"><IconCalendar className="h-3.5 w-3.5" />{formatNgay(de.ngay)}</span>
        <span className="h-1 w-1 rounded-full bg-ink/20" />
        <span>{formatDungLuong(de.kichThuoc)}</span>
        {de.dapAnDuongDan && (
          <span className="flex items-center gap-1 rounded-full bg-ok/12 px-2 py-0.5 text-[11px] font-semibold text-ok"><IconCheck className="h-3 w-3" />Đáp án</span>
        )}
      </div>
      <div className="mt-3 flex items-center gap-3 border-t border-ink/8 pt-3 text-[12px] text-ink-faint">
        <span className="flex items-center gap-1.5" title="Lượt xem"><IconEye className="h-3.5 w-3.5" />{de.luotXem ?? 0}</span>
        <span className="flex items-center gap-1.5" title="Lượt tải"><IconDownload className="h-3.5 w-3.5" />{de.luotTai ?? 0}</span>
        <span className={`flex items-center gap-1.5 ${sao ? "text-warn" : ""}`} title={sao ? `${sao}/5 từ ${de.saoDem} lượt` : "Chưa có đánh giá"}>
          <SaoNho day={!!sao} />
          {sao ? sao.toFixed(1) : "—"}
        </span>
        <motion.button whileTap={buttonTap} type="button" onClick={() => dao(de.id)} aria-pressed={daDoc} className={`ml-auto flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${daDoc ? "bg-ok/14 text-ok" : "bg-paper-deep text-ink-faint hover:text-ink"}`}>
          <IconCheck className="h-3 w-3" />
          {daDoc ? "Đã đọc" : "Đánh dấu"}
        </motion.button>
      </div>
      <Link href={`/de/${de.id}`} className="mt-4 block">
        <motion.span whileTap={buttonTap} className="nut-quet nut-nhan flex items-center justify-between gap-2 rounded-field bg-accent px-4 py-3 text-sm font-semibold text-paper-light transition-colors duration-300 hover:bg-accent-deep">
          Xem đề
          <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </motion.span>
      </Link>
    </motion.article>
  );
}