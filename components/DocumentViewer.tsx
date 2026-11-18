"use client";
import {useEffect, useMemo, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {AnimatePresence, motion} from "framer-motion";
import {IconArrowLeft, IconCheck, IconClose, IconDownload, IconExternal, IconFile, IconLoader, IconSearch} from "@/components/Icons";
import Skeleton from "@/components/Skeleton";
import {buttonTap, spring} from "@/lib/animations";
import {useDanhDau} from "@/lib/useDanhDau";
import {useSoTay} from "@/lib/useSoTay";
import {goiTai} from "@/app/actions";
const CDN = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174";
const WORKER = `${CDN}/build/pdf.worker.min.js`;
const CMAP = `${CDN}/cmaps/`;
const FONTS = `${CDN}/standard_fonts/`;
type KetQuaTim = {trang: number; snippet: string};
function IconGhim({day}: {day: boolean}) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill={day ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M7 3.5h10v17l-5-3.6-5 3.6Z" />
    </svg>
  );
}
function IconSoTay() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4.5h11a3 3 0 0 1 3 3v12H8a3 3 0 0 1-3-3Z" />
      <path d="M9 9h6M9 12.5h6M9 16h4" />
    </svg>
  );
}
function IconTapTrung({mo}: {mo: boolean}) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {mo ? <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /> : <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />}
    </svg>
  );
}
export default function DocumentViewer({url, ten, id, urlDapAn}: {url: string; ten: string; id: string; urlDapAn?: string | null}) {
  const router = useRouter();
  const {danhDau} = useDanhDau();
  const soTay = useSoTay(id);
  const soTayRef = useRef(soTay);
  soTayRef.current = soTay;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const taskRef = useRef<{cancel: () => void; promise: Promise<unknown>} | null>(null);
  const touchRef = useRef<{x: number; y: number; kc: number; zoom: number} | null>(null);
  const [nguon, setNguon] = useState<"de" | "dapan">("de");
  const [pdf, setPdf] = useState<any>(null);
  const [fit, setFit] = useState(0);
  const [trang, setTrang] = useState(1);
  const [tong, setTong] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [dangTai, setDangTai] = useState(true);
  const [dangVe, setDangVe] = useState(true);
  const [loi, setLoi] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");
  const [ketQua, setKetQua] = useState<KetQuaTim[]>([]);
  const [dangTim, setDangTim] = useState(false);
  const [tapTrung, setTapTrung] = useState(false);
  const [moSoTay, setMoSoTay] = useState(false);
  const [tiepTuc, setTiepTuc] = useState<number | null>(null);
  const xemDapAn = nguon === "dapan" && !!urlDapAn;
  const src = xemDapAn ? (urlDapAn as string) : url;
  const soGhim = soTay.bm.includes(trang);
  const ghiChu = soTay.note[String(trang)] ?? "";
  const trangGhiChu = useMemo(() => Object.keys(soTay.note).map(Number).filter((p) => (soTay.note[String(p)] ?? "").trim()).sort((a, b) => a - b), [soTay.note]);
  const soMuc = soTay.bm.length + trangGhiChu.length;
  useEffect(() => {
    danhDau(id);
  }, [id, danhDau]);
  useEffect(() => {
    let alive = true;
    setDangTai(true);
    setLoi("");
    setPdf(null);
    setFit(0);
    setTrang(1);
    setZoom(1);
    setKetQua([]);
    setTiepTuc(null);
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = WORKER;
        const doc = await pdfjs.getDocument({url: src, cMapUrl: CMAP, cMapPacked: true, standardFontDataUrl: FONTS, disableAutoFetch: true, rangeChunkSize: 65536}).promise;
        if (!alive) {
          doc.destroy();
          return;
        }
        setPdf(doc);
        setTong(doc.numPages);
        const last = soTayRef.current.last;
        if (last > 1 && last <= doc.numPages) {
          setTrang(last);
          setTiepTuc(last);
        }
        setDangTai(false);
      } catch {
        if (alive) {
          setLoi("Không tải được file. Link có thể đã hết hạn, hãy tải lại trang.");
          setDangTai(false);
        }
      }
    })();
    return () => {
      alive = false;
      if (taskRef.current) taskRef.current.cancel();
    };
  }, [src]);
  useEffect(() => {
    if (!tiepTuc) return;
    const t = setTimeout(() => setTiepTuc(null), 4000);
    return () => clearTimeout(t);
  }, [tiepTuc]);
  useEffect(() => {
    if (!pdf) return;
    return () => {
      pdf.destroy();
    };
  }, [pdf]);
  useEffect(() => {
    soTay.setLast(trang);
  }, [trang, soTay.setLast]);
  useEffect(() => {
    if (!pdf) return;
    let alive = true;
    const compute = async () => {
      const page = await pdf.getPage(1);
      const w = page.getViewport({scale: 1}).width;
      const cw = wrapRef.current?.clientWidth ?? 0;
      if (alive && cw > 0 && w > 0) setFit(cw / w);
    };
    void compute();
    window.addEventListener("resize", compute);
    return () => {
      alive = false;
      window.removeEventListener("resize", compute);
    };
  }, [pdf, tapTrung, moSoTay]);
  useEffect(() => {
    if (!pdf || fit <= 0 || !canvasRef.current || !overlayRef.current || !boxRef.current) return;
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    const box = boxRef.current;
    let cancelled = false;
    (async () => {
      setDangVe(true);
      const page = await pdf.getPage(trang);
      if (cancelled) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const scale = fit * zoom;
      const base = page.getViewport({scale});
      const cssW = Math.floor(base.width);
      const cssH = Math.floor(base.height);
      box.style.width = `${cssW}px`;
      box.style.height = `${cssH}px`;
      canvas.width = Math.max(1, Math.floor(cssW * dpr));
      canvas.height = Math.max(1, Math.floor(cssH * dpr));
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      overlay.width = canvas.width;
      overlay.height = canvas.height;
      overlay.style.width = `${cssW}px`;
      overlay.style.height = `${cssH}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (taskRef.current) taskRef.current.cancel();
      const task = page.render({canvasContext: ctx, viewport: page.getViewport({scale: scale * dpr})});
      taskRef.current = task;
      await task.promise;
      if (cancelled) return;
      const octx = overlay.getContext("2d");
      if (octx) {
        octx.setTransform(dpr, 0, 0, dpr, 0, 0);
        octx.clearRect(0, 0, cssW, cssH);
        const q = tuKhoa.trim().toLowerCase();
        if (q) {
          const tc = await page.getTextContent();
          const vp = page.getViewport({scale});
          octx.fillStyle = "rgba(179,38,30,0.32)";
          for (const it of tc.items as any[]) {
            const s = String(it.str ?? "").toLowerCase();
            if (!s.includes(q)) continue;
            const r = vp.convertToViewportRectangle([it.transform[4], it.transform[5], it.transform[4] + it.width, it.transform[5] + it.height]);
            octx.fillRect(Math.min(r[0], r[2]), Math.min(r[1], r[3]), Math.abs(r[2] - r[0]), Math.abs(r[3] - r[1]));
          }
        }
      }
      setDangVe(false);
    })().catch(() => {
      if (!cancelled) setDangVe(false);
    });
    return () => {
      cancelled = true;
    };
  }, [pdf, fit, trang, zoom, tuKhoa]);
  useEffect(() => {
    const phim = (e: KeyboardEvent) => {
      const t = e.target;
      if (t instanceof HTMLElement && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.key === "Escape") {
        if (tapTrung) setTapTrung(false);
        else setMoSoTay(false);
      }
      if (e.key === "ArrowRight") setTrang((p) => Math.min(tong, p + 1));
      if (e.key === "ArrowLeft") setTrang((p) => Math.max(1, p - 1));
      if (e.key.toLowerCase() === "f") setTapTrung((v) => !v);
    };
    window.addEventListener("keydown", phim);
    return () => window.removeEventListener("keydown", phim);
  }, [tong, tapTrung]);
  useEffect(() => {
    if (!tapTrung) return;
    const cu = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = cu;
    };
  }, [tapTrung]);
  const tim = async () => {
    if (!pdf || !tuKhoa.trim()) {
      setKetQua([]);
      return;
    }
    setDangTim(true);
    const q = tuKhoa.trim().toLowerCase();
    const kq: KetQuaTim[] = [];
    for (let i = 1; i <= tong; i++) {
      const page = await pdf.getPage(i);
      const tc = await page.getTextContent();
      const van = (tc.items as any[]).map((it) => String(it.str ?? "")).join(" ");
      const idx = van.toLowerCase().indexOf(q);
      if (idx >= 0) kq.push({trang: i, snippet: van.slice(Math.max(0, idx - 30), idx + 50)});
      page.cleanup();
    }
    setKetQua(kq);
    setDangTim(false);
    if (kq.length) setTrang(kq[0].trang);
  };
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchRef.current = {x: 0, y: 0, kc: Math.hypot(dx, dy), zoom};
    } else if (e.touches.length === 1) {
      touchRef.current = {x: e.touches[0].clientX, y: e.touches[0].clientY, kc: 0, zoom};
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const t = touchRef.current;
    if (!t) return;
    if (e.touches.length === 2 && t.kc > 0) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      setZoom(Math.min(4, Math.max(0.5, Number((t.zoom * (Math.hypot(dx, dy) / t.kc)).toFixed(2)))));
    }
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const t = touchRef.current;
    touchRef.current = null;
    if (!t || t.kc > 0 || zoom > 1.05 || e.changedTouches.length !== 1) return;
    const dx = e.changedTouches[0].clientX - t.x;
    const dy = e.changedTouches[0].clientY - t.y;
    if (Math.abs(dx) > 60 && Math.abs(dy) < 40) {
      if (dx < 0) setTrang((p) => Math.min(tong, p + 1));
      else setTrang((p) => Math.max(1, p - 1));
    }
  };
  const onWheel = (e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    setZoom((z) => Math.min(4, Math.max(0.5, Number((z - Math.sign(e.deltaY) * 0.15).toFixed(2)))));
  };
  const viewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(src)}`;
  return (
    <div className={tapTrung ? "fixed inset-0 z-[70] flex flex-col bg-paper p-3 sm:p-5" : "mt-6"}>
      {tapTrung && (
        <div className="mb-3 flex items-center justify-between gap-3 border-b-2 border-ink pb-2">
          <p className="min-w-0 truncate font-display text-base font-bold text-ink">{ten}</p>
          <motion.button whileTap={buttonTap} type="button" onClick={() => setTapTrung(false)} className="flex shrink-0 items-center gap-2 border border-ink bg-ink px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-paper-light transition-colors hover:border-accent hover:bg-accent">
            <IconTapTrung mo />
            Thoát (Esc)
          </motion.button>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2.5">
        {!tapTrung && (
          <motion.button whileTap={buttonTap} type="button" onClick={() => router.push("/")} className="flex items-center gap-2 border border-ink bg-paper-light px-4 py-2.5 text-sm font-semibold text-ink transition-colors active:bg-paper-deep hover:bg-paper">
            <IconArrowLeft className="h-4 w-4" />
            Quay lại
          </motion.button>
        )}
        <motion.a whileTap={buttonTap} href={src} download onClick={() => {
          if (!xemDapAn) void goiTai(id);
        }} target="_blank" rel="noopener noreferrer" className="nut-quet flex items-center gap-2 border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors active:border-accent active:bg-accent hover:border-accent hover:bg-accent">
          <IconDownload className="h-4 w-4" />
          {xemDapAn ? "Tải đáp án" : "Tải PDF"}
        </motion.a>
        {!tapTrung && (
          <motion.a whileTap={buttonTap} href={viewerUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 border border-ink bg-paper-light px-4 py-2.5 text-sm font-semibold text-ink transition-colors active:bg-paper-deep hover:bg-paper">
            <IconExternal className="h-4 w-4" />
            Mở tab mới
          </motion.a>
        )}
        <motion.button whileTap={buttonTap} type="button" disabled={!urlDapAn} title={urlDapAn ? "Xem đáp án của đề này" : "Đề này chưa có đáp án"} onClick={() => setNguon((n) => (n === "de" ? "dapan" : "de"))} className={`flex items-center gap-2 border px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${xemDapAn ? "border-ink bg-ink text-paper-light hover:border-accent hover:bg-accent" : "border-ok bg-ok/12 text-ok hover:bg-ok hover:text-paper-light"}`}>
          {xemDapAn ? <IconFile className="h-4 w-4" /> : <IconCheck className="h-4 w-4" />}
          {xemDapAn ? "Xem đề thi" : "Đáp án"}
        </motion.button>
        <motion.button whileTap={buttonTap} type="button" onClick={() => setMoSoTay((v) => !v)} aria-expanded={moSoTay} className={`relative flex items-center gap-2 border px-4 py-2.5 text-sm font-semibold transition-colors ${moSoTay ? "border-warn bg-warn/15 text-warn" : "border-ink bg-paper-light text-ink hover:border-warn hover:text-warn"}`}>
          <IconSoTay />
          Sổ tay
          {soMuc > 0 && <span className="grid h-5 min-w-5 place-items-center border border-warn bg-warn px-1 text-[10px] font-bold text-paper-light">{soMuc}</span>}
        </motion.button>
        {!tapTrung && (
          <motion.button whileTap={buttonTap} type="button" onClick={() => setTapTrung(true)} title="Ẩn mọi thứ quanh, chỉ còn đề (phím F)" className="flex items-center gap-2 border border-info bg-info/12 px-4 py-2.5 text-sm font-semibold text-info transition-colors hover:bg-info hover:text-paper-light">
            <IconTapTrung mo={false} />
            Tập trung
          </motion.button>
        )}
      </div>
      <div className="mt-3 h-1 w-full overflow-hidden bg-ink/10">
        <motion.div animate={{width: `${tong ? (trang / tong) * 100 : 0}%`}} transition={spring} className="h-full bg-gradient-to-r from-accent via-warn to-info" />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border border-ink/25 bg-paper-light px-3 py-2">
        <div className="flex items-center gap-2">
          <span className={`border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] ${xemDapAn ? "border-ok bg-ok/12 text-ok" : "border-accent bg-accent-wash text-accent"}`}>{xemDapAn ? "Đáp án" : "Đề thi"}</span>
          <motion.button whileTap={buttonTap} type="button" disabled={trang <= 1} onClick={() => setTrang((t) => Math.max(1, t - 1))} className="border border-ink/40 bg-paper px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft transition-colors disabled:opacity-40 hover:border-accent hover:text-accent">Trước</motion.button>
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">{dangTai ? "..." : `${trang}/${tong}`}</span>
          <motion.button whileTap={buttonTap} type="button" disabled={trang >= tong} onClick={() => setTrang((t) => Math.min(tong, t + 1))} className="border border-ink/40 bg-paper px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft transition-colors disabled:opacity-40 hover:border-accent hover:text-accent">Sau</motion.button>
          <motion.button whileTap={buttonTap} type="button" onClick={() => soTay.toggleBm(trang)} title={soGhim ? "Bỏ ghim trang này" : "Ghim trang này vào sổ tay"} className={`border p-1.5 transition-colors ${soGhim ? "border-warn bg-warn/15 text-warn" : "border-ink/40 bg-paper text-ink-faint hover:border-warn hover:text-warn"}`}>
            <IconGhim day={soGhim} />
          </motion.button>
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileTap={buttonTap} type="button" disabled={zoom <= 0.5} onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))} aria-label="Thu nhỏ" className="border border-ink/40 bg-paper px-3 py-1.5 text-sm font-bold text-ink-soft transition-colors disabled:opacity-40 hover:border-accent hover:text-accent">−</motion.button>
          <span className="w-12 text-center text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">{Math.round(zoom * 100)}%</span>
          <motion.button whileTap={buttonTap} type="button" disabled={zoom >= 4} onClick={() => setZoom((z) => Math.min(4, Number((z + 0.25).toFixed(2))))} aria-label="Phóng to" className="border border-ink/40 bg-paper px-3 py-1.5 text-sm font-bold text-ink-soft transition-colors disabled:opacity-40 hover:border-accent hover:text-accent">+</motion.button>
        </div>
      </div>
      <div className="mt-3 border border-ink/25 bg-paper-light p-3">
        <div className="flex gap-2">
          <div className="group relative min-w-0 flex-1">
            <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint group-focus-within:text-accent" />
            <input type="text" value={tuKhoa} onChange={(e) => setTuKhoa(e.target.value)} onKeyDown={(e) => {
              if (e.key === "Enter") void tim();
            }} placeholder={xemDapAn ? "Tìm trong đáp án (Enter để tìm)..." : "Tìm chữ trong đề (Enter để tìm)..."} aria-label="Tìm trong PDF" className="w-full border border-ink/30 bg-paper py-2 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent" />
          </div>
          <motion.button whileTap={buttonTap} type="button" onClick={() => void tim()} disabled={dangTim} className="flex shrink-0 items-center gap-1.5 border border-ink bg-ink px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-paper-light transition-colors hover:border-accent hover:bg-accent disabled:opacity-50">
            {dangTim ? <IconLoader className="h-3.5 w-3.5 animate-spin" /> : <IconSearch className="h-3.5 w-3.5" />}
            Tìm
          </motion.button>
        </div>
        {ketQua.length > 0 && (
          <ul className="viewer-scroll mt-2 max-h-32 space-y-1 overflow-y-auto">
            {ketQua.map((k, i) => (
              <li key={`${k.trang}-${i}`}>
                <button type="button" onClick={() => setTrang(k.trang)} className={`w-full truncate border px-2 py-1 text-left text-xs transition-colors ${trang === k.trang ? "border-accent bg-accent-wash text-accent-deep" : "border-ink/20 bg-paper text-ink-soft hover:border-accent"}`}>
                  Trang {k.trang}: …{k.snippet}…
                </button>
              </li>
            ))}
          </ul>
        )}
        {tuKhoa && !dangTim && ketQua.length === 0 && <p className="mt-2 text-xs text-ink-faint">Không tìm thấy khớp. Thử từ ngắn hơn hoặc bỏ dấu.</p>}
      </div>
      <AnimatePresence>
        {moSoTay && (
          <motion.div initial={{height: 0, opacity: 0}} animate={{height: "auto", opacity: 1}} exit={{height: 0, opacity: 0}} transition={spring} className="overflow-hidden">
            <div className="mt-3 grid gap-3 border border-warn/40 bg-paper-light p-3 sm:grid-cols-2">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
                  <IconGhim day />
                  Trang đã ghim ({soTay.bm.length})
                </p>
                {soTay.bm.length === 0 ? (
                  <p className="mt-2 text-xs text-ink-faint">Chưa ghim trang nào. Bấm icon bookmark cạnh số trang để ghim trang đang đọc.</p>
                ) : (
                  <ul className="viewer-scroll mt-2 max-h-36 space-y-1 overflow-y-auto pr-1">
                    {[...soTay.bm].sort((a, b) => a - b).map((p) => (
                      <li key={p} className="flex items-center gap-1.5">
                        <button type="button" onClick={() => setTrang(p)} className={`min-w-0 flex-1 truncate border px-2 py-1 text-left text-xs transition-colors ${p === trang ? "border-warn bg-warn/15 text-warn" : "border-ink/20 bg-paper text-ink-soft hover:border-warn"}`}>
                          Trang {p}{(soTay.note[String(p)] ?? "").trim() ? " · có ghi chú" : ""}
                        </button>
                        <button type="button" onClick={() => soTay.toggleBm(p)} aria-label={`Bỏ ghim trang ${p}`} className="shrink-0 border border-transparent p-1 text-ink-faint transition-colors hover:border-danger hover:text-danger">
                          <IconClose className="h-3 w-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <motion.button whileTap={buttonTap} type="button" onClick={() => soTay.toggleBm(trang)} className={`mt-2 flex items-center gap-1.5 border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${soGhim ? "border-warn bg-warn/15 text-warn hover:bg-warn hover:text-paper-light" : "border-ink bg-ink text-paper-light hover:border-warn hover:bg-warn"}`}>
                  <IconGhim day={soGhim} />
                  {soGhim ? `Bỏ ghim trang ${trang}` : `Ghim trang ${trang}`}
                </motion.button>
              </div>
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
                  <IconSoTay />
                  Ghi chú trang {trang}
                </p>
                <textarea value={ghiChu} onChange={(e) => soTay.setNote(trang, e.target.value)} maxLength={1200} rows={4} placeholder="Ghi chú riêng của cậu cho trang này: câu hay sai, công thức cần nhớ... Tự lưu vào máy." className="mt-2 w-full border border-ink/30 bg-paper px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-warn" />
                <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-ink-faint">{ghiChu.length}/1200 · tự lưu vào máy cậu</p>
                {trangGhiChu.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {trangGhiChu.map((p) => (
                      <button key={p} type="button" onClick={() => setTrang(p)} className={`border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors ${p === trang ? "border-warn bg-warn/15 text-warn" : "border-ink/25 bg-paper text-ink-soft hover:border-warn hover:text-warn"}`}>
                        Trang {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={wrapRef} data-pdf-zoom onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onWheel={onWheel} className={`viewer-scroll relative mt-3 overflow-auto border border-ink/25 bg-paper-light p-3 shadow-paper ${tapTrung ? "min-h-0 flex-1" : "max-h-[80vh]"}`}>
        {dangTai ? (
          <div className="space-y-3 p-2">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-[55%] w-full" />
            <div className="flex items-center justify-center gap-2 pt-2 text-sm text-ink-faint">
              <IconLoader className="h-4 w-4 animate-spin text-accent" />
              {xemDapAn ? "Đang dựng đáp án..." : "Đang dựng trang đề..."}
            </div>
          </div>
        ) : loi ? (
          <div className="border border-accent/50 bg-accent-wash p-5 text-sm text-accent-deep">{loi}</div>
        ) : (
          <motion.div key={`${src}-${trang}`} initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={spring} ref={boxRef} className="relative mx-auto">
            <canvas ref={canvasRef} className="block bg-white shadow-paper" />
            <canvas ref={overlayRef} className="pointer-events-none absolute inset-0" />
            {soGhim && <motion.span initial={{scale: 0.6, opacity: 0}} animate={{scale: 1, opacity: 1}} transition={spring} className="absolute right-2 top-2 flex items-center gap-1 border border-warn bg-warn px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-paper-light shadow-stamp"><IconGhim day />Đã ghim</motion.span>}
            {dangVe && (
              <div className="pointer-events-none sticky bottom-2 mx-auto mt-2 flex w-max items-center gap-2 border border-ink/30 bg-paper-light px-3 py-1.5 text-xs text-ink-soft shadow-paper">
                <IconLoader className="h-3.5 w-3.5 animate-spin text-accent" />
                Đang vẽ trang {trang}...
              </div>
            )}
          </motion.div>
        )}
        <AnimatePresence>
          {tiepTuc && (
            <motion.div initial={{opacity: 0, y: 12}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: 12}} className="pointer-events-none sticky bottom-2 mx-auto mt-2 w-max border border-info bg-info/12 px-3 py-1.5 text-xs font-semibold text-info shadow-paper">
              Tiếp tục đọc từ trang {tiepTuc} lần trước
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {!tapTrung && <p className="mt-3 text-xs text-ink-faint">Vuốt ngang chuyển trang · chụm hai ngón hoặc Ctrl+cuộn để zoom vùng đề · phím F bật tập trung, Esc thoát · mũi tên trái/phải chuyển trang. Sổ tay lưu ghim trang và ghi chú vào máy cậu.</p>}
    </div>
  );
}