"use client";
import {useCallback, useEffect, useMemo, useState} from "react";
import Link from "next/link";
import {motion} from "framer-motion";
import {IconDownload, IconEye, IconLoader, IconRefresh, IconSeal, MonIcon} from "@/components/Icons";
import {layThongKe, type ThongKe} from "@/app/actions";
import {formatDungLuong, type NhomMon} from "@/lib/data";
import {buttonTap, fadeInUp, spring, staggerContainer} from "@/lib/animations";
const MAU_NHOM: Record<NhomMon, string> = {
  "bat-buoc": "rgb(var(--accent))",
  "tu-nhien": "rgb(var(--info))",
  "xa-hoi": "rgb(var(--ok))",
  "ung-dung": "rgb(var(--warn))",
  khac: "rgb(var(--ink-faint))"
};
const NHOM_CUA_MON: Record<string, NhomMon> = {
  "Toán": "bat-buoc", "Văn": "bat-buoc", "Anh": "bat-buoc",
  "Lí": "tu-nhien", "Hóa": "tu-nhien", "Sinh": "tu-nhien",
  "Sử": "xa-hoi", "Địa": "xa-hoi", "KTPL": "xa-hoi",
  "Tin": "ung-dung", "CN": "ung-dung", "Khác": "khac"
};
function Duong({ds, mau}: {ds: number[]; mau: string}) {
  const max = Math.max(1, ...ds);
  const diem = ds.map((v, i) => `${20 + i * (520 / 13)},${150 - (v / max) * 128}`);
  return (
    <>
      <motion.path initial={{pathLength: 0}} animate={{pathLength: 1}} transition={{duration: 1.1, ease: "easeOut"}} d={`M${diem.join(" L")}`} fill="none" stroke={mau} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <motion.path initial={{opacity: 0}} animate={{opacity: 0.16}} transition={{delay: 0.5, duration: 0.6}} d={`M${diem.join(" L")} L540,150 L20,150 Z`} fill={mau} stroke="none" />
    </>
  );
}
export default function Dashboard() {
  const [tk, setTk] = useState<ThongKe | null>(null);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");
  const [hover, setHover] = useState<number | null>(null);
  const tai = useCallback(async () => {
    setDangTai(true);
    setLoi("");
    const kq = await layThongKe();
    if (kq.ok) setTk(kq.tk);
    else setLoi(kq.error);
    setDangTai(false);
  }, []);
  useEffect(() => {
    void tai();
  }, [tai]);
  const maxMon = useMemo(() => Math.max(1, ...(tk?.mon.map((m) => m.xem) ?? [1])), [tk]);
  const maxNgay = useMemo(() => Math.max(1, ...(tk?.ngay.map((d) => Math.max(d.xem, d.tai)) ?? [1])), [tk]);
  const tiles = tk ? [
    {nhan: "Tổng đề", giaTri: String(tk.tongDe), mau: "text-accent", vien: "border-accent/50"},
    {nhan: "Đề có đáp án", giaTri: `${tk.tongDapAn}/${tk.tongDe}`, mau: "text-ok", vien: "border-ok/50"},
    {nhan: "Lượt xem", giaTri: String(tk.tongXem), mau: "text-info", vien: "border-info/50"},
    {nhan: "Lượt tải", giaTri: String(tk.tongTai), mau: "text-warn", vien: "border-warn/50"},
    {nhan: "Thành viên", giaTri: String(tk.thanhVien), mau: "text-ink", vien: "border-ink/40"},
    {nhan: "Nhận xét chờ", giaTri: String(tk.choDuyet), mau: "text-danger", vien: "border-danger/50"}
  ] : [];
  const vong = tk && tk.tongDe ? tk.tongDapAn / tk.tongDe : 0;
  const chuVi = 2 * Math.PI * 42;
  return (
    <motion.section variants={staggerContainer} initial="hidden" animate="visible" className="mx-auto w-full min-w-0 max-w-6xl px-4 pt-8 sm:pt-10">
      <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink pb-4">
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          <IconSeal className="h-5 w-5 text-accent" />
          Dashboard <span className="text-accent">thống kê</span>
        </h1>
        <motion.button whileTap={buttonTap} type="button" onClick={() => void tai()} className="flex items-center gap-1.5 border border-ink/30 bg-paper-light px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft transition-colors hover:border-accent hover:text-accent">
          <IconRefresh className={`h-3.5 w-3.5 ${dangTai ? "animate-spin" : ""}`} />
          Làm mới
        </motion.button>
      </motion.div>
      {loi ? (
        <p className="mt-4 border border-danger/60 bg-danger/10 p-3 text-sm text-danger">{loi}</p>
      ) : !tk ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({length: 6}).map((_, i) => (
            <div key={i} className="h-20 animate-pulse border border-ink/20 bg-paper-light" />
          ))}
        </div>
      ) : (
        <>
          <motion.div variants={fadeInUp} className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {tiles.map((t) => (
              <motion.div key={t.nhan} whileHover={{y: -3}} transition={spring} className={`border ${t.vien} bg-paper-light px-3 py-3 shadow-paper`}>
                <p className="text-[10px] uppercase tracking-[0.16em] text-ink-faint">{t.nhan}</p>
                <motion.p key={t.giaTri} initial={{y: 8, opacity: 0}} animate={{y: 0, opacity: 1}} transition={spring} className={`mt-1 font-display text-xl font-bold ${t.mau}`}>{t.giaTri}</motion.p>
              </motion.div>
            ))}
          </motion.div>
          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
            <motion.div variants={fadeInUp} className="sheet border border-ink/25 bg-paper-light p-4 shadow-paper lg:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-base font-bold text-ink">Nhịp truy cập 14 ngày</h2>
                <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 bg-accent" />Xem</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 bg-info" />Tải</span>
                </div>
              </div>
              <div className="relative mt-3">
                <svg viewBox="0 0 560 170" className="w-full" onPointerMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  const idx = Math.round(((e.clientX - r.left) / r.width * 560 - 20) / (520 / 13));
                  setHover(idx >= 0 && idx < 14 ? idx : null);
                }} onPointerLeave={() => setHover(null)}>
                  {[0, 1, 2, 3].map((i) => (
                    <line key={i} x1="20" x2="540" y1={22 + i * 42.6} y2={22 + i * 42.6} stroke="rgb(var(--ink) / 0.12)" strokeDasharray="3 4" />
                  ))}
                  <Duong ds={tk.ngay.map((d) => d.xem)} mau="rgb(var(--accent))" />
                  <Duong ds={tk.ngay.map((d) => d.tai)} mau="rgb(var(--info))" />
                  {hover !== null && <line x1={20 + hover * (520 / 13)} x2={20 + hover * (520 / 13)} y1="14" y2="150" stroke="rgb(var(--ink) / 0.35)" strokeWidth="1" />}
                  {tk.ngay.map((d, i) => (
                    <text key={d.ngay} x={20 + i * (520 / 13)} y="164" textAnchor="middle" fontSize="8.5" fill="rgb(var(--ink-faint))">{i % 2 === 0 ? d.ngay : ""}</text>
                  ))}
                  <text x="20" y="14" fontSize="9" fill="rgb(var(--ink-faint))">{maxNgay}</text>
                </svg>
                {hover !== null && (
                  <div className="pointer-events-none absolute top-0 -translate-x-1/2 border border-ink/40 bg-paper px-2 py-1 text-[10px] shadow-paper" style={{left: `${((20 + hover * (520 / 13)) / 560) * 100}%`}}>
                    <span className="font-semibold text-ink">{tk.ngay[hover].ngay}</span>
                    <span className="ml-2 text-accent">{tk.ngay[hover].xem} xem</span>
                    <span className="ml-2 text-info">{tk.ngay[hover].tai} tải</span>
                  </div>
                )}
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="sheet flex flex-col items-center justify-center border border-ink/25 bg-paper-light p-4 shadow-paper">
              <h2 className="self-start font-display text-base font-bold text-ink">Phủ đáp án</h2>
              <div className="relative mt-2 grid place-items-center">
                <svg viewBox="0 0 100 100" className="h-36 w-36 -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgb(var(--ink) / 0.12)" strokeWidth="9" />
                  <motion.circle cx="50" cy="50" r="42" fill="none" stroke="rgb(var(--ok))" strokeWidth="9" strokeLinecap="round" strokeDasharray={chuVi} initial={{strokeDashoffset: chuVi}} animate={{strokeDashoffset: chuVi * (1 - vong)}} transition={{duration: 1.1, ease: "easeOut"}} />
                </svg>
                <div className="absolute text-center">
                  <p className="font-display text-2xl font-bold text-ok">{Math.round(vong * 100)}%</p>
                  <p className="text-[9px] uppercase tracking-[0.14em] text-ink-faint">đề có đáp án</p>
                </div>
              </div>
              <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-ink-faint">{tk.tongDapAn} đáp án · {formatDungLuong(tk.bytes)} toàn kho</p>
            </motion.div>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-5 pb-4 lg:grid-cols-2">
            <motion.div variants={fadeInUp} className="sheet border border-ink/25 bg-paper-light p-4 shadow-paper">
              <h2 className="font-display text-base font-bold text-ink">Sức nóng theo môn</h2>
              <ul className="mt-3 space-y-2">
                {tk.mon.filter((m) => m.de > 0).sort((a, b) => b.xem - a.xem).map((m) => (
                  <li key={m.mon} className="flex items-center gap-2.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center border border-ink/25 bg-paper text-ink">
                      <MonIcon mon={m.mon} className="h-4 w-4" />
                    </span>
                    <span className="w-12 shrink-0 text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">{m.mon}</span>
                    <div className="h-3 min-w-0 flex-1 overflow-hidden bg-ink/10">
                      <motion.div initial={{width: 0}} animate={{width: `${(m.xem / maxMon) * 100}%`}} transition={{duration: 0.9, ease: "easeOut"}} className="h-full" style={{background: MAU_NHOM[NHOM_CUA_MON[m.mon]]}} />
                    </div>
                    <span className="w-14 shrink-0 text-right text-[11px] font-semibold text-ink">{m.xem} xem</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div variants={fadeInUp} className="sheet border border-ink/25 bg-paper-light p-4 shadow-paper">
              <h2 className="font-display text-base font-bold text-ink">Top đề được xem</h2>
              <ul className="mt-3 space-y-2">
                {tk.top.map((d, i) => (
                  <li key={d.id}>
                    <Link href={`/de/${d.id}`} className="flex items-center gap-2.5 border border-ink/20 bg-paper p-2.5 transition-colors hover:border-accent">
                      <span className={`grid h-7 w-7 shrink-0 place-items-center border font-display text-sm font-bold ${i === 0 ? "border-accent bg-accent text-paper-light" : "border-ink/30 text-ink-soft"}`}>{i + 1}</span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{d.ten}</span>
                      <span className="shrink-0 border border-accent/60 px-1.5 text-[10px] font-semibold uppercase text-accent">{d.mon}</span>
                      <span className="flex shrink-0 items-center gap-1 text-[11px] text-ink-faint"><IconEye className="h-3 w-3" />{d.xem}</span>
                      <span className="flex shrink-0 items-center gap-1 text-[11px] text-ink-faint"><IconDownload className="h-3 w-3" />{d.tai}</span>
                    </Link>
                  </li>
                ))}
                {tk.top.length === 0 && <p className="text-sm text-ink-soft">Kho chưa có đề nào.</p>}
              </ul>
            </motion.div>
          </div>
        </>
      )}
    </motion.section>
  );
}