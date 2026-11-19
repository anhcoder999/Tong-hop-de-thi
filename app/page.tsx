"use client";
import {useEffect, useMemo, useState} from "react";
import Link from "next/link";
import {motion, useScroll, useTransform} from "framer-motion";
import {IconArrowRight, IconCalendar, IconCheck, IconEye, IconFile, IconSearch, IconSeal, MonIcon} from "@/components/Icons";
import InkDraw from "@/components/InkDraw";
import {DS_MON, formatNgay, MON_DAY_DU, NHOM_MON, type DeThi, type NhomMon} from "@/lib/data";
import {buttonTap, EASE, fadeInUp, spring, staggerContainer} from "@/lib/animations";
import {useAuth} from "@/lib/auth";
import {layDanhSach} from "@/lib/deThi";
const MAU_NHOM: Record<NhomMon, string> = {
  "bat-buoc": "border-l-accent",
  "tu-nhien": "border-l-info",
  "xa-hoi": "border-l-ok",
  "ung-dung": "border-l-warn",
  khac: "border-l-ink-faint"
};
function IconGhimTrang({className}: {className?: string}) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className ?? "h-5 w-5"} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
      <path d="M7 3.5h10v17l-5-3.6-5 3.6Z" />
    </svg>
  );
}
const VIEC = [
  {icon: IconFile, tieuDe: "Đọc ngay trong trang", moTa: "PDF dựng theo độ phân giải màn hình nên chữ nét. Vuốt sang trang, chụm hai ngón để phóng to, không phải cài thêm app."},
  {icon: IconCheck, tieuDe: "Đáp án mở riêng", moTa: "Đang làm thì đáp án nằm im một chỗ. Làm xong mới bấm sang, khỏi lỡ mắt thấy lời giải."},
  {icon: IconGhimTrang, tieuDe: "Ghim trang, ghi chú", moTa: "Sai câu nào thì ghim trang đó, ghi một dòng vì sao sai. Ghi chú nằm trong máy cậu, mở lại đúng trang đang đọc."},
  {icon: IconSearch, tieuDe: "Tìm chữ trong đề", moTa: "Nhớ mang máng một cụm từ thì gõ vào, trang chứa nó được tô đỏ rồi nhảy tới đúng chỗ."}
];
function DauKho() {
  return (
    <motion.svg aria-hidden initial={{opacity: 0, scale: 1.5, rotate: 24}} animate={{opacity: 0.9, scale: 1, rotate: 10}} transition={{type: "spring", stiffness: 260, damping: 18, delay: 0.35}} viewBox="0 0 120 120" className="pointer-events-none absolute -bottom-6 -left-2 h-24 w-24 text-accent sm:-bottom-7 sm:-left-7">
      <defs>
        <path id="dethi-vong-kho" d="M60,60 m-43,0 a43,43 0 1,1 86,0 a43,43 0 1,1 -86,0" />
      </defs>
      <circle cx="60" cy="60" r="47" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="60" cy="60" r="31" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
      <text fontSize="8.5" letterSpacing="2.4" fill="currentColor">
        <textPath href="#dethi-vong-kho">KHO ĐỀ THPT · MIỄN PHÍ · KHÔNG QUẢNG CÁO ·</textPath>
      </text>
      <text x="60" y="66" textAnchor="middle" fontSize="17" fontWeight="bold" fill="currentColor" fontFamily="serif">ĐT</text>
    </motion.svg>
  );
}
export default function TrangGioiThieu() {
  const {user} = useAuth();
  const {scrollY} = useScroll();
  const yPhieu = useTransform(scrollY, [0, 460], [0, -40]);
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
  const vuaLen = useMemo(() => [...ds].sort((a, b) => b.ngay.localeCompare(a.ngay)).slice(0, 3), [ds]);
  const mauCua = (mon: string) => MAU_NHOM[(NHOM_MON.find((n) => (n.mon as string[]).includes(mon))?.id ?? "khac") as NhomMon];
  const so = (n: number) => (dangTai ? "—" : String(n));
  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl overflow-x-clip px-4 pb-20 pt-8 sm:pt-12">
      <motion.section variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
        <motion.div variants={fadeInUp} className="min-w-0 lg:col-span-7">
          <div className="flex items-baseline justify-between gap-3 border-b border-ink/25 pb-2 text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            <span>Kho đề ôn thi tốt nghiệp THPT</span>
            <span className="shrink-0 font-mono">{dangTai ? "đang đếm..." : thongKe.moiNhat ? `cập nhật ${formatNgay(thongKe.moiNhat)}` : "chưa có đề"}</span>
          </div>
          <h1 className="mt-5 font-display text-[2.6rem] font-bold leading-[1.05] tracking-tight text-ink sm:text-6xl">
            Đề thi THPT,
            <span className="relative mt-1 block text-accent">
              đáp án để riêng.
              <span className="absolute inset-x-0 -bottom-2 text-accent">
                <InkDraw className="h-2.5 w-full" />
              </span>
            </span>
          </h1>
          <p className="mt-8 max-w-xl font-display text-lg italic leading-relaxed text-ink-soft sm:text-xl">
            Mỗi đề một file, đáp án một file khác. Mở lên là đọc ngay trong trang, khỏi tải về rồi đi tìm app mở.
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-faint">
            Trang ghim và ghi chú lưu trong máy cậu, đóng tab mở lại vẫn còn. Muốn in thì mỗi đề đều có nút tải PDF.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/kho-de">
              <motion.span whileTap={buttonTap} className="nut-quet nut-nhan group flex items-center gap-2 border border-ink bg-ink px-6 py-3.5 text-sm font-semibold text-paper-light transition-colors hover:border-accent hover:bg-accent">
                Mở mục lục đề
                <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </motion.span>
            </Link>
            <motion.a whileTap={buttonTap} href="#thu-ngo" className="flex items-center gap-2 border-b-2 border-ink/30 px-1 py-2 text-sm font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent">
              Đọc thư của người gom đề
            </motion.a>
          </div>
        </motion.div>
        <motion.aside variants={fadeInUp} style={{y: yPhieu}} className="relative min-w-0 lg:col-span-5">
          <div className="sheet relative -rotate-1 border-2 border-ink p-6 shadow-lift">
            <span className="absolute -top-3 left-8 h-6 w-24 -rotate-3 border border-ink/10 bg-accent-wash/90" />
            <span className="absolute -top-2 right-6 h-5 w-14 rotate-6 border border-ink/10 bg-accent-wash/70" />
            <p className="flex items-baseline justify-between text-[10px] uppercase tracking-[0.24em] text-ink-faint">
              Phiếu kho
              <span className="font-mono">2026</span>
            </p>
            <div className="mt-4 flex items-end gap-3 border-b border-dashed border-ink/25 pb-4">
              <motion.span key={ds.length} initial={{y: 14, opacity: 0}} animate={{y: 0, opacity: 1}} transition={spring} className="font-display text-6xl font-bold leading-none text-ink">{so(ds.length)}</motion.span>
              <span className="pb-1 text-xs uppercase tracking-[0.16em] text-ink-soft">đề trong kho</span>
            </div>
            <div className="mt-4 grid grid-cols-3 divide-x divide-dashed divide-ink/25">
              {[
                {nhan: "có đáp án", giaTri: so(thongKe.dapAn)},
                {nhan: "môn đã có", giaTri: `${so(thongKe.demMon.size)}/${DS_MON.length}`},
                {nhan: "lượt xem", giaTri: so(thongKe.xem)}
              ].map((r) => (
                <div key={r.nhan} className="px-2 first:pl-0 last:pr-0">
                  <motion.p key={r.giaTri} initial={{y: 8, opacity: 0}} animate={{y: 0, opacity: 1}} transition={spring} className="font-display text-xl font-bold text-ink">{r.giaTri}</motion.p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-ink-faint">{r.nhan}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-ink-faint">{loi ? `Chưa đọc được số liệu: ${loi}.` : "Đếm thẳng từ kho, không làm tròn."}</p>
            <DauKho />
          </div>
          <Link href="/kho-de" className="mt-5 flex items-center justify-between gap-2 border border-ink/30 bg-paper-light px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition-colors hover:border-accent hover:text-accent">
            Xem toàn bộ mục lục
            <IconArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.aside>
      </motion.section>
      <motion.section initial={{opacity: 0, y: 22}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: "-70px"}} transition={{duration: 0.45, ease: EASE}} className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <h2 className="font-display text-2xl font-bold leading-snug text-ink">Bốn việc hay dùng</h2>
          <span className="mt-2 block h-px w-16 bg-accent" />
          <p className="mt-3 text-xs leading-relaxed text-ink-faint">Tải PDF với chấm sao, nhận xét thì nằm ngay trong trang đề.</p>
        </div>
        <ol className="min-w-0 lg:col-span-9">
          {VIEC.map((v, i) => (
            <motion.li key={v.tieuDe} initial={{opacity: 0, x: -16}} whileInView={{opacity: 1, x: 0}} viewport={{once: true, margin: "-50px"}} transition={{duration: 0.36, ease: EASE, delay: i * 0.05}} className={`group flex gap-4 border-b border-dashed border-ink/20 py-5 first:pt-0 ${i % 2 === 1 ? "lg:ml-12" : ""}`}>
              <span className="grid h-11 w-11 shrink-0 place-items-center border border-ink/30 bg-paper-light text-ink transition-colors group-hover:border-accent group-hover:text-accent">
                <v.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="flex items-baseline gap-2.5 font-display text-lg font-bold text-ink">
                  <span className="font-mono text-[11px] font-normal text-accent">{String(i + 1).padStart(2, "0")}</span>
                  {v.tieuDe}
                </p>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-ink-soft">{v.moTa}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </motion.section>
      <motion.section initial={{opacity: 0, y: 22}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: "-70px"}} transition={{duration: 0.45, ease: EASE}} className="mt-20">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b-2 border-ink pb-3">
          <h2 className="font-display text-2xl font-bold text-ink">Mục lục môn</h2>
          <p className="text-[11px] uppercase tracking-[0.14em] text-ink-faint">bấm một dòng để lọc đề môn đó</p>
        </div>
        <div className="mt-2 grid grid-cols-1 gap-x-12 md:grid-cols-2">
          {DS_MON.map((m, i) => {
            const soDe = thongKe.demMon.get(m) ?? 0;
            const trong = (
              <>
                <span className="grid h-8 w-8 shrink-0 place-items-center text-ink-soft transition-colors group-hover:text-accent">
                  <MonIcon mon={m} className="h-4 w-4" />
                </span>
                <span className="shrink-0 font-display text-base font-bold text-ink">{m}</span>
                <span className="hidden shrink-0 text-[11px] uppercase tracking-[0.1em] text-ink-faint sm:inline">{MON_DAY_DU[m]}</span>
                <span className="mx-1 h-px min-w-4 flex-1 translate-y-[-3px] border-b border-dotted border-ink/35" />
                {soDe > 0 ? (
                  <span className="shrink-0 border border-ink/30 px-2 py-0.5 font-mono text-xs font-bold text-ink transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-paper-light">{dangTai ? "—" : soDe}</span>
                ) : (
                  <span className="shrink-0 text-[11px] uppercase tracking-[0.12em] text-ink-faint">chưa có</span>
                )}
              </>
            );
            return soDe > 0 ? (
              <motion.div key={m} initial={{opacity: 0}} whileInView={{opacity: 1}} viewport={{once: true}} transition={{duration: 0.3, delay: Math.min(i * 0.02, 0.2)}}>
                <Link href={`/kho-de?mon=${encodeURIComponent(m)}`} className="group flex items-center gap-2 border-b border-ink/10 py-2.5 transition-colors hover:bg-accent-wash/40">
                  {trong}
                </Link>
              </motion.div>
            ) : (
              <span key={m} className="flex items-center gap-2 border-b border-ink/10 py-2.5 opacity-60">
                {trong}
              </span>
            );
          })}
        </div>
      </motion.section>
      <motion.section initial={{opacity: 0, y: 22}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: "-70px"}} transition={{duration: 0.45, ease: EASE}} className="mt-20">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl font-bold text-ink">Vừa lên kho</h2>
          <Link href="/kho-de" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft underline-offset-4 transition-colors hover:text-accent hover:underline hover:decoration-wavy">
            Xem hết
            <IconArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <ul className="mt-5 space-y-3">
          {dangTai ? (
            Array.from({length: 3}).map((_, i) => <li key={i} className="h-20 animate-pulse border border-ink/15 bg-paper-light" />)
          ) : vuaLen.length === 0 ? (
            <li className="border border-dashed border-ink/25 bg-paper-light p-5 text-sm text-ink-soft">Kho đang trống. Người gom đề sẽ tải lên sớm.</li>
          ) : (
            vuaLen.map((d, i) => (
              <motion.li key={d.id} initial={{opacity: 0, y: 14}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: "-40px"}} transition={{duration: 0.34, ease: EASE, delay: i * 0.06}} className={i % 2 === 1 ? "lg:ml-8" : ""}>
                <Link href={`/de/${d.id}`} className={`group relative flex items-center gap-4 overflow-hidden border border-ink/20 border-l-4 bg-paper-light p-4 pl-5 shadow-paper transition-all duration-300 hover:translate-x-1 hover:border-accent/50 ${mauCua(d.mon)}`}>
                  <span aria-hidden className="pointer-events-none absolute right-3 top-0 hidden font-display text-6xl font-bold leading-none text-ink/10 sm:block">{i + 1}</span>
                  <span className="grid h-10 w-10 shrink-0 place-items-center border border-ink/25 bg-paper text-ink transition-colors group-hover:border-accent group-hover:text-accent">
                    <MonIcon mon={d.mon} className="h-5 w-5" />
                  </span>
                  <span className="relative min-w-0 flex-1">
                    <span className="block truncate font-display text-base font-bold text-ink sm:text-lg">{d.ten}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.1em] text-ink-faint">
                      <span className="font-semibold text-accent">{d.mon}</span>
                      <span className="flex items-center gap-1"><IconCalendar className="h-3 w-3" />{formatNgay(d.ngay)}</span>
                      <span className="flex items-center gap-1"><IconEye className="h-3 w-3" />{d.luotXem ?? 0}</span>
                      {d.dapAnDuongDan ? <span className="border border-ok/60 px-1.5 text-ok">đáp án</span> : <span className="border border-ink/20 px-1.5">chưa đáp án</span>}
                      {d.ghimAt && <span className="border border-ink bg-ink px-1.5 text-paper-light">ghim</span>}
                    </span>
                  </span>
                  <IconArrowRight className="relative h-4 w-4 shrink-0 text-ink-faint transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent" />
                </Link>
              </motion.li>
            ))
          )}
        </ul>
      </motion.section>
      <motion.section id="thu-ngo" initial={{opacity: 0, y: 26}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: "-70px"}} transition={{duration: 0.5, ease: EASE}} className="mt-20 scroll-mt-24">
        <div className="sheet relative mx-auto max-w-3xl rotate-[0.4deg] border-2 border-ink bg-paper-light p-6 shadow-lift sm:p-9">
          <span className="absolute -top-3 left-10 h-6 w-28 -rotate-2 border border-ink/10 bg-accent-wash/90" />
          <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-ink-faint">
            <IconSeal className="h-3.5 w-3.5 text-accent" />
            Thư của người gom đề
          </p>
          <div className="mt-5 space-y-4 font-display text-[15px] leading-7 text-ink-soft sm:text-base sm:leading-8">
            <p className="first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:font-display first-letter:text-5xl first-letter:font-bold first-letter:leading-[0.8] first-letter:text-accent">
              Kho này bắt đầu từ một thư mục tên “de thi final FINAL” trong máy mình. Bên trong là đề nhặt từ khắp nơi, file đáp án đặt tên kiểu “dap an (1).pdf”. Làm xong một đề là mất mười phút đi tìm đáp án của chính nó.
            </p>
            <p>Bực quá nên mình gom lại: đề một file, đáp án một file, môn nào ra môn đó. Rồi thêm chỗ ghi chú, vì mình hay sai một lỗi hai ba lần mà không nhớ lần trước sai ở đâu.</p>
            <p>Cậu cứ làm trọn một đề rồi hãy mở đáp án. Sai câu nào thì ghim trang đó, ghi một dòng vì sao sai. Cuối tuần đọc lại mấy dòng đó.</p>
            <p>Đề ở đây không phải đề chuẩn của Bộ, cũng chẳng có ai chấm điểm hộ cậu. Thỉnh thoảng vẫn lọt đề sai đáp án — cậu thấy thì viết vào ô nhận xét ngay dưới đề, mình duyệt tay nên có khi chậm vài tiếng mới hiện.</p>
            <p>Lúc mình viết thư này mấy môn tự nhiên vẫn còn trống, đang đi xin thêm. Có tuần mình lười, chẳng tải đề nào, cậu đừng giận.</p>
            <p>Thôi, cậu làm đề đi. Mình đi tìm thêm đề.</p>
          </div>
          <p className="mt-4 font-display text-sm italic text-ink-faint">P.S. Đừng thức tới ba giờ sáng vì một đề. Mai làm tiếp, đề không chạy mất.</p>
          <div className="mt-7 flex flex-wrap items-end justify-between gap-4 border-t border-dashed border-ink/25 pt-5">
            <div>
              <p className="font-display text-xl font-bold italic text-ink">Anh Lusilfer</p>
              <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-ink-faint">người gom đề</p>
            </div>
            <a href="https://anhcoder999.github.io/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 border border-accent bg-accent-wash px-3 py-1.5 text-xs font-bold text-accent-deep underline decoration-wavy underline-offset-4 transition-colors hover:bg-accent hover:text-paper-light">
              Hồ sơ người viết
              <IconArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </motion.section>
      <motion.div initial={{opacity: 0}} whileInView={{opacity: 1}} viewport={{once: true}} transition={{duration: 0.4, ease: EASE}} className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t-2 border-ink pt-5">
        <p className="max-w-xl font-display text-base italic text-ink-soft">Hết thư. Cậu mở mục lục, chọn môn đang yếu nhất rồi làm trọn một đề.</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/kho-de" className="group flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-accent underline-offset-4 hover:underline hover:decoration-wavy">
            Vào kho đề
            <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          {!user && (
            <Link href="/login" className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-faint underline-offset-4 transition-colors hover:text-ink hover:underline">
              Đăng nhập
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}