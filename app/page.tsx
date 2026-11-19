"use client";
import {useEffect, useMemo, useState} from "react";
import Link from "next/link";
import {motion, useScroll, useTransform} from "framer-motion";
import {IconArrowRight, IconCalendar, IconCheck, IconEye, IconFile, IconSearch, IconSeal, MonIcon} from "@/components/Icons";
import {DS_MON, formatNgay, MON_DAY_DU, NHOM_MON, type DeThi, type NhomMon} from "@/lib/data";
import {buttonTap, EASE, fadeInUp, spring, staggerContainer} from "@/lib/animations";
import {useAuth} from "@/lib/auth";
import {layDanhSach} from "@/lib/deThi";
const TONE: Record<NhomMon, {nen: string; chu: string}> = {
  "bat-buoc": {nen: "bg-accent", chu: "text-accent"},
  "tu-nhien": {nen: "bg-info", chu: "text-info"},
  "xa-hoi": {nen: "bg-ok", chu: "text-ok"},
  "ung-dung": {nen: "bg-warn", chu: "text-warn"},
  khac: {nen: "bg-grape", chu: "text-grape"}
};
const KY = ["A", "B", "C", "D"];
function IconBut() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h16M6.5 16.5l9-9a2.1 2.1 0 0 1 3 3l-9 9H6.5Z" />
      <path d="M13.5 6.5l3 3" />
    </svg>
  );
}
function IconGhim() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M7 3.5h10v17l-5-3.6-5 3.6Z" />
    </svg>
  );
}
const VIEC = [
  {Icon: IconFile, tieuDe: "Đọc ngay trong trang", moTa: "PDF dựng theo độ phân giải màn hình nên chữ nét. Vuốt sang trang, chụm hai ngón để phóng to, không phải cài thêm app.", chu: "text-accent", nen: "bg-accent"},
  {Icon: IconCheck, tieuDe: "Đáp án mở riêng", moTa: "Đang làm thì đáp án nằm im một chỗ. Làm xong mới bấm sang, khỏi lỡ mắt thấy lời giải.", chu: "text-ok", nen: "bg-ok"},
  {Icon: IconGhim, tieuDe: "Ghim trang, ghi chú", moTa: "Sai câu nào thì ghim trang đó, ghi một dòng vì sao sai. Ghi chú nằm trong máy cậu, mở lại đúng trang đang đọc.", chu: "text-warn", nen: "bg-warn"},
  {Icon: IconSearch, tieuDe: "Tìm chữ trong đề", moTa: "Nhớ mang máng một cụm từ thì gõ vào, trang chứa nó được tô đỏ rồi nhảy tới đúng chỗ.", chu: "text-info", nen: "bg-info"}
];
export default function TrangGioiThieu() {
  const {user} = useAuth();
  const {scrollY} = useScroll();
  const yPhieu = useTransform(scrollY, [0, 600], [0, -50]);
  const [ds, setDs] = useState<DeThi[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");
  const [to, setTo] = useState<Record<number, number>>({0: 1, 1: 3, 2: 0});
  useEffect(() => {
    let alive = true;
    layDanhSach().then((kq) => {
      if (!alive) return;
      setDs(kq);
      setDangTai(false);
    }).catch((e) => {
      if (!alive) return;
      setLoi(e instanceof Error ? e.message : "chưa đọc được kho");
      setDangTai(false);
    });
    return () => {
      alive = false;
    };
  }, []);
  const thongKe = useMemo(() => {
    const demMon = new Map<string, number>();
    let dapAn = 0;
    let xem = 0;
    let moiNhat = "";
    for (const d of ds) {
      demMon.set(d.mon, (demMon.get(d.mon) ?? 0) + 1);
      if (d.dapAnDuongDan) dapAn++;
      xem += d.luotXem ?? 0;
      if (d.ngay > moiNhat) moiNhat = d.ngay;
    }
    return {demMon, dapAn, xem, moiNhat};
  }, [ds]);
  const vuaLen = useMemo(() => [...ds].sort((a, b) => b.ngay.localeCompare(a.ngay)).slice(0, 4), [ds]);
  const toneCua = (mon: string) => TONE[(NHOM_MON.find((n) => (n.mon as string[]).includes(mon))?.id ?? "khac") as NhomMon];
  const so = (n: number) => (dangTai ? "—" : String(n));
  const tiLe = ds.length ? thongKe.dapAn / ds.length : 0;
  const chuVi = 2 * Math.PI * 32;
  const soTo = Object.keys(to).length;
  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl px-4 pb-24 pt-10 sm:pt-14">
      <motion.section variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <motion.div variants={fadeInUp} className="relative overflow-hidden rounded-panel border-2 border-ink bg-paper-light p-6 shadow-lift sm:p-9 lg:col-span-8">
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-60" style={{background: "radial-gradient(circle, rgb(var(--mark) / 0.85), transparent 68%)"}} />
          <div className="relative">
            <span className="inline-flex -skew-x-6 items-center gap-2 border-2 border-ink bg-mark px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-markink">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Kho đề tốt nghiệp THPT · 2026
            </span>
            <h1 className="mt-6 font-display text-[2.9rem] font-extrabold leading-[0.98] tracking-[-0.03em] text-ink sm:text-[4.2rem]">
              Đề thi THPT,
              <span className="relative mt-1 block w-fit">
                <motion.span initial={{scaleX: 0}} animate={{scaleX: 1}} transition={{duration: 0.7, ease: EASE, delay: 0.35}} style={{transformOrigin: "left center"}} className="absolute inset-x-[-6px] bottom-[0.12em] top-[0.22em] -skew-x-6 bg-mark" />
                <span className="relative">đáp án để riêng.</span>
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-[15px] leading-relaxed text-ink-soft sm:text-base">
              Mỗi đề một file, đáp án một file khác. Mở lên là đọc ngay trong trang, khỏi tải về rồi đi tìm app mở.
            </p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-faint">
              Trang ghim và ghi chú lưu trong máy cậu, đóng tab mở lại vẫn còn. Muốn in thì mỗi đề đều có nút tải PDF.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/kho-de">
                <motion.span whileTap={buttonTap} whileHover={{y: -3}} transition={spring} className="nut-quet nut-nhan group flex items-center gap-2 rounded-field border-2 border-ink bg-ink px-6 py-3.5 text-sm font-bold text-paper-light shadow-paper transition-colors hover:bg-accent">
                  Mở kho đề
                  <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </motion.span>
              </Link>
              <Link href="/thi-thu">
                <motion.span whileTap={buttonTap} whileHover={{y: -3}} transition={spring} className="flex items-center gap-2 rounded-field border-2 border-ink bg-paper-light px-6 py-3.5 text-sm font-bold text-ink transition-colors hover:bg-mark hover:text-markink">
                  <IconBut />
                  Thi thử như thật
                </motion.span>
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] font-bold uppercase tracking-[0.06em] text-ink-faint">
              {["Miễn phí", "Không quảng cáo", "Cập nhật mỗi tuần"].map((t) => (
                <span key={t} className="flex items-center gap-1.5"><IconCheck className="h-3.5 w-3.5 text-ok" />{t}</span>
              ))}
            </div>
          </div>
        </motion.div>
        <motion.div variants={fadeInUp} style={{y: yPhieu}} className="grid grid-cols-1 gap-4 lg:col-span-4">
          <div className="rounded-panel border-2 border-ink bg-ink p-5 text-paper-light shadow-lift">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] opacity-60">Đề trong kho</p>
            <div className="mt-1 flex items-end justify-between gap-3">
              <motion.p key={ds.length} initial={{y: 14, opacity: 0}} animate={{y: 0, opacity: 1}} transition={spring} className="font-display text-6xl font-extrabold leading-none tracking-tight">{so(ds.length)}</motion.p>
              <div className="relative grid shrink-0 place-items-center">
                <svg viewBox="0 0 76 76" className="h-[72px] w-[72px] -rotate-90">
                  <circle cx="38" cy="38" r="32" fill="none" stroke="rgb(var(--paper-light) / 0.18)" strokeWidth="7" />
                  <motion.circle cx="38" cy="38" r="32" fill="none" stroke="rgb(var(--mark))" strokeWidth="7" strokeLinecap="round" strokeDasharray={chuVi} initial={{strokeDashoffset: chuVi}} animate={{strokeDashoffset: chuVi * (1 - tiLe)}} transition={{duration: 1.1, ease: EASE}} />
                </svg>
                <span className="absolute font-display text-sm font-extrabold">{Math.round(tiLe * 100)}%</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-paper-light/15 pt-4">
              {[
                {nhan: "Đáp án", giaTri: so(thongKe.dapAn)},
                {nhan: "Môn", giaTri: `${so(thongKe.demMon.size)}/${DS_MON.length}`},
                {nhan: "Lượt xem", giaTri: so(thongKe.xem)}
              ].map((r) => (
                <div key={r.nhan}>
                  <p className="text-[9px] font-bold uppercase tracking-[0.1em] opacity-55">{r.nhan}</p>
                  <motion.p key={r.giaTri} initial={{y: 6, opacity: 0}} animate={{y: 0, opacity: 1}} transition={spring} className="mt-0.5 font-mono text-base font-bold">{r.giaTri}</motion.p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed opacity-60">{loi ? `Chưa đọc được số liệu: ${loi}.` : thongKe.moiNhat ? `Cập nhật ${formatNgay(thongKe.moiNhat)} · đếm thẳng từ kho.` : "Đếm thẳng từ kho, không làm tròn."}</p>
          </div>
          <div className="rounded-panel border-2 border-ink bg-paper-light p-5 shadow-paper">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink-faint">Phiếu trả lời</p>
              <span className="font-mono text-[11px] font-bold text-accent">{soTo}/8</span>
            </div>
            <div className="mt-3 space-y-1.5">
              {Array.from({length: 8}).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-5 shrink-0 font-mono text-[11px] font-bold text-ink-faint">{i + 1}</span>
                  <div className="flex flex-1 gap-1.5">
                    {KY.map((k, j) => {
                      const dang = to[i] === j;
                      return (
                        <button key={k} type="button" onClick={() => setTo((c) => {
                          const moi = {...c};
                          if (moi[i] === j) delete moi[i];
                          else moi[i] = j;
                          return moi;
                        })} aria-label={`Câu ${i + 1} phương án ${k}`} aria-pressed={dang} className={`grid h-6 flex-1 place-items-center rounded-full border-2 text-[10px] font-bold transition-all duration-200 ${dang ? "border-ink bg-ink text-paper-light" : "border-ink/25 text-ink-faint hover:border-ink hover:bg-mark hover:text-markink"}`}>
                          {k}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-ink-faint">Tô thử cho quen tay. Vào phòng thi thật thì có đồng hồ và chấm tự động.</p>
          </div>
        </motion.div>
      </motion.section>
      <section className="mt-24 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <motion.div initial={{opacity: 0, y: 20}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: "-80px"}} transition={{duration: 0.5, ease: EASE}} className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <span className="font-mono text-[11px] font-bold text-accent">01 — Cách dùng</span>
            <h2 className="mt-2 font-display text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">Bốn việc cậu sẽ dùng nhiều nhất</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">Kho này không cố làm nhiều thứ. Nó chỉ cố làm bốn việc này cho thật tử tế.</p>
            <Link href="/kho-de" className="mt-5 inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.06em] text-accent transition-colors hover:text-accent-deep">
              Bắt đầu ngay
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 gap-4 lg:col-span-8">
          {VIEC.map((v, i) => (
            <motion.div key={v.tieuDe} initial={{opacity: 0, y: 22}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: "-60px"}} transition={{duration: 0.45, ease: EASE, delay: i * 0.05}} whileHover={{x: 4}} className="group relative overflow-hidden rounded-card border-2 border-ink bg-paper-light p-5 shadow-paper transition-shadow duration-300 hover:shadow-lift">
              <span aria-hidden className={`absolute inset-y-0 left-0 w-1.5 ${v.nen}`} />
              <div className="flex items-start gap-4 pl-2">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-field border-2 border-ink bg-paper ${v.chu}`}><v.Icon /></span>
                <div className="min-w-0">
                  <p className="flex items-baseline gap-2.5 font-display text-[18px] font-bold tracking-tight text-ink">
                    <span className="font-mono text-[11px] font-normal text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
                    {v.tieuDe}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{v.moTa}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      <motion.section initial={{opacity: 0, y: 24}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: "-80px"}} transition={{duration: 0.5, ease: EASE}} className="mt-24">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-ink pb-4">
          <div>
            <span className="font-mono text-[11px] font-bold text-info">02 — Môn học</span>
            <h2 className="mt-1.5 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Chọn môn cậu đang yếu</h2>
          </div>
          <Link href="/kho-de" className="flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-[0.06em] text-accent transition-colors hover:text-accent-deep">
            Xem tất cả
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {DS_MON.map((m, i) => {
            const soDe = thongKe.demMon.get(m) ?? 0;
            const tone = toneCua(m);
            const noiDung = (
              <>
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-field border-2 border-ink ${soDe ? `${tone.nen} text-paper-light` : "bg-paper-deep text-ink-faint"}`}>
                  <MonIcon mon={m} className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-sm font-bold text-ink">{m}</span>
                  <span className="block truncate text-[11px] text-ink-faint">{MON_DAY_DU[m]}</span>
                </span>
                <span className={`shrink-0 font-mono text-sm font-bold ${soDe ? tone.chu : "text-ink-faint"}`}>{dangTai ? "—" : soDe}</span>
              </>
            );
            return (
              <motion.div key={m} initial={{opacity: 0, y: 14}} whileInView={{opacity: 1, y: 0}} viewport={{once: true}} transition={{duration: 0.32, ease: EASE, delay: Math.min(i * 0.025, 0.25)}}>
                {soDe > 0 ? (
                  <Link href={`/kho-de?mon=${encodeURIComponent(m)}`} className="group flex h-full items-center gap-3 rounded-card border-2 border-ink bg-paper-light p-3.5 shadow-paper transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                    {noiDung}
                  </Link>
                ) : (
                  <span title="Môn này chưa có đề" className="flex h-full items-center gap-3 rounded-card border-2 border-dashed border-ink/25 bg-paper-light/50 p-3.5 opacity-70">
                    {noiDung}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.section>
      <motion.section initial={{opacity: 0, y: 24}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: "-80px"}} transition={{duration: 0.5, ease: EASE}} className="mt-24">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-ink pb-4">
          <div>
            <span className="font-mono text-[11px] font-bold text-ok">03 — Mới nhất</span>
            <h2 className="mt-1.5 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Vừa lên kho</h2>
          </div>
          <Link href="/kho-de" className="flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-[0.06em] text-accent transition-colors hover:text-accent-deep">
            Xem hết
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6 overflow-hidden rounded-card border-2 border-ink bg-paper-light shadow-paper">
          {dangTai ? (
            <div className="divide-y-2 divide-dashed divide-ink/12">
              {Array.from({length: 4}).map((_, i) => <div key={i} className="h-[78px] animate-pulse bg-paper-deep/40" />)}
            </div>
          ) : vuaLen.length === 0 ? (
            <p className="p-6 text-sm text-ink-soft">Kho đang trống. Người gom đề sẽ tải lên sớm.</p>
          ) : (
            <ul className="divide-y-2 divide-dashed divide-ink/12">
              {vuaLen.map((d, i) => (
                <motion.li key={d.id} initial={{opacity: 0, x: -14}} whileInView={{opacity: 1, x: 0}} viewport={{once: true, margin: "-40px"}} transition={{duration: 0.34, ease: EASE, delay: i * 0.05}}>
                  <Link href={`/de/${d.id}`} className="group flex items-center gap-4 p-4 transition-colors hover:bg-mark/25">
                    <span className="w-6 shrink-0 font-mono text-sm font-bold text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-field border-2 border-ink ${toneCua(d.mon).nen} text-paper-light`}>
                      <MonIcon mon={d.mon} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-[15px] font-bold tracking-tight text-ink">{d.ten}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-ink-faint">
                        <span className="font-bold text-ink-soft">{d.mon}</span>
                        <span className="flex items-center gap-1"><IconCalendar className="h-3 w-3" />{formatNgay(d.ngay)}</span>
                        <span className="flex items-center gap-1"><IconEye className="h-3 w-3" />{d.luotXem ?? 0}</span>
                        {d.dapAnDuongDan && <span className="rounded-field bg-ok/15 px-1.5 font-bold text-ok">đáp án</span>}
                        {d.ghimAt && <span className="-skew-x-6 bg-mark px-1.5 font-bold text-markink">ghim</span>}
                      </span>
                    </span>
                    <IconArrowRight className="h-4 w-4 shrink-0 text-ink-faint transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent" />
                  </Link>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </motion.section>
      <motion.section id="thu-ngo" initial={{opacity: 0, y: 26}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: "-80px"}} transition={{duration: 0.55, ease: EASE}} className="mt-24 scroll-mt-28">
        <div className="relative overflow-hidden rounded-panel border-2 border-ink bg-paper-light shadow-lift">
          <div aria-hidden className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-accent via-mark to-cyan" />
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="border-b-2 border-ink bg-paper p-6 lg:col-span-4 lg:border-b-0 lg:border-r-2">
              <p className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-ink-faint">
                <IconSeal className="h-3.5 w-3.5 text-accent" />
                Thư gửi cậu
              </p>
              <p className="mt-5 font-display text-2xl font-extrabold leading-tight tracking-tight text-ink">Người gom đề viết vài dòng.</p>
              <div className="mt-6 flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-field border-2 border-ink bg-mark font-display text-sm font-extrabold text-markink">AL</span>
                <div>
                  <p className="font-display text-base font-bold text-ink">Anh Lusilfer</p>
                  <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-faint">người gom đề</p>
                </div>
              </div>
              <a href="https://anhcoder999.github.io/" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-field border-2 border-ink bg-paper-light px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.06em] text-ink transition-colors hover:bg-mark hover:text-markink">
                Hồ sơ người viết
                <IconArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="p-6 sm:p-9 lg:col-span-8">
              <p className="font-display text-xl font-bold tracking-tight text-ink">Chào cậu,</p>
              <div className="mt-4 space-y-4 text-[15px] leading-7 text-ink-soft">
                <p>Không biết lúc cậu mở trang web này ra thì ngoài trời đang là buổi sáng, hay đã khuya lắm rồi mà cậu vẫn còn ngồi bên bàn học nhỉ? Dạo này việc ôn tập của cậu thế nào rồi, có bị ngợp vì bài vở hay áp lực quá trước kỳ thi sắp tới không? Nếu thấy hơi mệt, cậu cứ hít một hơi thật sâu, uống một ngụm nước rồi hẳn bắt đầu nhé.</p>
                <p>Góc nhỏ này mình làm ra với mong muốn rất đơn giản: gom góp lại những bộ đề thi về chung một chỗ cho gọn gàng, để mỗi lần cần luyện tập là cậu có sẵn ngay, đỡ mất công lặn lội tìm kiếm khắp nơi. Kho đề vẫn đang được mình cập nhật dần theo thời gian nên chắc chắn sẽ còn những chỗ chưa đầy đủ, mong cậu thông cảm nếu đôi lúc chưa tìm thấy đúng môn mình cần.</p>
                <p>Chặng đường ôn thi lúc nào cũng dễ nản, nên cậu nhớ giữ gìn sức khỏe, đừng ép bản thân thức khuya quá nhé. Làm thử một đề có sai vài câu cũng chẳng sao cả, miễn là mình nhận ra chỗ còn hổng để kịp vá lại trước khi bước vào phòng thi thật.</p>
                <p>Chúc cậu luôn giữ được cái đầu tỉnh táo, làm bài thật chắc tay và đạt được kết quả xứng đáng với những gì cậu đã bỏ ra. Cứ bình tĩnh mà bước, rồi mọi chuyện sẽ ổn cả thôi!</p>
              </div>
              <p className="mt-5 border-l-4 border-mark pl-4 text-sm italic leading-relaxed text-ink-faint">P.S. Hôm nào thấy đầu óc quay cuồng quá thì cứ gấp sách lại đi ngủ một giấc cho khỏe, mai mình lại làm tiếp nhé.</p>
            </div>
          </div>
        </div>
      </motion.section>
      <motion.section initial={{opacity: 0, y: 20}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: "-60px"}} transition={{duration: 0.45, ease: EASE}} className="relative mt-16 overflow-hidden rounded-panel border-2 border-ink bg-ink p-6 text-paper-light shadow-lift sm:p-9">
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-70" style={{background: "radial-gradient(circle, rgb(var(--accent) / 0.7), transparent 68%)"}} />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Thư tới đây thôi.</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed opacity-75">Cậu uống ngụm nước rồi mở mục lục, chọn môn đang yếu nhất mà luyện nhé.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/kho-de">
              <motion.span whileTap={buttonTap} className="nut-nhan flex items-center gap-2 rounded-field border-2 border-mark bg-mark px-5 py-3 text-sm font-bold text-markink transition-colors hover:bg-paper-light hover:border-paper-light">
                Vào kho đề
                <IconArrowRight className="h-4 w-4" />
              </motion.span>
            </Link>
            {!user && (
              <Link href="/login" className="rounded-field border-2 border-paper-light/30 px-5 py-3 text-sm font-bold transition-colors hover:border-paper-light">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </motion.section>
    </div>
  );
}