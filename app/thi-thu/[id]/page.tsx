"use client";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {AnimatePresence, motion} from "framer-motion";
import {IconAlert, IconArrowLeft, IconArrowRight, IconCheck, IconClose, IconLoader, IconSeal} from "@/components/Icons";
import Latex from "@/components/Latex";
import {batDauThi, ghiNhanThoat, layKetQua, luuNhap, nopBai, type PhongThi} from "@/app/thi-thu/actions";
import {KY_HIEU_DS, SO_LAN_THOAT_TOI_DA, dinhDangDongHo, lamTron, nhanLoai, type KetQuaBai, type KetQuaCau, type TraLoi} from "@/lib/thiThu";
import {buttonTap, EASE, spring} from "@/lib/animations";
type Phong = Extract<PhongThi, {ok: true}>;
function XemLai({c}: {c: KetQuaCau}) {
  const tl = c.tra_loi;
  return (
    <li className={`border p-4 ${c.dung ? "border-ok/50 bg-ok/5" : "border-danger/40 bg-danger/5"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-display text-base font-bold text-ink">
          Câu {c.thu_tu}
          <span className="border border-ink/30 px-1.5 py-0.5 text-[10px] font-sans font-semibold uppercase tracking-[0.1em] text-ink-soft">{nhanLoai(c.loai)}</span>
        </p>
        <span className={`border px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em] ${c.dung ? "border-ok text-ok" : "border-danger text-danger"}`}>{c.diem_dat}/{c.diem}đ</span>
      </div>
      <div className="mt-2 text-sm leading-relaxed text-ink-soft"><Latex nguon={c.noi_dung} /></div>
      {c.loai === "trac_nghiem" && (
        <ul className="mt-3 space-y-1.5">
          {c.lua_chon.map((o) => {
            const laDapAn = o.ky_hieu === c.dap_an_mcq;
            const daChon = tl === o.ky_hieu;
            return (
              <li key={o.ky_hieu} className={`flex items-start gap-2 border px-2.5 py-1.5 text-sm ${laDapAn ? "border-ok bg-ok/10 text-ink" : daChon ? "border-danger bg-danger/10 text-ink" : "border-ink/15 text-ink-soft"}`}>
                <span className="font-bold">{o.ky_hieu}.</span>
                <span className="min-w-0 flex-1"><Latex nguon={o.noi_dung} /></span>
                {laDapAn && <IconCheck className="h-4 w-4 shrink-0 text-ok" />}
                {daChon && !laDapAn && <IconClose className="h-4 w-4 shrink-0 text-danger" />}
              </li>
            );
          })}
        </ul>
      )}
      {c.loai === "dung_sai" && (
        <ul className="mt-3 space-y-1.5">
          {c.lua_chon.map((o) => {
            const chon = tl && typeof tl === "object" ? tl[o.ky_hieu] : undefined;
            const dung = !!c.dap_an_ds[o.ky_hieu];
            const khop = typeof chon === "boolean" && chon === dung;
            return (
              <li key={o.ky_hieu} className={`flex flex-wrap items-center gap-2 border px-2.5 py-1.5 text-sm ${khop ? "border-ok/50 bg-ok/10" : "border-danger/40 bg-danger/10"}`}>
                <span className="font-bold">{o.ky_hieu})</span>
                <span className="min-w-0 flex-1 text-ink-soft"><Latex nguon={o.noi_dung} /></span>
                <span className="shrink-0 text-[11px] uppercase tracking-[0.08em] text-ink-faint">cậu: {typeof chon === "boolean" ? (chon ? "Đúng" : "Sai") : "—"}</span>
                <span className={`shrink-0 border px-1.5 text-[11px] font-bold uppercase ${dung ? "border-ok text-ok" : "border-danger text-danger"}`}>đáp án: {dung ? "Đúng" : "Sai"}</span>
              </li>
            );
          })}
          <li className="text-[11px] uppercase tracking-[0.1em] text-ink-faint">Đúng {c.so_y_dung}/4 ý</li>
        </ul>
      )}
      {c.loai === "tra_loi_ngan" && (
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <span className="border border-ink/25 bg-paper px-2.5 py-1">Cậu trả lời: <b className="text-ink">{typeof tl === "string" && tl ? tl : "—"}</b></span>
          <span className="border border-ok bg-ok/10 px-2.5 py-1 text-ok">Đáp án: <b>{c.dap_an_ngan.split("|").join(" hoặc ")}</b></span>
        </div>
      )}
      {c.giai_thich && (
        <div className="mt-3 border-l-2 border-accent bg-paper-light p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">Giải thích</p>
          <div className="mt-1 text-sm leading-relaxed text-ink-soft"><Latex nguon={c.giai_thich} /></div>
        </div>
      )}
    </li>
  );
}
export default function PhongThiPage({params}: {params: {id: string}}) {
  const router = useRouter();
  const [giaiDoan, setGiaiDoan] = useState<"dangTai" | "dangLam" | "ketQua" | "loi">("dangTai");
  const [phong, setPhong] = useState<Phong | null>(null);
  const [traLoi, setTraLoi] = useState<TraLoi>({});
  const [idx, setIdx] = useState(0);
  const [conLai, setConLai] = useState(0);
  const [soLan, setSoLan] = useState(0);
  const [canhBao, setCanhBao] = useState<number | null>(null);
  const [hoiNop, setHoiNop] = useState(false);
  const [dangNop, setDangNop] = useState(false);
  const [ketQua, setKetQua] = useState<KetQuaBai | null>(null);
  const [loi, setLoi] = useState("");
  const traLoiRef = useRef<TraLoi>({});
  const nopRef = useRef(false);
  const thoatRef = useRef(0);
  const baiRef = useRef("");
  traLoiRef.current = traLoi;
  const moPhong = useCallback(async () => {
    nopRef.current = false;
    setGiaiDoan("dangTai");
    setKetQua(null);
    setLoi("");
    const baiCu = new URLSearchParams(window.location.search).get("bai");
    if (baiCu) {
      const kq = await layKetQua(baiCu);
      if (kq.ok) {
        setKetQua(kq.ketQua);
        setGiaiDoan("ketQua");
        return;
      }
      router.replace(`/thi-thu/${params.id}`);
    }
    const kq = await batDauThi(params.id);
    if (!kq.ok) {
      setLoi(kq.error);
      setGiaiDoan("loi");
      return;
    }
    baiRef.current = kq.baiThiId;
    setPhong(kq);
    setTraLoi(kq.traLoi ?? {});
    setSoLan(kq.soLanThoat);
    setIdx(0);
    setConLai(Math.max(0, Math.round((new Date(kq.hanNop).getTime() - Date.now()) / 1000)));
    setGiaiDoan("dangLam");
  }, [params.id, router]);
  useEffect(() => {
    void moPhong();
  }, [moPhong]);
  const nop = useCallback(async (tuDong: boolean) => {
    if (nopRef.current || !baiRef.current) return;
    nopRef.current = true;
    setDangNop(true);
    setHoiNop(false);
    const kq = await nopBai(baiRef.current, traLoiRef.current);
    setDangNop(false);
    if (kq.ok) {
      setKetQua(kq.ketQua);
      setGiaiDoan("ketQua");
    } else {
      nopRef.current = false;
      if (!tuDong) setLoi(kq.error);
    }
  }, []);
  useEffect(() => {
    if (giaiDoan !== "dangLam" || !phong) return;
    const han = new Date(phong.hanNop).getTime();
    const t = setInterval(() => {
      const con = Math.max(0, Math.round((han - Date.now()) / 1000));
      setConLai(con);
      if (con <= 0) void nop(true);
    }, 1000);
    return () => clearInterval(t);
  }, [giaiDoan, phong, nop]);
  useEffect(() => {
    if (giaiDoan !== "dangLam") return;
    const t = setInterval(() => {
      if (baiRef.current) void luuNhap(baiRef.current, traLoiRef.current);
    }, 10000);
    return () => clearInterval(t);
  }, [giaiDoan]);
  useEffect(() => {
    if (giaiDoan !== "dangLam" || !baiRef.current) return;
    const t = setTimeout(() => {
      void luuNhap(baiRef.current, traLoi);
    }, 1200);
    return () => clearTimeout(t);
  }, [traLoi, giaiDoan]);
  useEffect(() => {
    if (giaiDoan !== "dangLam") return;
    const canh = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", canh);
    return () => window.removeEventListener("beforeunload", canh);
  }, [giaiDoan]);
  useEffect(() => {
    if (giaiDoan !== "dangLam") return;
    const xuLy = async () => {
      if (nopRef.current || !baiRef.current) return;
      const now = Date.now();
      if (now - thoatRef.current < 1500) return;
      thoatRef.current = now;
      const kq = await ghiNhanThoat(baiRef.current);
      if (!kq.ok && !kq.biHuy) return;
      setSoLan(kq.soLan);
      if (kq.biHuy) {
        nopRef.current = true;
        const r = await layKetQua(baiRef.current);
        if (r.ok) {
          setKetQua(r.ketQua);
          setGiaiDoan("ketQua");
        }
      } else setCanhBao(kq.soLan);
    };
    const anHien = () => {
      if (document.visibilityState === "hidden") void xuLy();
    };
    const matTieuDiem = () => void xuLy();
    document.addEventListener("visibilitychange", anHien);
    window.addEventListener("blur", matTieuDiem);
    return () => {
      document.removeEventListener("visibilitychange", anHien);
      window.removeEventListener("blur", matTieuDiem);
    };
  }, [giaiDoan]);
  const cau = phong?.cau ?? [];
  const cauHien = cau[idx];
  const soDaLam = useMemo(() => cau.filter((c) => {
    const v = traLoi[c.id];
    if (c.loai === "dung_sai") return !!v && typeof v === "object" && KY_HIEU_DS.every((k) => typeof (v as Record<string, boolean>)[k] === "boolean");
    return typeof v === "string" && v.trim() !== "";
  }).length, [cau, traLoi]);
  const chon = (id: string, giaTri: string | Record<string, boolean>) => setTraLoi((cur) => ({...cur, [id]: giaTri}));
  const chonY = (id: string, ky: string, giaTri: boolean) => setTraLoi((cur) => ({...cur, [id]: {...(cur[id] && typeof cur[id] === "object" ? (cur[id] as Record<string, boolean>) : {}), [ky]: giaTri}}));
  const xoaDapAn = (id: string) => setTraLoi((cur) => {
    const moi = {...cur};
    delete moi[id];
    return moi;
  });
  const lamLai = () => {
    router.replace(`/thi-thu/${params.id}`);
    setPhong(null);
    void moPhong();
  };
  if (giaiDoan === "dangTai") {
    return (
      <div className="mx-auto flex w-full max-w-3xl items-center justify-center gap-2 px-4 py-24 text-sm text-ink-faint">
        <IconLoader className="h-4 w-4 animate-spin text-accent" />
        Đang mở phòng thi...
      </div>
    );
  }
  if (giaiDoan === "loi") {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-20">
        <div className="sheet border-danger p-6 pl-9 shadow-paper">
          <IconAlert className="h-7 w-7 text-danger" />
          <h1 className="mt-3 font-display text-2xl font-bold text-ink">Chưa vào được phòng thi</h1>
          <p className="mt-2 text-sm text-ink-soft">{loi}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/thi-thu" className="border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors hover:border-accent hover:bg-accent">Về danh sách đề</Link>
            <motion.button whileTap={buttonTap} type="button" onClick={() => void moPhong()} className="border border-ink/40 bg-paper-light px-4 py-2.5 text-sm font-semibold text-ink-soft">Thử lại</motion.button>
          </div>
        </div>
      </div>
    );
  }
  if (giaiDoan === "ketQua" && ketQua) {
    const phanTram = ketQua.tongDiem > 0 ? Math.round((ketQua.diem / ketQua.tongDiem) * 100) : 0;
    return (
      <div className="mx-auto w-full min-w-0 max-w-4xl px-4 pb-16 pt-8">
        <motion.div initial={{opacity: 0, y: 16}} animate={{opacity: 1, y: 0}} transition={spring} className="sheet border-2 border-ink p-6 shadow-lift">
          <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            <IconSeal className="h-3.5 w-3.5 text-accent" />
            Kết quả bài thi
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold text-ink">{ketQua.ten}</h1>
          {ketQua.viPham && (
            <p className="mt-3 flex items-start gap-2 border border-danger bg-danger/10 p-3 text-sm text-danger">
              <IconAlert className="mt-0.5 h-4 w-4 shrink-0" />
              Bài bị hủy vì rời phòng thi {ketQua.soLanThoat} lần (quá {SO_LAN_THOAT_TOI_DA} lần). Điểm ghi nhận 0. Cậu vẫn xem lại lời giải bên dưới và làm lại được.
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-end gap-6 border-y border-dashed border-ink/25 py-4">
            <div>
              <motion.p initial={{scale: 0.7, opacity: 0}} animate={{scale: 1, opacity: 1}} transition={spring} className={`font-display text-6xl font-bold leading-none ${ketQua.viPham ? "text-danger" : "text-accent"}`}>{ketQua.diem}</motion.p>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-ink-faint">trên {ketQua.tongDiem} điểm</p>
            </div>
            <dl className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {nhan: "Tỉ lệ", giaTri: `${phanTram}%`},
                {nhan: "Câu đúng trọn", giaTri: `${ketQua.soCauDung}/${ketQua.soCau}`},
                {nhan: "Thời gian", giaTri: `${lamTron(ketQua.phutLam)}p`},
                {nhan: "Lần rời phòng", giaTri: `${ketQua.soLanThoat}`}
              ].map((r) => (
                <div key={r.nhan}>
                  <dt className="text-[10px] uppercase tracking-[0.12em] text-ink-faint">{r.nhan}</dt>
                  <dd className="font-display text-xl font-bold text-ink">{r.giaTri}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <motion.button whileTap={buttonTap} type="button" onClick={lamLai} className="nut-nhan flex items-center gap-2 border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors hover:border-accent hover:bg-accent">
              <IconArrowRight className="h-4 w-4" />
              Làm lại đề này
            </motion.button>
            <Link href="/thi-thu" className="flex items-center gap-2 border border-ink/40 bg-paper-light px-4 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent">
              <IconArrowLeft className="h-4 w-4" />
              Về danh sách đề
            </Link>
          </div>
        </motion.div>
        <h2 className="mt-8 border-b-2 border-ink pb-2 font-display text-xl font-bold text-ink">Xem lại từng câu</h2>
        <ul className="mt-4 space-y-3">
          {ketQua.cau.map((c) => <XemLai key={c.id} c={c} />)}
        </ul>
      </div>
    );
  }
  if (!phong || !cauHien) return null;
  const v = traLoi[cauHien.id];
  return (
    <div className="mx-auto w-full min-w-0 max-w-4xl px-4 pb-16">
      <div className="sticky top-[66px] z-40 -mx-4 border-b-2 border-ink bg-paper px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-display text-base font-bold text-ink">{phong.ten}</p>
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink-faint">{phong.mon} · đã làm {soDaLam}/{cau.length} câu · rời phòng {soLan}/{SO_LAN_THOAT_TOI_DA}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`border px-3 py-1.5 font-mono text-lg font-bold tabular-nums ${conLai <= 60 ? "border-danger bg-danger/10 text-danger" : "border-ink bg-paper-light text-ink"}`}>{dinhDangDongHo(conLai)}</span>
            <motion.button whileTap={buttonTap} type="button" onClick={() => setHoiNop(true)} disabled={dangNop} className="nut-nhan flex items-center gap-2 border border-accent bg-accent px-4 py-2 text-sm font-semibold text-paper-light transition-colors hover:bg-accent-deep disabled:opacity-60">
              {dangNop ? <IconLoader className="h-4 w-4 animate-spin" /> : <IconCheck className="h-4 w-4" />}
              Nộp bài
            </motion.button>
          </div>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden bg-ink/10">
          <motion.div animate={{width: `${cau.length ? (soDaLam / cau.length) * 100 : 0}%`}} transition={spring} className="h-full bg-gradient-to-r from-accent via-warn to-ok" />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {cau.map((c, i) => {
          const daLam = (() => {
            const g = traLoi[c.id];
            if (c.loai === "dung_sai") return !!g && typeof g === "object" && KY_HIEU_DS.every((k) => typeof (g as Record<string, boolean>)[k] === "boolean");
            return typeof g === "string" && g.trim() !== "";
          })();
          return (
            <button key={c.id} type="button" onClick={() => setIdx(i)} className={`grid h-9 w-9 place-items-center border text-xs font-bold transition-colors ${i === idx ? "border-accent bg-accent text-paper-light" : daLam ? "border-ok bg-ok/15 text-ok" : "border-ink/25 bg-paper-light text-ink-faint hover:border-ink/60"}`}>
              {c.thu_tu}
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={cauHien.id} initial={{opacity: 0, x: 18}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -18}} transition={{duration: 0.22, ease: EASE}} className="sheet mt-4 p-5 pl-8 shadow-paper">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 font-display text-lg font-bold text-ink">
              Câu {cauHien.thu_tu}
              <span className="border border-ink/30 px-1.5 py-0.5 text-[10px] font-sans font-semibold uppercase tracking-[0.1em] text-ink-soft">{nhanLoai(cauHien.loai)}</span>
            </p>
            <span className="text-[11px] uppercase tracking-[0.1em] text-ink-faint">{cauHien.diem} điểm</span>
          </div>
          <div className="mt-3 text-[15px] leading-relaxed text-ink"><Latex nguon={cauHien.noi_dung} /></div>
          {cauHien.loai === "trac_nghiem" && (
            <div className="mt-4 space-y-2">
              {cauHien.lua_chon.map((o) => {
                const active = v === o.ky_hieu;
                return (
                  <motion.button key={o.ky_hieu} whileTap={buttonTap} type="button" onClick={() => chon(cauHien.id, o.ky_hieu)} className={`flex w-full items-start gap-3 border p-3 text-left transition-colors ${active ? "border-accent bg-accent-wash" : "border-ink/25 bg-paper hover:border-ink/60"}`}>
                    <span className={`grid h-7 w-7 shrink-0 place-items-center border font-bold ${active ? "border-accent bg-accent text-paper-light" : "border-ink/40 text-ink-soft"}`}>{o.ky_hieu}</span>
                    <span className="min-w-0 flex-1 pt-0.5 text-sm text-ink"><Latex nguon={o.noi_dung} /></span>
                  </motion.button>
                );
              })}
            </div>
          )}
          {cauHien.loai === "dung_sai" && (
            <div className="mt-4 space-y-2">
              {cauHien.lua_chon.map((o) => {
                const giaTri = v && typeof v === "object" ? (v as Record<string, boolean>)[o.ky_hieu] : undefined;
                return (
                  <div key={o.ky_hieu} className="flex flex-wrap items-center gap-3 border border-ink/25 bg-paper p-3">
                    <span className="font-display text-base font-bold text-ink">{o.ky_hieu})</span>
                    <span className="min-w-0 flex-1 text-sm text-ink"><Latex nguon={o.noi_dung} /></span>
                    <div className="flex shrink-0 gap-1.5">
                      {[true, false].map((k) => (
                        <motion.button key={String(k)} whileTap={buttonTap} type="button" onClick={() => chonY(cauHien.id, o.ky_hieu, k)} className={`border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] transition-colors ${giaTri === k ? (k ? "border-ok bg-ok text-paper-light" : "border-danger bg-danger text-paper-light") : "border-ink/30 bg-paper-light text-ink-soft hover:border-ink/60"}`}>
                          {k ? "Đúng" : "Sai"}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                );
              })}
              <p className="text-[11px] text-ink-faint">Chọn đủ 4 ý. Đúng 1 ý được 0,1đ; 2 ý 0,25đ; 3 ý 0,5đ; 4 ý trọn điểm câu.</p>
            </div>
          )}
          {cauHien.loai === "tra_loi_ngan" && (
            <div className="mt-4">
              <input type="text" inputMode="decimal" value={typeof v === "string" ? v : ""} onChange={(e) => chon(cauHien.id, e.target.value)} placeholder="Nhập kết quả..." className="w-full max-w-xs border border-ink/30 bg-paper px-3.5 py-2.5 text-base text-ink outline-none focus:border-accent" />
              <p className="mt-2 text-[11px] text-ink-faint">Số thập phân dùng dấu phẩy hoặc dấu chấm đều được.</p>
            </div>
          )}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-ink/20 pt-4">
            <motion.button whileTap={buttonTap} type="button" onClick={() => xoaDapAn(cauHien.id)} className="border border-ink/30 bg-paper-light px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-ink-faint transition-colors hover:border-danger hover:text-danger">Xóa đáp án</motion.button>
            <div className="flex gap-2">
              <motion.button whileTap={buttonTap} type="button" disabled={idx <= 0} onClick={() => setIdx((i) => Math.max(0, i - 1))} className="flex items-center gap-1.5 border border-ink/40 bg-paper-light px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft transition-colors disabled:opacity-40 hover:border-accent hover:text-accent">
                <IconArrowLeft className="h-3.5 w-3.5" />
                Câu trước
              </motion.button>
              <motion.button whileTap={buttonTap} type="button" disabled={idx >= cau.length - 1} onClick={() => setIdx((i) => Math.min(cau.length - 1, i + 1))} className="flex items-center gap-1.5 border border-ink bg-ink px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-paper-light transition-colors disabled:opacity-40 hover:border-accent hover:bg-accent">
                Câu sau
                <IconArrowRight className="h-3.5 w-3.5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      {loi && <p className="mt-3 border border-danger/60 bg-danger/10 p-2.5 text-xs text-danger">{loi}</p>}
      <AnimatePresence>
        {canhBao !== null && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 z-[95] grid place-items-center bg-ink/75 p-4">
            <motion.div initial={{scale: 0.85, y: 20}} animate={{scale: 1, y: 0}} exit={{scale: 0.9, opacity: 0}} transition={spring} className="w-full max-w-md border-2 border-danger bg-paper-light p-6 text-center shadow-lift">
              <IconAlert className="mx-auto h-9 w-9 text-danger" />
              <h2 className="mt-3 font-display text-2xl font-bold text-ink">Cảnh báo rời phòng thi</h2>
              <p className="mt-2 text-sm text-ink-soft">Cậu vừa rời khỏi phòng thi lần <b className="text-danger">{canhBao}</b> trên {SO_LAN_THOAT_TOI_DA} lần cho phép. Quá {SO_LAN_THOAT_TOI_DA} lần, bài sẽ bị 0 điểm ngay lập tức.</p>
              <motion.button whileTap={buttonTap} type="button" onClick={() => setCanhBao(null)} className="nut-nhan mt-5 w-full border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors hover:border-accent hover:bg-accent">Đã hiểu, tiếp tục làm bài</motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {hoiNop && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 z-[95] grid place-items-center bg-ink/75 p-4">
            <motion.div initial={{scale: 0.9, y: 16}} animate={{scale: 1, y: 0}} exit={{scale: 0.95, opacity: 0}} transition={spring} className="w-full max-w-md border-2 border-ink bg-paper-light p-6 shadow-lift">
              <h2 className="font-display text-2xl font-bold text-ink">Nộp bài bây giờ?</h2>
              <p className="mt-2 text-sm text-ink-soft">Cậu đã làm {soDaLam}/{cau.length} câu. {soDaLam < cau.length ? `Còn ${cau.length - soDaLam} câu chưa trả lời, nộp là tính 0 điểm cho các câu đó.` : "Tất cả câu đã có trả lời."} Thời gian còn {dinhDangDongHo(conLai)}.</p>
              <div className="mt-5 flex gap-2">
                <motion.button whileTap={buttonTap} type="button" onClick={() => setHoiNop(false)} className="flex-1 border border-ink/40 bg-paper px-4 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-paper-deep">Làm tiếp</motion.button>
                <motion.button whileTap={buttonTap} type="button" onClick={() => void nop(false)} className="nut-nhan flex-1 border border-accent bg-accent px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors hover:bg-accent-deep">Nộp bài</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}