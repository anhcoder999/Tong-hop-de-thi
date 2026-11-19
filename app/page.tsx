"use client";
import {useEffect, useMemo, useState} from "react";
import Link from "next/link";
import {motion, useScroll, useTransform} from "framer-motion";
import {IconArrowRight, IconCalendar, IconCheck, IconEye, IconFile, IconSearch, IconSeal, MonIcon} from "@/components/Icons";
import {DS_MON, formatNgay, MON_DAY_DU, NHOM_MON, type DeThi, type NhomMon} from "@/lib/data";
import {buttonTap, EASE, fadeInUp, spring, staggerContainer} from "@/lib/animations";
import {useAuth} from "@/lib/auth";
import {layDanhSach} from "@/lib/deThi";
const TONE: Record<NhomMon, string> = {
  "bat-buoc": "bg-accent-wash text-accent",
  "tu-nhien": "bg-info/12 text-info",
  "xa-hoi": "bg-ok/12 text-ok",
  "ung-dung": "bg-warn/14 text-warn",
  khac: "bg-grape/12 text-grape"
};
function IconBut() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h16M6.5 16.5l9-9a2.1 2.1 0 0 1 3 3l-9 9H6.5Z" />
      <path d="M13.5 6.5l3 3" />
    </svg>
  );
}
function IconGhim() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
      <path d="M7 3.5h10v17l-5-3.6-5 3.6Z" />
    </svg>
  );
}
const VIEC = [
  {Icon: IconFile, tieuDe: "Đọc ngay trong trang", moTa: "PDF dựng theo độ phân giải màn hình nên chữ nét. Vuốt sang trang, chụm hai ngón để phóng to, không phải cài thêm app.", tone: "bg-accent-wash text-accent"},
  {Icon: IconCheck, tieuDe: "Đáp án mở riêng", moTa: "Đang làm thì đáp án nằm im một chỗ. Làm xong mới bấm sang, khỏi lỡ mắt thấy lời giải.", tone: "bg-ok/12 text-ok"},
  {Icon: IconGhim, tieuDe: "Ghim trang, ghi chú", moTa: "Sai câu nào thì ghim trang đó, ghi một dòng vì sao sai. Ghi chú nằm trong máy cậu, mở lại đúng trang đang đọc.", tone: "bg-warn/14 text-warn"},
  {Icon: IconSearch, tieuDe: "Tìm chữ trong đề", moTa: "Nhớ mang máng một cụm từ thì gõ vào, trang chứa nó được tô đỏ rồi nhảy tới đúng chỗ.", tone: "bg-info/12 text-info"}
];
export default function TrangGioiThieu() {
  const {user} = useAuth();
  const {scrollY} = useScroll();
  const yThe = useTransform(scrollY, [0, 500], [0, -46]);
  const [ds, setDs] = useState<DeThi[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");
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
  const chuVi = 2 * Math.PI * 34;
  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl px-4 pb-24 pt-10 sm:pt-16">
      <motion.section variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
        <motion.div variants={fadeInUp} className="min-w-0 lg:col-span-7">
          <motion.span variants={fadeInUp} className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper-light px-3 py-1.5 text-[11px] font-semibold text-ink-soft shadow-paper">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            Kho đề ôn thi tốt nghiệp THPT · 2026
          </motion.span>
          <h1 className="mt-5 font-display text-[2.7rem] font-bold leading-[1.06] tracking-tight text-ink sm:text-6xl">
            Đề thi THPT,
            <span className="block bg-gradient-to-r from-accent via-info to-grape bg-clip-text text-transparent">đáp án để riêng.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-soft sm:text-base">
            Mỗi đề một file, đáp án một file khác. Mở lên là đọc ngay trong trang, khỏi tải về rồi đi tìm app mở.
          </p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-faint">
            Trang ghim và ghi chú lưu trong máy cậu, đóng tab mở lại vẫn còn. Muốn in thì mỗi đề đều có nút tải PDF.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/kho-de">
              <motion.span whileTap={buttonTap} whileHover={{y: -2}} transition={spring} className="nut-quet nut-nhan group flex items-center gap-2 rounded-field bg-accent px-6 py-3.5 text-sm font-semibold text-paper-light shadow-lift transition-colors hover:bg-accent-deep">
                Mở kho đề
                <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </motion.span>
            </Link>
            <Link href="/thi-thu">
              <motion.span whileTap={buttonTap} whileHover={{y: -2}} transition={spring} className="flex items-center gap-2 rounded-field border border-ink/12 bg-paper-light px-6 py-3.5 text-sm font-semibold text-ink shadow-paper transition-colors hover:border-accent/40 hover:text-accent">
                <IconBut />
                Vào phòng thi thử
              </motion.span>
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] font-medium text-ink-faint">
            {["Miễn phí", "Không quảng cáo", "Cập nhật dần mỗi tuần"].map((t) => (
              <span key={t} className="flex items-center gap-1.5"><IconCheck className="h-3.5 w-3.5 text-ok" />{t}</span>
            ))}
          </div>
        </motion.div>
        <motion.aside variants={fadeInUp} style={{y: yThe}} className="min-w-0 lg:col-span-5">
          <div className="relative overflow-hidden rounded-panel border border-ink/10 bg-paper-light p-6 shadow-lift">
            <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-40" style={{background: "radial-gradient(circle, rgb(var(--accent) / 0.35), transparent 70%)"}} />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">Đề trong kho</p>
                <motion.p key={ds.length} initial={{y: 12, opacity: 0}} animate={{y: 0, opacity: 1}} transition={spring} className="mt-1 font-display text-6xl font-bold leading-none tracking-tight text-ink">{so(ds.length)}</motion.p>
                <p className="mt-2 text-[12px] text-ink-faint">{dangTai ? "đang đếm..." : thongKe.moiNhat ? `cập nhật ${formatNgay(thongKe.moiNhat)}` : "chưa có đề"}</p>
              </div>
              <div className="relative grid shrink-0 place-items-center">
                <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgb(var(--ink) / 0.1)" strokeWidth="7" />
                  <motion.circle cx="40" cy="40" r="34" fill="none" stroke="rgb(var(--ok))" strokeWidth="7" strokeLinecap="round" strokeDasharray={chuVi} initial={{strokeDashoffset: chuVi}} animate={{strokeDashoffset: chuVi * (1 - tiLe)}} transition={{duration: 1.1, ease: EASE}} />
                </svg>
                <div className="absolute text-center">
                  <p className="font-display text-base font-bold text-ink">{Math.round(tiLe * 100)}%</p>
                  <p className="text-[9px] uppercase tracking-[0.1em] text-ink-faint">đáp án</p>
                </div>
              </div>
            </div>
            <dl className="relative mt-6 grid grid-cols-3 gap-3 border-t border-ink/8 pt-5">
              {[
                {nhan: "Có đáp án", giaTri: so(thongKe.dapAn), mau: "text-ok"},
                {nhan: "Môn đã có", giaTri: `${so(thongKe.demMon.size)}/${DS_MON.length}`, mau: "text-info"},
                {nhan: "Lượt xem", giaTri: so(thongKe.xem), mau: "text-grape"}
              ].map((r) => (
                <div key={r.nhan}>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-faint">{r.nhan}</dt>
                  <motion.dd key={r.giaTri} initial={{y: 8, opacity: 0}} animate={{y: 0, opacity: 1}} transition={spring} className={`mt-1 font-display text-xl font-bold ${r.mau}`}>{r.giaTri}</motion.dd>
                </div>
              ))}
            </dl>
            <p className="relative mt-4 text-[11px] leading-relaxed text-ink-faint">{loi ? `Chưa đọc được số liệu: ${loi}.` : "Đếm thẳng từ kho, không làm tròn."}</p>
          </div>
        </motion.aside>
      </motion.section>
      <motion.section initial={{opacity: 0, y: 24}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: "-80px"}} transition={{duration: 0.5, ease: EASE}} className="mt-24">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">Kho này có gì</h2>
            <p className="mt-1.5 text-sm text-ink-faint">Bốn việc cậu sẽ dùng nhiều nhất.</p>
          </div>
          <span className="hidden h-px flex-1 bg-gradient-to-r from-ink/15 to-transparent sm:block" />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {VIEC.map((v, i) => (
            <motion.div key={v.tieuDe} initial={{opacity: 0, y: 18}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: "-60px"}} transition={{duration: 0.42, ease: EASE, delay: (i % 2) * 0.06}} whileHover={{y: -3}} className="group rounded-card border border-ink/10 bg-paper-light p-5 shadow-paper transition-[border-color,box-shadow] duration-300 hover:border-accent/30 hover:shadow-lift">
              <div className="flex items-start gap-4">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-field ${v.tone}`}><v.Icon /></span>
                <div className="min-w-0">
                  <p className="flex items-baseline gap-2 font-display text-[17px] font-semibold tracking-tight text-ink">
                    <span className="font-mono text-[11px] font-normal text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
                    {v.tieuDe}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{v.moTa}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
      <motion.section initial={{opacity: 0, y: 24}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: "-80px"}} transition={{duration: 0.5, ease: EASE}} className="mt-24">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">Môn học</h2>
            <p className="mt-1.5 text-sm text-ink-faint">Bấm một môn để mở kho đã lọc sẵn.</p>
          </div>
          <Link href="/kho-de" className="flex items-center gap-1.5 text-[13px] font-semibold text-accent transition-colors hover:text-accent-deep">
            Xem tất cả
            <IconArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {DS_MON.map((m, i) => {
            const soDe = thongKe.demMon.get(m) ?? 0;
            const noiDung = (
              <>
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-field ${soDe ? toneCua(m) : "bg-paper-deep text-ink-faint"}`}>
                  <MonIcon mon={m} className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">{m}</span>
                  <span className="block truncate text-[11px] text-ink-faint">{MON_DAY_DU[m]}</span>
                </span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${soDe ? "bg-paper-deep text-ink" : "text-ink-faint"}`}>{dangTai ? "—" : soDe}</span>
              </>
            );
            return (
              <motion.div key={m} initial={{opacity: 0, y: 12}} whileInView={{opacity: 1, y: 0}} viewport={{once: true}} transition={{duration: 0.32, ease: EASE, delay: Math.min(i * 0.025, 0.25)}}>
                {soDe > 0 ? (
                  <Link href={`/kho-de?mon=${encodeURIComponent(m)}`} className="group flex h-full items-center gap-3 rounded-card border border-ink/10 bg-paper-light p-3.5 shadow-paper transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-lift">
                    {noiDung}
                  </Link>
                ) : (
                  <span title="Môn này chưa có đề" className="flex h-full items-center gap-3 rounded-card border border-dashed border-ink/12 bg-paper-light/50 p-3.5 opacity-70">
                    {noiDung}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.section>
      <motion.section initial={{opacity: 0, y: 24}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: "-80px"}} transition={{duration: 0.5, ease: EASE}} className="mt-24">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">Vừa lên kho</h2>
            <p className="mt-1.5 text-sm text-ink-faint">Những đề mới nhất vừa được gom về.</p>
          </div>
          <Link href="/kho-de" className="flex items-center gap-1.5 text-[13px] font-semibold text-accent transition-colors hover:text-accent-deep">
            Xem hết
            <IconArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-6 overflow-hidden rounded-card border border-ink/10 bg-paper-light shadow-paper">
          {dangTai ? (
            <div className="divide-y divide-ink/8">
              {Array.from({length: 4}).map((_, i) => <div key={i} className="h-[76px] animate-pulse bg-paper-deep/40" />)}
            </div>
          ) : vuaLen.length === 0 ? (
            <p className="p-6 text-sm text-ink-soft">Kho đang trống. Người gom đề sẽ tải lên sớm.</p>
          ) : (
            <ul className="divide-y divide-ink/8">
              {vuaLen.map((d, i) => (
                <motion.li key={d.id} initial={{opacity: 0, x: -12}} whileInView={{opacity: 1, x: 0}} viewport={{once: true, margin: "-40px"}} transition={{duration: 0.34, ease: EASE, delay: i * 0.05}}>
                  <Link href={`/de/${d.id}`} className="group flex items-center gap-4 p-4 transition-colors hover:bg-paper-deep/50">
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-field ${toneCua(d.mon)}`}>
                      <MonIcon mon={d.mon} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-[15px] font-semibold tracking-tight text-ink">{d.ten}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-faint">
                        <span className="font-semibold text-ink-soft">{d.mon}</span>
                        <span className="flex items-center gap-1"><IconCalendar className="h-3 w-3" />{formatNgay(d.ngay)}</span>
                        <span className="flex items-center gap-1"><IconEye className="h-3 w-3" />{d.luotXem ?? 0}</span>
                        {d.dapAnDuongDan && <span className="rounded-full bg-ok/12 px-2 py-0.5 font-semibold text-ok">đáp án</span>}
                        {d.ghimAt && <span className="rounded-full bg-ink px-2 py-0.5 font-semibold text-paper-light">ghim</span>}
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
        <div className="relative overflow-hidden rounded-panel border border-ink/10 bg-paper-light p-6 shadow-lift sm:p-10">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-info to-grape" />
          <div className="mx-auto max-w-2xl">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
              <IconSeal className="h-3.5 w-3.5 text-accent" />
              Thư gửi cậu
            </p>
            <p className="mt-5 font-display text-xl font-semibold tracking-tight text-ink">Chào cậu,</p>
            <div className="mt-4 space-y-4 text-[15px] leading-7 text-ink-soft">
              <p>Không biết lúc cậu mở trang web này ra thì ngoài trời đang là buổi sáng, hay đã khuya lắm rồi mà cậu vẫn còn ngồi bên bàn học nhỉ? Dạo này việc ôn tập của cậu thế nào rồi, có bị ngợp vì bài vở hay áp lực quá trước kỳ thi sắp tới không? Nếu thấy hơi mệt, cậu cứ hít một hơi thật sâu, uống một ngụm nước rồi hẳn bắt đầu nhé.</p>
              <p>Góc nhỏ này mình làm ra với mong muốn rất đơn giản: gom góp lại những bộ đề thi về chung một chỗ cho gọn gàng, để mỗi lần cần luyện tập là cậu có sẵn ngay, đỡ mất công lặn lội tìm kiếm khắp nơi. Kho đề vẫn đang được mình cập nhật dần theo thời gian nên chắc chắn sẽ còn những chỗ chưa đầy đủ, mong cậu thông cảm nếu đôi lúc chưa tìm thấy đúng môn mình cần.</p>
              <p>Chặng đường ôn thi lúc nào cũng dễ nản, nên cậu nhớ giữ gìn sức khỏe, đừng ép bản thân thức khuya quá nhé. Làm thử một đề có sai vài câu cũng chẳng sao cả, miễn là mình nhận ra chỗ còn hổng để kịp vá lại trước khi bước vào phòng thi thật.</p>
              <p>Chúc cậu luôn giữ được cái đầu tỉnh táo, làm bài thật chắc tay và đạt được kết quả xứng đáng với những gì cậu đã bỏ ra. Cứ bình tĩnh mà bước, rồi mọi chuyện sẽ ổn cả thôi!</p>
            </div>
            <p className="mt-4 text-sm italic leading-relaxed text-ink-faint">P.S. Hôm nào thấy đầu óc quay cuồng quá thì cứ gấp sách lại đi ngủ một giấc cho khỏe, mai mình lại làm tiếp nhé.</p>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-ink/10 pt-6">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-accent-wash font-display text-sm font-bold text-accent">AL</span>
                <div>
                  <p className="font-display text-base font-semibold tracking-tight text-ink">Anh Lusilfer</p>
                  <p className="text-[11px] uppercase tracking-[0.1em] text-ink-faint">người gom đề</p>
                </div>
              </div>
              <a href="https://anhcoder999.github.io/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-field border border-ink/12 bg-paper px-4 py-2.5 text-[13px] font-semibold text-ink-soft transition-colors hover:border-accent/40 hover:text-accent">
                Hồ sơ người viết
                <IconArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </motion.section>
      <motion.section initial={{opacity: 0, y: 20}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: "-60px"}} transition={{duration: 0.45, ease: EASE}} className="relative mt-16 overflow-hidden rounded-panel border border-accent/20 p-6 sm:p-8">
        <div aria-hidden className="absolute inset-0 -z-10" style={{background: "linear-gradient(120deg, rgb(var(--accent) / 0.12), rgb(var(--info) / 0.1) 45%, rgb(var(--grape) / 0.12))"}} />
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">Thư tới đây thôi.</h2>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-soft">Cậu uống ngụm nước rồi mở mục lục, chọn môn đang yếu nhất mà luyện nhé.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/kho-de">
              <motion.span whileTap={buttonTap} className="nut-nhan flex items-center gap-2 rounded-field bg-accent px-5 py-3 text-sm font-semibold text-paper-light transition-colors hover:bg-accent-deep">
                Vào kho đề
                <IconArrowRight className="h-4 w-4" />
              </motion.span>
            </Link>
            {!user && (
              <Link href="/login" className="rounded-field border border-ink/15 bg-paper-light px-5 py-3 text-sm font-semibold text-ink-soft transition-colors hover:border-accent/40 hover:text-accent">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </motion.section>
    </div>
  );
}