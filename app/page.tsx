"use client";
import {useEffect, useMemo, useState} from "react";
import Link from "next/link";
import {motion, useScroll, useTransform} from "framer-motion";
import {IconArrowRight, IconCalendar, IconCheck, IconDownload, IconEye, IconFile, IconSearch, IconSeal, MonIcon} from "@/components/Icons";
import InkDraw from "@/components/InkDraw";
import {DS_MON, formatNgay, MON_DAY_DU, NHOM_MON, type DeThi} from "@/lib/data";
import {buttonTap, EASE, fadeInUp, spring, staggerContainer} from "@/lib/animations";
import {useAuth} from "@/lib/auth";
import {layDanhSach} from "@/lib/deThi";
const CACH_DUNG = [
  {icon: IconSearch, tieuDe: "Tìm đúng đề cần luyện", moTa: "Lọc theo từng môn, gõ tên không dấu vẫn ra. Đề ghim của quản trị luôn nằm đầu mục lục."},
  {icon: IconFile, tieuDe: "Đọc PDF ngay trong trang", moTa: "Không cần tải về rồi mở app khác. Chữ dựng theo độ phân giải màn hình nên nét như bản gốc."},
  {icon: IconCheck, tieuDe: "Đáp án tách riêng từng đề", moTa: "Làm xong mới bấm sang đáp án để đối chiếu, tránh lộ lời giải khi đang làm bài."},
  {icon: IconSeal, tieuDe: "Ghim trang và ghi chú", moTa: "Đánh dấu trang hay sai, viết ghi chú riêng. Mọi thứ lưu trong máy cậu, mở lại đúng trang đang đọc."},
  {icon: IconEye, tieuDe: "Tìm chữ trong đề", moTa: "Nhập một cụm từ, trang nào chứa nó sẽ được tô đỏ và nhảy tới đúng chỗ."},
  {icon: IconDownload, tieuDe: "Tải về khi cần in", moTa: "Mỗi đề và đáp án đều có nút tải PDF riêng, kèm lượt xem và lượt tải công khai."}
];
export default function TrangGioiThieu() {
  const {user} = useAuth();
  const {scrollY} = useScroll();
  const yPhieu = useTransform(scrollY, [0, 420], [0, -34]);
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
      setLoi(e instanceof Error ? e.message : "Chưa đọc được kho đề.");
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
    for (const d of ds) {
      demMon.set(d.mon, (demMon.get(d.mon) ?? 0) + 1);
      if (d.dapAnDuongDan) dapAn++;
      xem += d.luotXem ?? 0;
    }
    return {demMon, dapAn, xem, monCoDe: demMon.size};
  }, [ds]);
  const dangChuY = useMemo(() => {
    const ghim = ds.filter((d) => d.ghimAt);
    const moi = [...ds].sort((a, b) => b.ngay.localeCompare(a.ngay));
    const gop = [...ghim];
    for (const d of moi) {
      if (gop.length >= 3) break;
      if (!gop.some((x) => x.id === d.id)) gop.push(d);
    }
    return gop.slice(0, 3);
  }, [ds]);
  const so = (n: number) => (dangTai ? "—" : String(n));
  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl px-4 pb-20 pt-8 sm:pt-12">
      <motion.section variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <motion.div variants={fadeInUp} className="min-w-0 lg:col-span-7">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-ink-soft">
            <span>Kì thi tốt nghiệp THPT</span>
            <span>Năm 2026</span>
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-6xl">
            Đề thi THPT,{" "}
            <span className="relative inline-block text-accent">
              gom một chỗ
              <span className="absolute inset-x-0 -bottom-1 text-accent">
                <InkDraw className="h-2 w-full" />
              </span>
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">
            Một kho đề nhỏ do học sinh giữ gìn: mười hai môn, đề và đáp án để riêng từng file, đọc thẳng trên điện thoại, có chỗ ghi chú lại những câu hay sai. Không quảng cáo, không bắt tải app, không thu phí.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/kho-de">
              <motion.span whileTap={buttonTap} className="nut-quet nut-nhan group flex items-center gap-2 border border-ink bg-ink px-5 py-3 text-sm font-semibold text-paper-light transition-colors hover:border-accent hover:bg-accent">
                Vào kho đề
                <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </motion.span>
            </Link>
            <motion.a whileTap={buttonTap} href="#thu-ngo" className="flex items-center gap-2 border border-ink/40 bg-paper-light px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent">
              Đọc thư ngỏ
            </motion.a>
            <span className="lac-nhe inline-flex -rotate-1 items-center gap-1.5 border border-accent/70 bg-accent-wash px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-deep">
              <IconSeal className="h-3.5 w-3.5" />
              Lưu hành miễn phí
            </span>
          </div>
        </motion.div>
        <motion.aside variants={fadeInUp} style={{y: yPhieu}} className="sheet relative min-w-0 border-2 border-ink p-5 shadow-lift lg:col-span-5">
          <span className="absolute -top-3 left-6 h-6 w-20 -rotate-3 border border-ink/10 bg-accent-wash/90" />
          <p className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            Phiếu mục lục
            <span className="font-mono">2026</span>
          </p>
          <dl className="mt-4 divide-y divide-dashed divide-ink/20 border-y border-dashed border-ink/25">
            {[
              {nhan: "Đề trong kho", giaTri: so(ds.length)},
              {nhan: "Đề kèm đáp án", giaTri: so(thongKe.dapAn)},
              {nhan: "Môn đã có đề", giaTri: `${so(thongKe.monCoDe)}/${DS_MON.length}`},
              {nhan: "Lượt xem tích luỹ", giaTri: so(thongKe.xem)}
            ].map((r) => (
              <div key={r.nhan} className="flex items-baseline justify-between gap-3 py-2.5">
                <dt className="text-xs uppercase tracking-[0.12em] text-ink-soft">{r.nhan}</dt>
                <motion.dd key={r.giaTri} initial={{y: 8, opacity: 0}} animate={{y: 0, opacity: 1}} transition={spring} className="font-display text-2xl font-bold text-ink">{r.giaTri}</motion.dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[11px] leading-relaxed text-ink-faint">
            {loi ? `Chưa đọc được số liệu: ${loi}` : "Số liệu đếm trực tiếp từ kho, cập nhật mỗi lần cậu mở trang."}
          </p>
          <Link href="/kho-de" className="mt-4 flex items-center justify-between gap-2 border border-ink/30 bg-paper px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-accent hover:text-accent">
            Mở mục lục đầy đủ
            <IconArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.aside>
      </motion.section>
      <motion.section initial={{opacity: 0, y: 20}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: "-60px"}} transition={{duration: 0.45, ease: EASE}} className="mt-14">
        <h2 className="flex items-center gap-3 font-display text-2xl font-bold text-ink">
          Kho này có gì
          <span className="h-px flex-1 bg-ink/20" />
        </h2>
        <ol className="mt-5 grid grid-cols-1 gap-x-8 md:grid-cols-2">
          {CACH_DUNG.map((c, i) => (
            <motion.li key={c.tieuDe} initial={{opacity: 0, y: 14}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: "-40px"}} transition={{duration: 0.35, ease: EASE, delay: (i % 2) * 0.06}} className="group flex gap-4 border-b border-dashed border-ink/20 py-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center border border-ink/30 bg-paper-light text-ink transition-colors group-hover:border-accent group-hover:text-accent">
                <c.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="flex items-baseline gap-2 font-display text-base font-bold text-ink">
                  <span className="font-mono text-[11px] text-accent">{String(i + 1).padStart(2, "0")}</span>
                  {c.tieuDe}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{c.moTa}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </motion.section>
      <motion.section initial={{opacity: 0, y: 20}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: "-60px"}} transition={{duration: 0.45, ease: EASE}} className="mt-14">
        <h2 className="flex items-center gap-3 font-display text-2xl font-bold text-ink">
          Môn học
          <span className="h-px flex-1 bg-ink/20" />
          <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-faint">bấm để lọc</span>
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {DS_MON.map((m) => {
            const soDe = thongKe.demMon.get(m) ?? 0;
            const noiDung = (
              <>
                <span className="grid h-9 w-9 shrink-0 place-items-center border border-ink/25 bg-paper text-ink transition-colors group-hover:border-accent group-hover:text-accent">
                  <MonIcon mon={m} className="h-4.5 w-4.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">{m}</span>
                  <span className="block truncate text-[10px] uppercase tracking-[0.12em] text-ink-faint">{MON_DAY_DU[m]}</span>
                </span>
                <span className={`shrink-0 border px-1.5 py-0.5 text-[11px] font-bold ${soDe ? "border-accent/60 text-accent" : "border-ink/20 text-ink-faint"}`}>{dangTai ? "—" : soDe}</span>
              </>
            );
            return soDe > 0 ? (
              <Link key={m} href={`/kho-de?mon=${encodeURIComponent(m)}`} className="group flex items-center gap-3 border border-ink/25 bg-paper-light p-3 transition-colors hover:border-accent hover:shadow-paper">
                {noiDung}
              </Link>
            ) : (
              <span key={m} title="Môn này chưa có đề" className="flex items-center gap-3 border border-dashed border-ink/20 bg-paper/60 p-3 opacity-70">
                {noiDung}
              </span>
            );
          })}
        </div>
        <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-ink-faint">
          {NHOM_MON.map((n) => `${n.ten}: ${n.mon.join(", ")}`).join(" · ")}
        </p>
      </motion.section>
      <motion.section initial={{opacity: 0, y: 20}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: "-60px"}} transition={{duration: 0.45, ease: EASE}} className="mt-14">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-3 font-display text-2xl font-bold text-ink">
            Đề đáng chú ý
            <span className="h-px w-16 bg-ink/20" />
          </h2>
          <Link href="/kho-de" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft underline-offset-4 transition-colors hover:text-accent hover:underline hover:decoration-wavy">
            Xem tất cả
            <IconArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <ul className="mt-5 space-y-2.5">
          {dangTai ? (
            Array.from({length: 3}).map((_, i) => <li key={i} className="h-16 animate-pulse border border-ink/20 bg-paper-light" />)
          ) : dangChuY.length === 0 ? (
            <li className="border border-dashed border-ink/25 bg-paper-light p-4 text-sm text-ink-soft">Kho đang trống, quản trị sẽ tải đề lên sớm.</li>
          ) : (
            dangChuY.map((d, i) => (
              <motion.li key={d.id} initial={{opacity: 0, x: -14}} whileInView={{opacity: 1, x: 0}} viewport={{once: true, margin: "-40px"}} transition={{duration: 0.32, ease: EASE, delay: i * 0.05}}>
                <Link href={`/de/${d.id}`} className="sheet group flex items-center gap-3 p-4 pl-8 shadow-paper transition-colors hover:border-accent/60">
                  <span className="grid h-10 w-10 shrink-0 place-items-center border border-ink/25 bg-paper text-ink transition-colors group-hover:border-accent group-hover:text-accent">
                    <MonIcon mon={d.mon} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-base font-bold text-ink">{d.ten}</span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.1em] text-ink-faint">
                      <span className="flex items-center gap-1"><IconCalendar className="h-3 w-3" />{formatNgay(d.ngay)}</span>
                      <span className="flex items-center gap-1"><IconEye className="h-3 w-3" />{d.luotXem ?? 0}</span>
                      {d.dapAnDuongDan && <span className="border border-ok/60 px-1.5 text-ok">Đáp án</span>}
                      {d.ghimAt && <span className="border border-ink bg-ink px-1.5 text-paper-light">Ghim</span>}
                    </span>
                  </span>
                  <span className="shrink-0 border border-accent/70 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">{d.mon}</span>
                  <IconArrowRight className="h-4 w-4 shrink-0 text-ink-faint transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent" />
                </Link>
              </motion.li>
            ))
          )}
        </ul>
      </motion.section>
      <motion.section id="thu-ngo" initial={{opacity: 0, y: 24}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: "-60px"}} transition={{duration: 0.5, ease: EASE}} className="sheet relative mt-16 scroll-mt-24 border-2 border-ink bg-paper-light p-6 shadow-lift sm:p-9">
        <span className="pointer-events-none absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-ink/40" />
        <span className="pointer-events-none absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-ink/40" />
        <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-ink-faint">
          <IconSeal className="h-3.5 w-3.5 text-accent" />
          Thư ngỏ của người giữ kho
        </p>
        <h2 className="mt-3 font-display text-2xl font-bold text-ink sm:text-3xl">Gửi cậu, người đang ôn thi</h2>
        <div className="mt-4 max-w-2xl space-y-3 font-display text-[15px] italic leading-relaxed text-ink-soft">
          <p>Kho này bắt đầu từ một thư mục đề lộn xộn trong máy mình. Sau vài lần không tìm nổi đáp án của chính đề mình vừa làm, mình gom lại thành chỗ này: đề một file, đáp án một file, môn nào ra môn đó.</p>
          <p>Cậu cứ làm hết đề rồi hãy bấm sang đáp án. Sai ở đâu thì ghim trang đó lại, ghi một dòng vì sao sai. Cuối tuần mở sổ tay ra đọc lại, đỡ hơn làm thêm mười đề mới mà quên hết lỗi cũ.</p>
          <p>Đừng học tủ, và đừng thức tới ba giờ sáng để cày cho xong một đề. Ngủ đủ sáu tiếng rồi làm một đề tỉnh táo, hơn bốn đề trong trạng thái mắt mở không lên. Ăn uống đúng bữa nữa, phòng thi không phát kẹo đâu.</p>
          <p>Chúc cậu giữ được nhịp ôn đều, vào phòng thi đọc đề thấy quen tay, và ra khỏi phòng thi với cảm giác nhẹ nhõm vì đã làm hết sức. Điểm số rồi sẽ về đúng chỗ của nó.</p>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-ink/25 pt-4">
          <div>
            <p className="font-display text-lg font-bold text-ink">Anh Lusilfer</p>
            <p className="text-[11px] uppercase tracking-[0.14em] text-ink-faint">Người giữ kho · quản trị viên</p>
          </div>
          <a href="https://anhcoder999.github.io/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 border border-accent bg-accent-wash px-3 py-1.5 text-xs font-bold text-accent-deep underline decoration-wavy underline-offset-4 transition-colors hover:bg-accent hover:text-paper-light">
            Hồ sơ người viết
            <IconArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </motion.section>
      <motion.section initial={{opacity: 0, y: 20}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: "-60px"}} transition={{duration: 0.45, ease: EASE}} className="mt-14 flex flex-wrap items-center justify-between gap-4 border-y-2 border-ink py-6">
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-bold text-ink">Bắt đầu từ một đề thôi</h2>
          <p className="mt-1 text-sm text-ink-soft">Mở mục lục, chọn môn cậu yếu nhất, làm trọn một đề rồi đối chiếu đáp án.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/kho-de">
            <motion.span whileTap={buttonTap} className="nut-nhan flex items-center gap-2 border border-ink bg-ink px-5 py-3 text-sm font-semibold text-paper-light transition-colors hover:border-accent hover:bg-accent">
              Vào kho đề
              <IconArrowRight className="h-4 w-4" />
            </motion.span>
          </Link>
          {!user && (
            <Link href="/login">
              <motion.span whileTap={buttonTap} className="flex items-center gap-2 border border-ink/40 bg-paper-light px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent">
                Đăng nhập để lưu ghi chú
              </motion.span>
            </Link>
          )}
        </div>
      </motion.section>
    </div>
  );
}