"use client";
import {useCallback, useEffect, useMemo, useState} from "react";
import {motion} from "framer-motion";
import {IconCheck, IconLoader, IconSeal} from "@/components/Icons";
import {DS_MON, MON_DAY_DU, formatNgay, type DeThi, type Mon} from "@/lib/data";
import {layDanhSach} from "@/lib/deThi";
import {boGhimDe, ghimDe} from "@/app/actions";
import {buttonTap, fadeInUp} from "@/lib/animations";
export default function GhimDe() {
  const [ds, setDs] = useState<DeThi[]>([]);
  const [mon, setMon] = useState<Mon>("Toán");
  const [dangTai, setDangTai] = useState(true);
  const [dangGhim, setDangGhim] = useState<string | null>(null);
  const [bao, setBao] = useState("");
  const tai = useCallback(async () => {
    setDangTai(true);
    try {
      setDs(await layDanhSach());
    } catch {
      setDs([]);
    } finally {
      setDangTai(false);
    }
  }, []);
  useEffect(() => {
    void tai();
  }, [tai]);
  const danhSach = useMemo(() => ds.filter((d) => d.mon === mon).sort((a, b) => (a.ghimAt && b.ghimAt ? a.ghimAt.localeCompare(b.ghimAt) : a.ghimAt ? -1 : b.ghimAt ? 1 : b.ngay.localeCompare(a.ngay))), [ds, mon]);
  const soGhim = danhSach.filter((d) => d.ghimAt).length;
  const bam = async (d: DeThi) => {
    setDangGhim(d.id);
    setBao("");
    const kq = d.ghimAt ? await boGhimDe(d.id) : await ghimDe(d.id);
    setBao(kq.ok ? (d.ghimAt ? `Đã bỏ ghim "${d.ten}".` : `Đã ghim "${d.ten}" lên đầu môn ${mon}.`) : (kq.error ?? "Lỗi ghim đề."));
    await tai();
    setDangGhim(null);
  };
  return (
    <motion.section variants={fadeInUp} initial="hidden" animate="visible" className="mx-auto mt-10 w-full min-w-0 max-w-6xl px-4">
      <div className="sheet border border-ink/25 bg-paper-light p-5 shadow-paper">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink pb-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
            <IconSeal className="h-4 w-4 text-accent" />
            Ghim đề đầu danh sách
          </h2>
          <span className="border border-accent/70 bg-accent-wash px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">{soGhim}/3 đề ghim</span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select value={mon} onChange={(e) => setMon(e.target.value as Mon)} aria-label="Chọn môn" className="border border-ink/30 bg-paper px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft outline-none focus:border-accent">
            {DS_MON.map((m) => (
              <option key={m} value={m}>{m} · {MON_DAY_DU[m]}</option>
            ))}
          </select>
          <p className="text-[11px] text-ink-faint">Đề ghim trước nằm trên. Tối đa 3 đề mỗi môn.</p>
        </div>
        {bao && <p className="mt-3 border border-accent/50 bg-accent-wash p-2.5 text-xs text-accent-deep">{bao}</p>}
        {dangTai ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-ink-faint">
            <IconLoader className="h-4 w-4 animate-spin text-accent" />
            Đang tải kho đề...
          </div>
        ) : danhSach.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">Môn này chưa có đề nào.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {danhSach.map((d, i) => (
              <li key={d.id} className={`flex min-w-0 items-center gap-2.5 border p-3 ${d.ghimAt ? "border-accent/70 bg-accent-wash/40" : "border-ink/20 bg-paper"}`}>
                <span className={`grid h-6 w-6 shrink-0 place-items-center border text-[11px] font-bold ${d.ghimAt ? "border-accent bg-accent text-paper-light" : "border-ink/30 text-ink-faint"}`}>{d.ghimAt ? i + 1 : "·"}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{d.ten}</p>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-ink-faint">{formatNgay(d.ngay)} · {d.loai === "docx" ? "DOCX" : "PDF"}</p>
                </div>
                <motion.button whileTap={buttonTap} type="button" disabled={dangGhim === d.id} onClick={() => void bam(d)} className={`flex shrink-0 items-center gap-1.5 border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] transition-colors disabled:opacity-50 ${d.ghimAt ? "border-ink/40 bg-paper text-ink-soft hover:bg-paper-deep" : "border-ink bg-ink text-paper-light hover:border-accent hover:bg-accent"}`}>
                  {dangGhim === d.id ? <IconLoader className="h-3 w-3 animate-spin" /> : d.ghimAt ? <IconCheck className="h-3 w-3" /> : <IconSeal className="h-3 w-3" />}
                  {d.ghimAt ? "Bỏ ghim" : "Ghim"}
                </motion.button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.section>
  );
}