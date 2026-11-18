"use client";
import {useCallback, useEffect, useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {IconCheck, IconLoader, IconRefresh, IconSeal, IconTrash} from "@/components/Icons";
import {duyetBinhLuan, layBinhLuanChoDuyet, xoaBinhLuan, type BinhLuan} from "@/app/actions";
import {buttonTap, fadeInUp, spring} from "@/lib/animations";
export default function BinhLuanAdmin() {
  const [ds, setDs] = useState<(BinhLuan & {de_ten: string})[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [dangXuLy, setDangXuLy] = useState<string | null>(null);
  const [bao, setBao] = useState("");
  const tai = useCallback(async () => {
    setDangTai(true);
    const kq = await layBinhLuanChoDuyet();
    if (kq.ok) setDs(kq.ds);
    else setBao(kq.error);
    setDangTai(false);
  }, []);
  useEffect(() => {
    void tai();
  }, [tai]);
  const xuLy = async (id: string, kieu: "duyet" | "xoa") => {
    setDangXuLy(id);
    setBao("");
    const kq = kieu === "duyet" ? await duyetBinhLuan(id) : await xoaBinhLuan(id);
    if (kq.ok) {
      setDs((cur) => cur.filter((b) => b.id !== id));
      setBao(kieu === "duyet" ? "Đã duyệt, nhận xét hiện công khai ✓" : "Đã xóa nhận xét.");
    } else setBao(kq.error ?? "Lỗi xử lý.");
    setDangXuLy(null);
  };
  return (
    <motion.section id="binh-luan" variants={fadeInUp} initial="hidden" animate="visible" className="mx-auto mt-10 w-full min-w-0 max-w-6xl scroll-mt-24 px-4 pb-4">
      <div className="sheet border border-ink/25 bg-paper-light p-5 shadow-paper">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink pb-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
            <IconSeal className="h-4 w-4 text-accent" />
            Nhận xét chờ duyệt
            <span className="border border-warn/70 bg-warn/10 px-2 py-0.5 text-[11px] font-semibold text-warn">{ds.length}</span>
          </h2>
          <motion.button whileTap={buttonTap} type="button" onClick={() => void tai()} className="flex items-center gap-1.5 border border-ink/30 bg-paper px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft transition-colors hover:border-accent hover:text-accent">
            <IconRefresh className={`h-3.5 w-3.5 ${dangTai ? "animate-spin" : ""}`} />
            Tải lại
          </motion.button>
        </div>
        {bao && <p className="mt-3 border border-accent/50 bg-accent-wash p-2.5 text-xs text-accent-deep">{bao}</p>}
        {dangTai ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-ink-faint">
            <IconLoader className="h-4 w-4 animate-spin text-accent" />
            Đang tải hàng chờ...
          </div>
        ) : ds.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">Hàng chờ trống. Mọi nhận xét đã được xử lý.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            <AnimatePresence initial={false}>
              {ds.map((b) => (
                <motion.li key={b.id} layout initial={{opacity: 0, y: 8}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, x: 24}} transition={spring} className="flex min-w-0 flex-wrap items-start gap-3 border border-warn/40 bg-paper p-3">
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold text-ink">{b.ten_nguoi}</span>
                      <span className="truncate uppercase tracking-[0.1em] text-ink-faint">về “{b.de_ten}”</span>
                      <span className="text-ink-faint">{new Date(b.created_at).toLocaleString("vi-VN")}</span>
                    </p>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm text-ink-soft">{b.noi_dung}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <motion.button whileTap={buttonTap} type="button" disabled={dangXuLy === b.id} onClick={() => void xuLy(b.id, "duyet")} className="flex items-center gap-1.5 border border-ok bg-ok/12 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-ok transition-colors hover:bg-ok hover:text-paper-light disabled:opacity-50">
                      {dangXuLy === b.id ? <IconLoader className="h-3 w-3 animate-spin" /> : <IconCheck className="h-3 w-3" />}
                      Duyệt
                    </motion.button>
                    <motion.button whileTap={buttonTap} type="button" disabled={dangXuLy === b.id} onClick={() => void xuLy(b.id, "xoa")} className="flex items-center gap-1.5 border border-danger bg-danger/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-danger transition-colors hover:bg-danger hover:text-paper-light disabled:opacity-50">
                      <IconTrash className="h-3 w-3" />
                      Xóa
                    </motion.button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </motion.section>
  );
}