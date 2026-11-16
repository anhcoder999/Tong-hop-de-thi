"use client";
import {useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {motion} from "framer-motion";
import {IconArrowLeft, IconDownload, IconExternal, IconLoader, IconSearch} from "@/components/Icons";
import Skeleton from "@/components/Skeleton";
import {buttonTap} from "@/lib/animations";
import {useDanhDau} from "@/lib/useDanhDau";
import {goiTai} from "@/app/actions";
const CDN = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174";
const WORKER = `${CDN}/build/pdf.worker.min.js`;
const CMAP = `${CDN}/cmaps/`;
const FONTS = `${CDN}/standard_fonts/`;
type KetQuaTim = {trang: number; snippet: string};
export default function DocumentViewer({url, ten, id}: {url: string; ten: string; id: string}) {
  const router = useRouter();
  const {danhDau} = useDanhDau();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<any>(null);
  const taskRef = useRef<{cancel: () => void; promise: Promise<unknown>} | null>(null);
  const touchRef = useRef<{x: number; y: number; kc: number; zoom: number} | null>(null);
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
  useEffect(() => {
    danhDau(id);
  }, [id, danhDau]);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = WORKER;
        const doc = await pdfjs.getDocument({url, cMapUrl: CMAP, cMapPacked: true, standardFontDataUrl: FONTS}).promise;
        if (!alive) {
          doc.destroy();
          return;
        }
        docRef.current = doc;
        setPdf(doc);
        setTong(doc.numPages);
        setDangTai(false);
      } catch {
        if (alive) {
          setLoi("Không tải được PDF. Link có thể đã hết hạn, hãy tải lại trang.");
          setDangTai(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [url]);
  useEffect(() => {
    return () => {
      if (taskRef.current) taskRef.current.cancel();
      if (docRef.current) docRef.current.destroy();
    };
  }, []);
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
  }, [pdf]);
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
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
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
            const x = Math.min(r[0], r[2]);
            const y = Math.min(r[1], r[3]);
            octx.fillRect(x, y, Math.abs(r[2] - r[0]), Math.abs(r[3] - r[1]));
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
      const kc = Math.hypot(dx, dy);
      setZoom(Math.min(4, Math.max(0.5, Number((t.zoom * (kc / t.kc)).toFixed(2)))));
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
  const viewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(url)}`;
  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2.5">
        <motion.button whileTap={buttonTap} type="button" onClick={() => router.push("/")} className="flex items-center gap-2 border border-ink bg-paper-light px-4 py-2.5 text-sm font-semibold text-ink transition-colors active:bg-paper-deep hover:bg-paper">
          <IconArrowLeft className="h-4 w-4" />
          Quay lại
        </motion.button>
        <motion.a whileTap={buttonTap} href={url} download onClick={() => void goiTai(id)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper-light transition-colors active:border-accent active:bg-accent hover:border-accent hover:bg-accent">
          <IconDownload className="h-4 w-4" />
          Tải PDF
        </motion.a>
        <motion.a whileTap={buttonTap} href={viewerUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 border border-ink bg-paper-light px-4 py-2.5 text-sm font-semibold text-ink transition-colors active:bg-paper-deep hover:bg-paper">
          <IconExternal className="h-4 w-4" />
          Mở tab mới
        </motion.a>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border border-ink/25 bg-paper-light px-3 py-2">
        <div className="flex items-center gap-2">
          <motion.button whileTap={buttonTap} type="button" disabled={trang <= 1} onClick={() => setTrang((t) => Math.max(1, t - 1))} className="border border-ink/40 bg-paper px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft transition-colors disabled:opacity-40 hover:border-accent hover:text-accent">Trước</motion.button>
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">{dangTai ? "..." : `${trang}/${tong}`}</span>
          <motion.button whileTap={buttonTap} type="button" disabled={trang >= tong} onClick={() => setTrang((t) => Math.min(tong, t + 1))} className="border border-ink/40 bg-paper px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft transition-colors disabled:opacity-40 hover:border-accent hover:text-accent">Sau</motion.button>
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
            }} placeholder="Tìm chữ trong đề (Enter để tìm)..." aria-label="Tìm trong PDF" className="w-full border border-ink/30 bg-paper py-2 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent" />
          </div>
          <motion.button whileTap={buttonTap} type="button" onClick={() => void tim()} disabled={dangTim} className="flex shrink-0 items-center gap-1.5 border border-ink bg-ink px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-paper-light transition-colors hover:border-accent hover:bg-accent disabled:opacity-50">
            {dangTim ? <IconLoader className="h-3.5 w-3.5 animate-spin" /> : <IconSearch className="h-3.5 w-3.5" />}
            Tìm
          </motion.button>
        </div>
        {ketQua.length > 0 && (
          <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto viewer-scroll">
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
      <div ref={wrapRef} data-pdf-zoom onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onWheel={onWheel} className="viewer-scroll relative mt-3 max-h-[80vh] overflow-auto border border-ink/25 bg-paper-light p-3 shadow-paper">
        {dangTai ? (
          <div className="space-y-3 p-2">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-[55%] w-full" />
            <div className="flex items-center justify-center gap-2 pt-2 text-sm text-ink-faint">
              <IconLoader className="h-4 w-4 animate-spin text-accent" />
              Đang dựng trang đề...
            </div>
          </div>
        ) : loi ? (
          <div className="border border-accent/50 bg-accent-wash p-5 text-sm text-accent-deep">{loi}</div>
        ) : (
          <div ref={boxRef} className="relative mx-auto">
            <canvas ref={canvasRef} className="block bg-white shadow-paper" />
            <canvas ref={overlayRef} className="pointer-events-none absolute inset-0" />
            {dangVe && (
              <div className="pointer-events-none sticky bottom-2 mx-auto mt-2 flex w-max items-center gap-2 border border-ink/30 bg-paper-light px-3 py-1.5 text-xs text-ink-soft shadow-paper">
                <IconLoader className="h-3.5 w-3.5 animate-spin text-accent" />
                Đang vẽ trang {trang}...
              </div>
            )}
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-ink-faint">Vuốt ngang để chuyển trang, chụm hai ngón hoặc Ctrl+cuộn để phóng to riêng vùng đề (zoom toàn trang vẫn khóa). Ô tìm sẽ tô đỏ chữ khớp trên trang.</p>
    </div>
  );
}