"use client";
import {useCallback, useEffect, useMemo, useState} from "react";
import {motion} from "framer-motion";
import {IconAlert, IconCheck, IconLoader, IconSearch, IconSeal} from "@/components/Icons";
import {banNguoiDung, layNguoiDung, type NguoiDung} from "@/app/actions";
import {buttonTap, fadeInUp} from "@/lib/animations";
import {khongDau} from "@/lib/data";
export default function NguoiDungAdmin() {
  const [ds, setDs] = useState<NguoiDung[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [tuKhoa, setTuKhoa] = useState("");
  const [bao, setBao] = useState("");
  const [dangXuLy, setDangXuLy] = useState<string | null>(null);
  const tai = useCallback(async () => {
    setDangTai(true);
    const kq = await layNguoiDung();
    if (kq.ok) setDs(kq.ds);
    else setBao(kq.error);
    setDangTai(false);
  }, []);
  useEffect(() => {
    void tai();
  }, [tai]);
  const loc = useMemo(() => {
    const q = khongDau(tuKhoa);
    return ds.filter((u) => !q || khongDau(u.email ?? "").includes(q) || khongDau(u.ho_ten ?? "").includes(q));
  }, [ds, tuKhoa]);
  const doiBan = async (u: NguoiDung) => {
    const muonBan = !u.banned;
    if (muonBan && !window.confirm(`Khóa tài khoản ${u.email}?`)) return;
    setDangXuLy(u.id);
    setBao("");
    const kq = await banNguoiDung(u.id, muonBan);
    setBao(kq.ok ? (muonBan ? `Đã khóa ${u.email}.` : `Đã mở khóa ${u.email}.`) : (kq.error ?? "Lỗi."));
    await tai();
    setDangXuLy(null);
  };
  return (
    <motion.section variants={fadeInUp} initial="hidden" animate="visible" className="mx-auto mt-10 w-full min-w-0 max-w-6xl px-4 pb-16">
      <div className="sheet border border-ink/25 bg-paper-light p-5 shadow-paper">
        <h2 className="flex items-center gap-2 border-b-2 border-ink pb-4 font-display text-lg font-bold text-ink">
          <IconSeal className="h-4 w-4 text-accent" />
          Người dùng ({ds.length})
        </h2>
        <div className="group relative mt-4">
          <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint group-focus-within:text-accent" />
          <input type="text" value={tuKhoa} onChange={(e) => setTuKhoa(e.target.value)} placeholder="Tìm theo email hoặc tên..." aria-label="Tìm người dùng" className="w-full border border-ink/30 bg-paper py-2.5 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent" />
        </div>
        {bao && <p className="mt-3 border border-accent/50 bg-accent-wash p-2.5 text-xs text-accent-deep">{bao}</p>}
        {dangTai ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-ink-faint">
            <IconLoader className="h-4 w-4 animate-spin text-accent" />
            Đang tải danh sách...
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {loc.map((u) => (
              <li key={u.id} className={`flex min-w-0 flex-wrap items-center gap-2.5 border p-3 ${u.banned ? "border-danger/60 bg-danger/10" : "border-ink/20 bg-paper"}`}>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{u.ho_ten?.trim() || u.email}</p>
                  <p className="truncate text-[11px] text-ink-faint">{u.email} · tham gia {new Date(u.created_at).toLocaleDateString("vi-VN")}</p>
                </div>
                <span className={`border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${u.role === "admin" ? "border-accent text-accent" : "border-ink/30 text-ink-soft"}`}>{u.role === "admin" ? "Admin" : "Member"}</span>
                {u.banned && <span className="flex items-center gap-1 border border-danger px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-danger"><IconAlert className="h-3 w-3" />Bị khóa</span>}
                <motion.button whileTap={buttonTap} type="button" disabled={dangXuLy === u.id || u.role === "admin"} onClick={() => void doiBan(u)} className={`flex shrink-0 items-center gap-1.5 border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] transition-colors disabled:opacity-40 ${u.banned ? "border-ok bg-ok/15 text-ok hover:bg-ok hover:text-paper-light" : "border-danger bg-danger/10 text-danger hover:bg-danger hover:text-paper-light"}`}>
                  {dangXuLy === u.id ? <IconLoader className="h-3 w-3 animate-spin" /> : u.banned ? <IconCheck className="h-3 w-3" /> : <IconAlert className="h-3 w-3" />}
                  {u.banned ? "Mở khóa" : "Khóa"}
                </motion.button>
              </li>
            ))}
            {loc.length === 0 && <p className="text-sm text-ink-soft">Không có người dùng khớp.</p>}
          </ul>
        )}
      </div>
    </motion.section>
  );
}