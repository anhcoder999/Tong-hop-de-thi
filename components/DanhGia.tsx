"use client";
import {useCallback, useEffect, useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {IconLoader, IconSeal} from "@/components/Icons";
import {binhLuan, danhGia, layBinhLuan, layDanhGia, type BinhLuan, type DanhGiaTong} from "@/app/actions";
import {buttonTap, fadeInUp, spring, staggerContainer, stampIn} from "@/lib/animations";
import {useAuth} from "@/lib/auth";
function Sao({day, className}: {day: boolean; className?: string}) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? "h-6 w-6"} fill={day ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <path d="M12 3.4l2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8Z" />
    </svg>
  );
}
export default function DanhGia({deId, tenDe}: {deId: string; tenDe: string}) {
  const {user, isAdmin} = useAuth();
  const [tg, setTg] = useState<DanhGiaTong>({tb: 0, dem: 0, cuaToi: 0});
  const [ds, setDs] = useState<BinhLuan[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [saoHover, setSaoHover] = useState(0);
  const [dangGuiSao, setDangGuiSao] = useState(false);
  const [burst, setBurst] = useState(0);
  const [noiDung, setNoiDung] = useState("");
  const [dangGui, setDangGui] = useState(false);
  const [bao, setBao] = useState<{kieu: "ok" | "loi"; text: string} | null>(null);
  const tai = useCallback(async () => {
    const [a, b] = await Promise.all([layDanhGia(deId), layBinhLuan(deId)]);
    setTg(a);
    setDs(b);
    setDangTai(false);
  }, [deId]);
  useEffect(() => {
    void tai();
  }, [tai]);
  useEffect(() => {
    if (!bao) return;
    const t = setTimeout(() => setBao(null), 4000);
    return () => clearTimeout(t);
  }, [bao]);
  const chamSao = async (s: number) => {
    if (dangGuiSao) return;
    if (!user) {
      setBao({kieu: "loi", text: "Đăng nhập để đánh giá đề này nhé."});
      return;
    }
    setDangGuiSao(true);
    const kq = await danhGia(deId, s);
    if (kq.ok) {
      setBurst((b) => b + 1);
      setBao({kieu: "ok", text: `Đã ghi nhận ${s} sao của cậu ✓`});
      await tai();
    } else setBao({kieu: "loi", text: kq.error ?? "Lỗi đánh giá."});
    setDangGuiSao(false);
  };
  const gui = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (dangGui) return;
    if (!user) {
      setBao({kieu: "loi", text: "Đăng nhập để gửi nhận xét nhé."});
      return;
    }
    setDangGui(true);
    setBao(null);
    const kq = await binhLuan(deId, noiDung);
    if (kq.ok) {
      setNoiDung("");
      setBao({kieu: "ok", text: "Đã gửi nhận xét, chờ quản trị duyệt là hiện công khai."});
      await tai();
    } else setBao({kieu: "loi", text: kq.error ?? "Lỗi gửi nhận xét."});
    setDangGui(false);
  };
  const saoHien = saoHover || tg.cuaToi;
  return (
    <motion.section variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{once: true, margin: "-60px"}} className="sheet mt-8 border border-ink/25 bg-paper-light p-5 shadow-paper sm:p-6">
      <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink pb-4">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
          <IconSeal className="h-4 w-4 text-accent" />
          Đánh giá & nhận xét
        </h2>
        <span className="max-w-[16rem] truncate text-[11px] uppercase tracking-[0.14em] text-ink-faint">{tenDe}</span>
      </motion.div>
      <motion.div variants={fadeInUp} className="mt-4 flex flex-wrap items-center gap-5">
        <div className="relative flex items-center gap-1" onMouseLeave={() => setSaoHover(0)}>
          {[1, 2, 3, 4, 5].map((s) => (
            <motion.button key={s} whileTap={buttonTap} whileHover={{scale: 1.15, rotate: -6}} type="button" disabled={dangGuiSao} onMouseEnter={() => setSaoHover(s)} onClick={() => void chamSao(s)} aria-label={`${s} sao`} className={`relative transition-colors ${s <= saoHien ? "text-warn" : "text-ink-faint hover:text-warn"}`}>
              <Sao day={s <= saoHien} />
              <AnimatePresence>
                {burst > 0 && s === tg.cuaToi && (
                  <motion.span key={burst} initial={{scale: 0.4, opacity: 0.9}} animate={{scale: 2.1, opacity: 0}} transition={{duration: 0.6, ease: "easeOut"}} className="pointer-events-none absolute inset-0 rounded-full border-2 border-warn" />
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>
        <div className="flex items-baseline gap-2">
          <motion.span key={tg.tb} initial={{y: 8, opacity: 0}} animate={{y: 0, opacity: 1}} transition={spring} className="font-display text-3xl font-bold text-ink">{tg.dem ? tg.tb.toFixed(1) : "—"}</motion.span>
          <span className="text-xs uppercase tracking-[0.14em] text-ink-faint">/5 · {tg.dem} lượt đánh giá</span>
        </div>
        {tg.cuaToi > 0 && <motion.span variants={stampIn} className="-rotate-2 border border-warn/70 bg-warn/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-warn">Cậu chấm {tg.cuaToi} sao</motion.span>}
      </motion.div>
      <motion.form variants={fadeInUp} onSubmit={gui} className="mt-5 space-y-2.5">
        <textarea value={noiDung} onChange={(e) => setNoiDung(e.target.value)} maxLength={600} rows={3} placeholder="Nhận xét về đề: độ khó, câu sai đáp án, gợi ý ôn tập... (quản trị duyệt trước khi hiện)" className="w-full border border-ink/30 bg-paper px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent" />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] uppercase tracking-[0.12em] text-ink-faint">{noiDung.length}/600</span>
          <motion.button whileTap={buttonTap} type="submit" disabled={dangGui} className="nut-quet flex items-center gap-2 border border-ink bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-paper-light transition-colors hover:border-accent hover:bg-accent disabled:opacity-50">
            {dangGui ? <IconLoader className="h-3.5 w-3.5 animate-spin" /> : <IconSeal className="h-3.5 w-3.5" />}
            Gửi nhận xét
          </motion.button>
        </div>
        <AnimatePresence>
          {bao && (
            <motion.p initial={{opacity: 0, y: 6}} animate={{opacity: 1, y: 0}} exit={{opacity: 0}} className={`border p-2.5 text-xs ${bao.kieu === "loi" ? "border-danger/60 bg-danger/10 text-danger" : "border-ok/60 bg-ok/10 text-ok"}`}>{bao.text}</motion.p>
          )}
        </AnimatePresence>
      </motion.form>
      <motion.div variants={fadeInUp} className="mt-5 border-t border-dashed border-ink/25 pt-4">
        {dangTai ? (
          <div className="flex items-center gap-2 text-sm text-ink-faint">
            <IconLoader className="h-4 w-4 animate-spin text-accent" />
            Đang tải nhận xét...
          </div>
        ) : ds.length === 0 ? (
          <p className="text-sm text-ink-soft">Chưa có nhận xét nào. Cậu là người đầu tiên chấm đề này đi.</p>
        ) : (
          <ul className="viewer-scroll max-h-96 space-y-3 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {ds.map((b) => (
                <motion.li key={b.id} layout initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0}} transition={spring} className="flex gap-3 border border-ink/20 bg-paper p-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center border border-ink/35 bg-paper-light font-display text-xs font-bold text-accent">{(b.ten_nguoi.trim() || "?").slice(0, 2).toUpperCase()}</span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold text-ink">{b.ten_nguoi}</span>
                      <span className="uppercase tracking-[0.1em] text-ink-faint">{new Date(b.created_at).toLocaleDateString("vi-VN")}</span>
                      {!b.duyet && <span className="border border-warn/70 bg-warn/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-warn">Chờ duyệt</span>}
                      {b.cuaToi && <span className="border border-info/60 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-info">Của cậu</span>}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm text-ink-soft">{b.noi_dung}</p>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
        {isAdmin && <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-ink-faint">Quản trị: duyệt nhận xét ở mục “Nhận xét chờ duyệt” trong trang quản trị.</p>}
      </motion.div>
    </motion.section>
  );
}