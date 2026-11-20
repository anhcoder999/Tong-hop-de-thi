"use client";
import {useCallback, useEffect, useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {IconCheck, IconClose, IconLoader, IconRefresh, IconSeal, IconTrash} from "@/components/Icons";
import {doiAnBinhLuan, layBinhLuanAdmin, xoaBinhLuan, type BinhLuanAdminRow} from "@/app/actions";
import {buttonTap, fadeInUp, spring} from "@/lib/animations";
export default function BinhLuanAdmin() {
  const [ds, setDs] = useState<BinhLuanAdminRow[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [dangXuLy, setDangXuLy] = useState<string | null>(null);
  const [bao, setBao] = useState("");
  const tai = useCallback(async () => {
    setDangTai(true);
    const kq = await layBinhLuanAdmin();
    if (kq.ok) setDs(kq.ds);
    else setBao(kq.error);
    setDangTai(false);
  }, []);
  useEffect(() => {
    void tai();
  }, [tai]);
  const xuLy = async (id: string, kieu: "an" | "xoa") => {
    const muc = ds.find((b) => b.id === id);
    setDangXuLy(id);
    setBao("");
    const kq = kieu === "an" ? await doiAnBinhLuan(id, !muc?.duyet) : await xoaBinhLuan(id);
    if (kq.ok) {
      if (kieu === "xoa") setDs((cur) => cur.filter((b) => b.id !== id));
      else setDs((cur) => cur.map((b) => (b.id === id ? {...b, duyet: !b.duyet} : b)));
      setBao(kieu === "xoa" ? "Đã xóa nhận xét." : muc?.duyet ? "Đã ẩn nhận xét khỏi trang đề." : "Đã hiện lại nhận xét.");
    } else setBao(kq.error ?? "Lỗi xử lý.");
    setDangXuLy(null);
  };
  const soAn = ds.filter((b) => !b.duyet).length;
  return (
    <motion.section id="binh-luan" variants={fadeInUp} initial="hidden" animate="visible" className="mx-auto mt-0 w-full min-w-0 max-w-6xl scroll-mt-32 px-4 pb-16 pt-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-ink pb-3">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-ink">
            <IconSeal className="h-4 w-4 text-accent" />
            Quản lý nhận xét
            <span className="border border-ink/25 bg-paper-light px-2 py-0.5 font-mono text-xs font-semibold text-ink-soft">{ds.length}</span>
            {soAn > 0 && <span className="border border-warn/70 bg-warn/10 px-2 py-0.5 font-mono text-xs font-semibold text-warn">{soAn} ẩn</span>}
          </h1>
          <p className="mt-1 text-xs text-ink-soft">Nhận xét đăng lên ngay không cần duyệt. Ẩn thì nó biến mất khỏi trang đề, xóa là mất hẳn.</p>
        </div>
        <motion.button whileTap={buttonTap} type="button" onClick={() => void tai()} className="flex items-center gap-1.5 border border-ink/30 bg-paper-light px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-soft transition-colors hover:border-accent hover:text-accent">
          <IconRefresh className={`h-3 w-3 ${dangTai ? "animate-spin" : ""}`} />
          Tải lại
        </motion.button>
      </div>
      {bao && <p className="mt-3 border border-accent/50 bg-accent-wash p-2.5 text-xs text-accent-deep">{bao}</p>}
      {dangTai ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-ink-faint">
          <IconLoader className="h-4 w-4 animate-spin text-accent" />
          Đang tải nhận xét...
        </div>
      ) : ds.length === 0 ? (
        <div className="mt-3 border border-dashed border-ink/25 bg-paper-light p-5 text-sm text-ink-soft">Chưa có nhận xét nào trong kho.</div>
      ) : (
        <>
          <div className="viewer-scroll mt-3 max-h-[58vh] min-h-[10rem] overflow-y-auto border border-ink/15 bg-paper/40 p-2">
            <ul className="space-y-1.5">
              <AnimatePresence initial={false}>
                {ds.map((b) => (
                  <motion.li key={b.id} layout initial={{opacity: 0, y: 8}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, x: 20}} transition={spring} className={`flex min-w-0 flex-wrap items-start gap-2.5 border p-2.5 ${b.duyet ? "border-ink/20 bg-paper-light" : "border-warn/50 bg-warn/10"}`}>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-x-2 text-[10px] uppercase tracking-[0.08em]">
                        <span className="font-semibold text-ink">{b.ten_nguoi}</span>
                        <span className="truncate text-ink-faint">{b.email}</span>
                        <span className="truncate text-ink-faint">· {b.de_ten}</span>
                        <span className="text-ink-faint">{new Date(b.created_at).toLocaleString("vi-VN")}</span>
                        {!b.duyet && <span className="border border-warn px-1 font-bold text-warn">Ẩn</span>}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-ink-soft">{b.noi_dung}</p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <motion.button whileTap={buttonTap} type="button" disabled={dangXuLy === b.id} onClick={() => void xuLy(b.id, "an")} className={`flex items-center gap-1 border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors disabled:opacity-50 ${b.duyet ? "border-warn bg-warn/12 text-warn hover:bg-warn hover:text-paper-light" : "border-ok bg-ok/12 text-ok hover:bg-ok hover:text-paper-light"}`}>
                        {dangXuLy === b.id ? <IconLoader className="h-3 w-3 animate-spin" /> : b.duyet ? <IconClose className="h-3 w-3" /> : <IconCheck className="h-3 w-3" />}
                        {b.duyet ? "Ẩn" : "Hiện"}
                      </motion.button>
                      <motion.button whileTap={buttonTap} type="button" disabled={dangXuLy === b.id} onClick={() => void xuLy(b.id, "xoa")} className="flex items-center gap-1 border border-danger bg-danger/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-danger transition-colors hover:bg-danger hover:text-paper-light disabled:opacity-50">
                        <IconTrash className="h-3 w-3" />
                        Xóa
                      </motion.button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
          <p className="mt-1.5 text-[10px] uppercase tracking-[0.12em] text-ink-faint">Khung cuộn riêng · 100 nhận xét gần nhất</p>
        </>
      )}
    </motion.section>
  );
}