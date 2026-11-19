"use client";
import {useCallback, useEffect, useState} from "react";
import Link from "next/link";
import {motion} from "framer-motion";
import {IconAlert, IconArrowRight, IconCheck, IconLoader, IconRefresh, IconSeal, MonIcon} from "@/components/Icons";
import InkDraw from "@/components/InkDraw";
import {layTrangThiThu} from "@/app/thi-thu/actions";
import {formatNgay, MON_DAY_DU} from "@/lib/data";
import {lamTron, type DeThiTomTat, type LichSuThi} from "@/lib/thiThu";
import {buttonTap, EASE, fadeInUp, spring, staggerContainer} from "@/lib/animations";
export default function TrangThiThu() {
  const [ds, setDs] = useState<DeThiTomTat[]>([]);
  const [lichSu, setLichSu] = useState<LichSuThi[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");
  const tai = useCallback(async () => {
    setDangTai(true);
    setLoi("");
    const kq = await layTrangThiThu();
    if (kq.ok) {
      setDs(kq.ds);
      setLichSu(kq.lichSu);
    } else setLoi(kq.error);
    setDangTai(false);
  }, []);
  useEffect(() => {
    void tai();
  }, [tai]);
  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl px-4 pb-16 pt-8 sm:pt-10">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.header variants={fadeInUp} className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-5">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.2em] text-ink-faint">Phòng thi trực tuyến</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Thi thử{" "}
              <span className="relative inline-block text-accent">
                như thi thật
                <span className="absolute inset-x-0 -bottom-1 text-accent">
                  <InkDraw className="h-2 w-full" />
                </span>
              </span>
            </h1>
          </div>
          <p className="max-w-sm text-xs leading-relaxed text-ink-soft">Có đồng hồ đếm ngược, tự nộp khi hết giờ. Rời khỏi phòng thi quá 3 lần là bài bị 0 điểm, cậu vẫn được làm lại đề khác lượt.</p>
        </motion.header>
        <motion.div variants={fadeInUp} className="mt-4 flex flex-wrap items-center gap-3 border border-warn/50 bg-warn/10 p-3 text-xs text-ink-soft">
          <IconAlert className="h-4 w-4 shrink-0 text-warn" />
          <span>Trong lúc thi: đừng chuyển tab, đừng mở app khác, đừng tắt màn hình. Hệ thống ghi nhận mỗi lần rời đi.</span>
        </motion.div>
      </motion.div>
      {loi ? (
        <div className="mt-6 border border-accent/50 bg-accent-wash p-5 text-sm text-accent-deep">
          <p className="font-semibold">Chưa vào được phòng thi</p>
          <p className="mt-1 text-xs">{loi}</p>
          <div className="mt-3 flex gap-2">
            <Link href="/login" className="border border-accent bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-paper-light">Đăng nhập</Link>
            <motion.button whileTap={buttonTap} type="button" onClick={() => void tai()} className="border border-ink/40 bg-paper-light px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">Thử lại</motion.button>
          </div>
        </div>
      ) : dangTai ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({length: 3}).map((_, i) => <div key={i} className="h-44 animate-pulse border border-ink/15 bg-paper-light" />)}
        </div>
      ) : ds.length === 0 ? (
        <div className="mt-6 border border-dashed border-ink/25 bg-paper-light p-6 text-sm text-ink-soft">Chưa có đề thi online nào được công khai. Quản trị sẽ mở phòng thi sớm.</div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ds.map((d, i) => (
            <motion.article key={d.id} initial={{opacity: 0, y: 14}} animate={{opacity: 1, y: 0}} transition={{duration: 0.28, ease: EASE, delay: Math.min(i * 0.04, 0.2)}} className="sheet group flex flex-col p-5 pl-8 shadow-paper transition-colors hover:border-accent/60">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-11 w-11 place-items-center border border-ink/30 bg-paper text-ink transition-colors group-hover:border-accent group-hover:text-accent">
                  <MonIcon mon={d.mon} className="h-6 w-6" />
                </span>
                <span className="-rotate-2 border border-accent/70 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">{d.mon}</span>
              </div>
              <h2 className="mt-4 line-clamp-2 min-h-[3rem] font-display text-lg font-bold leading-snug text-ink">{d.ten}</h2>
              {d.mo_ta && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-faint">{d.mo_ta}</p>}
              <dl className="mt-3 grid grid-cols-3 gap-2 border-y border-dashed border-ink/20 py-2 text-center">
                <div><dt className="text-[10px] uppercase tracking-[0.1em] text-ink-faint">Câu</dt><dd className="font-display text-base font-bold text-ink">{d.so_cau}</dd></div>
                <div><dt className="text-[10px] uppercase tracking-[0.1em] text-ink-faint">Phút</dt><dd className="font-display text-base font-bold text-ink">{d.thoi_gian_phut}</dd></div>
                <div><dt className="text-[10px] uppercase tracking-[0.1em] text-ink-faint">Điểm cao</dt><dd className="font-display text-base font-bold text-ok">{d.diem_cao_nhat === null ? "—" : d.diem_cao_nhat}</dd></div>
              </dl>
              <p className="mt-2 text-[11px] uppercase tracking-[0.1em] text-ink-faint">{MON_DAY_DU[d.mon]} · đã thi {d.so_lan_thi} lần</p>
              <Link href={`/thi-thu/${d.id}`} className="mt-4 block">
                <motion.span whileTap={buttonTap} className="nut-quet nut-nhan flex items-center justify-between gap-2 border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors group-hover:border-accent group-hover:bg-accent">
                  Vào phòng thi
                  <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </motion.span>
              </Link>
            </motion.article>
          ))}
        </div>
      )}
      <section className="mt-14">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink pb-3">
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-ink">
            <IconSeal className="h-4 w-4 text-accent" />
            Lịch sử thi của cậu
          </h2>
          <motion.button whileTap={buttonTap} type="button" onClick={() => void tai()} className="flex items-center gap-1.5 border border-ink/30 bg-paper-light px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft transition-colors hover:border-accent hover:text-accent">
            <IconRefresh className={`h-3.5 w-3.5 ${dangTai ? "animate-spin" : ""}`} />
            Tải lại
          </motion.button>
        </div>
        {lichSu.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">Cậu chưa thi lượt nào. Chọn một đề ở trên rồi bấm vào phòng thi nhé.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {lichSu.map((b) => (
              <motion.li key={b.id} layout initial={{opacity: 0, y: 8}} animate={{opacity: 1, y: 0}} transition={spring} className={`flex min-w-0 flex-wrap items-center gap-3 border p-3 ${b.trang_thai === "vi_pham" ? "border-danger/50 bg-danger/10" : b.trang_thai === "dang_lam" ? "border-warn/50 bg-warn/10" : "border-ink/20 bg-paper-light"}`}>
                <span className="grid h-9 w-9 shrink-0 place-items-center border border-ink/25 bg-paper text-ink">
                  <MonIcon mon={b.mon as never} className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{b.ten}</p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-[0.1em] text-ink-faint">
                    {formatNgay(b.created_at)} · {lamTron(b.phut_lam)} phút · {b.so_cau_dung} câu đúng trọn vẹn
                  </p>
                </div>
                {b.trang_thai === "vi_pham" ? (
                  <span className="flex items-center gap-1 border border-danger px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-danger"><IconAlert className="h-3 w-3" />Vi phạm · 0đ</span>
                ) : b.trang_thai === "dang_lam" ? (
                  <span className="flex items-center gap-1 border border-warn px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-warn"><IconLoader className="h-3 w-3" />Đang làm</span>
                ) : (
                  <span className="flex items-center gap-1 border border-ok px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ok"><IconCheck className="h-3 w-3" />{b.diem}/{b.tong_diem}</span>
                )}
                <Link href={b.trang_thai === "dang_lam" ? `/thi-thu/${b.de_id}` : `/thi-thu/${b.de_id}?bai=${b.id}`} className="shrink-0 border border-ink/40 bg-paper px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft transition-colors hover:border-accent hover:text-accent">
                  {b.trang_thai === "dang_lam" ? "Làm tiếp" : "Xem lại"}
                </Link>
              </motion.li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}